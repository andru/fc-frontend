export const fcEndpoint = {
  instance: process.env.REACT_APP_WIKI || 'http://localhost',
  sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://localhost:8989/bigdata/sparql', 
}

export const wikidataEndpoint = {
  instance: 'http://wikidata.org',
  sparqlEndpoint: 'http://query.wikidata.org/sparql'
}