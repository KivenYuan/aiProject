# GitHub HTTPS推送脚本
# 使用方法：
# 1. 在GitHub生成Personal Access Token（需repo权限）
# 2. 运行此脚本：.\push-to-github.ps1
# 3. 输入GitHub用户名和Token作为密码

Write-Host "=== GitHub HTTPS推送脚本 ===" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确目录
if (-not (Test-Path ".git")) {
    Write-Host "错误：当前目录不是Git仓库" -ForegroundColor Red
    Write-Host "请切换到项目根目录：D:\code\AIProject\ai-frontend" -ForegroundColor Yellow
    exit 1
}

# 显示仓库信息
Write-Host "📦 仓库信息：" -ForegroundColor Green
git remote -v
Write-Host ""

# 显示待推送的提交
Write-Host "📝 待推送的提交：" -ForegroundColor Green
git log --oneline --graph -5
Write-Host ""

# 确认推送
$confirm = Read-Host "是否开始推送？(y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "已取消推送" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 开始推送..." -ForegroundColor Cyan
Write-Host "========================================"

# 执行推送
try {
    # 尝试推送
    git push -u origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 推送成功！" -ForegroundColor Green
        Write-Host "仓库地址：https://github.com/KivenYuan/aiProject" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ 推送失败 (错误码：$LASTEXITCODE)" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 常见问题解决：" -ForegroundColor Yellow
        Write-Host "1. 确保已在GitHub创建仓库：aiProject" -ForegroundColor Yellow
        Write-Host "2. 使用GitHub Token而不是密码" -ForegroundColor Yellow
        Write-Host "3. Token需要有repo权限" -ForegroundColor Yellow
        Write-Host "4. 仓库URL：https://github.com/KivenYuan/aiProject.git" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 推送过程中出错：$_" -ForegroundColor Red
}

Write-Host "========================================"