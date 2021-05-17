export const fcEndpoint = {
  instance: process.env.REACT_APP_WIKI || 'http://base.floracommons.org',
  sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://wdqs.floracommons.org/bigdata/sparql', 
}

export const wikidataEndpoint = {
  instance: 'https://wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
}