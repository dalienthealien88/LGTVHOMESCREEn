import hashlib
import json
import pathlib
import shutil
import subprocess
import tarfile
import tempfile
from io import BytesIO


APP_DIR = pathlib.Path(__file__).resolve().parent
ROOT = APP_DIR.parent
META = json.loads((APP_DIR / "appinfo.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "Homeframe.ipk"
APP_FILES = ["appinfo.json", "index.html", "styles.css", "app.js", "icon.svg"]


def tar_gzip(root, paths):
    stream = BytesIO()
    with tarfile.open(fileobj=stream, mode="w:gz") as archive:
        for path, archive_name in paths:
            archive.add(path, arcname=archive_name)
    return stream.getvalue()


def ar_header(name, data):
    header = bytearray(b" " * 60)
    header[0:16] = (name + "/").encode("ascii").ljust(16)
    header[16:28] = b"0".ljust(12)
    header[28:34] = b"0".ljust(6)
    header[34:40] = b"0".ljust(6)
    header[40:48] = b"100644".ljust(8)
    header[48:58] = str(len(data)).encode("ascii").ljust(10)
    header[58:60] = b"`\n"
    return bytes(header)


with tempfile.TemporaryDirectory(prefix="bazaar-package-") as temp_name:
    temp = pathlib.Path(temp_name)
    control_dir = temp / "control"
    control_dir.mkdir()
    app_path = temp / "usr" / "palm" / "applications" / META["id"]
    app_path.mkdir(parents=True)

    for name in APP_FILES:
        source = APP_DIR / name
        if not source.is_file():
            raise FileNotFoundError(f"Missing app package file: {source}")
        shutil.copyfile(source, app_path / name)

    control = "\n".join([
        f"Package: {META['id']}",
        f"Version: {META['version']}",
        "Architecture: all",
        f"Description: {META.get('appDescription', META['title'])}",
        "Maintainer: LGTV Homebrew",
        "Section: misc",
        "Priority: optional",
        "",
    ])
    (control_dir / "control").write_text(control, encoding="utf-8", newline="\n")

    control_archive = tar_gzip(temp, [(control_dir / "control", "control")])
    data_files = sorted(path for path in (temp / "usr").rglob("*") if path.is_file())
    data_archive = tar_gzip(
        temp,
        [(path, path.relative_to(temp).as_posix()) for path in data_files],
    )
    package_parts = [
        ("debian-binary", b"2.0\n"),
        ("control.tar.gz", control_archive),
        ("data.tar.gz", data_archive),
    ]

    package = bytearray(b"!<arch>\n")
    for name, data in package_parts:
        package.extend(ar_header(name, data))
        package.extend(data)
        if len(data) % 2:
            package.extend(b"\n")

    package_bytes = bytes(package)
    OUTPUT.write_bytes(package_bytes)
    manifest_path = ROOT / "homeframe.manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["version"] = META["version"]
    manifest["ipkHash"] = {"sha256": hashlib.sha256(package_bytes).hexdigest()}
    manifest_path.write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline="\n"
    )

print(f"{OUTPUT} ({len(package_bytes)} bytes)")
