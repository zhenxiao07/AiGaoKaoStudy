"""模拟院校录取数据（实际产品需对接真实一分一段表和历年录取数据）"""

UNIVERSITIES = [
    {
        "id": "u001", "name": "北京大学", "province": "北京", "city": "北京",
        "type": ["985", "211", "双一流"], "logo": "pku",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [1200, 1350, 1180, 1420, 1280]},
            },
            {
                "name": "经济学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [1800, 2100, 1950, 2200, 2050]},
            },
            {
                "name": "临床医学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [2500, 2800, 2600, 3000, 2700]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [1300, 1450, 1250, 1500, 1380]},
            },
            {
                "name": "数学与应用数学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [2000, 2300, 2100, 2500, 2200]},
            },
            {
                "name": "心理学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3000, 3400, 3100, 3600, 3200]},
            },
            {
                "name": "哲学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3500, 4000, 3600, 4200, 3800]},
            },
            {
                "name": "社会学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [4000, 4500, 4100, 4800, 4300]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A+", "经济学": "A+", "临床医学": "A+",
            "软件工程": "A+", "数学与应用数学": "A+", "心理学": "A+",
            "哲学": "A+", "社会学": "A+",
        },
    },
    {
        "id": "u002", "name": "清华大学", "province": "北京", "city": "北京",
        "type": ["985", "211", "双一流"], "logo": "thu",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [800, 950, 820, 1000, 870]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [2200, 2500, 2300, 2600, 2400]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [850, 1000, 870, 1050, 920]},
            },
            {
                "name": "数学与应用数学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [1500, 1700, 1550, 1800, 1600]},
            },
            {
                "name": "电气工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [1800, 2000, 1850, 2100, 1920]},
            },
            {
                "name": "工业设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3000, 3400, 3100, 3600, 3200]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A+", "机械工程": "A+", "软件工程": "A+",
            "数学与应用数学": "A+", "电气工程": "A+", "工业设计": "A+",
        },
    },
    {
        "id": "u003", "name": "中山大学", "province": "广东", "city": "广州",
        "type": ["985", "211", "双一流"], "logo": "sysu",
        "majors": [
            {
                "name": "临床医学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [5800, 6200, 5900, 6500, 6100]},
            },
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [8000, 8800, 8200, 9200, 8500]},
            },
            {
                "name": "法学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [9500, 10200, 9800, 11000, 10000]},
            },
            {
                "name": "金融学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [7200, 7800, 7400, 8200, 7600]},
            },
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [11000, 12000, 11200, 12500, 11500]},
            },
            {
                "name": "心理学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [10000, 11000, 10300, 11500, 10600]},
            },
            {
                "name": "护理学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [15000, 16500, 15300, 17000, 15800]},
            },
            {
                "name": "社会工作",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [13000, 14200, 13300, 14800, 13600]},
            },
        ],
        "subject_rankings": {
            "临床医学": "A+", "计算机科学与技术": "A", "法学": "A", "金融学": "A",
            "教育学": "A", "心理学": "A+", "护理学": "A+", "社会工作": "A",
        },
    },
    {
        "id": "u004", "name": "华南理工大学", "province": "广东", "city": "广州",
        "type": ["211", "双一流"], "logo": "scut",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [15000, 16500, 15500, 17000, 16000]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [22000, 24000, 22500, 25000, 23000]},
            },
            {
                "name": "工商管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [25000, 27000, 26000, 28000, 26500]},
            },
            {
                "name": "金融学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [18000, 19500, 18500, 20500, 19000]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [16000, 17500, 16500, 18000, 17000]},
            },
            {
                "name": "电气工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [20000, 22000, 20500, 23000, 21000]},
            },
            {
                "name": "会计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [23000, 25000, 23500, 26000, 24200]},
            },
            {
                "name": "工业设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [28000, 30000, 28500, 31000, 29000]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A-", "机械工程": "A", "工商管理": "B+",
            "软件工程": "A-", "电气工程": "A-", "会计学": "B+", "工业设计": "B+",
        },
    },
    {
        "id": "u005", "name": "暨南大学", "province": "广东", "city": "广州",
        "type": ["211"], "logo": "jnu",
        "majors": [
            {
                "name": "新闻传播学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [32000, 35000, 33000, 36000, 34000]},
            },
            {
                "name": "金融学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [28000, 30000, 28500, 31000, 29500]},
            },
            {
                "name": "法学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [30000, 32000, 30500, 33000, 31500]},
            },
            {
                "name": "市场营销",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [38000, 41000, 39000, 43000, 40000]},
            },
            {
                "name": "广告学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [40000, 43000, 41000, 45000, 42000]},
            },
            {
                "name": "人力资源管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [36000, 39000, 37000, 41000, 38000]},
            },
            {
                "name": "工商管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [35000, 38000, 36000, 40000, 37000]},
            },
        ],
        "subject_rankings": {
            "新闻传播学": "B+", "金融学": "B+", "法学": "B",
            "市场营销": "B", "广告学": "B+", "人力资源管理": "B",
        },
    },
    {
        "id": "u006", "name": "深圳大学", "province": "广东", "city": "深圳",
        "type": [], "logo": "szu",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [42000, 45000, 43000, 46000, 44000]},
            },
            {
                "name": "工商管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [55000, 58000, 56000, 60000, 57000]},
            },
            {
                "name": "艺术设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [60000, 63000, 61000, 65000, 62000]},
            },
            {
                "name": "会计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [52000, 55000, 53000, 57000, 54000]},
            },
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [58000, 62000, 59000, 64000, 60500]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [44000, 47000, 45000, 48500, 46000]},
            },
        ],
        "subject_rankings": {"计算机科学与技术": "B", "工商管理": "B-", "艺术设计": "B-", "软件工程": "B"},
    },
    {
        "id": "u007", "name": "武汉大学", "province": "湖北", "city": "武汉",
        "type": ["985", "211", "双一流"], "logo": "whu",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [10000, 11000, 10200, 11500, 10500]},
            },
            {
                "name": "法学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [11500, 12500, 11800, 13000, 12200]},
            },
            {
                "name": "新闻传播学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [15000, 16000, 15200, 16500, 15600]},
            },
            {
                "name": "汉语言文学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [16000, 17500, 16300, 18000, 16800]},
            },
            {
                "name": "社会工作",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [18000, 19500, 18300, 20000, 18700]},
            },
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [17000, 18500, 17300, 19000, 17700]},
            },
            {
                "name": "工商管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [14000, 15200, 14300, 15700, 14600]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A", "法学": "A+", "新闻传播学": "A+",
            "汉语言文学": "A", "社会工作": "A-", "教育学": "A-",
        },
    },
    {
        "id": "u008", "name": "浙江大学", "province": "浙江", "city": "杭州",
        "type": ["985", "211", "双一流"], "logo": "zju",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3500, 3800, 3600, 4000, 3700]},
            },
            {
                "name": "金融学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [5500, 6000, 5700, 6300, 5800]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [7000, 7500, 7100, 7800, 7300]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3800, 4100, 3900, 4300, 4000]},
            },
            {
                "name": "会计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [8000, 8700, 8200, 9000, 8400]},
            },
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [9000, 9800, 9200, 10200, 9500]},
            },
            {
                "name": "心理学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [8500, 9200, 8700, 9600, 8900]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A+", "金融学": "A", "机械工程": "A+",
            "软件工程": "A+", "会计学": "A", "教育学": "A-", "心理学": "A",
        },
    },
    {
        "id": "u009", "name": "中国人民大学", "province": "北京", "city": "北京",
        "type": ["985", "211", "双一流"], "logo": "ruc",
        "majors": [
            {
                "name": "法学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3000, 3400, 3100, 3600, 3200]},
            },
            {
                "name": "新闻传播学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [3500, 3900, 3600, 4100, 3700]},
            },
            {
                "name": "工商管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [4000, 4500, 4100, 4700, 4200]},
            },
            {
                "name": "行政管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [4500, 5000, 4600, 5200, 4800]},
            },
            {
                "name": "人力资源管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [5000, 5500, 5100, 5700, 5300]},
            },
            {
                "name": "经济学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [2500, 2900, 2600, 3000, 2700]},
            },
            {
                "name": "市场营销",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [5500, 6000, 5600, 6200, 5800]},
            },
            {
                "name": "公共关系",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [6000, 6500, 6100, 6700, 6200]},
            },
        ],
        "subject_rankings": {
            "法学": "A+", "新闻传播学": "A+", "工商管理": "A+",
            "行政管理": "A+", "人力资源管理": "A+", "经济学": "A+",
            "市场营销": "A", "公共关系": "A",
        },
    },
    {
        "id": "u010", "name": "北京师范大学", "province": "北京", "city": "北京",
        "type": ["985", "211", "双一流"], "logo": "bnu",
        "majors": [
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [8000, 8800, 8200, 9200, 8500]},
            },
            {
                "name": "心理学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [7000, 7800, 7200, 8000, 7400]},
            },
            {
                "name": "汉语言文学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [9000, 9800, 9200, 10200, 9500]},
            },
            {
                "name": "社会工作",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [11000, 12000, 11200, 12500, 11600]},
            },
            {
                "name": "学前教育",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [12000, 13000, 12200, 13500, 12600]},
            },
            {
                "name": "特殊教育",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [14000, 15200, 14300, 15700, 14700]},
            },
            {
                "name": "哲学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [10000, 11000, 10200, 11500, 10600]},
            },
        ],
        "subject_rankings": {
            "教育学": "A+", "心理学": "A+", "汉语言文学": "A+",
            "社会工作": "A", "学前教育": "A+", "特殊教育": "A+", "哲学": "A",
        },
    },
    {
        "id": "u011", "name": "中央财经大学", "province": "北京", "city": "北京",
        "type": ["211", "双一流"], "logo": "cufe",
        "majors": [
            {
                "name": "会计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [12000, 13200, 12300, 13700, 12700]},
            },
            {
                "name": "统计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [13000, 14200, 13300, 14700, 13700]},
            },
            {
                "name": "财务管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [14000, 15200, 14300, 15700, 14700]},
            },
            {
                "name": "审计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [15000, 16200, 15300, 16700, 15700]},
            },
            {
                "name": "金融学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [11000, 12200, 11300, 12700, 11700]},
            },
            {
                "name": "经济学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [11500, 12700, 11800, 13200, 12200]},
            },
        ],
        "subject_rankings": {
            "会计学": "A+", "统计学": "A", "财务管理": "A+",
            "审计学": "A+", "金融学": "A+", "经济学": "A",
        },
    },
    {
        "id": "u012", "name": "华南师范大学", "province": "广东", "city": "广州",
        "type": ["211"], "logo": "scnu",
        "majors": [
            {
                "name": "教育学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [28000, 31000, 29000, 32500, 30000]},
            },
            {
                "name": "心理学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [25000, 28000, 26000, 29500, 27000]},
            },
            {
                "name": "汉语言文学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [32000, 35000, 33000, 36500, 34000]},
            },
            {
                "name": "学前教育",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [35000, 38000, 36000, 39500, 37000]},
            },
            {
                "name": "特殊教育",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [40000, 43000, 41000, 44500, 42000]},
            },
            {
                "name": "社会工作",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [38000, 41000, 39000, 42500, 40000]},
            },
            {
                "name": "音乐学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [45000, 48000, 46000, 50000, 47000]},
            },
        ],
        "subject_rankings": {
            "教育学": "A-", "心理学": "A-", "汉语言文学": "B+",
            "学前教育": "A-", "特殊教育": "A-", "社会工作": "B+", "音乐学": "B+",
        },
    },
    {
        "id": "u013", "name": "广东财经大学", "province": "广东", "city": "广州",
        "type": [], "logo": "gdufe",
        "majors": [
            {
                "name": "会计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [55000, 59000, 56500, 61000, 57500]},
            },
            {
                "name": "财务管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [58000, 62000, 59500, 64000, 60500]},
            },
            {
                "name": "审计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [60000, 64000, 61500, 66000, 62500]},
            },
            {
                "name": "市场营销",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [62000, 66000, 63500, 68000, 64500]},
            },
            {
                "name": "人力资源管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [64000, 68000, 65500, 70000, 66500]},
            },
            {
                "name": "行政管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [65000, 69000, 66500, 71000, 67500]},
            },
            {
                "name": "统计学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [57000, 61000, 58500, 63000, 59500]},
            },
        ],
        "subject_rankings": {
            "会计学": "B", "财务管理": "B", "审计学": "B-",
            "市场营销": "B-", "人力资源管理": "B-", "行政管理": "B-", "统计学": "B",
        },
    },
    {
        "id": "u014", "name": "南方医科大学", "province": "广东", "city": "广州",
        "type": ["211"], "logo": "smu",
        "majors": [
            {
                "name": "临床医学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [18000, 20000, 18500, 21000, 19200]},
            },
            {
                "name": "护理学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [30000, 33000, 31000, 34500, 32000]},
            },
            {
                "name": "中医学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [25000, 28000, 26000, 29500, 27000]},
            },
            {
                "name": "公共卫生",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [35000, 38000, 36000, 39500, 37000]},
            },
        ],
        "subject_rankings": {
            "临床医学": "A-", "护理学": "A", "中医学": "A-", "公共卫生": "B+",
        },
    },
    {
        "id": "u015", "name": "广州大学", "province": "广东", "city": "广州",
        "type": [], "logo": "gzhu",
        "majors": [
            {
                "name": "艺术设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [70000, 75000, 72000, 78000, 74000]},
            },
            {
                "name": "广告学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [72000, 77000, 74000, 80000, 76000]},
            },
            {
                "name": "旅游管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [75000, 80000, 77000, 83000, 79000]},
            },
            {
                "name": "酒店管理",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [78000, 83000, 80000, 86000, 82000]},
            },
            {
                "name": "体育教育",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [80000, 85000, 82000, 88000, 84000]},
            },
            {
                "name": "市场营销",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [73000, 78000, 75000, 81000, 77000]},
            },
        ],
        "subject_rankings": {
            "艺术设计": "B-", "广告学": "B-", "旅游管理": "B-",
            "酒店管理": "B-", "体育教育": "B-", "市场营销": "B-",
        },
    },
    {
        "id": "u016", "name": "华中科技大学", "province": "湖北", "city": "武汉",
        "type": ["985", "211", "双一流"], "logo": "hust",
        "majors": [
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [6000, 6700, 6200, 7000, 6400]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [10000, 11000, 10200, 11500, 10600]},
            },
            {
                "name": "电气工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [9000, 10000, 9200, 10500, 9500]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [6500, 7200, 6700, 7500, 6900]},
            },
            {
                "name": "工业设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [14000, 15500, 14300, 16000, 14800]},
            },
            {
                "name": "临床医学",
                "subject_req": {"required": ["化学", "生物"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [8000, 8800, 8200, 9200, 8500]},
            },
        ],
        "subject_rankings": {
            "计算机科学与技术": "A+", "机械工程": "A+", "电气工程": "A+",
            "软件工程": "A", "工业设计": "A+", "临床医学": "A-",
        },
    },
    {
        "id": "u017", "name": "东南大学", "province": "江苏", "city": "南京",
        "type": ["985", "211", "双一流"], "logo": "seu",
        "majors": [
            {
                "name": "土木工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [12000, 13200, 12300, 13700, 12700]},
            },
            {
                "name": "电气工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [9000, 10000, 9200, 10500, 9500]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [11000, 12200, 11300, 12700, 11700]},
            },
            {
                "name": "建筑学",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [15000, 16500, 15300, 17000, 15800]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [10000, 11000, 10200, 11500, 10600]},
            },
        ],
        "subject_rankings": {
            "土木工程": "A+", "电气工程": "A+", "机械工程": "A+",
            "建筑学": "A+", "软件工程": "A",
        },
    },
    {
        "id": "u018", "name": "广东工业大学", "province": "广东", "city": "广州",
        "type": [], "logo": "gdut",
        "majors": [
            {
                "name": "土木工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [55000, 60000, 57000, 62000, 58500]},
            },
            {
                "name": "机械工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [50000, 55000, 52000, 57000, 53500]},
            },
            {
                "name": "计算机科学与技术",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [45000, 50000, 47000, 52000, 48500]},
            },
            {
                "name": "软件工程",
                "subject_req": {"required": ["物理"], "optional": [], "logic": "AND"},
                "ranks": {"广东_物理": [48000, 53000, 50000, 55000, 51500]},
            },
            {
                "name": "工业设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [58000, 63000, 60000, 65000, 61500]},
            },
            {
                "name": "艺术设计",
                "subject_req": {"required": [], "optional": [], "logic": "ANY"},
                "ranks": {"广东_物理": [65000, 70000, 67000, 72000, 68500]},
            },
        ],
        "subject_rankings": {
            "土木工程": "B", "机械工程": "B+", "计算机科学与技术": "B+",
            "软件工程": "B", "工业设计": "B", "艺术设计": "B-",
        },
    },
]
