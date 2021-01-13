export const fcEndpoint = {
  instance: process.env.REACT_APP_WIKI || 'http://localhost',
  sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://localhost:8989/bigdata/sparql', 
}

export const wikidataEndpoint = {
  instance: 'https://wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
}