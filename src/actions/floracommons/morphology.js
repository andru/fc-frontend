import { wbApi } from "../_init.js"
import { getPID, getUID } from "./pid-uid.js";

/**
 * Fetch all plant structure properties without a [subproperty of] statement
 * @return {Array}      An array of results
 */
export  async function getTopLevelStructures() {
  const url = wbApi.sparqlQuery(`
  SELECT ?structure ?structureLabel {
    #SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    ?structure wdt:${getPID('core/instance of')} "plant superstructure".
    ?structure rdfs:label ?structureLabel.
    FILTER( NOT EXISTS {
      ?structure wdt:${getPID("core/substructure of")} ?parentStructure.
    })
 }
 ORDER BY ASC(?structureLabel)
`);

return await fetch(url).then(async response => {
  const data = wbApi.simplify.sparqlResults(await response.json());

  return data;
}).catch(err => {
  console.error(err);
});
}


/**
 * Return a list of characters with no parent (via `related character`)
 */
export async function getTopLevelCharacters () {
  const url = wbApi.sparqlQuery(`# Get top level characters and their related superstructure  
  SELECT DISTINCT ?character ?characterLabel  WHERE {
    ?character wdt:${getPID('core/instance of')} "plant character".
    ?character rdfs:label ?characterLabel.

    FILTER( NOT EXISTS {
      ?character wdt:${getPID('core/subcharacter of')} ?noParent.
    })
  }
  ORDER BY ASC(?characterLabel)
`);

  return await fetch(url).then(async response => {
    const data = wbApi.simplify.sparqlResults(await response.json());
    /* {
      character: Object { value: "PID", label: "String" }
      superStructure: "PID"
    } */
    // console.log('getTopLevelCharacters', data)
    return data;//.map(row => row.character);
  }).catch(err => {
    console.error(err);
  });
} 


/**
 * Return a list of characters grouped by the top level related structure
 */
export async function getTopLevelCharactersOfStructure (structureId) {
  // this query is much faster, but returns all characters, so needs some filtering
  const url = wbApi.sparqlQuery(`# 
    # Get top level characters and their related superstructure  
    SELECT DISTINCT ?character ?characterLabel WHERE {
      ?character wdt:${getPID('core/instance of')} "plant character".
      ?character wdt:${getPID("core/related structure")} ?relatedStructure.
      ?relatedStructure wdt:${getPID("core/substructure of")}* wd:${structureId}.

      ?character rdfs:label ?characterLabel.

      FILTER( NOT EXISTS {
        ?character wdt:${getPID('core/subcharacter of')} ?noParent.
      })
    }
    ORDER BY ASC(?characterLabel)
`);

  return await fetch(url).then(async response => {
    const data = wbApi.simplify.sparqlResults(await response.json());
    /* {
      character: Object { value: "PID", label: "String" }
      superStructure: "PID"
    } */
    // console.log('getTopLevelCharacters', data)
    return data;//.map(row => row.character);
  }).catch(err => {
    console.error(err);
  });
}