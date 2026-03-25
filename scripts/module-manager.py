#!/usr/bin/env python3
"""
模块化文档管理工具
用于管理模块化架构中的模块文档和依赖关系
"""

import re
import sys
import argparse
import json
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

class ModuleManager:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.overview_file = self.project_root / "PROJECT-OVERVIEW.md"
        self.modules_dir = self.project_root / "docs" / "modules"
        self.modules = {}
        self.dependencies = {}
        
    def load_overview(self):
        """加载项目概览文档"""
        if not self.overview_file.exists():
            print(f"错误: 项目概览文件不存在: {self.overview_file}")
            sys.exit(1)
        
        with open(self.overview_file, 'r', encoding='utf-8') as f:
            self.overview_content = f.read()
        
        self._parse_modules()
        self._parse_dependency_matrix()
    
    def _parse_modules(self):
        """从概览文档中解析模块信息"""
        # 查找模块目录表格
        table_pattern = r'\|\s*`(M-\d{3})`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|'
        matches = re.findall(table_pattern, self.overview_content)
        
        for match in matches:
            module_id, module_name, status, priority, owner, doc_file = match
            self.modules[module_id] = {
                'id': module_id,
                'name': module_name.strip(),
                'status': status.strip(),
                'priority': priority.strip(),
                'owner': owner.strip(),
                'doc_file': doc_file.strip(),
                'doc_path': self.modules_dir / doc_file.strip()
            }
    
    def _parse_dependency_matrix(self):
        """解析模块依赖矩阵"""
        # 查找依赖矩阵表格
        matrix_pattern = r'\|\s*`(M-\d{3})`\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|'
        
        # 找到依赖矩阵部分
        matrix_section = re.search(r'## 模块依赖矩阵.*?(?=##|$)', self.overview_content, re.DOTALL)
        if not matrix_section:
            return
        
        matrix_content = matrix_section.group(0)
        matches = re.findall(matrix_pattern, matrix_content)
        
        # 初始化依赖矩阵
        module_ids = sorted(self.modules.keys())
        self.dependencies = {mid: {other: '❌' for other in module_ids} for mid in module_ids}
        
        for match in matches:
            source_id = match[0]
            for i, dep_status in enumerate(match[1:], 1):
                if i <= len(module_ids):
                    target_id = module_ids[i-1]
                    self.dependencies[source_id][target_id] = dep_status
    
    def load_module(self, module_id: str) -> Dict:
        """加载单个模块的详细信息"""
        if module_id not in self.modules:
            print(f"错误: 模块 {module_id} 不存在")
            return {}
        
        module_info = self.modules[module_id]
        module_file = module_info['doc_path']
        
        if not module_file.exists():
            print(f"警告: 模块文档不存在: {module_file}")
            return module_info
        
        with open(module_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 解析模块基本信息
        module_info['description'] = self._extract_description(content)
        module_info['features'] = self._extract_features(content)
        module_info['internal_deps'] = self._extract_internal_dependencies(content)
        
        return module_info
    
    def _extract_description(self, content: str) -> str:
        """从模块文档中提取描述"""
        desc_pattern = r'\*\*模块描述\*\*：\s*(.*?)(?=\n\n|\n##)'
        match = re.search(desc_pattern, content, re.DOTALL)
        return match.group(1).strip() if match else ""
    
    def _extract_features(self, content: str) -> List[Dict]:
        """从模块文档中提取功能列表"""
        features = []
        
        # 查找功能目录表格
        table_pattern = r'\|\s*`(F-\d{3})`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|'
        matches = re.findall(table_pattern, content)
        
        for match in matches:
            feature_id, feature_name, status, priority, owner, last_update = match
            features.append({
                'id': feature_id,
                'name': feature_name.strip(),
                'status': status.strip(),
                'priority': priority.strip(),
                'owner': owner.strip(),
                'last_update': last_update.strip()
            })
        
        return features
    
    def _extract_internal_dependencies(self, content: str) -> Dict[str, Dict[str, str]]:
        """提取模块内部功能依赖矩阵"""
        # 查找模块内依赖矩阵
        matrix_pattern = r'\|\s*`(F-\d{3})`\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|\s*([✅🔶❌\-])\s*\|'
        
        matrix_section = re.search(r'## 模块内功能依赖矩阵.*?(?=##|$)', content, re.DOTALL)
        if not matrix_section:
            return {}
        
        matrix_content = matrix_section.group(0)
        matches = re.findall(matrix_pattern, matrix_content)
        
        # 获取功能ID列表
        feature_ids = sorted([f['id'] for f in self._extract_features(content)])
        deps = {fid: {other: '❌' for other in feature_ids} for fid in feature_ids}
        
        for match in matches:
            source_id = match[0]
            for i, dep_status in enumerate(match[1:], 1):
                if i <= len(feature_ids):
                    target_id = feature_ids[i-1]
                    deps[source_id][target_id] = dep_status
        
        return deps
    
    def list_modules(self, filter_status: Optional[str] = None):
        """列出所有模块"""
        print(f"{'模块ID':<10} {'模块名称':<25} {'状态':<15} {'优先级':<10} {'功能数':<8} {'负责人':<15}")
        print("-" * 90)
        
        for module_id, module_info in self.modules.items():
            if filter_status and filter_status not in module_info['status']:
                continue
            
            # 加载模块详情获取功能数量
            module_detail = self.load_module(module_id)
            feature_count = len(module_detail.get('features', []))
            
            print(f"{module_id:<10} {module_info['name']:<25} {module_info['status']:<15} "
                  f"{module_info['priority']:<10} {feature_count:<8} {module_info['owner']:<15}")
    
    def show_module(self, module_id: str):
        """显示模块详情"""
        if module_id not in self.modules:
            print(f"错误: 模块 {module_id} 不存在")
            return
        
        module_info = self.load_module(module_id)
        
        print(f"模块ID: {module_info['id']}")
        print(f"模块名称: {module_info['name']}")
        print(f"状态: {module_info['status']}")
        print(f"优先级: {module_info['priority']}")
        print(f"负责人: {module_info['owner']}")
        print(f"文档文件: {module_info['doc_file']}")
        
        if 'description' in module_info:
            print(f"\n描述: {module_info['description']}")
        
        # 显示功能列表
        if module_info.get('features'):
            print(f"\n功能列表 ({len(module_info['features'])}个):")
            print(f"{'功能ID':<10} {'功能名称':<25} {'状态':<15} {'优先级':<10}")
            print("-" * 60)
            for feature in module_info['features']:
                print(f"{feature['id']:<10} {feature['name']:<25} {feature['status']:<15} {feature['priority']:<10}")
        
        # 显示外部依赖
        print(f"\n模块依赖关系:")
        for target_id, dep_status in self.dependencies.get(module_id, {}).items():
            if dep_status != '❌' and dep_status != '-':
                target_name = self.modules.get(target_id, {}).get('name', '未知')
                print(f"  {dep_status} {target_id}: {target_name}")
    
    def analyze_dependencies(self, module_id: str, direction: str = "all"):
        """分析模块依赖链"""
        if module_id not in self.modules:
            print(f"错误: 模块 {module_id} 不存在")
            return
        
        visited = set()
        
        def dfs(current_id: str, depth: int = 0, is_upstream: bool = True):
            if current_id in visited:
                return
            visited.add(current_id)
            
            prefix = "  " * depth + ("↑ " if is_upstream else "↓ ")
            module_name = self.modules.get(current_id, {}).get('name', '未知')
            print(f"{prefix}{current_id}: {module_name}")
            
            # 上游依赖（依赖的其他模块）
            if direction in ["upstream", "all"] and is_upstream:
                for target_id, dep_status in self.dependencies.get(current_id, {}).items():
                    if dep_status in ['✅', '🔶'] and target_id != current_id:
                        dfs(target_id, depth + 1, True)
            
            # 下游依赖（依赖此模块的其他模块）
            if direction in ["downstream", "all"] and not is_upstream:
                for source_id, deps in self.dependencies.items():
                    if deps.get(module_id) in ['✅', '🔶']:
                        dfs(source_id, depth + 1, False)
        
        print(f"模块 {module_id} 的依赖关系分析:")
        
        if direction in ["upstream", "all"]:
            print("\n上游依赖链（本模块依赖的其他模块）:")
            dfs(module_id, 0, True)
            visited.clear()
        
        if direction in ["downstream", "all"]:
            print("\n下游依赖链（依赖本模块的其他模块）:")
            visited.clear()
            for source_id, deps in self.dependencies.items():
                if deps.get(module_id) in ['✅', '🔶']:
                    dfs(source_id, 0, False)
    
    def validate(self):
        """验证模块化架构的完整性"""
        print("验证模块化架构...")
        
        issues = []
        
        # 检查模块ID格式
        for module_id in self.modules:
            if not re.match(r'^M-\d{3}$', module_id):
                issues.append(f"模块ID格式错误: {module_id}")
        
        # 检查模块文档是否存在
        for module_id, module_info in self.modules.items():
            if not module_info['doc_path'].exists():
                issues.append(f"模块文档不存在: {module_info['doc_file']} (模块 {module_id})")
        
        # 检查循环依赖
        def check_cycle(current_id: str, path: List[str]):
            if current_id in path:
                cycle = " -> ".join(path[path.index(current_id):] + [current_id])
                issues.append(f"发现模块循环依赖: {cycle}")
                return True
            return False
        
        def dfs_cycle(current_id: str, path: List[str]):
            if check_cycle(current_id, path):
                return
            
            for target_id, dep_status in self.dependencies.get(current_id, {}).items():
                if dep_status in ['✅', '🔶'] and target_id != current_id:
                    dfs_cycle(target_id, path + [current_id])
        
        for module_id in self.modules:
            dfs_cycle(module_id, [])
        
        # 检查功能ID命名空间
        for module_id, module_info in self.modules.items():
            module_detail = self.load_module(module_id)
            for feature in module_detail.get('features', []):
                feature_id = feature['id']
                if module_id == 'M-001' and not re.match(r'^F-00\d$', feature_id):
                    issues.append(f"核心模块功能ID命名空间错误: {feature_id}")
                elif module_id == 'M-002' and not re.match(r'^F-1\d{2}$', feature_id):
                    issues.append(f"认证模块功能ID命名空间错误: {feature_id}")
                elif module_id == 'M-003' and not re.match(r'^F-2\d{2}$', feature_id):
                    issues.append(f"对话模块功能ID命名空间错误: {feature_id}")
        
        if issues:
            print(f"发现 {len(issues)} 个问题:")
            for issue in issues:
                print(f"  - {issue}")
            return False
        else:
            print("✓ 模块化架构验证通过")
            return True
    
    def aggregate(self, output_file: Optional[str] = None):
        """聚合所有模块功能，生成传统的FEATURE-MAP.md"""
        print("聚合所有模块功能...")
        
        aggregated_content = "# 功能思维导图 / 功能文档（聚合视图）\n\n"
        aggregated_content += "**注意**: 此文件由模块管理工具自动生成，请勿直接编辑。\n"
        aggregated_content += "编辑功能请修改对应的模块文档。\n\n"
        
        aggregated_content += "## 项目概述\n\n"
        aggregated_content += "此视图聚合了所有模块的功能信息。\n\n"
        
        # 添加模块概览
        aggregated_content += "## 模块概览\n\n"
        aggregated_content += "| 模块ID | 模块名称 | 状态 | 功能数 |\n"
        aggregated_content += "|--------|----------|------|--------|\n"
        
        total_features = 0
        for module_id, module_info in self.modules.items():
            module_detail = self.load_module(module_id)
            feature_count = len(module_detail.get('features', []))
            total_features += feature_count
            
            aggregated_content += f"| `{module_id}` | `{module_info['name']}` | `{module_info['status']}` | {feature_count} |\n"
        
        aggregated_content += f"\n**总计**: {len(self.modules)} 个模块，{total_features} 个功能\n\n"
        
        # 添加所有功能
        aggregated_content += "## 所有功能\n\n"
        
        for module_id in sorted(self.modules.keys()):
            module_info = self.modules[module_id]
            module_detail = self.load_module(module_id)
            
            aggregated_content += f"### 模块: {module_info['name']} ({module_id})\n\n"
            
            if module_detail.get('features'):
                aggregated_content += "| 功能ID | 功能名称 | 状态 | 优先级 | 负责人 |\n"
                aggregated_content += "|--------|----------|------|--------|--------|\n"
                
                for feature in module_detail['features']:
                    aggregated_content += f"| `{feature['id']}` | `{feature['name']}` | `{feature['status']}` | `{feature['priority']}` | `{feature['owner']}` |\n"
                
                aggregated_content += "\n"
        
        # 写入文件
        if output_file:
            output_path = Path(output_file)
        else:
            output_path = self.project_root / "FEATURE-MAP-AGGREGATED.md"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(aggregated_content)
        
        print(f"✓ 已生成聚合文档: {output_path}")
        return str(output_path)
    
    def search_features(self, query: str):
        """搜索跨模块功能"""
        print(f"搜索功能: {query}")
        
        results = []
        
        for module_id, module_info in self.modules.items():
            module_detail = self.load_module(module_id)
            
            for feature in module_detail.get('features', []):
                # 在功能名称和ID中搜索
                if (query.lower() in feature['name'].lower() or 
                    query.lower() in feature['id'].lower()):
                    results.append({
                        'module_id': module_id,
                        'module_name': module_info['name'],
                        'feature': feature
                    })
        
        if results:
            print(f"找到 {len(results)} 个结果:")
            print(f"{'模块':<15} {'功能ID':<10} {'功能名称':<25} {'状态':<15}")
            print("-" * 65)
            
            for result in results:
                feature = result['feature']
                print(f"{result['module_name']} ({result['module_id']}):")
                print(f"  {feature['id']:<10} {feature['name']:<25} {feature['status']:<15}")
        else:
            print("未找到匹配的功能")
    
    def feature_dependencies(self, feature_id: str):
        """查看功能依赖关系"""
        # 查找功能所属模块
        feature_module = None
        feature_info = None
        
        for module_id, module_info in self.modules.items():
            module_detail = self.load_module(module_id)
            for feature in module_detail.get('features', []):
                if feature['id'] == feature_id:
                    feature_module = module_id
                    feature_info = feature
                    break
            if feature_module:
                break
        
        if not feature_info:
            print(f"错误: 功能 {feature_id} 不存在")
            return
        
        print(f"功能: {feature_info['name']} ({feature_id})")
        print(f"所属模块: {self.modules[feature_module]['name']} ({feature_module})")
        
        # 显示模块间依赖
        print(f"\n模块级依赖:")
        module_deps = self.dependencies.get(feature_module, {})
        for target_id, dep_status in module_deps.items():
            if dep_status != '❌' and dep_status != '-':
                target_name = self.modules.get(target_id, {}).get('name', '未知')
                print(f"  {dep_status} 依赖模块 {target_id}: {target_name}")

def main():
    parser = argparse.ArgumentParser(description="模块化文档管理工具")
    parser.add_argument("--root", default=".", help="项目根目录")
    
    subparsers = parser.add_subparsers(dest="command", help="命令")
    
    # list 命令
    list_parser = subparsers.add_parser("list", help="列出所有模块")
    list_parser.add_argument("--status", help="按状态过滤")
    
    # show 命令
    show_parser = subparsers.add_parser("show", help="显示模块详情")
    show_parser.add_argument("module_id", help="模块ID")
    
    # deps 命令
    deps_parser = subparsers.add_parser("deps", help="分析模块依赖")
    deps_parser.add_argument("module_id", help="模块ID")
    deps_parser.add_argument("--direction", choices=["upstream", "downstream", "all"], default="all", help="依赖方向")
    
    # validate 命令
    subparsers.add_parser("validate", help="验证模块化架构")
    
    # aggregate 命令
    aggregate_parser = subparsers.add_parser("aggregate", help="聚合所有功能")
    aggregate_parser.add_argument("--output", help="输出文件路径")
    
    # search 命令
    search_parser = subparsers.add_parser("search", help="搜索功能")
    search_parser.add_argument("query", help="搜索关键词")
    
    # feature-deps 命令
    feature_deps_parser = subparsers.add_parser("feature-deps", help="查看功能依赖")
    feature_deps_parser.add_argument("feature_id", help="功能ID")
    
    args = parser.parse_args()
    
    manager = ModuleManager(args.root)
    
    try:
        manager.load_overview()
    except Exception as e:
        print(f"加载项目概览失败: {e}")
        sys.exit(1)
    
    if args.command == "list":
        manager.list_modules(args.status)
    elif args.command == "show":
        manager.show_module(args.module_id)
    elif args.command == "deps":
        manager.analyze_dependencies(args.module_id, args.direction)
    elif args.command == "validate":
        success = manager.validate()
        sys.exit(0 if success else 1)
    elif args.command == "aggregate":
        manager.aggregate(args.output)
    elif args.command == "search":
        manager.search_features(args.query)
    elif args.command == "feature-deps":
        manager.feature_dependencies(args.feature_id)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()