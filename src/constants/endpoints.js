import dotenv from 'dotenv';
dotenv.config();

export const fcEndpoint = {
  instance: process.env.WIKI || 'http://localhost',
  sparqlEndpoint: process.env.SPARQL || 'http://localhost:8989/bigdata/sparql',
  
}

export const wikidataEndpoint = {
  instance: 'http://wikidata.org',
  sparqlEndpoint: 'http://query.wikidata.org/sparql'
}