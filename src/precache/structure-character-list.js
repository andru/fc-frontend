import util from "util";
import fs from "fs";
import path from "path";

import wikibaseSDK from "wikibase-sdk";
import { getPID, getUID } from "../actions/floracommons/pid-uid.js";
import { getTopLevelStructures, getTopLevelCharacters, getTopLevelCharactersOfStructure } from "../actions/floracommons/morphology.js";

const writeFile = util.promisify(fs.writeFile);


export default async function fetchAndCache () {

  const fcEndpoint = {
    instance: process.env.REACT_APP_WIKI || 'http://localhost',
    sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://localhost:8989/bigdata/sparql', 
  }
  const wbApi = wikibaseSDK(fcEndpoint);
  

  console.log('Querying wikibase and pre-caching structure & character lists')
  const allStructures = await fetchStructures();
  const allCharacters = await fetchCharacters();
  // a map of structure ids to an array of character ids
  const structuresWithCharacters = await fetchStructureCharacters();

  const cachedResults = {
    structureToCharacters: structuresWithCharacters,
    structures: allStructures.map(structure => [structure.id, structure.label]),
    characters: allCharacters.map(character => [character.id, character.label]),
  }

  const cachePath = path.resolve('./public')

  await writeFile(`${cachePath}/structure-character.json`, JSON.stringify(cachedResults));

  console.log("Done!");


  async function fetchStructures () {
    const data = await getTopLevelStructures();
    if (data) {
      return data.map(row => ({
        id: row.structure.value,
        label: row.structure.label
      }))
    } else {
      throw new Error('Oops no structures')
    }
  }
  
  async function fetchCharacters () {
    const data = await getTopLevelCharacters();
    if (data) {
      return data.map(row => ({
        id: row.character.value,
        label: row.character.label
      }))
    } else {
      throw new Error('Oops no characters');
    }
  }
  
  async function fetchStructureCharacters () {

    // fetch a list of top level structures and associated top-level characters
    const url = wbApi.sparqlQuery(`# 
    SELECT DISTINCT ?structure ?structureLabel ?character ?characterLabel WHERE {
      ?structure wdt:${getPID('core/instance of')} "plant structure".
      ?structure rdfs:label ?structureLabel.

      FILTER( NOT EXISTS {
        ?structure wdt:${getPID("core/substructure of")} ?noStrParent.
      })
      
      ?structure wdt:${getPID("core/related character")} ?character
                 
      FILTER( NOT EXISTS {
        ?character wdt:${getPID('core/subcharacter of')} ?noCharParent.
      })
      ?character rdfs:label ?characterLabel.
    }
    ORDER BY ASC(?characterLabel)
`);

  const data = await fetch(url).then(async response => {
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
  
    if (data) {
      return data.reduce((groups, row) => {
        if (!groups[row.structure.value]) {
          groups[row.structure.value] = [];
        }
        groups[row.structure.value].push(row.character.value)
        return groups;
      }, {})
    } else {
      throw new Error('Oops no characters');
    }
  }
}

