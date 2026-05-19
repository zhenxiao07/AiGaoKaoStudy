#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高考专业录取分数爬虫 - 整合版
功能：按学校抓取近5年专业录取分数，每处理完一所学校后暂停10分钟
数据源：掌上高考 (eol.cn)
"""

import os
import time
import json
import hmac
import hashlib
import base64
import logging
from datetime import datetime
import requests

# ==================== 配置 ====================
PROVINCE_ID = 34          # 安徽省，可根据需要修改 (北京11, 安徽34, 江苏32...)
YEARS = [2021, 2022, 2023, 2024, 2025]   # 近5年
REQUEST_TIMEOUT = 15      # 请求超时秒数
RETRY_TIMES = 3           # 失败重试次数
SCHOOL_FETCH_SIZE = 100   # 每页获取学校数量
SLEEP_BETWEEN_YEARS = 5   # 同所学校不同年份之间的延时（秒）
SLEEP_BETWEEN_SCHOOLS = 600  # 学校与学校之间的延时（秒）=10分钟

# 数据存储目录
DATA_DIR = "data"
LOG_DIR = "logs"
PROGRESS_FILE = "crawled_schools.txt"

# 配置日志
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "crawler.log"), encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 全局 session
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
})

# ==================== 签名生成（掌上高考 signsafe）====================
def generate_sign(url):
    """
    根据完整URL生成 signsafe 签名
    算法: HMAC-SHA1(URL, key="D23ABC@#56") -> Base64
    """
    key = "D23ABC@#56"
    signature = hmac.new(key.encode(), url.encode(), hashlib.sha1).digest()
    return base64.b64encode(signature).decode()

# ==================== 获取学校列表 ====================
def fetch_schools(province_id, page=1):
    """
    获取指定省份的学校列表（分页）
    返回: [(学校名, school_id), ...]
    """
    url = "https://api.zjzw.cn/web/api/"
    payload = {
        "province_id": province_id,
        "page": page,
        "request_type": 1,
        "size": SCHOOL_FETCH_SIZE
    }
    try:
        resp = session.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        items = data.get('data', {}).get('item', [])
        schools = []
        for item in items:
            name = item.get('name')
            school_id = item.get('school_id')
            if name and school_id:
                schools.append((name, school_id))
        # 判断是否还有下一页
        total_page = data.get('data', {}).get('totalPage', 1)
        return schools, page < total_page
    except Exception as e:
        logger.error(f"获取学校列表失败 (province={province_id}, page={page}): {e}")
        return [], False

def get_all_schools(province_id):
    """获取省份下所有学校（自动翻页）"""
    all_schools = []
    page = 1
    while True:
        logger.info(f"正在获取第 {page} 页学校列表...")
        schools, has_next = fetch_schools(province_id, page)
        all_schools.extend(schools)
        if not has_next:
            break
        page += 1
        time.sleep(1)  # 翻页间隔
    logger.info(f"共获取到 {len(all_schools)} 所学校")
    return all_schools

# ==================== 抓取单所学校某年的专业分数 ====================
def fetch_scores_for_school(school_id, school_name, year, province_id):
    """
    抓取单所学校指定年份在某个省份的专业录取数据
    返回: list of dict (专业分数详情)
    """
    # 构造原始请求参数（注意：这是 GET 请求，签名需要包含完整 URL）
    base_url = "https://api.eol.cn/web/api/"
    params = {
        "local_province_id": province_id,
        "year": year,
        "school_id": school_id,
        "uri": "apidata/api/gk/score/special",
        "local_batch_id": 7,   # 本科批次，可根据需要调整（7表示本科批）
        "page": 1,
        "size": 50
    }
    # 拼接查询字符串（按字母排序？不必须，保持原顺序即可）
    query_parts = [f"{k}={v}" for k, v in params.items()]
    query_string = "&".join(query_parts)
    full_path = f"{base_url}?{query_string}"
    
    # 生成签名
    signsafe = generate_sign(full_path)
    final_url = f"{full_path}&signsafe={signsafe}"
    
    for attempt in range(RETRY_TIMES):
        try:
            resp = session.get(final_url, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                result = resp.json()
                # 检查业务状态码
                if result.get('code') == 200 or 'data' in result:
                    items = result.get('data', {}).get('item', [])
                    # 添加额外字段便于识别
                    for item in items:
                        item['school_id'] = school_id
                        item['school_name'] = school_name
                        item['year'] = year
                    logger.info(f"  {school_name} - {year}年 获取到 {len(items)} 条专业记录")
                    return items
                else:
                    logger.warning(f"  API返回异常: {result.get('message', '未知错误')}")
            else:
                logger.warning(f"  请求失败 HTTP {resp.status_code}")
        except Exception as e:
            logger.error(f"  请求异常 (尝试 {attempt+1}/{RETRY_TIMES}): {e}")
            time.sleep(2)
    logger.error(f"  {school_name} - {year} 年抓取失败（已重试{RETRY_TIMES}次）")
    return []

# ==================== 保存学校数据 ====================
def save_school_data(school_name, school_id, all_years_data):
    """将某所学校所有年份的数据保存为JSON文件"""
    os.makedirs(DATA_DIR, exist_ok=True)
    filename = os.path.join(DATA_DIR, f"{school_name}_{school_id}.json")
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(all_years_data, f, ensure_ascii=False, indent=2)
    logger.info(f"数据已保存: {filename} (共 {len(all_years_data)} 条记录)")

# ==================== 断点续传管理 ====================
def load_processed_schools():
    """读取已处理的学校ID集合"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def mark_school_processed(school_id):
    """标记学校已完成"""
    with open(PROGRESS_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{school_id}\n")

# ==================== 主流程（每所学校间隔10分钟）====================
def main():
    logger.info("========== 高考专业录取爬虫启动 ==========")
    logger.info(f"目标省份ID: {PROVINCE_ID}, 年份: {YEARS}")
    
    # 1. 获取全部学校列表
    schools = get_all_schools(PROVINCE_ID)
    if not schools:
        logger.error("未获取到任何学校，退出")
        return
    
    # 2. 加载已完成列表
    processed = load_processed_schools()
    remaining = [s for s in schools if s[1] not in processed]
    logger.info(f"总学校数: {len(schools)}, 已完成: {len(processed)}, 剩余: {len(remaining)}")
    
    if not remaining:
        logger.info("所有学校均已处理完毕，爬虫结束")
        return
    
    # 3. 循环处理每所学校
    for idx, (school_name, school_id) in enumerate(remaining, start=1):
        logger.info(f"\n========== [{idx}/{len(remaining)}] 开始处理: {school_name} (ID: {school_id}) ==========")
        all_data = []
        
        # 抓取近5年数据
        for year in YEARS:
            logger.info(f"  抓取 {year} 年数据...")
            year_data = fetch_scores_for_school(school_id, school_name, year, PROVINCE_ID)
            if year_data:
                all_data.extend(year_data)
            # 避免请求过快
            time.sleep(SLEEP_BETWEEN_YEARS)
        
        # 保存数据（即使某年无数据也保存空列表）
        save_school_data(school_name, school_id, all_data)
        mark_school_processed(school_id)
        
        # 判断是否还有下一所学校
        if idx < len(remaining):
            logger.info(f"等待 {SLEEP_BETWEEN_SCHOOLS // 60} 分钟，继续下一所学校...")
            time.sleep(SLEEP_BETWEEN_SCHOOLS)
    
    logger.info("所有剩余学校处理完毕！")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("用户中断程序，进度已保存，下次运行将跳过已完成的学校。")
    except Exception as e:
        logger.exception(f"程序异常退出: {e}")