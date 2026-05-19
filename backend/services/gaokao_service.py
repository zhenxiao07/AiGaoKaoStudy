"""
gaokao_service.py  –  Real-data school recommendation using gaokao.db.

Algorithm:
  1. User supplies province + subject_type + score.
  2. We look up all schools with historical data for that province.
  3. Convert user score → estimated rank using the existing lookup table.
  4. For each school, collect historical min_ranks across years.
  5. Classify as 冲/稳/保 based on rank comparison; estimate admission probability.
  6. Return sorted, tiered list.
"""
import statistics
from typing import Optional

from data.gaokao_db import (
    db_ready,
    fetch_school_history_multi_batch,
    fetch_eligible_majors_for_school,
    list_provinces,
    list_subjects_for_province,
    search_schools,
)
from services.recommendation_service import _score_to_rank


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def gaokao_recommend(
    province: str,
    subject_type: str,       # "文科" | "理科"
    score: Optional[int],
    batches: list[str] | None = None,
    top_n: int = 40,
    target_majors: list[str] | None = None,
) -> dict:
    """
    Returns {"冲": [...], "稳": [...], "保": [...]} where each entry is a
    GaokaoSchoolCard-compatible dict.
    """
    if not db_ready():
        return {"冲": [], "稳": [], "保": [], "error": "数据库未就绪，请先运行数据导入脚本"}

    if batches is None:
        batches = ["本科一批", "本科二批"]

    # Map subject_type to province_key for rank lookup
    # 文科 → 历史, 理科 → 物理 (new gaokao reform provinces)
    # Legacy provinces use 文科/理科 directly
    subject_key = _map_subject(subject_type)
    province_key = f"{province}_{subject_key}"
    user_rank = _score_to_rank(score, province_key)

    schools = fetch_school_history_multi_batch(province, subject_type, batches)

    results: dict[str, list] = {"冲": [], "稳": [], "保": []}

    for school in schools:
        year_data = school["years"]
        ranks = [y["min_rank"] for y in year_data if y["min_rank"] is not None]
        scores = [y["min_score"] for y in year_data if y["min_score"] is not None]

        if not ranks and not scores:
            continue

        # Prefer rank-based comparison; fall back to score-based
        if len(ranks) >= 2:
            tier, prob, volatile = _calc_tier_by_rank(user_rank, ranks)
        elif scores:
            tier, prob, volatile = _calc_tier_by_score(score, scores)
        else:
            continue

        if tier is None:
            continue

        eligible_majors = fetch_eligible_majors_for_school(
            school["university_name"], province, subject_type,
            school["batch"], score,
        )

        # 专业过滤：用户指定了目标专业时，只保留能达到那些专业分数线的学校
        if target_majors and score is not None:
            wanted = set(target_majors)
            matched = [m for m in eligible_majors if m["name"] in wanted]
            if not matched:
                continue                    # 没有一个目标专业能达到 → 过滤
            display_majors = matched        # 卡片只展示目标专业
        else:
            display_majors = eligible_majors

        card = {
            "university_name": school["university_name"],
            "uni_city": school["uni_city"],
            "uni_province": school["uni_province"],
            "school_tags": _build_tags(school),
            "batch": school["batch"],
            "tier": tier,
            "probability": prob,
            "is_volatile": volatile,
            "trend": _build_trend(year_data),
            "latest_score": scores[0] if scores else None,
            "latest_rank": ranks[0] if ranks else None,
            "eligible_majors": display_majors,
        }
        results[tier].append(card)

    # Sort each tier by tier quality then probability
    for tier in results:
        results[tier] = _sort(results[tier])[:top_n]

    return results


def gaokao_provinces() -> list[str]:
    return list_provinces()


def gaokao_subjects(province: str) -> list[str]:
    return list_subjects_for_province(province)


def gaokao_search(query: str) -> list[dict]:
    return search_schools(query)


