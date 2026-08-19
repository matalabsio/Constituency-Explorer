import unittest

from kurupam_collector.aliases import AliasIndex
from kurupam_collector.config import load_config


class AliasMatchingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.index = AliasIndex(load_config())

    def test_gummalaxmipuram_normalizes_to_gummalakshmipuram(self) -> None:
        matches = self.index.match_text("Gummalaxmipuram Mandal map", match_kind="caption")
        slugs = {item.entity.slug for item in matches}
        self.assertIn("gummalakshmipuram", slugs)
        self.assertNotIn("kurupam-constituency", slugs)

    def test_jiyyamavalasa_variants(self) -> None:
        for name in ("Jiyammavalasa", "Jiyyamavalasa", "Jiyyamvalasa", "Jiyyammavalasa"):
            matches = self.index.match_text(f"{name} Mandal", match_kind="heading")
            slugs = {item.entity.slug for item in matches}
            self.assertIn("jiyammavalasa", slugs, name)

    def test_url_path_match(self) -> None:
        matches = self.index.match_url(
            "https://parvathipurammanyam.ap.gov.in/slider/mandal-maps/kurupam-2/"
        )
        self.assertTrue(any(item.entity.slug == "kurupam" for item in matches))

    def test_does_not_match_unrelated_mandal(self) -> None:
        matches = self.index.match_text("Saluru Mandal", match_kind="caption")
        self.assertEqual(matches, [])

    def test_word_boundary_avoids_partial_tokens(self) -> None:
        matches = self.index.match_text("kurupampalem notes", match_kind="paragraph")
        self.assertFalse(any(item.entity.slug == "kurupam" for item in matches))


if __name__ == "__main__":
    unittest.main()
