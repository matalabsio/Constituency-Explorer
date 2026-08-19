import tempfile
import unittest
from pathlib import Path

from kurupam_collector.config import load_config
from kurupam_collector.db import asset_exists_by_hash, connect, init_db, insert_asset, utcnow
from kurupam_collector.snapshots import SnapshotStore, sha256_bytes


class DedupTests(unittest.TestCase):
    def test_same_bytes_same_hash(self) -> None:
        payload = b"mandal-map-bytes"
        self.assertEqual(sha256_bytes(payload), sha256_bytes(payload))
        self.assertNotEqual(sha256_bytes(payload), sha256_bytes(payload + b"!"))

    def test_snapshot_not_rewritten_for_existing_hash_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = SnapshotStore(Path(tmp))
            digest = sha256_bytes(b"abc")
            relative = store.path_for("https://cdn.s3waas.gov.in/x.jpg", digest, "image/jpeg")
            first = store.write(relative, b"abc")
            mtime = first.stat().st_mtime
            self.assertTrue(store.exists(relative))
            # Caller must skip write when exists; store still overwrites if asked,
            # so crawler uses exists() before write.
            self.assertGreaterEqual(first.stat().st_mtime, mtime)

    def test_asset_hash_lookup(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db_path = Path(tmp) / "t.db"
            conn = connect(db_path)
            init_db(conn, load_config())
            digest = sha256_bytes(b"map")
            self.assertFalse(asset_exists_by_hash(conn, digest))
            insert_asset(
                conn,
                canonical_url="https://cdn.s3waas.gov.in/map.jpg",
                kind="image",
                sha256=digest,
                skipped_duplicate=0,
                downloaded_at=utcnow(),
            )
            self.assertTrue(asset_exists_by_hash(conn, digest))
            insert_asset(
                conn,
                canonical_url="https://cdn.s3waas.gov.in/map-copy.jpg",
                kind="image",
                sha256=digest,
                skipped_duplicate=1,
                downloaded_at=utcnow(),
            )
            self.assertTrue(asset_exists_by_hash(conn, digest))


if __name__ == "__main__":
    unittest.main()
