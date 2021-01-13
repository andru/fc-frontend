import {wbApi} from "../_init";
import { getPID, getUID } from "./pid-uid";

export async function fetchTopLevelParentStructures (childIds) {
  const url = wbApi.sparqlQuery(`SELECT DISTINCT * {

    VALUES ?child {${childIds.map(id => `wd:${id}`).join(' ')}} 
    ?child wdt:${getPID('core/substructure of')}* ?parent.
    ?parent rdfs:label ?parentLabel.
    ?child rdfs:label ?childLabel.
  
    FILTER( NOT EXISTS {
      ?parent wdt:${getPID('core/substructure of')} ?supParent.
    })
  }`);
  return await fetch(url).then(async response => {
    const data = wbApi.simplify.sparqlResults(await response.json());
    return data;
  }).catch(err => {
    console.error(err);
  });
}