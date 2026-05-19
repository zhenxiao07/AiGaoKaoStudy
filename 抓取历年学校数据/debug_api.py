import requests
import json

url = "https://api.zjzw.cn/web/api/"
payload = {
    "province_id": 34,
    "page": 1,
    "request_type": 1,
    "size": 100
}

# 尝试不同的请求方式
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Content-Type": "application/json"
}

# 方式1: POST + json
resp1 = requests.post(url, json=payload, headers=headers, timeout=10)
print("POST json 状态码:", resp1.status_code)
print("响应内容前500字符:", resp1.text[:500])
print("是否为 JSON:", resp1.headers.get('Content-Type', ''))
try:
    print("JSON解析结果:", json.dumps(resp1.json(), ensure_ascii=False)[:500])
except:
    print("不是有效JSON")

print("\n" + "="*50 + "\n")

# 方式2: POST + data (form)
resp2 = requests.post(url, data=payload, headers={"User-Agent": headers["User-Agent"]}, timeout=10)
print("POST form 状态码:", resp2.status_code)
print("响应内容前500字符:", resp2.text[:500])