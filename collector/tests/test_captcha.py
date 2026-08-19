import unittest

from kurupam_collector.extract import detect_challenges, parse_html
from bs4 import BeautifulSoup


class CaptchaDetectionTests(unittest.TestCase):
    def test_ignores_captcha_form_validation_strings(self) -> None:
        html = """
        <html><head><title>Mandal Maps</title></head>
        <body><h1>Mandal Maps</h1>
        <script>var x = {"captchaRequired":"Captcha is a required field"};</script>
        <p>Kurupam Mandal</p></body></html>
        """
        soup = BeautifulSoup(html, "html.parser")
        js, blocked = detect_challenges(html, soup, "Mandal Maps Kurupam Mandal")
        self.assertFalse(js)
        self.assertIsNone(blocked)

    def test_flags_real_recaptcha_widget(self) -> None:
        html = """
        <html><body><div class="g-recaptcha" data-sitekey="abc"></div></body></html>
        """
        soup = BeautifulSoup(html, "html.parser")
        _, blocked = detect_challenges(html, soup, "")
        self.assertEqual(blocked, "captcha")

    def test_mandal_maps_fixture_not_blocked(self) -> None:
        html = """
        <html><head><title>Mandal Maps | District</title></head>
        <body><h1>Mandal Maps</h1>
        <script>var S3WaaSAccessibilityParams = {"captchaRequired":"Captcha is a required field"};</script>
        <dl class='gallery-item'><dd class='gallery-caption'>Kurupam Mandal</dd></dl>
        </body></html>
        """
        page = parse_html(html, "https://parvathipurammanyam.ap.gov.in/mandal-maps/")
        self.assertIsNone(page.blocked_reason)


if __name__ == "__main__":
    unittest.main()
