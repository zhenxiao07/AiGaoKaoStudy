import statistics
from data.universities import UNIVERSITIES
from models.schemas import UserInfo, SchoolCard


def recommend_schools(user_info: UserInfo, target_majors: list[str]) -> dict:
    subject_type = user_info.subject_type or "物理"
    province_key = f"{user_info.province}_{subject_type}"
    user_rank = _score_to_rank(user_info.score, province_key)

    results = {"冲": [], "稳": [], "保": []}

    for uni in UNIVERSITIES:
        for major in uni["majors"]:
            if major["name"] not in target_majors:
                continue

            if not _subject_filter(user_info.subject_selection, major["subject_req"]):
                continue

            # 优先用用户省份数据，没有则用第一个可用省份的数据（demo模式）
            ranks = major["ranks"].get(province_key)
            if not ranks and major["ranks"]:
                ranks = list(major["ranks"].values())[0]
            if not ranks:
                continue

            tier, probability, is_volatile = _calc_tier(user_rank, ranks)
            if not tier:
                continue

            from data.xuefeng_kb import XUEFENG_KNOWLEDGE
            has_xf = any(major["name"] in e.get("major_tags", []) for e in XUEFENG_KNOWLEDGE)

            card = SchoolCard(
                university_id=uni["id"],
                university_name=uni["name"],
                city=uni["city"],
                school_type=uni["type"],
                major_name=major["name"],
                probability=probability,
                tier=tier,
                subject_ranking=uni["subject_rankings"].get(major["name"], "B-"),
                trend_ranks=ranks,
                is_volatile=is_volatile,
                has_xuefeng=has_xf,
            )
            results[tier].append(card)

    for tier in results:
        results[tier] = _sort_cards(results[tier])[:6]

    return results


def _score_to_rank(score: int | None, province_key: str) -> int:
    """分数换算全省位次（demo数据，实际产品需对接真实一分一段表）"""
    if score is None:
        return 50000
    # 各省物理/理科参考换算表（分数→累计位次）
    base_map = {
        "广东_物理":   {700: 500,  680: 3000,  660: 8000,  640: 18000, 620: 35000, 600: 55000, 580: 75000, 560: 95000,  540: 120000},
        "广东_历史":   {680: 500,  660: 3000,  640: 8000,  620: 18000, 600: 30000, 580: 45000, 560: 60000},
        "北京_物理":   {680: 200,  660: 800,   640: 2000,  620: 4000,  600: 7000,  580: 11000, 560: 16000, 540: 22000},
        "北京_历史":   {660: 200,  640: 800,   620: 2000,  600: 4000,  580: 7000,  560: 11000},
        "上海_物理":   {570: 500,  550: 2000,  530: 5000,  510: 10000, 490: 16000, 470: 23000, 450: 31000},
        "上海_历史":   {560: 500,  540: 2000,  520: 5000,  500: 10000, 480: 16000},
        "浙江_物理":   {700: 500,  680: 2000,  660: 6000,  640: 14000, 620: 28000, 600: 45000, 580: 65000},
        "江苏_物理":   {690: 500,  670: 2000,  650: 6000,  630: 14000, 610: 28000, 590: 48000, 570: 70000},
        "山东_物理":   {680: 1000, 660: 4000,  640: 10000, 620: 22000, 600: 40000, 580: 62000, 560: 85000},
        "河南_物理":   {680: 2000, 660: 7000,  640: 18000, 620: 38000, 600: 65000, 580: 95000, 560: 130000},
        "河南_历史":   {660: 2000, 640: 7000,  620: 16000, 600: 30000, 580: 48000, 560: 68000},
        "四川_物理":   {680: 1000, 660: 4000,  640: 11000, 620: 25000, 600: 45000, 580: 68000, 560: 94000},
        "湖南_物理":   {670: 500,  650: 2500,  630: 8000,  610: 18000, 590: 34000, 570: 52000, 550: 73000},
        "湖北_物理":   {670: 500,  650: 2000,  630: 7000,  610: 16000, 590: 30000, 570: 48000, 550: 68000},
        "福建_物理":   {660: 500,  640: 2000,  620: 6000,  600: 14000, 580: 26000, 560: 40000, 540: 56000},
        "安徽_物理":   {680: 1000, 660: 4000,  640: 11000, 620: 25000, 600: 44000, 580: 66000, 560: 90000},
        "江西_物理":   {670: 500,  650: 2000,  630: 7000,  610: 16000, 590: 30000, 570: 48000, 550: 66000},
        "辽宁_物理":   {660: 500,  640: 2000,  620: 6000,  600: 14000, 580: 26000, 560: 40000, 540: 57000},
        "重庆_物理":   {660: 500,  640: 2000,  620: 6000,  600: 14000, 580: 26000, 560: 40000},
        "河北_物理":   {660: 1000, 640: 4000,  620: 11000, 600: 24000, 580: 42000, 560: 62000, 540: 84000},
    }
    table = base_map.get(province_key)
    # 未收录省份使用全国平均参考表
    if not table:
        table = {700: 1000, 680: 4000, 660: 12000, 640: 28000, 620: 52000, 600: 82000, 580: 115000, 560: 150000}

    thresholds = sorted(table.keys(), reverse=True)
    for t in thresholds:
        if score >= t:
            base_rank = table[t]
            # 每高1分约少200人（分数越高排名越靠前，位次数值越小）
            extra = (score - t) * 200
            return max(1, base_rank - extra)
    return 200000


def _subject_filter(user_subjects: list[str], req: dict) -> bool:
    required = req.get("required", [])
    logic = req.get("logic", "ANY")
    if not required:
        return True
    if logic == "AND":
        return all(s in user_subjects for s in required)
    return any(s in user_subjects for s in required)


def _calc_tier(user_rank: int, ranks: list[int]) -> tuple:
    hist_min = min(ranks)   # 最高门槛（位次最小=最难录）
    hist_max = max(ranks)   # 最低门槛（位次最大=最易录）
    hist_avg = statistics.mean(ranks)

    std_dev = statistics.stdev(ranks) if len(ranks) > 1 else 0
    is_volatile = std_dev > 3000

    if user_rank < hist_avg:
        tier = "冲"
        prob = 0.2 + 0.2 * (1 - (hist_avg - user_rank) / hist_avg)
    elif user_rank <= hist_max * 1.05:
        tier = "稳"
        prob = 0.65
    elif user_rank <= hist_max * 1.15:
        tier = "稳"
        prob = 0.55
    elif user_rank <= hist_max * 1.30:
        tier = "保"
        prob = 0.90
    else:
        return None, 0, False

    return tier, round(min(max(prob, 0.15), 0.95), 2), is_volatile


def _sort_cards(cards: list[SchoolCard]) -> list[SchoolCard]:
    ranking_order = {"A+": 5, "A": 4, "A-": 3, "B+": 2, "B": 1, "B-": 0}
    return sorted(
        cards,
        key=lambda c: (ranking_order.get(c.subject_ranking, 0), c.probability),
        reverse=True,
    )
