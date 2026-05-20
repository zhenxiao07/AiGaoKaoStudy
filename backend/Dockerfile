FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# 国内服务器构建可改用清华源：--build-arg PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
ARG PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --default-timeout=120 \
        -i ${PIP_INDEX_URL} -r requirements.txt

COPY . .

EXPOSE 8000

# 默认环境变量（密钥请通过 .env / docker-compose 注入，勿写入镜像）
ENV PYTHONUNBUFFERED=1 \
    ALLOWED_ORIGINS="*"

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
