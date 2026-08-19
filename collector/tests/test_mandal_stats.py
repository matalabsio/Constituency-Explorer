import unittest

from kurupam_collector.extract import extract_mandal_stats_tables


class MandalStatsTableTests(unittest.TestCase):
    def test_extracts_target_mandal_rows(self) -> None:
        tables = [
            [
                ["Mandal Name", "No.of Gram Panchayats", "No. of Villages"],
                ["Komarada", "31", "99"],
                ["Gummalakshmipuram", "27", "124"],
                ["Kurupam", "23", "95"],
                ["Jiyyammavalasa", "31", "58"],
                ["Garugubilli", "25", "34"],
                ["Parvathipuram", "26", "49"],
            ]
        ]
        rows = extract_mandal_stats_tables(tables)
        self.assertEqual(len(rows), 6)
        kurupam = next(row for row in rows if row.mandal_name_as_published == "Kurupam")
        self.assertEqual(kurupam.gram_panchayats, 23)
        self.assertEqual(kurupam.villages, 95)
        jiyya = next(row for row in rows if row.mandal_name_as_published == "Jiyyammavalasa")
        self.assertEqual(jiyya.gram_panchayats, 31)
        self.assertEqual(jiyya.villages, 58)

    def test_ignores_unrelated_tables(self) -> None:
        tables = [[["Revenue Divisions", "Division Name", "Mandal Name"], ["Palakonda", "Palakonda", "Kurupam"]]]
        self.assertEqual(extract_mandal_stats_tables(tables), [])


if __name__ == "__main__":
    unittest.main()
