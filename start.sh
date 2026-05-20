#!/bin/bash
set -e

echo "==========================================="
echo "    AI 智能填报志愿 -- 一键启动"
echo "==========================================="

# ── 1. 检查 .env ──────────────────────────────
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "  [!] 缺少 .env 与 .env.example，无法继续"
        exit 1
    fi
    echo ""
    echo "  [!] 已从 .env.example 创建 .env，请填入 ZHIPU_API_KEY 后重新运行："
    echo "      nano .env"
    echo ""
    exit 1
fi

if grep -q "your_zhipu_api_key_here" .env; then
    echo ""
    echo "  [!] 请先在 .env 文件中填入真实的 ZHIPU_API_KEY："
    echo "      nano .env"
    echo ""
    exit 1
fi

# ── 2. 检查 Docker ────────────────────────────
if ! docker info > /dev/null 2>&1; then
    echo "  [!] Docker 未运行，请先启动 Docker"
    exit 1
fi

if ! docker compose version > /dev/null 2>&1; then
    echo "  [!] 未找到 docker compose，请安装 Docker Compose v2+"
    exit 1
fi

# ── 3. 构建 & 启动 ────────────────────────────
echo ""
echo "  [1/3] 构建镜像（首次约 3~5 分钟）..."
docker compose build

echo ""
echo "  [2/3] 启动所有服务..."
docker compose up -d

echo ""
echo "  [3/3] 等待服务就绪..."
for i in $(seq 1 12); do
    if curl -sf http://localhost/ > /dev/null 2>&1; then
        break
    fi
    printf "        等待中 %d/12 ...\r" "$i"
    sleep 5
done
echo ""

# ── 4. 输出访问信息 ───────────────────────────
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_SERVER_IP")

echo "==========================================="
echo "  服务已启动！"
echo ""
echo "  本机访问：   http://localhost"
echo "  局域网/公网：http://${SERVER_IP}"
echo ""
echo "  常用命令："
echo "    查看日志：  docker compose logs -f"
echo "    停止服务：  docker compose down"
echo "    重启服务：  docker compose restart"
echo "    强制重建：  docker compose build --no-cache && docker compose up -d"
echo "==========================================="
