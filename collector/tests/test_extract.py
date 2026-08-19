import unittest

from kurupam_collector.extract import extract_mandal_gallery, full_image_url, parse_html

GALLERY_HTML = """
<html><head><title>Mandal Maps | District</title></head>
<body>
<h1>Mandal Maps</h1>
<p>Last Updated: <strong>Aug 08, 2026</strong></p>
<dl class='gallery-item'>
  <dt class='gallery-icon portrait'>
    <a href='https://parvathipurammanyam.ap.gov.in/slider/mandal-maps/kurupam-2/'>
      <img src='https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/2022/03/2022030714-212x300.jpg'
           srcset='https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/2022/03/2022030714-212x300.jpg 212w, https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/2022/03/2022030714.jpg 725w'
           alt='kurupam' />
    </a>
  </dt>
  <dd class='wp-caption-text gallery-caption'>Kurupam Mandal</dd>
</dl>
<dl class='gallery-item'>
  <dt>
    <a href='https://parvathipurammanyam.ap.gov.in/slider/mandal-maps/saluru/'>
      <img src='https://cdn.s3waas.gov.in/s31679091c5a880faf6fb5e6087eb1b2dc/uploads/2022/03/x-212x300.jpg' alt='saluru' />
    </a>
  </dt>
  <dd class='wp-caption-text gallery-caption'>Saluru Mandal</dd>
</dl>
</body></html>
"""


class ExtractTests(unittest.TestCase):
    def test_strips_wordpress_image_size(self) -> None:
        thumb = "https://cdn.s3waas.gov.in/x/uploads/2022/03/2022030714-212x300.jpg"
        self.assertEqual(
            full_image_url(thumb),
            "https://cdn.s3waas.gov.in/x/uploads/2022/03/2022030714.jpg",
        )

    def test_gallery_captions_and_full_images(self) -> None:
        items = extract_mandal_gallery(GALLERY_HTML, "https://parvathipurammanyam.ap.gov.in/mandal-maps/")
        self.assertEqual(len(items), 2)
        kurupam = items[0]
        self.assertEqual(kurupam.caption, "Kurupam Mandal")
        self.assertTrue(kurupam.page_url.endswith("/slider/mandal-maps/kurupam-2/"))
        self.assertTrue(kurupam.full_image_url.endswith("2022030714.jpg"))
        self.assertNotIn("-212x300", kurupam.full_image_url or "")

    def test_page_structure_fields(self) -> None:
        page = parse_html(GALLERY_HTML, "https://parvathipurammanyam.ap.gov.in/mandal-maps/")
        self.assertEqual(page.title, "Mandal Maps | District")
        self.assertIn("Mandal Maps", page.headings)
        self.assertFalse(page.js_rendered_likely)
        self.assertIsNone(page.blocked_reason)


if __name__ == "__main__":
    unittest.main()
