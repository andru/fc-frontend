import {wbApi} from "../_init";
import { getPID, getUID } from "./pid-uid";



export async function fetchHigherTaxa (taxonId, queryOptions = {breakCache: false}) {
  const url = wbApi.sparqlQuery(`SELECT ?sub ?sup ?rank (count(?mid)-1 as ?distance) { 
    VALUES ?sub {wd:${taxonId}}
    ?sub wdt:P19* ?mid .
    ?mid wdt:P19* ?sup .
    ?sup wdt:P18 ?rank.
 }
  GROUP BY ?sub ?sup ?rank
  ORDER BY DESC(?distance)`);
  return fetch(`${url}${queryOptions.breakCache ? '&nocache=true' : ''}`).then(async response => {
    if (response.status !== 200) {
      throw new Error("Query failed");
    }
    const data = wbApi.simplify.sparqlResults(await response.json());
    console.log('taxon hierarchy', data);
    return data.map(d => ({id: d.sup, distance: d.distance, rank: d.rank}));
  }).catch(err => {
    console.error(err);
  });
}

export async function fetchSubTaxa (taxonId, queryOptions = {breakCache: false}) {
  const url = wbApi.sparqlQuery(`SELECT ?taxon ?name (count(?subTaxon)-1 as ?numSubTaxa){ 
    ${taxonId 
      ? `?taxon wdt:${getPID('taxon/parent taxon')} wd:${taxonId}.`
      : `?taxon wdt:${getPID('core/instance of')} "taxon".`
    }
    ?taxon wdt:${getPID('taxon/name')} ?name.
    ${taxonId ? '' : `FILTER NOT EXISTS {?taxon wdt:${getPID('taxon/parent taxon')} ?parent}`}
    ?taxon ^wdt:${getPID('taxon/parent taxon')}* ?subTaxon.
  }
                     
  GROUP BY ?taxon ?name
  ORDER BY ASC(?name)`);

  return fetch(`${url}${queryOptions.breakCache ? '&nocache=true' : ''}`).then(async response => {
    if (response.status !== 200) {
      throw new Error("Query failed");
    }
    const data = wbApi.simplify.sparqlResults(await response.json());
    console.log('taxon hierarchy', data);
    return data;
  }).catch(err => {
    console.error(err);
  });
}