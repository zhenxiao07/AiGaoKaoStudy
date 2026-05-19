"""
import_gaokao.py
Run once to import all gaokao xlsx data into SQLite (gaokao.db).

Usage:
    cd backend
    python data/import_gaokao.py [--raw-dir data/gaokao_raw] [--db data/gaokao.db]
"""
import argparse
import json
import os
import sqlite3
import sys

import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

YEAR_MAP = {
    "2020年": ("最低排位",   "平均分"),
    "2019年": ("最低排位.1", "平均分.1"),
    "2018年": ("最低排位.2", "平均分.2"),
    "2017年": ("最低排位.3", "平均分.3"),
    "2016年": ("最低排位.4", "平均分.4"),
}

# Sheets we care about (skip specialty batches)
SKIP_SHEET_KEYWORDS = ["空乘", "空保", "乘务", "面试", "走读", "菏泽", "泰安", "青岛", "莱芜", "高密", "临沂", "龙潭", "高密"]


def create_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS admissions (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            student_province TEXT    NOT NULL,
            subject_type     TEXT    NOT NULL,
            category         TEXT    NOT NULL,
            batch            TEXT    NOT NULL,
            uni_province     TEXT,
            uni_city         TEXT,
            is_985           INTEGER DEFAULT 0,
            is_211           INTEGER DEFAULT 0,
            is_dfc           INTEGER DEFAULT 0,
            university_name  TEXT    NOT NULL,
            year             INTEGER NOT NULL,
            min_score        REAL,
            min_rank         INTEGER,
            avg_score        REAL,
            UNIQUE(student_province, subject_type, category, batch, university_name, year)
        );
        CREATE INDEX IF NOT EXISTS idx_prov_subj_batch
            ON admissions(student_province, subject_type, batch);
        CREATE INDEX IF NOT EXISTS idx_uni_name
            ON admissions(university_name);
    """)
    conn.commit()


def _bool_col(val) -> int:
    return 1 if str(val).strip() == "是" else 0


def _to_float(val) -> float | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _to_int(val) -> int | None:
    f = _to_float(val)
    return int(f) if f is not None else None


def parse_sheet_name(sheet_name: str) -> tuple[str, str]:
    """'普通类_本科一批' -> ('普通类', '本科一批')"""
    for kw in SKIP_SHEET_KEYWORDS:
        if kw in sheet_name:
            return None, None
    if "_" in sheet_name:
        idx = sheet_name.rfind("_")
        return sheet_name[:idx], sheet_name[idx + 1:]
    return sheet_name, "未知批次"


def process_sheet(df: pd.DataFrame, student_province: str, subject_type: str,
                  category: str, batch: str) -> list[tuple]:
    records = []
    for _, row in df.iterrows():
        uni_name = row.get("学校")
        if pd.isna(uni_name) or not str(uni_name).strip():
            continue
        uni_name = str(uni_name).strip()

        is_985 = _bool_col(row.get("F915", "否"))   # column may be named F985 in some files
        # Some files use 985 directly
        if "985" in df.columns:
            is_985 = _bool_col(row.get("985", "否"))

        is_211 = _bool_col(row.get("F211", "否"))
        is_dfc = _bool_col(row.get("双一流", "否"))
        uni_province = str(row.get("省份", "")).strip()
        uni_city = str(row.get("城市", "")).strip()

        for year_col, (rank_col, avg_col) in YEAR_MAP.items():
            year = int(year_col.replace("年", ""))
            min_score = _to_float(row.get(year_col))
            if min_score is None:
                continue

            min_rank = _to_int(row.get(rank_col)) if rank_col in df.columns else None
            avg_raw = row.get(avg_col) if avg_col in df.columns else None
            avg_score = None
            if avg_raw is not None and str(avg_raw).strip() not in ("--", "", "nan"):
                avg_score = _to_float(avg_raw)

            records.append((
                student_province, subject_type, category, batch,
                uni_province, uni_city,
                is_985, is_211, is_dfc,
                uni_name, year, min_score, min_rank, avg_score,
            ))
    return records


INSERT_SQL = """
    INSERT OR IGNORE INTO admissions
        (student_province, subject_type, category, batch,
         uni_province, uni_city, is_985, is_211, is_dfc,
         university_name, year, min_score, min_rank, avg_score)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
"""


def import_xlsx(xlsx_path: str, student_province: str, subject_type: str,
                conn: sqlite3.Connection) -> int:
    try:
        df_sheets = pd.read_excel(xlsx_path, sheet_name=None)
    except Exception as exc:
        print(f"  [ERROR] reading {xlsx_path}: {exc}")
        return 0

    total = 0
    for sheet_name, df in df_sheets.items():
        category, batch = parse_sheet_name(sheet_name)
        if category is None:
            continue
        records = process_sheet(df, student_province, subject_type, category, batch)
        if records:
            conn.executemany(INSERT_SQL, records)
            total += len(records)
    conn.commit()
    return total


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-dir", default=os.path.join(os.path.dirname(__file__), "gaokao_raw"))
    parser.add_argument("--db",      default=os.path.join(os.path.dirname(__file__), "gaokao.db"))
    args = parser.parse_args()

    manifest_path = os.path.join(args.raw_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        print(f"Manifest not found: {manifest_path}")
        print("Run extract_gaokao.ps1 first.")
        sys.exit(1)

    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)

    conn = sqlite3.connect(args.db)
    create_db(conn)

    grand_total = 0
    for entry in manifest:
        xlsx_path = os.path.join(args.raw_dir, entry["file"])
        prov = entry["province"]
        subj = entry["subject_type"]
        print(f"Importing {prov} {subj} ...", end=" ", flush=True)
        n = import_xlsx(xlsx_path, prov, subj, conn)
        print(f"{n:,} records")
        grand_total += n

    print(f"\nTotal records: {grand_total:,}")

    # Summary
    cur = conn.execute(
        "SELECT student_province, subject_type, COUNT(*) as n "
        "FROM admissions GROUP BY student_province, subject_type "
        "ORDER BY student_province, subject_type"
    )
    print("\nProvince summary:")
    for row in cur.fetchall():
        print(f"  {row[0]} {row[1]}: {row[2]:,}")

    cur2 = conn.execute("SELECT COUNT(DISTINCT university_name) FROM admissions")
    print(f"\nUnique universities: {cur2.fetchone()[0]:,}")

    conn.close()
    print(f"\nDatabase written to: {args.db}")


if __name__ == "__main__":
    main()
