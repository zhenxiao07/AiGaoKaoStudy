#!/usr/bin/env python3
"""
create_major_demo.py
生成专业录取分数演示数据，写入 gaokao.db 的 major_admissions 表。

策略：
  - 从 admissions 表读取平均分 >= 540 的院校（约211及以上层次）
  - 为每个 院校×省份×科类×批次 组合生成若干专业的模拟分数
  - 专业分数 = 院校平均最低分 + 专业偏移量 + 年度随机波动
  - 固定随机种子保证可复现
"""
import random
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "gaokao.db"
RNG = random.Random(42)

# (专业名称, 分差下限, 分差上限)  相对于院校年均最低分
# 正数 = 比校线高，负数 = 比校线低
STEM_MAJORS = [
    ("计算机科学与技术",    +8, +20),
    ("软件工程",            +6, +18),
    ("人工智能",            +10, +22),
    ("数据科学与大数据技术", +7, +18),
    ("电气工程及其自动化",   -3,  +8),
    ("机械工程",            -10,  -2),
    ("土木工程",            -14,  -5),
    ("化学工程与工艺",      -12,  -3),
    ("数学与应用数学",       +2, +10),
    ("统计学",               +1,  +9),
    ("物理学",               -5,  +5),
    ("金融学",               +5, +16),
    ("经济学",               +3, +12),
    ("临床医学",             +5, +20),
    ("药学",                 -3,  +8),
    ("英语",                 -8,  +2),
    ("汉语言文学",           -15,  -5),
    ("法学",                 -2,  +8),
    ("工商管理",             -4,  +8),
    ("新闻传播学",           -3,  +8),
]

LIB_MAJORS = [
    ("汉语言文学",    -12,  -2),
    ("历史学",        -15,  -5),
    ("哲学",          -18,  -8),
    ("经济学",         +5, +15),
    ("金融学",         +8, +18),
    ("会计学",         +3, +12),
    ("工商管理",       -4,  +8),
    ("法学",           +0, +10),
    ("新闻学",         -2,  +8),
    ("英语",           -5,  +3),
    ("行政管理",       -8,   0),
    ("国际关系",       +2, +12),
    ("政治学",         -5,  +5),
    ("社会学",         -8,  +2),
    ("教育学",         -10,  0),
]


def main() -> None:
    if not DB_PATH.exists():
        print(f"[ERROR] 找不到数据库: {DB_PATH}")
        print("请先运行 import_gaokao.py 导入高考数据。")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ── 建表 ─────────────────────────────────────────────────────────────────
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS major_admissions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        university_name TEXT    NOT NULL,
        major_name      TEXT    NOT NULL,
        province        TEXT    NOT NULL,
        subject_type    TEXT    NOT NULL,
        batch           TEXT    NOT NULL,
        year            INTEGER NOT NULL,
        min_score       INTEGER NOT NULL,
        UNIQUE(university_name, major_name, province, subject_type, batch, year)
    );
    CREATE INDEX IF NOT EXISTS idx_major_lookup
        ON major_admissions(university_name, province, subject_type, batch);
    CREATE INDEX IF NOT EXISTS idx_major_name
        ON major_admissions(major_name);
    """)

    # ── 检查是否已有数据 ──────────────────────────────────────────────────────
    existing = cur.execute("SELECT COUNT(*) FROM major_admissions").fetchone()[0]
    if existing > 0:
        print(f"major_admissions 已有 {existing:,} 条记录，跳过重复生成。")
        print("如需重新生成，请先执行: DROP TABLE major_admissions")
        conn.close()
        return

    # ── 读取院校基准分 ────────────────────────────────────────────────────────
    # 只处理平均最低分 >= 540 的组合（粗略筛选211及以上层次）
    base_rows = cur.execute("""
        SELECT university_name,
               student_province AS province,
               subject_type,
               batch,
               ROUND(AVG(min_score)) AS avg_score
        FROM admissions
        WHERE min_score IS NOT NULL
          AND min_score >= 540
        GROUP BY university_name, student_province, subject_type, batch
        HAVING COUNT(DISTINCT year) >= 2
        ORDER BY avg_score DESC
    """).fetchall()

    print(f"共找到 {len(base_rows):,} 个院校×省份×科类×批次 组合，开始生成专业数据…")

    buf: list[tuple] = []
    BATCH_SIZE = 5000

    for uni_name, province, subject_type, batch, avg_score in base_rows:
        avg_score = int(avg_score)
        # 根据科类选择专业列表（文科系列 / 理科系列）
        # 兼容"历史"/"物理"（新高考改革省份写法）
        is_lib = subject_type in ("文科", "历史")
        majors = LIB_MAJORS if is_lib else STEM_MAJORS

        for major_name, off_lo, off_hi in majors:
            # 这所学校×专业的固定偏移（随机但可复现）
            base_off = RNG.randint(off_lo, off_hi)

            for year in range(2016, 2021):
                year_noise = RNG.randint(-5, 5)
                min_score = max(200, min(750, avg_score + base_off + year_noise))
                buf.append((uni_name, major_name, province, subject_type, batch, year, min_score))

            if len(buf) >= BATCH_SIZE:
                cur.executemany(
                    "INSERT OR IGNORE INTO major_admissions "
                    "(university_name, major_name, province, subject_type, batch, year, min_score) "
                    "VALUES (?,?,?,?,?,?,?)",
                    buf,
                )
                conn.commit()
                buf.clear()

    if buf:
        cur.executemany(
            "INSERT OR IGNORE INTO major_admissions "
            "(university_name, major_name, province, subject_type, batch, year, min_score) "
            "VALUES (?,?,?,?,?,?,?)",
            buf,
        )
        conn.commit()

    total = cur.execute("SELECT COUNT(*) FROM major_admissions").fetchone()[0]
    print(f"Done! major_admissions total: {total:,} records.")
    conn.close()


if __name__ == "__main__":
    main()
