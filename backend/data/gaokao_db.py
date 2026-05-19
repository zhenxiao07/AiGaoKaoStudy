"""
gaokao_db.py  –  SQLite access layer for the real gaokao admission data.
"""
import os
import sqlite3
from functools import lru_cache
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "gaokao.db")


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@lru_cache(maxsize=1)
def _shared_conn() -> sqlite3.Connection:
    return _get_conn()


def get_conn() -> sqlite3.Connection:
    return _shared_conn()


def db_ready() -> bool:
    return os.path.exists(DB_PATH)


# ---------------------------------------------------------------------------
# Province / subject helpers
# ---------------------------------------------------------------------------

def list_provinces() -> list[str]:
    if not db_ready():
        return []
    cur = get_conn().execute(
        "SELECT DISTINCT student_province FROM admissions ORDER BY student_province"
    )
    return [r[0] for r in cur.fetchall()]


def list_subjects_for_province(province: str) -> list[str]:
    if not db_ready():
        return []
    cur = get_conn().execute(
        "SELECT DISTINCT subject_type FROM admissions WHERE student_province=? ORDER BY subject_type",
        (province,),
    )
    return [r[0] for r in cur.fetchall()]


# ---------------------------------------------------------------------------
# Core query: fetch historical admission ranks for a school in a province
# ---------------------------------------------------------------------------

def fetch_school_history(
    student_province: str,
    subject_type: str,
    batch: str = "本科一批",
    category: str = "普通类",
    min_year: int = 2016,
) -> list[dict]:
    """
    Returns one row per university with aggregated multi-year data.
    Fields: university_name, uni_city, uni_province, is_985, is_211, is_dfc,
            years (list of {year, min_score, min_rank})
    """
    if not db_ready():
        return []

    cur = get_conn().execute(
        """
        SELECT university_name, uni_city, uni_province, is_985, is_211, is_dfc,
               year, min_score, min_rank, avg_score
        FROM admissions
        WHERE student_province = ?
          AND subject_type     = ?
          AND batch            = ?
          AND category         = ?
          AND year             >= ?
          AND min_score        IS NOT NULL
        ORDER BY university_name, year DESC
        """,
        (student_province, subject_type, batch, category, min_year),
    )
    rows = cur.fetchall()

    # Group by university
    uni_map: dict[str, dict] = {}
    for r in rows:
        name = r["university_name"]
        if name not in uni_map:
            uni_map[name] = {
                "university_name": name,
                "uni_city": r["uni_city"],
                "uni_province": r["uni_province"],
                "is_985": r["is_985"],
                "is_211": r["is_211"],
                "is_dfc": r["is_dfc"],
                "years": [],
            }
        uni_map[name]["years"].append({
            "year": r["year"],
            "min_score": r["min_score"],
            "min_rank": r["min_rank"],
            "avg_score": r["avg_score"],
        })

    return list(uni_map.values())


def fetch_school_history_multi_batch(
    student_province: str,
    subject_type: str,
    batches: list[str] | None = None,
    min_year: int = 2016,
) -> list[dict]:
    """Fetch school history across multiple batches, tagging each school with its batch."""
    if not db_ready():
        return []
    if batches is None:
        batches = ["本科一批", "本科二批"]

    placeholders = ",".join("?" * len(batches))
    cur = get_conn().execute(
        f"""
        SELECT university_name, uni_city, uni_province, is_985, is_211, is_dfc,
               batch, year, min_score, min_rank, avg_score
        FROM admissions
        WHERE student_province = ?
          AND subject_type     = ?
          AND category         = '普通类'
          AND batch            IN ({placeholders})
          AND year             >= ?
          AND min_score        IS NOT NULL
        ORDER BY university_name, batch, year DESC
        """,
        [student_province, subject_type, *batches, min_year],
    )
    rows = cur.fetchall()

    uni_map: dict[str, dict] = {}
    for r in rows:
        key = f"{r['university_name']}_{r['batch']}"
        if key not in uni_map:
            uni_map[key] = {
                "university_name": r["university_name"],
                "uni_city": r["uni_city"],
                "uni_province": r["uni_province"],
                "is_985": r["is_985"],
                "is_211": r["is_211"],
                "is_dfc": r["is_dfc"],
                "batch": r["batch"],
                "years": [],
            }
        uni_map[key]["years"].append({
            "year": r["year"],
            "min_score": r["min_score"],
            "min_rank": r["min_rank"],
            "avg_score": r["avg_score"],
        })

    return list(uni_map.values())


# ---------------------------------------------------------------------------
# Major admissions queries
# ---------------------------------------------------------------------------

def _major_table_exists() -> bool:
    cur = get_conn().execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='major_admissions'"
    )
    return cur.fetchone() is not None


def fetch_eligible_majors_for_school(
    university_name: str,
    province: str,
    subject_type: str,
    batch: str,
    user_score: Optional[int],
    score_window: int = 30,
    top_n: int = 8,
) -> list[dict]:
    """
    返回该院校中考生分数可触及的专业列表。
    每个专业包含：均线、分差、冲/稳/保 及完整的历年分数明细（year_scores）。
    """
    if user_score is None or not _major_table_exists():
        return []

    # 拉取该院校所有专业的逐年分数
    rows = get_conn().execute(
        """
        SELECT major_name, year, min_score
        FROM major_admissions
        WHERE university_name = ?
          AND province        = ?
          AND subject_type    = ?
          AND batch           = ?
        ORDER BY major_name, year DESC
        """,
        (university_name, province, subject_type, batch),
    ).fetchall()

    # 按专业分组
    from collections import defaultdict
    major_map: dict[str, list[dict]] = defaultdict(list)
    for major_name, year, min_score in rows:
        major_map[major_name].append({"year": year, "min_score": int(min_score)})

    result: list[dict] = []
    for major_name, year_data in major_map.items():
        scores = [d["min_score"] for d in year_data]
        avg_score = int(round(sum(scores) / len(scores)))
        latest_score = year_data[0]["min_score"]   # 已按 year DESC 排序
        gap = user_score - avg_score

        if gap < -score_window:
            continue

        if gap >= 20:
            tier = "保"
        elif gap >= -8:
            tier = "稳"
        else:
            tier = "冲"

        result.append({
            "name": major_name,
            "avg_min_score": avg_score,
            "latest_min_score": latest_score,
            "gap": gap,
            "tier": tier,
            "year_scores": sorted(year_data, key=lambda x: x["year"]),  # 升序给前端
        })

    tier_order = {"稳": 0, "保": 1, "冲": 2}
    result.sort(key=lambda x: (tier_order.get(x["tier"], 3), -x["gap"]))
    return result[:top_n]


def list_majors_for_province(province: str, subject_type: str) -> list[str]:
    """返回该省份/科类下有数据的专业名列表（去重）。"""
    if not _major_table_exists():
        return []
    cur = get_conn().execute(
        "SELECT DISTINCT major_name FROM major_admissions "
        "WHERE province=? AND subject_type=? ORDER BY major_name",
        (province, subject_type),
    )
    return [r[0] for r in cur.fetchall()]


def search_schools(name_query: str, limit: int = 20) -> list[dict]:
    if not db_ready():
        return []
    cur = get_conn().execute(
        """
        SELECT DISTINCT university_name, uni_city, uni_province, is_985, is_211, is_dfc
        FROM admissions
        WHERE university_name LIKE ?
        ORDER BY is_985 DESC, is_211 DESC, university_name
        LIMIT ?
        """,
        (f"%{name_query}%", limit),
    )
    return [dict(r) for r in cur.fetchall()]
