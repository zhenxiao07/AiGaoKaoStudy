FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# 默认环境变量（docker compose / docker run -e 可覆盖）
ENV PYTHONUNBUFFERED=1 \
    ALLOWED_ORIGINS="*" \
    ZHIPU_API_KEY="09f3e44425c3490eac39ec517fe7d0ab.eKjcGwl1MCWiqQPW "

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
