import util from "util";
import fs from "fs";
import path from "path";

import wikibaseSDK from "wikibase-sdk";
import makeWikibaseApiActions from "../actions/wikibase-api.js";

const writeFile = util.promisify(fs.writeFile);


export default async function fetchAndCache () {

  const fcEndpoint = {
    instance: process.env.REACT_APP_WIKI || 'http://localhost',
    sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://localhost:8989/bigdata/sparql', 
  }
  const wbApi = wikibaseSDK(fcEndpoint);
  const { getTopLevelStructures, getTopLevelCharacters, getTopLevelCharactersOfStructure } = makeWikibaseApiActions(wbApi);
  

  console.log('Querying wikibase and pre-caching structure & character lists')
  const allStructures = await fetchStructures();
  const allCharacters = await fetchCharacters();
  // a map of structure ids to an array of character ids
  const structuresWithCharacters = {};

  for (const structure of allStructures) {
    console.log(`Fetching characters related to structure ${structure.label}`)
    const characters = await fetchCharactersOfStructure(structure.id);
    // if there are characters associated with the structure, add it to the list
    if (characters.length > 0) {
      structuresWithCharacters[structure.id] = characters.map(character => character.id);
    }
  }

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
  
  async function fetchCharactersOfStructure (structureId) {
    const data = await getTopLevelCharactersOfStructure(structureId);
  
    if (data) {
      return data.map(row => ({
        id: row.character.value,
        label: row.character.label
      }))
    } else {
      throw new Error('Oops no characters');
    }
  }
}

