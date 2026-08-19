import unittest

from kurupam_collector.villagecodes import (
    extract_villagecodes_detail_fields,
    extract_villagecodes_directory_rows,
    is_villagecodes_mandal_list_url,
    is_villagecodes_village_detail_url,
    mandal_slug_from_villagecodes_url,
)

KURUPAM_LIST_SNIPPET = """
<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","itemListElement":[{"@type":"ListItem","position":1,"name":"Abiri","url":"https://andhrapradesh.villagecodes.in/vizianagaram/kurupam-54304809/abiri-04809582026/"}]}</script>
<table>
<tr><th>Village</th><th>Village code</th><th>Population</th><th>Households</th><th>Area</th><th>PIN code</th><th>Nearest town</th></tr>
<tr><td>Abiri</td><td>582026</td><td>377</td><td>86</td><td>33 hectares</td><td>535523</td><td>Parvathipuram</td></tr>
</table>
"""

DETAIL_SNIPPET = """
<table><tr><th>Field</th><th>Value</th></tr>
<tr><td>Village name</td><td>Abiri</td></tr>
<tr><td>Census village code</td><td>582026</td></tr>
<tr><td>Population</td><td>377</td></tr>
<tr><td>Households</td><td>86</td></tr>
<tr><td>Gram panchayat</td><td>Tittiri</td></tr>
<tr><td>Male population</td><td>180</td></tr>
<tr><td>Female population</td><td>197</td></tr>
</table>
"""


class VillagecodesExtractTests(unittest.TestCase):
    def test_url_classifiers(self) -> None:
        mandal = "https://andhrapradesh.villagecodes.in/vizianagaram/kurupam-54304809/"
        village = "https://andhrapradesh.villagecodes.in/vizianagaram/kurupam-54304809/abiri-04809582026/"
        self.assertTrue(is_villagecodes_mandal_list_url(mandal))
        self.assertFalse(is_villagecodes_village_detail_url(mandal))
        self.assertTrue(is_villagecodes_village_detail_url(village))
        self.assertEqual(mandal_slug_from_villagecodes_url(mandal), "kurupam")

    def test_directory_row_extraction(self) -> None:
        tables = [[
            ["Village", "Village code", "Population", "Households", "Area", "PIN code", "Nearest town"],
            ["Abiri", "582026", "377", "86", "33 hectares", "535523", "Parvathipuram"],
        ]]
        rows = extract_villagecodes_directory_rows(tables, KURUPAM_LIST_SNIPPET, "https://example.test/")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].village_name, "Abiri")
        self.assertEqual(rows[0].population, 377)
        self.assertTrue(rows[0].detail_url.endswith("/abiri-04809582026/"))

    def test_detail_field_extraction(self) -> None:
        fields = extract_villagecodes_detail_fields(DETAIL_SNIPPET)
        self.assertEqual(fields["village_name"], "Abiri")
        self.assertEqual(fields["census_village_code"], 582026)
        self.assertEqual(fields["population"], 377)
        self.assertEqual(fields["gram_panchayat"], "Tittiri")
        self.assertEqual(fields["population_male"], 180)


if __name__ == "__main__":
    unittest.main()
