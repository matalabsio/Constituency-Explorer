import unittest

from kurupam_collector.urls import host_of, normalize_url, path_of


class UrlNormalizationTests(unittest.TestCase):
    def test_upgrades_http_and_lowercases_host(self) -> None:
        self.assertEqual(
            normalize_url("HTTP://ParvathipuramManyam.AP.gov.in/Mandal-Maps"),
            "https://parvathipurammanyam.ap.gov.in/Mandal-Maps/",
        )

    def test_strips_fragment_and_tracking_params(self) -> None:
        url = "https://parvathipurammanyam.ap.gov.in/mandal-maps/?utm_source=x&b=2&a=1#top"
        self.assertEqual(
            normalize_url(url),
            "https://parvathipurammanyam.ap.gov.in/mandal-maps/?a=1&b=2",
        )

    def test_resolves_relative_links(self) -> None:
        self.assertEqual(
            normalize_url(
                "../slider/mandal-maps/kurupam-2/",
                base="https://parvathipurammanyam.ap.gov.in/mandal-maps/",
            ),
            "https://parvathipurammanyam.ap.gov.in/slider/mandal-maps/kurupam-2/",
        )

    def test_keeps_file_urls_without_forced_slash(self) -> None:
        url = "https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/2022/03/2022030714.jpg"
        self.assertEqual(normalize_url(url), url)

    def test_rejects_javascript_and_missing_host(self) -> None:
        with self.assertRaises(ValueError):
            normalize_url("javascript:void(0)")
        with self.assertRaises(ValueError):
            normalize_url("/only-path")

    def test_host_and_path_helpers(self) -> None:
        url = "https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/x.jpg"
        self.assertEqual(host_of(url), "cdn.s3waas.gov.in")
        self.assertTrue(path_of(url).startswith("/s31679091c5a880faf6fb5e6087eb1b2dc/"))


if __name__ == "__main__":
    unittest.main()
