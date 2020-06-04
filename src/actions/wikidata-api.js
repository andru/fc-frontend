export default (wikidata) => {

  async function getWikiDataImagesForTaxa (taxaNames) {
    const url = wikidata.sparqlQuery(`
      SELECT ?item (SAMPLE(?image) as ?mainImage) (SAMPLE(?taxonName) as ?mainTaxonName) {
        VALUES (?matchNames) { ${taxaNames.map(taxonName => `("${taxonName}")`).join(' ')} }
        ?item wdt:P31 wd:Q16521.
        ?item wdt:P225 ?matchNames.
        ?item wdt:P225 ?taxonName.
        ?item wdt:P18 ?image.
      }
      GROUP BY ?item
    `);
    return await fetch(url).then(async response => {
      const data = wikidata.simplify.sparqlResults(await response.json());
      /*
      {
        item: String <QID>,
        image: String <URL>,
        taxonName: String
      } 
      */
      return data;
    }).catch(err => {
      console.error(err);
    }).then(data => {
      // https://commons.wikimedia.org/wiki/File:Cirsium%20arvense%20with%20Bees%20Richard%20Bartz.jpg
      return Object.fromEntries(data.map(row => (
        [
          row.mainTaxonName, 
          `${row.mainImage}?width=300px`
        ]
      )))
    });
  }

  return {
    getWikiDataImagesForTaxa,
  }
}

