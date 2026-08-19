from __future__ import annotations

import hashlib
import mimetypes
from pathlib import Path


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extension_for(url: str, content_type: str | None) -> str:
    if content_type:
        guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
        if guessed:
            return guessed
    path = url.split("?", 1)[0]
    if "." in path.rsplit("/", 1)[-1]:
        ext = "." + path.rsplit(".", 1)[-1].lower()
        if 1 < len(ext) <= 8:
            return ext
    return ".bin"


def snapshot_relative_path(host: str, digest: str, ext: str) -> str:
    return f"storage/snapshots/{host}/{digest[:2]}/{digest}{ext}"


class SnapshotStore:
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir

    def exists(self, relative_path: str) -> bool:
        return (self.data_dir / relative_path).is_file()

    def write(self, relative_path: str, data: bytes) -> Path:
        dest = self.data_dir / relative_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return dest

    def path_for(self, url: str, digest: str, content_type: str | None) -> str:
        host = url.split("/")[2] if "://" in url else "unknown"
        return snapshot_relative_path(host, digest, extension_for(url, content_type))
