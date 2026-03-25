#!/bin/bash
# Git预提交钩子示例 - 功能文档检查
# 将此文件保存为 .git/hooks/pre-commit 并赋予执行权限

echo "🔍 检查功能文档更新..."

# 检查是否修改了功能相关的文件
FEATURE_FILES="FEATURE-MAP.md"
MODIFIED_FILES=$(git diff --cached --name-only)

# 检查是否有功能相关的代码文件被修改
FEATURE_CODE_PATTERN="src/.*feature.*\.(js|ts|py|java)$|.*/features/.*"
FEATURE_CODE_CHANGES=$(echo "$MODIFIED_FILES" | grep -E "$FEATURE_CODE_PATTERN" || true)

if [ -n "$FEATURE_CODE_CHANGES" ]; then
    echo "📝 检测到功能相关代码变更:"
    echo "$FEATURE_CODE_CHANGES" | while read -r file; do
        echo "  - $file"
    done
    
    # 检查FEATURE-MAP.md是否也被修改
    if echo "$MODIFIED_FILES" | grep -q "FEATURE-MAP.md"; then
        echo "✅ FEATURE-MAP.md 已更新，检查通过"
    else
        echo "⚠️  警告: 检测到功能代码变更，但 FEATURE-MAP.md 未更新"
        echo "   请确认是否需要更新功能文档:"
        echo "   1. 如果新增功能: 在 FEATURE-MAP.md 中添加功能条目"
        echo "   2. 如果修改功能: 更新 FEATURE-MAP.md 中的功能详情"
        echo "   3. 如果删除功能: 在 FEATURE-MAP.md 中标记功能为废弃"
        echo ""
        echo "   您可以:"
        echo "   a. 立即更新 FEATURE-MAP.md 并重新提交"
        echo "   b. 使用 --no-verify 跳过检查（不推荐）"
        echo ""
        read -p "是否继续提交？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ 提交已取消，请更新功能文档后重新提交"
            exit 1
        fi
    fi
fi

# 如果FEATURE-MAP.md被修改，运行验证
if echo "$MODIFIED_FILES" | grep -q "FEATURE-MAP.md"; then
    echo "📋 FEATURE-MAP.md 有变更，运行验证..."
    
    # 检查功能文档格式
    if ! grep -q "## 功能目录" "FEATURE-MAP.md"; then
        echo "❌ 错误: FEATURE-MAP.md 缺少 '## 功能目录' 章节"
        exit 1
    fi
    
    if ! grep -q "### 功能ID:" "FEATURE-MAP.md"; then
        echo "❌ 错误: FEATURE-MAP.md 缺少功能详情章节"
        exit 1
    fi
    
    # 检查功能ID格式
    INVALID_IDS=$(grep -n "### 功能ID:" "FEATURE-MAP.md" | grep -v "### 功能ID: \`F-\d\{3\}\`")
    if [ -n "$INVALID_IDS" ]; then
        echo "❌ 错误: 发现格式错误的功能ID:"
        echo "$INVALID_IDS"
        exit 1
    fi
    
    echo "✅ FEATURE-MAP.md 格式验证通过"
fi

# 运行功能文档管理器验证（如果可用）
if [ -f "scripts/feature-map-manager.py" ]; then
    echo "🔧 运行功能文档完整性检查..."
    python3 scripts/feature-map-manager.py validate
    if [ $? -ne 0 ]; then
        echo "❌ 功能文档完整性检查失败"
        echo "   请修复问题后重新提交"
        exit 1
    fi
fi

echo "✅ 所有检查通过，可以提交"
exit 0