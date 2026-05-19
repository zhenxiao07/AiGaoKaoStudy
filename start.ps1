# AI志愿师 启动脚本
# 用法：在项目根目录运行 .\start.ps1

Write-Host "启动 AI志愿师..." -ForegroundColor Cyan

# 设置智谱AI Key（已配置）
if (-not $env:ZHIPU_API_KEY) {
    $env:ZHIPU_API_KEY = "09f3e44425c3490eac39ec517fe7d0ab.eKjcGwl1MCWiqQPW"
}

# 启动后端
Write-Host "`n[1/2] 启动后端 (FastAPI:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; `$env:ZHIPU_API_KEY='09f3e44425c3490eac39ec517fe7d0ab.eKjcGwl1MCWiqQPW'; python -m uvicorn main:app --reload --port 8000"

Start-Sleep -Seconds 2

# 启动前端
Write-Host "[2/2] 启动前端 (Next.js:3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n已启动！请稍等几秒后访问：" -ForegroundColor Cyan
Write-Host "  前端：http://localhost:3000" -ForegroundColor White
Write-Host "  后端：http://localhost:8000" -ForegroundColor White
Write-Host "  API文档：http://localhost:8000/docs" -ForegroundColor White
