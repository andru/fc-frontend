import {wdApi} from "./_init";

export default (wikidata) => {

  async function getWikiDataImagesForTaxa (taxaNames) {
    const [url, body] = wikidata.sparqlQuery(`
      SELECT ?item (SAMPLE(?image) as ?mainImage) (SAMPLE(?taxonName) as ?mainTaxonName) {
        VALUES (?matchNames) { ${taxaNames.map(taxonName => `("${taxonName}")`).join(' ')} }
        ?item wdt:P31 wd:Q16521.
        ?item wdt:P225 ?matchNames.
        ?item wdt:P225 ?taxonName.
        ?item wdt:P18 ?image.
      }
      GROUP BY ?item
    `).split('?');
    return await fetch(
      url,
      {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        // mode: 'cors', // no-cors, *cors, same-origin
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          // 'Content-Type': 'application/json'
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body
      }
    ).then(async response => {
      const data = wikidata.simplify.sparqlResults(await response.json());
      /*
      {
        item: String <QID>,
        image: String <URL>,
        taxonName: String
      } 
      */
      return data;
    }).then(data => {
      // https://commons.wikimedia.org/wiki/File:Cirsium%20arvense%20with%20Bees%20Richard%20Bartz.jpg
      return Object.fromEntries(data.map(row => (
        [
          row.mainTaxonName, 
          `${row.mainImage}?width=300px`
        ]
      )))
    }).catch(err => {
      console.error(err);
    });
  }

  return {
    getWikiDataImagesForTaxa,
  }
}

