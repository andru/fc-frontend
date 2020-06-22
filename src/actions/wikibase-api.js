// @TODO - look these PIDs up with the api
const instanceOfPID = "P4";
const taxonNamePID = "P13";
const taxonRankPID = "P14";
const parentTaxonPID = "P15";
const relatedStructurePID = "P9";
const relatedCharacterPID = "P10";

const acceptedIdPID = "P22";
const taxonAuthorityPID = "P20";
const commonNamePID = "P17";
const taxonFamilyPID = "P16";

const morphologyStatementPID = "P32";
const characterStateValuePID = "P33";
/**
 * Return a list of actions scoped with a wikibase-api instance
 * @param {Object}      An instance wikibase-api  
 * @return {Array}      An object of action functions
 */
export default function makeActions (wbApi) {
    
  /**
   * Fetch all plant structure properties without a [subproperty of] statement
   * @return {Array}      An array of results
   */
  async function getTopLevelPlantStructureProperties() {
      const url = wbApi.sparqlQuery(`
      SELECT ?property ?propertyLabel {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
       ?property wdt:${instanceOfPID} "plant superstructure".
               FILTER( NOT EXISTS {
               ?property wdt:${relatedStructurePID} ?parentStructure.
             })
     }
     ORDER BY ASC(?propertyLabel)
    `);

    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /*{
        property: {
          value: "PID",
          label: "en label"
        }
      }*/
      console.log('Structures', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

  async function getPlantStructurePropertiesMatching (string) {
    const url = wbApi.sparqlQuery(`
    SELECT ?property ?propertyLabel ?parentProperty WHERE {
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      
      ?property wdt:${instanceOfPID} "plant structure".
      ?property rdfs:label ?label 
      
      FILTER(LANG(?label) ="en"). 
      FILTER (regex(?label,"^${string}")).   
      
      OPTIONAL {?property wdt:${relatedStructurePID} ?parentProperty.}
    }
    `);


    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /*{
        parentProperty: "PID",
        property: {
          label: "en label",
          value: "PID"
        }
      }*/
      console.log(data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }


  async function getAllSubpropertiesOf (propertyId) {
    const url = wbApi.sparqlQuery(`SELECT DISTINCT ?property ?propertyLabel ?parent WHERE {
      ?property wdt:${instanceOfPID}+ wd:${propertyId}.
      OPTIONAL {?property wdt:${relatedStructurePID} ?parent.}
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }`);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /*
      {
        property: {
          value: "PID",
          label: "en label"
        },
        parent: "PID"
      } 
      */
      console.log('Subproperties', data)
      return data;
    }).catch(err => {
  console.error(err);
    });
  }
  async function getAllSubpropertyValuesOf (propertyId) {
    const url = wbApi.sparqlQuery(`SELECT DISTINCT ?value  WHERE {
      ?p_ wdt:P5* wd:${propertyId}.
      ?p_ wikibase:directClaim ?p .
      ?item ?p ?value . 
    }`);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        value: "value string"
      } */
      console.log('Values', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

  /**
   * Return a list of characters related to the given structure
   * @param {String} structureId e.g. "P21" 
   */
  async function getAllCharactersForStructure (structureId) {

    // this query times out now because there are so many morph properties
    const url = wbApi.sparqlQuery(`#
    SELECT DISTINCT ?character ?characterLabel WHERE {
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      # all morphology properties
      ?property wdt:${instanceOfPID} "morphology property". #property instance of "morphology property"
      # reduce to properties which are related to the given structure
      ?property wdt:${relatedStructurePID}* wd:${structureId}.
      # get the related character for each property
      ?property wdt:${relatedCharacterPID} ?character.
      # reduce to top level characters
      ?character wdt:${instanceOfPID} "plant supercharacter"

    }
    ORDER BY ASC(?characterLabel)
    `);


    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        character: Object { value: "PID", label: "String" }
      } */
      console.log('getAllCharactersForStructure', data)
      return data.map(row => row.character);
    }).catch(err => {
      console.error(err);
    });
  }

    /**
   * Return a list of characters grouped by the top level related structure
   * @param {String} structureId e.g. "P21" 
   */
  async function getAllSuperCharacters (structureId) {
    // this query is much faster, but returns all characters, so needs some filtering
    const url = wbApi.sparqlQuery(`#
    SELECT DISTINCT ?superStructure ?character ?characterLabel  WHERE {
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      ?c wdt:${instanceOfPID} "plant character".
      ?c wdt:${relatedStructurePID} ?relatedStructure.
      ?c wdt:${relatedCharacterPID}* ?character.
      ?relatedStructure wdt:${relatedStructurePID}+ ?superStructure.
    }
    ORDER BY ASC(?superStructure) ASC(?characterLabel)`);

    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        character: Object { value: "PID", label: "String" }
        superStructure: "PID"
      } */
      console.log('getAllSuperCharacters', data)
      return data;//.map(row => row.character);
    }).catch(err => {
      console.error(err);
    });
  }

  async function getTaxaWithFacets (facets) {
    const facetQueries = facets
    // filter out incomplete facets
    .filter(facet => facet[0] && facet[1] && facet[2] && facet[2].length)
    // map each facet row to a Promise for results
    .map(async facet => {
      const [structureId, characterId = null, values = []] = facet;
      const url = wbApi.sparqlQuery(`#
      SELECT DISTINCT ?taxon ?taxonLabel ?parentTaxon ?parentTaxonLabel ?rank ?rankLabel ?superStructure ?superStructureLabel ?superCharacter ?superCharacterLabel ?value 
      WHERE {
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        VALUES ?values {${values.map(v => `"${v}"`).join(' ')}}
        ?taxon wdt:${taxonRankPID} ?rank.
        ?taxon p:${morphologyStatementPID} _:st.

        _:st pq:${relatedStructurePID} ?superStructure.
        ?superStructure wdt:${relatedStructurePID}* wd:${structureId}.
        hint:Prior hint:gearing "forward".

        _:st pq:${relatedCharacterPID} ?superCharacter.
        ?superCharacter wdt:${relatedCharacterPID}* wd:${characterId}.
        hint:Prior hint:gearing "forward".

        _:st pq:${characterStateValuePID} ?values.
        _:st pq:${characterStateValuePID} ?value.
        
        OPTIONAL { ?taxon wdt:${parentTaxonPID} ?parentTaxon }
        #FILTER (?value IN (${values.map(v => `"${v}"`).join(', ')}))
      }
      ORDER BY ASC(?taxonLabel)`);
      return await fetch(url).then(async response => {
        const data = wbApi.simplify.sparqlResults(await response.json());
        /* {
          taxon: Object { value: "QID", label: "String" }
          parentTaxon: Object { value: "QID", label: "String" }
          rank: Object { value: "QID", label: "String" }
          superStructure: Object {value: "PID", label: "String"}
          value: String
        } */
        // console.log('Taxa', data)
        return data;
      }).catch(err => {
        console.error(err);
      });
    });
    // return a Promise of all results combined into a single array
    return Promise.all(facetQueries).then(results => {
      // flatten all facet queries into a single result set
      return results.reduce((acc, facetResults) => (
        acc.concat(facetResults)
      ), [])
      // sort by taxon name
      .sort((a, b) => a.taxon.label > b.taxon.label ? 1 : b.taxon.label > a.taxon.label ? -1 : 0)
    });
  }


  async function getAllValuesForStructureAndCharacter (structureId, characterId) {
    const url = wbApi.sparqlQuery(`
      SELECT DISTINCT ?value WHERE {
        ?taxon p:P32 _:st.
        _:st pq:${relatedStructurePID} _:relatedStructure.
       _:relatedStructure wdt:${relatedStructurePID}* wd:${structureId}.
       hint:Prior hint:gearing "forward".
       _:st pq:${relatedCharacterPID} _:relatedCharacter.
       _:relatedCharacter wdt:${relatedCharacterPID}* wd:${characterId}.
       hint:Prior hint:gearing "forward".
       _:st pq:${characterStateValuePID} ?value.
     } ORDER BY ASC(?value)
     `);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        value: "value string"
      } */
      console.log('Values', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

  async function getTaxonById (taxonId) {
    const url = wbApi.sparqlQuery(`
    SELECT ?name ?family ?familyLabel ?rank ?rankLabel ?parentTaxon ?parentTaxonLabel ?commonName ?taxonId ?taxonAuthority ?taxonRank ?taxonRankLabel WHERE {
      BIND(<http://wikibase.svc/entity/${taxonId}> AS ?taxon)
      ?taxon wdt:${taxonNamePID} ?name;
             wdt:${taxonRankPID} ?rank.
      OPTIONAL {
        ?taxon wdt:${taxonFamilyPID} ?family;
      }
      OPTIONAL { 
        ?taxon wdt:${parentTaxonPID} ?parentTaxon.
      } 
      OPTIONAL {
        ?taxon wdt:${commonNamePID} ?commonName
      }
      OPTIONAL {
        ?taxon p:${acceptedIdPID} _:b1.
        _:b1 ps:${acceptedIdPID} ?taxonId;
             pq:${taxonAuthorityPID} ?taxonAuthority;
             pq:${taxonRankPID} ?taxonRank.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      console.log('Taxon', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

  async function searchTaxaByName (partialTaxonName) {
    const url = wbApi.sparqlQuery(`SELECT ?taxon ?taxonName{
      ?taxon wdt:${instanceOfPID} "taxon".
      ?taxon wdt:${taxonNamePID} ?taxonName.
      BIND (STRLEN(?taxonName) AS ?strlen)
      FILTER (REGEX(?taxonName, "${partialTaxonName}", "i"))
    } ORDER BY ASC(?strlen) ASC(?taxonName) LIMIT 20 `);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      console.log('Taxon', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

  return {
    getTopLevelPlantStructureProperties,
    getAllSuperCharacters,
    getPlantStructurePropertiesMatching,
    getAllSubpropertiesOf,
    getAllSubpropertyValuesOf,
    getAllCharactersForStructure,
    getAllValuesForStructureAndCharacter,
    getTaxaWithFacets,
    getTaxonById,
    searchTaxaByName,
  }
}