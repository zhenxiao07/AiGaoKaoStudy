# AI志愿师 · 后端服务

基于 **FastAPI** 构建的高考志愿填报 AI 后端，集成 Anthropic Claude 实现张雪峰风格的智能问答，支持 MBTI/Holland 测评与 Agentic 多工具调用。

## 技术栈

| 组件 | 版本 |
|------|------|
| Python | 3.10+ |
| FastAPI | 0.115 |
| Uvicorn | 0.30 |
| Anthropic SDK | 0.40 |
| Pydantic | 2.9 |

## 目录结构

```
backend/
├── main.py              # FastAPI 应用入口，CORS 配置
├── requirements.txt     # Python 依赖
├── .env.example         # 环境变量模板
├── routers/
│   ├── assessment.py    # MBTI / Holland 测评接口
│   └── agent.py         # AI 对话接口（普通 + SSE 流式）
├── services/
│   └── agent_service.py # Claude Agentic Loop，工具调用逻辑
├── models/
│   └── schemas.py       # Pydantic 请求/响应模型
└── data/
    ├── questions.py     # 测评题库
    ├── mappings.py      # 专业就业评分映射
    ├── xuefeng_kb.py    # 张雪峰知识库
    └── universities.py  # 院校数据
```

## 快速启动

### 方式一：项目根目录一键脚本（推荐）

```bash
cd ..          # 切换到项目根目录
bash start.sh
```

### 方式二：手动启动

**1. 创建虚拟环境并安装依赖**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**2. 配置环境变量**

```bash
cp .env.example .env
# 编辑 .env，填入你的 Anthropic API Key
nano .env
```

`.env` 内容：

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

**3. 启动服务**

```bash
# 开发模式（热重载）
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 生产模式（多 worker）
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

服务启动后访问：

- API 根路径：<http://localhost:8000/>
- 交互文档（Swagger）：<http://localhost:8000/docs>
- 备用文档（ReDoc）：<http://localhost:8000/redoc>

## API 接口

### 测评模块 `/assessment`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/assessment/questions` | 获取 MBTI + Holland 全量题目 |
| POST | `/assessment/submit` | 提交答题，返回人格类型与推荐专业 |

### 智能对话 `/agent`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/agent/chat` | 同步对话，返回完整回复 |
| POST | `/agent/chat/stream` | SSE 流式对话，逐 token 推送 |

#### 请求体示例

```json
{
  "user_info": {
    "province": "广东",
    "score": 620,
    "subject_type": "物理",
    "subject_selection": ["物理", "化学", "生物"]
  },
  "mbti_type": "INTJ",
  "top_majors": ["计算机科学与技术", "软件工程", "人工智能"],
  "top_school": "华南理工大学",
  "messages": [],
  "new_message": "我适合学计算机吗？"
}
```

## Agent 工具说明

后端实现了完整的 Agentic Loop，Claude 可自动调用以下工具：

| 工具名 | 功能 |
|--------|------|
| `search_xuefeng_kb` | 检索张雪峰对专业/院校的观点 |
| `query_school` | 查询院校基本信息、录取位次 |
| `query_major` | 查询专业就业率与平均薪资 |

## 常用命令

```bash
# 查看实时日志（一键脚本启动后）
tail -f ../backend.log

# 停止后台后端进程
kill $(cat ../.backend.pid)

# 运行时检查依赖
pip list | grep -E "fastapi|uvicorn|anthropic"

# 格式化代码
pip install black && black .
```

## 环境要求

- Python **3.10+**
- Anthropic API Key（[获取地址](https://console.anthropic.com/)）
- 网络可访问 `api.anthropic.com`
