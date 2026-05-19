"""
40道测评题目：24题MBTI + 16题Holland
"""

QUESTIONS = [
    # ── MBTI E/I 外向/内向 ──
    {
        "id": 1, "type": "mbti", "dimension": "EI",
        "text": "周末有空闲时，你更倾向于：",
        "options": [
            {"label": "A", "text": "约朋友出去玩，聊天聚餐", "score": "E"},
            {"label": "B", "text": "一个人在家看书、玩游戏或做自己喜欢的事", "score": "I"},
        ],
    },
    {
        "id": 2, "type": "mbti", "dimension": "EI",
        "text": "在一个陌生的聚会上，你通常会：",
        "options": [
            {"label": "A", "text": "主动和很多人搭话，认识新朋友", "score": "E"},
            {"label": "B", "text": "只和认识的人或少数新朋友聊天", "score": "I"},
        ],
    },
    {
        "id": 3, "type": "mbti", "dimension": "EI",
        "text": "做完一件让你消耗很多精力的事后，你更想：",
        "options": [
            {"label": "A", "text": "和朋友聊聊天，倾诉一下", "score": "E"},
            {"label": "B", "text": "独处一段时间，让自己安静下来", "score": "I"},
        ],
    },
    {
        "id": 4, "type": "mbti", "dimension": "EI",
        "text": "在小组讨论中，你通常：",
        "options": [
            {"label": "A", "text": "很快说出自己的想法，先表达再完善", "score": "E"},
            {"label": "B", "text": "先思考清楚再开口，不愿意说没想好的话", "score": "I"},
        ],
    },
    {
        "id": 5, "type": "mbti", "dimension": "EI",
        "text": "当你有一个新想法时，你更倾向于：",
        "options": [
            {"label": "A", "text": "立刻找人分享，边说边理清思路", "score": "E"},
            {"label": "B", "text": "先自己思考消化，确认后再分享", "score": "I"},
        ],
    },
    {
        "id": 6, "type": "mbti", "dimension": "EI",
        "text": "一个人独处一整天后，你的感受通常是：",
        "options": [
            {"label": "A", "text": "有些无聊或烦躁，想找人说话", "score": "E"},
            {"label": "B", "text": "很舒适，感觉充了电", "score": "I"},
        ],
    },

    # ── MBTI S/N 感觉/直觉 ──
    {
        "id": 7, "type": "mbti", "dimension": "SN",
        "text": "学习新知识时，你更喜欢：",
        "options": [
            {"label": "A", "text": "从具体的例子和实际操作入手", "score": "S"},
            {"label": "B", "text": "先理解整体框架和背后的逻辑", "score": "N"},
        ],
    },
    {
        "id": 8, "type": "mbti", "dimension": "SN",
        "text": "解决问题时，你更依赖：",
        "options": [
            {"label": "A", "text": "过去的经验和已经验证的方法", "score": "S"},
            {"label": "B", "text": "新的思路和创造性的解决方案", "score": "N"},
        ],
    },
    {
        "id": 9, "type": "mbti", "dimension": "SN",
        "text": "在规划未来时，你更关注：",
        "options": [
            {"label": "A", "text": "眼前具体可以做的事情，一步一步来", "score": "S"},
            {"label": "B", "text": "5年后、10年后想成为什么样的人", "score": "N"},
        ],
    },
    {
        "id": 10, "type": "mbti", "dimension": "SN",
        "text": "读一本书时，你更欣赏：",
        "options": [
            {"label": "A", "text": "情节真实细腻、描写生动的故事", "score": "S"},
            {"label": "B", "text": "充满想象力、探讨深刻主题的作品", "score": "N"},
        ],
    },
    {
        "id": 11, "type": "mbti", "dimension": "SN",
        "text": "当别人和你说话时，你更注意：",
        "options": [
            {"label": "A", "text": "对方说的具体内容和事实细节", "score": "S"},
            {"label": "B", "text": "对方话语背后的含义和潜在信息", "score": "N"},
        ],
    },
    {
        "id": 12, "type": "mbti", "dimension": "SN",
        "text": "做一件事时，你更享受：",
        "options": [
            {"label": "A", "text": "熟练完成已经会的事情，追求精益求精", "score": "S"},
            {"label": "B", "text": "探索新领域，尝试从没做过的事", "score": "N"},
        ],
    },

    # ── MBTI T/F 思考/情感 ──
    {
        "id": 13, "type": "mbti", "dimension": "TF",
        "text": "朋友来找你倾诉烦恼，你通常会：",
        "options": [
            {"label": "A", "text": "帮他分析问题，提出解决方案", "score": "T"},
            {"label": "B", "text": "先好好陪他聊，让他感到被理解", "score": "F"},
        ],
    },
    {
        "id": 14, "type": "mbti", "dimension": "TF",
        "text": "做决定时，你更看重：",
        "options": [
            {"label": "A", "text": "客观的逻辑和结果的合理性", "score": "T"},
            {"label": "B", "text": "对自己和他人感受的影响", "score": "F"},
        ],
    },
    {
        "id": 15, "type": "mbti", "dimension": "TF",
        "text": "在团队合作中，你更在意：",
        "options": [
            {"label": "A", "text": "大家能不能高效完成目标", "score": "T"},
            {"label": "B", "text": "团队氛围好不好，大家开不开心", "score": "F"},
        ],
    },
    {
        "id": 16, "type": "mbti", "dimension": "TF",
        "text": "被批评时，你的第一反应通常是：",
        "options": [
            {"label": "A", "text": "判断批评是否有道理，然后决定接不接受", "score": "T"},
            {"label": "B", "text": "先有情绪反应，再慢慢去消化批评内容", "score": "F"},
        ],
    },
    {
        "id": 17, "type": "mbti", "dimension": "TF",
        "text": "评价一部电影时，你更倾向于：",
        "options": [
            {"label": "A", "text": "分析剧情是否合理、结构是否严谨", "score": "T"},
            {"label": "B", "text": "聊它带给你的情感共鸣和触动", "score": "F"},
        ],
    },
    {
        "id": 18, "type": "mbti", "dimension": "TF",
        "text": "如果你需要拒绝一个请求，你会：",
        "options": [
            {"label": "A", "text": "直接说明原因，不觉得有什么难的", "score": "T"},
            {"label": "B", "text": "考虑对方感受，很纠结，尽量委婉", "score": "F"},
        ],
    },

    # ── MBTI J/P 判断/感知 ──
    {
        "id": 19, "type": "mbti", "dimension": "JP",
        "text": "面对一项大任务，你的做法通常是：",
        "options": [
            {"label": "A", "text": "先制定详细计划，按步骤执行", "score": "J"},
            {"label": "B", "text": "先大致了解，随机应变，边做边调整", "score": "P"},
        ],
    },
    {
        "id": 20, "type": "mbti", "dimension": "JP",
        "text": "对待截止日期，你通常：",
        "options": [
            {"label": "A", "text": "提前完成，不喜欢最后一刻赶工", "score": "J"},
            {"label": "B", "text": "常常在截止日前夕才开始全力冲刺", "score": "P"},
        ],
    },
    {
        "id": 21, "type": "mbti", "dimension": "JP",
        "text": "你的桌面/房间通常是：",
        "options": [
            {"label": "A", "text": "整洁有序，东西都有固定位置", "score": "J"},
            {"label": "B", "text": "比较随意，但你知道自己的东西在哪", "score": "P"},
        ],
    },
    {
        "id": 22, "type": "mbti", "dimension": "JP",
        "text": "旅行时，你更喜欢：",
        "options": [
            {"label": "A", "text": "提前规划好行程，按计划游览", "score": "J"},
            {"label": "B", "text": "大致定个方向，随心所欲地探索", "score": "P"},
        ],
    },
    {
        "id": 23, "type": "mbti", "dimension": "JP",
        "text": "当计划临时被打乱时，你通常：",
        "options": [
            {"label": "A", "text": "会有些不舒服，想尽快恢复原计划", "score": "J"},
            {"label": "B", "text": "还好，反正计划没有变化快", "score": "P"},
        ],
    },
    {
        "id": 24, "type": "mbti", "dimension": "JP",
        "text": "做选择时，你倾向于：",
        "options": [
            {"label": "A", "text": "尽快决定，不喜欢悬而未决的状态", "score": "J"},
            {"label": "B", "text": "保留选择空间，不急于下定论", "score": "P"},
        ],
    },

    # ── Holland R 实际型 ──
    {
        "id": 25, "type": "holland", "dimension": "R",
        "text": "下面哪种活动最吸引你？",
        "options": [
            {"label": "A", "text": "动手组装或修理一台机器", "score": "R"},
            {"label": "B", "text": "阅读一篇科学研究报告", "score": "I"},
        ],
    },
    {
        "id": 26, "type": "holland", "dimension": "R",
        "text": "如果让你选一门课外活动，你会选：",
        "options": [
            {"label": "A", "text": "木工或电路焊接等动手课", "score": "R"},
            {"label": "B", "text": "绘画或摄影等创作课", "score": "A"},
        ],
    },

    # ── Holland I 研究型 ──
    {
        "id": 27, "type": "holland", "dimension": "I",
        "text": "遇到一个复杂问题时，你更倾向于：",
        "options": [
            {"label": "A", "text": "深入研究，弄清楚背后的原理", "score": "I"},
            {"label": "B", "text": "找到一个快速可行的解决方法", "score": "E"},
        ],
    },
    {
        "id": 28, "type": "holland", "dimension": "I",
        "text": "你更感兴趣的是：",
        "options": [
            {"label": "A", "text": "理解宇宙、生命或数学的奥秘", "score": "I"},
            {"label": "B", "text": "帮助周围的人解决生活中的困难", "score": "S"},
        ],
    },

    # ── Holland A 艺术型 ──
    {
        "id": 29, "type": "holland", "dimension": "A",
        "text": "如果可以选择，你更愿意：",
        "options": [
            {"label": "A", "text": "写一首诗或设计一幅海报", "score": "A"},
            {"label": "B", "text": "整理一份详细的数据报表", "score": "C"},
        ],
    },
    {
        "id": 30, "type": "holland", "dimension": "A",
        "text": "在创作类活动中，你更享受：",
        "options": [
            {"label": "A", "text": "自由表达想法，不受规则束缚", "score": "A"},
            {"label": "B", "text": "按照既定规范完成精准的工作", "score": "C"},
        ],
    },

    # ── Holland S 社会型 ──
    {
        "id": 31, "type": "holland", "dimension": "S",
        "text": "在以下两个场景中，你更愿意做的是：",
        "options": [
            {"label": "A", "text": "辅导同学理解一道难题", "score": "S"},
            {"label": "B", "text": "独自攻克一个技术难关", "score": "R"},
        ],
    },
    {
        "id": 32, "type": "holland", "dimension": "S",
        "text": "当看到有人遇到困难时，你通常：",
        "options": [
            {"label": "A", "text": "很自然地想上前帮忙或安慰", "score": "S"},
            {"label": "B", "text": "觉得他们应该自己解决问题", "score": "I"},
        ],
    },
    {
        "id": 33, "type": "holland", "dimension": "S",
        "text": "你理想中的工作场景是：",
        "options": [
            {"label": "A", "text": "每天与不同的人打交道，帮助他们", "score": "S"},
            {"label": "B", "text": "专注在自己的工作上，减少干扰", "score": "I"},
        ],
    },

    # ── Holland E 企业型 ──
    {
        "id": 34, "type": "holland", "dimension": "E",
        "text": "你更享受哪种角色？",
        "options": [
            {"label": "A", "text": "带领团队实现一个目标", "score": "E"},
            {"label": "B", "text": "专注于执行具体的技术任务", "score": "R"},
        ],
    },
    {
        "id": 35, "type": "holland", "dimension": "E",
        "text": "面对商业机会，你的直觉是：",
        "options": [
            {"label": "A", "text": "兴奋，想去争取，说服别人加入", "score": "E"},
            {"label": "B", "text": "先分析风险，谨慎评估再行动", "score": "I"},
        ],
    },
    {
        "id": 36, "type": "holland", "dimension": "E",
        "text": "如果有机会创业，你更倾向于：",
        "options": [
            {"label": "A", "text": "勇于尝试，边干边学", "score": "E"},
            {"label": "B", "text": "在稳定的工作中慢慢积累经验", "score": "C"},
        ],
    },

    # ── Holland C 常规型 ──
    {
        "id": 37, "type": "holland", "dimension": "C",
        "text": "你更喜欢哪类工作方式？",
        "options": [
            {"label": "A", "text": "按照明确的规则和流程处理事务", "score": "C"},
            {"label": "B", "text": "自由发挥，没有固定套路", "score": "A"},
        ],
    },
    {
        "id": 38, "type": "holland", "dimension": "C",
        "text": "做账目或数据整理时，你觉得：",
        "options": [
            {"label": "A", "text": "挺有意思，能把数字弄得整整齐齐很有成就感", "score": "C"},
            {"label": "B", "text": "很无聊，不是我想做的事", "score": "A"},
        ],
    },
    {
        "id": 39, "type": "holland", "dimension": "C",
        "text": "在工作中，你更在意：",
        "options": [
            {"label": "A", "text": "准确、细致，不出任何差错", "score": "C"},
            {"label": "B", "text": "创新、突破，做出与众不同的成果", "score": "A"},
        ],
    },
    {
        "id": 40, "type": "holland", "dimension": "C",
        "text": "对于重复性的日常工作，你的态度是：",
        "options": [
            {"label": "A", "text": "能接受，稳定让我有安全感", "score": "C"},
            {"label": "B", "text": "会烦躁，我需要变化和新鲜感", "score": "E"},
        ],
    },
]
