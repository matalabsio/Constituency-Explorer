import unittest

from kurupam_collector.config import load_config


class AssetHostPolicyTests(unittest.TestCase):
    def test_asset_only_host_configured(self) -> None:
        config = load_config()
        self.assertIn("cdn.s3waas.gov.in", config.asset_only_hosts)
        self.assertFalse(config.enforce_robots_on_asset_hosts)

    def test_linked_asset_reasons(self) -> None:
        prefixes = ("mandal_map_image:", "detail_map:", "asset:")
        for reason in (
            "mandal_map_image:kurupam",
            "detail_map:komarada",
            "asset:image",
        ):
            self.assertTrue(any(reason.startswith(prefix) for prefix in prefixes))


if __name__ == "__main__":
    unittest.main()
