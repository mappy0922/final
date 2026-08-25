import csv
import json
import os

# 実行中のスクリプト（data_fecth.py）があるフォルダの絶対パスを取得
current_dir = os.path.dirname(os.path.abspath(__file__))

# パスを設定
input_filename = os.path.join(current_dir, "SSDSE-D-2021.csv")
output_filename = os.path.join(current_dir, "bedtimeData.jsx")

result_array = []

# 男女の別の名称を置換するマッピング辞書
gender_map = {
    "0_総数": "男女",
    "1_男": "男",
    "2_女": "女"
}

# 適切なエンコーディングを探してファイルを開く
encodings = ["utf-8-sig", "utf-8", "shift_jis", "cp932"]
f = None

for enc in encodings:
    try:
        f = open(input_filename, "r", encoding=enc)
        # テスト読み込みをしてエラーが出ないか確認
        content = f.readline()
        f.seek(0)
        break
    except (UnicodeDecodeError, LookupError):
        if f:
            f.close()
        f = None

if f is None:
    print("エラー: ファイルの文字コードが識別できませんでした。")
    exit()

with f:
    next(f)  # 1行目の「SSDSE-D-2023,2021年...」をスキップ
    reader = csv.DictReader(f)
    
    for row in reader:
        # 空行やデータが不完全な行はスキップ
        if not row or not row.get("男女の別") or not row.get("都道府県"):
            continue
            
        raw_gender = row["男女の別"].strip()
        # 辞書を使って文字列を置換（見つからない場合は元の値をそのまま使用）
        converted_gender = gender_map.get(raw_gender, raw_gender)
        
        result_array.append({
            "男女の別": converted_gender,
            "地域コード": row["地域コード"].strip(),
            "都道府県": row["都道府県"].strip(),
            "起床": row["起床"].strip(),
            "就寝": row["就寝"].strip()
        })

# JavaScriptオブジェクト用のJSON文字列を作成（日本語をエスケープしない）
json_string = json.dumps(result_array, ensure_ascii=False, indent=2)

# React環境でインポートしやすいように export const 形式にする
jsx_content = f"export const bedtimeData = {json_string};\n"

# JSXファイルとしてUTF-8で保存
with open(output_filename, "w", encoding="utf-8") as out_file:
    out_file.write(jsx_content)

print(f"変換が完了しました。ファイル '{output_filename}' を出力しました。")
