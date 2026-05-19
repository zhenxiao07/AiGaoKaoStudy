"""
extract_gaokao.py
Extracts all gaokao xlsx files from zip/directory entries into gaokao_raw/
with ASCII-safe filenames, then writes manifest.json.

Usage:
    python data/extract_gaokao.py \
        --data-dir "F:/code/data/gaokao/gaokao_2016-2020" \
        --out-dir  data/gaokao_raw
"""
import argparse
import json
import os
import shutil
import sys
import zipfile

sys.stdout.reconfigure(encoding="utf-8")

SKIP_NAMES = {"README.md", "demo.png", ".gitignore", ".git"}


def stem(name: str) -> str:
    """Remove .xlsx.zip / .zip / .xlsx suffixes."""
    if name.endswith(".xlsx.zip"):
        return name[:-9]
    if name.endswith(".xlsx"):
        return name[:-5]
    if name.endswith(".zip"):
        return name[:-4]
    return name


def parse_province_subject(name: str) -> tuple[str, str] | None:
    s = stem(name)
    if "-" not in s:
        return None
    idx = s.rfind("-")
    province = s[:idx]
    subject = s[idx + 1:]
    if subject not in ("文科", "理科"):
        return None
    return province, subject


def extract_xlsx_from_zip(zip_path: str, out_path: str) -> bool:
    """Read the xlsx from inside the zip and write to out_path."""
    with zipfile.ZipFile(zip_path) as z:
        names = z.namelist()
        xlsx_name = next((n for n in names if n.lower().endswith(".xlsx")), None)
        if not xlsx_name:
            return False
        data = z.read(xlsx_name)
        with open(out_path, "wb") as f:
            f.write(data)
    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default=r"F:\code\data\gaokao\gaokao_2016-2020")
    parser.add_argument("--out-dir",  default=os.path.join(os.path.dirname(__file__), "gaokao_raw"))
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    manifest = []

    for entry in sorted(os.scandir(args.data_dir), key=lambda e: e.name):
        if entry.name in SKIP_NAMES:
            continue

        parsed = parse_province_subject(entry.name)
        if parsed is None:
            continue
        province, subject = parsed

        out_name = f"{province}_{subject}.xlsx"
        out_path = os.path.join(args.out_dir, out_name)

        print(f"  {entry.name}  ->  {out_name}", end=" ... ", flush=True)

        if os.path.exists(out_path):
            print("already exists, skip")
            manifest.append({"file": out_name, "province": province, "subject_type": subject})
            continue

        ok = False
        if entry.is_file() and entry.name.endswith(".zip"):
            ok = extract_xlsx_from_zip(entry.path, out_path)
        elif entry.is_dir():
            # Directory named like "山东-文科.xlsx" containing the actual xlsx
            inner = next(
                (f for f in os.scandir(entry.path) if f.name.lower().endswith(".xlsx")),
                None,
            )
            if inner:
                shutil.copy2(inner.path, out_path)
                ok = True

        if ok:
            sz = os.path.getsize(out_path)
            print(f"OK ({sz // 1024} KB)")
            manifest.append({"file": out_name, "province": province, "subject_type": subject})
        else:
            print("SKIP")

    manifest_path = os.path.join(args.out_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n{len(manifest)} files extracted to {args.out_dir}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
