// @TODO - look these PIDs up with the api
const instanceOfPID = "P4";
const taxonRankPID = "P15";
const parentTaxonPID = "P16";
const relatedStructurePID = "P9";
const relatedCharacterPID = "P11";


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
      SELECT DISTINCT ?property ?propertyLabel WHERE {
        ?property wdt:${instanceOfPID} "plant superstructure".
        FILTER( NOT EXISTS {
          ?property wdt:${relatedStructurePID} ?parentStructure.
        })
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      } ORDER BY ASC(?propertyLabel)
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
      ?character wdt:P4 "plant supercharacter".
      ?character ^wdt:P11 ?relatedStructure.
      ?relatedStructure wdt:P9+ ?superStructure.
    }
    ORDER BY ASC(?superStructure) ASC(?character)`);

    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        character: Object { value: "PID", label: "String" }
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
      SELECT DISTINCT ?taxon ?taxonLabel ?parentTaxon ?parentTaxonLabel ?rank ?rankLabel ?p_ ?p_Label ?value 
      WHERE {
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        ?taxon wdt:${taxonRankPID} ?rank.
        ?p_ wdt:${relatedStructurePID}* wd:${structureId}.
        ?p_ wdt:${relatedCharacterPID}* wd:${characterId}.
        ?p_ wikibase:directClaim ?p .
        ?taxon ?p ?value.
        OPTIONAL { ?taxon wdt:${parentTaxonPID} ?parentTaxon }
        FILTER (?value IN (${values.map(v => `"${v}"`).join(', ')}))
      }
      ORDER BY ASC(?taxonLabel)`);
      return await fetch(url).then(async response => {
        const data = wbApi.simplify.sparqlResults(await response.json());
        /* {
          taxon: Object { value: "QID", label: "String" }
          parentTaxon: Object { value: "QID", label: "String" }
          rank: Object { value: "QID", label: "String" }
          p_: Object {value: "PID", label: "String"}
  
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
      ?p_ wdt:${relatedStructurePID}* wd:${structureId}.
      ?p_ wdt:${relatedCharacterPID}* wd:${characterId}.
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

  async function getTaxonById (taxonId) {
    const url = wbApi.sparqlQuery(`
    SELECT ?name ?family ?familyLabel ?rank ?rankLabel ?parentTaxon ?parentTaxonLabel ?commonName ?taxonId ?taxonAuthority ?taxonRank ?taxonRankLabel   {
      BIND (<http://wikibase.svc/entity/${taxonId}> AS ?taxon)
      ?taxon wdt:P14 ?name;
             wdt:P17 ?family;
             wdt:P15 ?rank;
             wdt:P16 ?parentTaxon;
             wdt:P18 ?commonName.
      ?taxon p:P23 [ ps:P23 ?taxonId; 
                     pq:P21 ?taxonAuthority;
                     pq:P15 ?taxonRank;].
    
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
    }`);
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
  }
}