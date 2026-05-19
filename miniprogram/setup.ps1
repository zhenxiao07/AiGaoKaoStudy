# AI志愿师 抖音小程序 构建脚本
# 使用方法：在 PowerShell 中运行 .\setup.ps1

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI志愿师 - 抖音小程序 构建向导" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/4] 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = node --version
    Write-Host "      Node.js $nodeVer 已安装 OK" -ForegroundColor Green
} catch {
    Write-Host "      错误：未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "      下载地址：https://nodejs.org" -ForegroundColor Gray
    exit 1
}

# 安装 Taro CLI
Write-Host "[2/4] 安装 Taro CLI（全局）..." -ForegroundColor Yellow
npm install -g @tarojs/cli@3.6.34
if ($LASTEXITCODE -ne 0) {
    Write-Host "      Taro CLI 安装失败，请检查网络或尝试：npm install -g @tarojs/cli@3.6.34 --registry https://registry.npmmirror.com" -ForegroundColor Red
    exit 1
}
Write-Host "      Taro CLI 安装 OK" -ForegroundColor Green

# 安装项目依赖
Write-Host "[3/4] 安装项目依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "      依赖安装失败，尝试使用国内镜像：" -ForegroundColor Red
    Write-Host "      npm install --registry https://registry.npmmirror.com" -ForegroundColor Gray
    exit 1
}
Write-Host "      依赖安装 OK" -ForegroundColor Green

# 构建抖音小程序
Write-Host "[4/4] 构建抖音小程序..." -ForegroundColor Yellow
npm run build:tt
if ($LASTEXITCODE -ne 0) {
    Write-Host "      构建失败，请查看上方错误信息" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   构建成功！输出目录：dist/" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "接下来的步骤：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 下载「抖音开发者工具」" -ForegroundColor White
Write-Host "   https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/developer-instrument/download/developer-instrument-update-and-download" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在抖音开放平台注册小程序，获取 AppID" -ForegroundColor White
Write-Host "   https://developer.open-douyin.com" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 将 AppID 填入 project.tt.json 的 appid 字段" -ForegroundColor White
Write-Host ""
Write-Host "4. 打开「抖音开发者工具」，选择「导入项目」" -ForegroundColor White
Write-Host "   项目目录：$(Join-Path $scriptDir 'dist')" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 配置后端地址（开发调试）：" -ForegroundColor White
Write-Host "   编辑 src/utils/api.ts，修改 BASE 变量" -ForegroundColor Gray
Write-Host "   开发工具中勾选「详情 > 本地设置 > 不校验合法域名」" -ForegroundColor Gray
Write-Host ""
Write-Host "6. 正式发布前：" -ForegroundColor White
Write-Host "   - 将后端部署到公网 HTTPS 服务器" -ForegroundColor Gray
Write-Host "   - 在开放平台「开发 > 开发设置」中配置服务器域名" -ForegroundColor Gray
Write-Host ""
Write-Host "开发模式（代码修改后自动重新构建）：" -ForegroundColor Yellow
Write-Host "   npm run dev:tt" -ForegroundColor Cyan
Write-Host ""
