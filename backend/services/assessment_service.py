from data.questions import QUESTIONS
from data.mappings import MBTI_MAJOR_MAP, HOLLAND_MAJOR_MAP, EMPLOYMENT_SCORE
from models.schemas import AssessmentAnswer, MajorCard


def score_assessment(answers: list[AssessmentAnswer]) -> dict:
    answer_map = {a.question_id: a.selected_option for a in answers}

    mbti_counts = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
    holland_counts = {"R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0}

    for q in QUESTIONS:
        qid = q["id"]
        selected = answer_map.get(qid)
        if not selected:
            continue
        option = next((o for o in q["options"] if o["label"] == selected), None)
        if not option:
            continue
        score_key = option["score"]
        if q["type"] == "mbti":
            mbti_counts[score_key] += 1
        else:
            holland_counts[score_key] += 1

    mbti_type = _calc_mbti_type(mbti_counts)
    holland_top2 = _calc_holland_top2(holland_counts)

    return {
        "mbti_type": mbti_type,
        "mbti_scores": mbti_counts,
        "holland_scores": holland_counts,
        "holland_top2": holland_top2,
    }


def _calc_mbti_type(counts: dict) -> str:
    result = ""
    for pos, neg in [("E", "I"), ("S", "N"), ("T", "F"), ("J", "P")]:
        result += pos if counts[pos] >= counts[neg] else neg
    return result


def _calc_holland_top2(counts: dict) -> list[str]:
    sorted_dims = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [d[0] for d in sorted_dims[:2]]


def recommend_majors(mbti_type: str, holland_top2: list[str]) -> list[MajorCard]:
    mbti_info = MBTI_MAJOR_MAP.get(mbti_type, {})
    mbti_high = set(mbti_info.get("high", []))
    mbti_low = set(mbti_info.get("low", []))

    holland_majors = set()
    for dim in holland_top2:
        holland_majors.update(HOLLAND_MAJOR_MAP.get(dim, {}).get("majors", []))

    all_majors = mbti_high | holland_majors
    cards: list[MajorCard] = []

    for major in all_majors:
        mbti_score = 100.0 if major in mbti_high else (30.0 if major in mbti_low else 60.0)
        holland_score = 100.0 if major in holland_majors else 50.0
        emp_score = EMPLOYMENT_SCORE.get(major, 60.0)

        total = mbti_score * 0.4 + holland_score * 0.4 + emp_score * 0.2

        if total < 60:
            continue

        employment_rating = "高" if emp_score >= 80 else ("中" if emp_score >= 65 else "低")
        avg_salary = _estimate_salary(emp_score)
        caution = major if major in mbti_low else None
        fit_reason = _build_fit_reason(major, mbti_type, holland_top2, emp_score)

        cards.append(MajorCard(
            name=major,
            score=round(total, 1),
            mbti_match=mbti_score,
            holland_match=holland_score,
            employment_score=emp_score,
            avg_salary=avg_salary,
            employment_rating=employment_rating,
            fit_reason=fit_reason,
            caution=f"MBTI {mbti_type} 类型需注意该专业的适配性" if major in mbti_low else None,
            has_xuefeng=_has_xuefeng_opinion(major),
        ))

    cards.sort(key=lambda x: x.score, reverse=True)
    return cards[:8]


def recommend_majors_from_self_assess(holland_scores: dict, mbti_scores: dict) -> dict:
    """根据自评的 Holland 和 MBTI 分数直接推荐专业"""
    # 推导 MBTI 类型
    mbti_type = ""
    for pos, neg in [("E", "I"), ("S", "N"), ("T", "F"), ("J", "P")]:
        mbti_type += pos if mbti_scores.get(pos, 0) >= mbti_scores.get(neg, 0) else neg

    # 推导 Holland Top2
    sorted_h = sorted(holland_scores.items(), key=lambda x: x[1], reverse=True)
    # 补齐所有维度（未选的默认0）
    all_dims = {d: holland_scores.get(d, 0) for d in ["R", "I", "A", "S", "E", "C"]}
    sorted_all = sorted(all_dims.items(), key=lambda x: x[1], reverse=True)
    # 至少取前2，但如果全0则随机给 I/E
    if sorted_all[0][1] == 0:
        holland_top2 = ["I", "E"]
    else:
        holland_top2 = [d[0] for d in sorted_all[:2]]

    majors = recommend_majors(mbti_type, holland_top2)
    return {"mbti_type": mbti_type, "holland_top2": holland_top2, "majors": majors}


def _estimate_salary(emp_score: float) -> str:
    if emp_score >= 90:
        return "20k-35k/月"
    if emp_score >= 80:
        return "12k-20k/月"
    if emp_score >= 70:
        return "8k-15k/月"
    if emp_score >= 60:
        return "6k-10k/月"
    return "5k-8k/月"


def _build_fit_reason(major: str, mbti: str, holland: list[str], emp: float) -> str:
    mbti_info = MBTI_MAJOR_MAP.get(mbti, {})
    desc = mbti_info.get("desc", "")
    h_descs = [HOLLAND_MAJOR_MAP.get(h, {}).get("desc", "") for h in holland]
    h_str = "、".join(filter(None, h_descs))
    return f"你的{mbti}性格{desc}，兴趣倾向为{h_str}，与{major}高度契合。"


def _has_xuefeng_opinion(major: str) -> bool:
    from data.xuefeng_kb import XUEFENG_KNOWLEDGE
    return any(major in entry.get("major_tags", []) for entry in XUEFENG_KNOWLEDGE)
