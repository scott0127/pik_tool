#!/usr/bin/env python3
"""
Decor.json Validation Tool
驗證 decor.json 的格式和資料完整性
"""

import json
import sys
from typing import List, Dict, Any

class DecorValidator:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.data = None
        
    def load_json(self) -> bool:
        """載入 JSON 檔案"""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            return True
        except json.JSONDecodeError as e:
            self.errors.append(f"JSON 格式錯誤: {e}")
            return False
        except FileNotFoundError:
            self.errors.append(f"找不到檔案: {self.filepath}")
            return False
    
    def validate_structure(self) -> None:
        """驗證基本結構"""
        if not isinstance(self.data, dict):
            self.errors.append("根節點必須是 object")
            return
        
        if 'definitions' not in self.data:
            self.errors.append("缺少 'definitions' 欄位")
            return
        
        if not isinstance(self.data['definitions'], list):
            self.errors.append("'definitions' 必須是陣列")
    
    def validate_categories(self) -> None:
        """驗證所有分類"""
        if not self.data or 'definitions' not in self.data:
            return
        
        category_ids = set()
        
        for idx, definition in enumerate(self.data['definitions']):
            # 檢查必要欄位
            if 'category' not in definition:
                self.errors.append(f"Definition {idx}: 缺少 'category' 欄位")
                continue
            
            category = definition['category']
            
            # 檢查 category 必要欄位
            required_fields = ['id', 'name', 'nameEn', 'type', 'icon']
            for field in required_fields:
                if field not in category:
                    self.errors.append(f"Category {idx}: 缺少必要欄位 '{field}'")
            
            # 檢查 category id 唯一性
            cat_id = category.get('id')
            if cat_id:
                if cat_id in category_ids:
                    self.errors.append(f"重複的 category id: '{cat_id}'")
                category_ids.add(cat_id)
            
            # 檢查 type 值
            if category.get('type') not in ['regular', 'special', 'regional']:
                self.warnings.append(f"Category '{cat_id}': type 應該是 'regular', 'special', 或 'regional'")
            
            # 檢查 variants
            if 'variants' not in definition:
                self.errors.append(f"Category '{cat_id}': 缺少 'variants' 欄位")
                continue
            
            if not isinstance(definition['variants'], list):
                self.errors.append(f"Category '{cat_id}': 'variants' 必須是陣列")
                continue
            
            if len(definition['variants']) == 0:
                self.warnings.append(f"Category '{cat_id}': variants 陣列為空")
            
            # 驗證每個 variant
            self.validate_variants(cat_id, definition['variants'], 
                                 definition.get('availablePikminTypes', []))
    
    def validate_variants(self, cat_id: str, variants: List[Dict], 
                         available_types: List[str]) -> None:
        """驗證 variants"""
        variant_ids = set()
        
        for idx, variant in enumerate(variants):
            # 檢查必要欄位
            if 'id' not in variant:
                self.errors.append(f"Category '{cat_id}', variant {idx}: 缺少 'id'")
                continue
            
            variant_id = variant['id']
            
            # 檢查 id 唯一性 (在同一 category 內)
            if variant_id in variant_ids:
                self.errors.append(f"Category '{cat_id}': 重複的 variant id '{variant_id}'")
            variant_ids.add(variant_id)
            
            # 檢查名稱
            if 'name' not in variant:
                self.errors.append(f"Category '{cat_id}', variant '{variant_id}': 缺少 'name'")
            if 'nameEn' not in variant:
                self.errors.append(f"Category '{cat_id}', variant '{variant_id}': 缺少 'nameEn'")
            
            # 檢查圖片
            has_image_url = 'imageUrl' in variant
            has_image_urls = 'imageUrls' in variant and isinstance(variant.get('imageUrls'), dict)
            
            if not has_image_url and not has_image_urls:
                self.errors.append(f"Category '{cat_id}', variant '{variant_id}': 缺少圖片 (imageUrl 或 imageUrls)")
            
            # 如果有 imageUrls，檢查是否與 availablePikminTypes 一致
            if has_image_urls:
                image_urls = variant['imageUrls']
                colors_with_images = set(image_urls.keys())
                
                # 檢查是否有未定義的顏色
                valid_colors = {'red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'}
                invalid_colors = colors_with_images - valid_colors
                if invalid_colors:
                    self.warnings.append(f"Category '{cat_id}', variant '{variant_id}': 未知的顏色 {invalid_colors}")
                
                # 驗證 URL 格式
                for color, url in image_urls.items():
                    if not isinstance(url, str) or not url.startswith('http'):
                        self.errors.append(f"Category '{cat_id}', variant '{variant_id}', color '{color}': 無效的 URL")
    
    def validate_pikmin_types(self) -> None:
        """驗證 availablePikminTypes"""
        if not self.data or 'definitions' not in self.data:
            return
        
        valid_types = {'red', 'yellow', 'blue', 'white', 'purple', 'rock', 'winged', 'ice'}
        
        for definition in self.data['definitions']:
            cat_id = definition.get('category', {}).get('id', 'unknown')
            available_types = definition.get('availablePikminTypes')
            
            if available_types is None:
                self.warnings.append(f"Category '{cat_id}': 缺少 'availablePikminTypes'，將使用所有類型")
                continue
            
            if not isinstance(available_types, list):
                self.errors.append(f"Category '{cat_id}': 'availablePikminTypes' 必須是陣列")
                continue
            
            # 檢查是否有無效的類型
            invalid_types = set(available_types) - valid_types
            if invalid_types:
                self.errors.append(f"Category '{cat_id}': 無效的皮克敏類型 {invalid_types}")
    
    def validate(self) -> bool:
        """執行完整驗證"""
        print("🔍 開始驗證 decor.json...")
        print("="*70)
        
        if not self.load_json():
            return False
        
        self.validate_structure()
        self.validate_categories()
        self.validate_pikmin_types()
        
        return len(self.errors) == 0
    
    def print_report(self) -> None:
        """印出驗證報告"""
        print("\n" + "="*70)
        print("驗證報告")
        print("="*70)
        
        if self.errors:
            print(f"\n❌ 發現 {len(self.errors)} 個錯誤:\n")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")
        
        if self.warnings:
            print(f"\n⚠️  發現 {len(self.warnings)} 個警告:\n")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        if not self.errors and not self.warnings:
            print("\n✅ 所有檢查通過！檔案格式正確。")
        elif not self.errors:
            print(f"\n✅ 沒有錯誤，但有 {len(self.warnings)} 個警告需要注意。")
        else:
            print(f"\n❌ 驗證失敗！請修正上述錯誤。")
        
        print("="*70)

def main():
    import os
    
    # 預設路徑
    default_path = r'c:\Users\scott\OneDrive\Desktop\pikmin\app\data\decor.json'
    filepath = sys.argv[1] if len(sys.argv) > 1 else default_path
    
    if not os.path.exists(filepath):
        print(f"❌ 找不到檔案: {filepath}")
        print(f"用法: python {sys.argv[0]} [decor.json路徑]")
        sys.exit(1)
    
    validator = DecorValidator(filepath)
    success = validator.validate()
    validator.print_report()
    
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
