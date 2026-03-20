#!/usr/bin/env python3
"""
功能文档管理工具
用于维护和查询 FEATURE-MAP.md 文档
"""

import re
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import json

class FeatureMapManager:
    def __init__(self, file_path: str = "FEATURE-MAP.md"):
        self.file_path = Path(file_path)
        self.content = ""
        self.features = {}
        
    def load(self):
        """加载功能文档"""
        if not self.file_path.exists():
            print(f"错误: 文件 {self.file_path} 不存在")
            sys.exit(1)
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            self.content = f.read()
        
        self._parse_features()
    
    def _parse_features(self):
        """解析功能文档，提取功能信息"""
        # 查找所有功能详情章节
        feature_pattern = r'### 功能ID: `([^`]+)` - `([^`]+)`(.*?)(?=### 功能ID:|## 依赖关系矩阵|$)'
        matches = re.findall(feature_pattern, self.content, re.DOTALL)
        
        for match in matches:
            feature_id, feature_name, feature_content = match
            self.features[feature_id] = {
                'id': feature_id,
                'name': feature_name.strip(),
                'content': feature_content.strip(),
                'dependencies': self._extract_dependencies(feature_content),
                'status': self._extract_status(feature_content)
            }
    
    def _extract_dependencies(self, content: str) -> Dict[str, List[str]]:
        """从功能内容中提取依赖关系"""
        dependencies = {'upstream': [], 'downstream': []}
        
        # 提取上游依赖
        upstream_pattern = r'\|\s*`([F]-\d+)`\s*\|\s*功能依赖\s*\|\s*`([^`]+)`'
        upstream_matches = re.findall(upstream_pattern, content)
        for dep_id, desc in upstream_matches:
            dependencies['upstream'].append({'id': dep_id, 'desc': desc})
        
        # 提取下游依赖
        downstream_pattern = r'\|\s*`([F]-\d+)`\s*\|\s*功能依赖\s*\|\s*`([^`]+)`'
        downstream_matches = re.findall(downstream_pattern, content)
        for dep_id, desc in downstream_matches:
            dependencies['downstream'].append({'id': dep_id, 'desc': desc})
        
        return dependencies
    
    def _extract_status(self, content: str) -> str:
        """从功能内容中提取状态"""
        status_pattern = r'\*\*当前状态\*\*：`([^`]+)`'
        match = re.search(status_pattern, content)
        return match.group(1) if match else "未知"
    
    def list_features(self, filter_status: Optional[str] = None):
        """列出所有功能"""
        print(f"{'功能ID':<10} {'功能名称':<30} {'状态':<20} {'上游依赖':<10} {'下游依赖':<10}")
        print("-" * 90)
        
        for feature_id, feature in self.features.items():
            if filter_status and filter_status not in feature['status']:
                continue
            
            upstream_count = len(feature['dependencies']['upstream'])
            downstream_count = len(feature['dependencies']['downstream'])
            
            print(f"{feature_id:<10} {feature['name']:<30} {feature['status']:<20} {upstream_count:<10} {downstream_count:<10}")
    
    def show_feature(self, feature_id: str):
        """显示特定功能的详细信息"""
        if feature_id not in self.features:
            print(f"错误: 功能 {feature_id} 不存在")
            return
        
        feature = self.features[feature_id]
        print(f"功能ID: {feature['id']}")
        print(f"功能名称: {feature['name']}")
        print(f"状态: {feature['status']}")
        print("\n依赖关系:")
        print("  上游依赖:")
        for dep in feature['dependencies']['upstream']:
            print(f"    - {dep['id']}: {dep['desc']}")
        print("  下游依赖:")
        for dep in feature['dependencies']['downstream']:
            print(f"    - {dep['id']}: {dep['desc']}")
    
    def find_dependencies(self, feature_id: str, direction: str = "all"):
        """查找功能的依赖链"""
        if feature_id not in self.features:
            print(f"错误: 功能 {feature_id} 不存在")
            return
        
        visited = set()
        
        def dfs(current_id: str, depth: int = 0, is_upstream: bool = True):
            if current_id in visited:
                return
            visited.add(current_id)
            
            prefix = "  " * depth + ("↑ " if is_upstream else "↓ ")
            print(f"{prefix}{current_id}: {self.features[current_id]['name']}")
            
            # 上游依赖
            if direction in ["upstream", "all"] and is_upstream:
                for dep in self.features[current_id]['dependencies']['upstream']:
                    dfs(dep['id'], depth + 1, True)
            
            # 下游依赖
            if direction in ["downstream", "all"] and not is_upstream:
                # 需要反向查找哪些功能依赖当前功能
                for other_id, other_feature in self.features.items():
                    for dep in other_feature['dependencies']['upstream']:
                        if dep['id'] == current_id:
                            dfs(other_id, depth + 1, False)
        
        print(f"功能 {feature_id} 的依赖关系:")
        if direction in ["upstream", "all"]:
            print("\n上游依赖链:")
            dfs(feature_id, 0, True)
            visited.clear()
        
        if direction in ["downstream", "all"]:
            print("\n下游依赖链:")
            visited.clear()
            # 查找依赖此功能的其他功能
            for other_id, other_feature in self.features.items():
                for dep in other_feature['dependencies']['upstream']:
                    if dep['id'] == feature_id:
                        dfs(other_id, 0, False)
    
    def validate(self):
        """验证功能文档的完整性"""
        print("验证功能文档...")
        
        issues = []
        
        # 检查功能ID格式
        for feature_id in self.features:
            if not re.match(r'^F-\d{3}$', feature_id):
                issues.append(f"功能ID格式错误: {feature_id}")
        
        # 检查依赖关系是否存在
        for feature_id, feature in self.features.items():
            for dep in feature['dependencies']['upstream']:
                if dep['id'] not in self.features:
                    issues.append(f"功能 {feature_id} 依赖不存在的功能: {dep['id']}")
        
        # 检查循环依赖
        def check_cycle(current_id: str, path: List[str]):
            if current_id in path:
                cycle = " -> ".join(path[path.index(current_id):] + [current_id])
                issues.append(f"发现循环依赖: {cycle}")
                return True
            return False
        
        def dfs_cycle(current_id: str, path: List[str]):
            if check_cycle(current_id, path):
                return
            
            for dep in self.features[current_id]['dependencies']['upstream']:
                dfs_cycle(dep['id'], path + [current_id])
        
        for feature_id in self.features:
            dfs_cycle(feature_id, [])
        
        if issues:
            print(f"发现 {len(issues)} 个问题:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("✓ 功能文档验证通过")
        
        return len(issues) == 0
    
    def export_json(self, output_file: str):
        """将功能文档导出为JSON格式"""
        data = {
            'features': self.features,
            'total_features': len(self.features),
            'dependencies': self._build_dependency_matrix()
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"已导出到 {output_file}")
    
    def _build_dependency_matrix(self) -> Dict[str, Dict[str, str]]:
        """构建依赖关系矩阵"""
        matrix = {}
        
        for feature_id in self.features:
            matrix[feature_id] = {}
            for other_id in self.features:
                if feature_id == other_id:
                    matrix[feature_id][other_id] = '-'
                else:
                    # 检查是否存在依赖关系
                    has_dependency = False
                    for dep in self.features[feature_id]['dependencies']['upstream']:
                        if dep['id'] == other_id:
                            matrix[feature_id][other_id] = '✅'
                            has_dependency = True
                            break
                    
                    if not has_dependency:
                        matrix[feature_id][other_id] = '❌'
        
        return matrix

def main():
    parser = argparse.ArgumentParser(description="功能文档管理工具")
    parser.add_argument("--file", default="FEATURE-MAP.md", help="功能文档文件路径")
    
    subparsers = parser.add_subparsers(dest="command", help="命令")
    
    # list 命令
    list_parser = subparsers.add_parser("list", help="列出所有功能")
    list_parser.add_argument("--status", help="按状态过滤")
    
    # show 命令
    show_parser = subparsers.add_parser("show", help="显示功能详情")
    show_parser.add_argument("feature_id", help="功能ID")
    
    # deps 命令
    deps_parser = subparsers.add_parser("deps", help="查看依赖关系")
    deps_parser.add_argument("feature_id", help="功能ID")
    deps_parser.add_argument("--direction", choices=["upstream", "downstream", "all"], default="all", help="依赖方向")
    
    # validate 命令
    subparsers.add_parser("validate", help="验证功能文档")
    
    # export 命令
    export_parser = subparsers.add_parser("export", help="导出为JSON")
    export_parser.add_argument("--output", default="feature-map.json", help="输出文件路径")
    
    args = parser.parse_args()
    
    manager = FeatureMapManager(args.file)
    
    try:
        manager.load()
    except Exception as e:
        print(f"加载文件失败: {e}")
        sys.exit(1)
    
    if args.command == "list":
        manager.list_features(args.status)
    elif args.command == "show":
        manager.show_feature(args.feature_id)
    elif args.command == "deps":
        manager.find_dependencies(args.feature_id, args.direction)
    elif args.command == "validate":
        manager.validate()
    elif args.command == "export":
        manager.export_json(args.output)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()