# ---------------------------------------------------------------------------
# Tier calculation
# ---------------------------------------------------------------------------

def _calc_tier_by_rank(
    user_rank: int, ranks: list[int]
) -> tuple[str | None, float, bool]:
    """
    Lower rank number = better student (rank 1 is the top scorer).
    user_rank << hist_avg  → student outperforms school's admission line → 保 (safety)
    user_rank ≈  hist_avg  → around the admission line              → 稳 (target)
    user_rank >  hist_avg  → student below the admission line        → 冲 (reach)
    """
    avg = statistics.mean(ranks)
    std = statistics.stdev(ranks) if len(ranks) > 1 else avg * 0.05
    is_volatile = std > avg * 0.10  # >10% coefficient of variation

    # Rank is worse than 130% of historical avg → very unlikely to be admitted
    if user_rank > avg * 1.30:
        return None, 0.0, is_volatile

    if user_rank > avg * 1.05:
        # 5–30% worse rank than school avg → reach school (冲)
        gap_ratio = (user_rank - avg) / avg          # 0.05 … 0.30
        prob = round(max(0.15, 0.42 - gap_ratio * 1.4), 2)
        tier = "冲"
    elif user_rank >= avg * 0.85:
        # Within ±15% of school avg → stable target (稳)
        prob = 0.70 if user_rank <= avg else 0.60
        tier = "稳"
    else:
        # Rank clearly better than school avg → safety school (保)
        tier = "保"
        prob = 0.92

    return tier, prob, is_volatile


def _calc_tier_by_score(
    user_score: Optional[int], scores: list[float]
) -> tuple[str | None, float, bool]:
    """
    Higher score = better student.
    user_score >> avg → student well above admission line → 保 (safety)
    user_score ≈  avg → around the admission line        → 稳 (target)
    user_score <  avg → student below the admission line → 冲 (reach)
    """
    if user_score is None:
        return None, 0.0, False
    avg = statistics.mean(scores)
    std = statistics.stdev(scores) if len(scores) > 1 else avg * 0.02
    is_volatile = std > 15

    if user_score < avg - 40:
        # Too far below the admission line → filtered out
        return None, 0.0, is_volatile
    elif user_score < avg - 10:
        # 10–40 points below avg → reach school (冲)
        gap = avg - user_score                        # 10 … 40
        prob = round(max(0.15, 0.42 - gap / 40 * 0.27), 2)
        tier = "冲"
    elif user_score <= avg + 10:
        # Within ±10 points → stable target (稳)
        prob = 0.70 if user_score >= avg else 0.58
        tier = "稳"
    else:
        # More than 10 points above avg → safety school (保)
        tier = "保"
        prob = 0.92

    return tier, prob, is_volatile


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_TAG_PRIORITY = {"985": 3, "211": 2, "双一流": 1}


def _build_tags(school: dict) -> list[str]:
    tags = []
    if school.get("is_985"):
        tags.append("985")
    if school.get("is_211"):
        tags.append("211")
    if school.get("is_dfc"):
        tags.append("双一流")
    return tags


def _build_trend(year_data: list[dict]) -> list[dict]:
    """Return years sorted ascending for chart display."""
    return sorted(
        [
            {
                "year": y["year"],
                "min_score": y["min_score"],
                "min_rank": y["min_rank"],
            }
            for y in year_data
            if y["min_score"] is not None
        ],
        key=lambda x: x["year"],
    )


def _sort(cards: list[dict]) -> list[dict]:
    def key(c):
        tag_score = sum(_TAG_PRIORITY.get(t, 0) for t in c.get("school_tags", []))
        return (tag_score, c.get("probability", 0))

    return sorted(cards, key=key, reverse=True)


def _map_subject(subject_type: str) -> str:
    """Map 文科/理科 to 历史/物理 for provinces using new gaokao reform."""
    mapping = {"文科": "历史", "理科": "物理"}
    return mapping.get(subject_type, subject_type)
