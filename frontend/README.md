# AI志愿师 · 前端

基于 **Next.js 16 + React 19 + Tailwind CSS 4** 构建的高考志愿智能填报前端，提供 MBTI/Holland 测评、专业推荐、院校匹配与 AI 流式问答全链路体验。

## 技术栈

| 组件 | 版本 |
|------|------|
| Next.js | 16.2 |
| React | 19.2 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Zustand | 5 |

## 目录结构

```
frontend/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（信息填写入口）
│   ├── assessment/
│   │   └── page.tsx        # MBTI + Holland 测评页
│   ├── self-assess/
│   │   └── page.tsx        # 自我评估页
│   ├── results/
│   │   ├── majors/page.tsx # 专业推荐结果页
│   │   └── schools/page.tsx# 院校推荐结果页
│   └── chat/
│       └── page.tsx        # AI 对话页（SSE 流式）
├── public/                 # 静态资源
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## 快速启动

### 方式一：项目根目录一键脚本（推荐）

```bash
cd ..          # 切换到项目根目录
bash start.sh
```

### 方式二：手动启动

**1. 安装依赖**

```bash
cd frontend
npm install
```

**2. 启动开发服务器**

```bash
npm run dev
```

访问 <http://localhost:3000> 查看应用。

**3. 其他常用命令**

```bash
# 构建生产包
npm run build

# 启动生产服务器（需先 build）
npm run start

# 类型检查
npx tsc --noEmit
```

## 页面路由说明

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 填写省份、分数、科目等基本信息 |
| `/assessment` | 测评 | MBTI + Holland 人格测评题目 |
| `/self-assess` | 自我评估 | 兴趣与能力自评 |
| `/results/majors` | 专业推荐 | 基于测评结果的专业匹配列表 |
| `/results/schools` | 院校推荐 | 院校筛选与位次参考 |
| `/chat` | AI 对话 | 与张雪峰风格 AI 顾问实时对话 |

## 环境变量

前端默认通过 `http://localhost:8000` 调用后端 API。如需修改，在 `frontend/` 下新建 `.env.local`：

```env
NEXT_PUBLIC_API_BASE=http://your-backend-host:8000
```

> 确保后端服务已启动，否则测评提交和 AI 对话功能将无法使用。

## 开发说明

- 样式：使用 **Tailwind CSS v4**（配置在 `postcss.config.mjs`），与 v3 语法有所不同
- 状态管理：**Zustand v5** 管理全局用户信息与测评结果
- AI 对话：通过 **SSE（Server-Sent Events）** 实现流式输出，接口为 `POST /agent/chat/stream`
- 本项目使用 **App Router**（`app/` 目录），非 Pages Router

## 常用命令速查

```bash
# 安装新依赖
npm install <package-name>

# 查看 Next.js 版本
npx next --version

# 清除缓存并重新构建
rm -rf .next && npm run build

# 查看端口占用（确认 3000 是否被占用）
lsof -i :3000
```

## 环境要求

- Node.js **18+**（推荐 20 LTS）
- npm **9+**
