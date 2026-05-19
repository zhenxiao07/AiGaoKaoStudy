import requests

url = "https://api.zjzw.cn/web/api/"
payload = {
    "uri": "apidata/api/gk/school",
    "province_id": 34,
    "page": 1,
    "request_type": 1,
    "size": 10
}
resp = requests.post(url, json=payload)
print("状态码:", resp.status_code)
print("返回内容:", resp.text[:500])