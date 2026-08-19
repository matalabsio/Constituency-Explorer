import unittest

from kurupam_collector.robots import RobotsCache


class RobotsEnforcementTests(unittest.TestCase):
    def setUp(self) -> None:
        self.robots = RobotsCache("KurupamCollector/1.0")
        self.page = "https://parvathipurammanyam.ap.gov.in/mandal-maps/"

    def test_empty_robots_allows_all(self) -> None:
        self.robots.load_from_body("https://parvathipurammanyam.ap.gov.in/robots.txt", "", status=204)
        allowed, reason = self.robots.allowed(self.page)
        self.assertTrue(allowed)
        self.assertIsNone(reason)

    def test_disallow_blocks_matching_path(self) -> None:
        body = "User-agent: *\nDisallow: /mandal-maps/\n"
        self.robots.load_from_body("https://parvathipurammanyam.ap.gov.in/robots.txt", body, status=200)
        allowed, reason = self.robots.allowed(self.page)
        self.assertFalse(allowed)
        self.assertEqual(reason, "disallowed by robots.txt")
        other, _ = self.robots.allowed("https://parvathipurammanyam.ap.gov.in/constituencies/")
        self.assertTrue(other)

    def test_http_403_disallows_all(self) -> None:
        self.robots.load_from_body("https://parvathipurammanyam.ap.gov.in/robots.txt", "", status=403)
        allowed, reason = self.robots.allowed(self.page)
        self.assertFalse(allowed)
        self.assertEqual(reason, "disallowed by robots.txt")

    def test_unread_robots_fail_closed(self) -> None:
        self.robots.mark_fetch_error("parvathipurammanyam.ap.gov.in", "timeout")
        allowed, reason = self.robots.allowed(self.page)
        self.assertFalse(allowed)
        self.assertIn("unread", reason or "")

    def test_not_loaded_fail_closed(self) -> None:
        allowed, reason = self.robots.allowed(self.page)
        self.assertFalse(allowed)
        self.assertIn("not loaded", reason or "")


if __name__ == "__main__":
    unittest.main()
