// @TODO - look these PIDs up with the api
const fcUIDPID = "P1";
const instanceOfPID = "P4";
const taxonNamePID = "P16";
const taxonRankPID = "P17";
const parentTaxonPID = "P18";
const substructureOfPID = "P9";
const subcharacterOfPID = "P10";
const relatedStructurePID = "P11";


const acceptedIdPID = "P25";
const taxonAuthorityPID = "P23";
const commonNamePID = "P20";
const taxonFamilyPID = "P19";

const morphologyStatementPID = "P35";
const morphologyStatementValuePID = "P36";
const morphologyStatementStructurePID = "P40";
const morphologyStatementStructureConstraintPID = "P41";
const morphologyStatementCharacterPID = "P42";

const distributionPID = "P29";


const provenancePID = "P15";
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
  async function getTopLevelStructures() {
      const url = wbApi.sparqlQuery(`
      SELECT ?structure ?structureLabel {
        #SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        ?structure wdt:${instanceOfPID} "plant superstructure".
        ?structure rdfs:label ?structureLabel.
        FILTER( NOT EXISTS {
          ?structure wdt:${substructureOfPID} ?parentStructure.
        })
     }
     ORDER BY ASC(?structureLabel)
    `);

    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      /*{
        property: {
          value: "PID",
          label: "en label"
        }
      }*/
      // console.log('Structures', data)
      return data;
    }).catch(err => {
      console.error(err);
    });
  }

    /**
   * Get a list of structures with one parent structure
   */
  // async function getSecondLevelStructures () {

  // }

  // async function getPlantStructurePropertiesMatching (string) {
  //   const url = wbApi.sparqlQuery(`
  //   SELECT ?property ?propertyLabel ?parentProperty WHERE {
  //     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      
  //     ?property wdt:${instanceOfPID} "plant structure".
  //     ?property rdfs:label ?label 
      
  //     FILTER(LANG(?label) ="en"). 
  //     FILTER (regex(?label,"^${string}")).   
      
  //     OPTIONAL {?property wdt:${substructureOfPID} ?parentProperty.}
  //   }
  //   `);


  //   return await fetch(url).then(async response => {
  //     const data = wbApi.simplify.sparqlResults(await response.json());
  //     /*{
  //       parentProperty: "PID",
  //       property: {
  //         label: "en label",
  //         value: "PID"
  //       }
  //     }*/
  //     // console.log(data)
  //     return data;
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // }


  async function getAllSubpropertiesOf (propertyId) {
    const url = wbApi.sparqlQuery(`SELECT DISTINCT ?property ?propertyLabel ?parent WHERE {
      ?property wdt:${instanceOfPID}+ wd:${propertyId}.
      OPTIONAL {?property wdt:${substructureOfPID} ?parent.}
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
  // async function getAllCharactersForStructure (structureId) {

  //   // this query times out now because there are so many morph properties
  //   const url = wbApi.sparqlQuery(`#
  //   SELECT DISTINCT ?character ?characterLabel WHERE {
  //     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  //     # all morphology properties
  //     ?property wdt:${instanceOfPID} "morphology property". #property instance of "morphology property"
  //     # reduce to properties which are related to the given structure
  //     ?property wdt:${substructureOfPID}* wd:${structureId}.
  //     # get the related character for each property
  //     ?property wdt:${subcharacterOfPID} ?character.
  //     # reduce to top level characters
  //     ?character wdt:${instanceOfPID} "plant supercharacter"

  //   }
  //   ORDER BY ASC(?characterLabel)
  //   `);


  //   return await fetch(url).then(async response => {
  //     const data = wbApi.simplify.sparqlResults(await response.json());
  //     /* {
  //       character: Object { value: "PID", label: "String" }
  //     } */
  //     // console.log('getAllCharactersForStructure', data)
  //     return data.map(row => row.character);
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // }

  /**
   * Return a list of characters with no parent (via `related character`)
   */
  async function getTopLevelCharacters () {
    const url = wbApi.sparqlQuery(`# Get top level characters and their related superstructure  
    SELECT DISTINCT ?character ?characterLabel  WHERE {
      ?character wdt:${instanceOfPID} "plant character".
      ?character rdfs:label ?characterLabel.

      FILTER( NOT EXISTS {
        ?character wdt:${subcharacterOfPID} ?noParent.
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
  async function getTopLevelCharactersOfStructure (structureId) {
    // this query is much faster, but returns all characters, so needs some filtering
    const url = wbApi.sparqlQuery(`# 
      # Get top level characters and their related superstructure  
      SELECT DISTINCT ?character ?characterLabel WHERE {
        ?character wdt:${instanceOfPID} "plant character".
        ?character wdt:${relatedStructurePID} ?relatedStructure.
        ?relatedStructure wdt:${substructureOfPID}* wd:${structureId}.

        ?character rdfs:label ?characterLabel.

        FILTER( NOT EXISTS {
          ?character wdt:${subcharacterOfPID} ?noParent.
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

  function facetFragmentFamily (facet) {
    if (!facet.length) {
      return '';
    } 
    return `
      ?taxon wdt:${parentTaxonPID}* ${facet}
    `;
  }

  // TREATS FACETS AS /AND/ BOOLEAN QUERIES
  async function getTaxaWithFacets (morphFacets, simpleFacets) {

    const mf = morphFacets.filter(facet => facet[0] && facet[1] && facet[2] && facet[2].length);
    const numFacets = mf.length;
    const addIf = (condition, fragment) => condition ? fragment : '';
    const url = wbApi.sparqlQuery(`#
      SELECT DISTINCT 
        ?taxon ?taxonLabel 
        ?parentTaxon ?parentTaxonLabel 
        ?rank ?rankLabel 
        ${addIf(mf.length, mf.map((f,i) => `
        ?relatedStructure${i} ?relatedStructure${i}Label 
        ?relatedCharacter${i} ?relatedCharacter${i}Label 
        ?provenance${i} ?provenance${i}Label
        ?value${i}`).join("\n\n")
        )}
        #?distribution
      WHERE {
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        ${ addIf(mf.length, mf.map(([structureId, characterId, values], i) => `VALUES ?values_${i} {${values.map(v => `"${v}"`).join(' ')}}`).join("\n"))}
        ${ addIf(simpleFacets.family.length, `VALUES ?families {${simpleFacets.family.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
        ${ addIf(simpleFacets.rank.length, `VALUES ?ranks {${simpleFacets.rank.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
        ${ addIf(simpleFacets.distribution.length, `VALUES ?distValues {${simpleFacets.distribution.map(v => `"${v}"`).join(' ')}}`)}

        ${ addIf(simpleFacets.family.length, `
          ?taxon wdt:${parentTaxonPID}+ ?families.
        `)}
        ${ addIf(simpleFacets.rank.length, `
          ?taxon wdt:${taxonRankPID}+ ?ranks.
        `)}
        ${ addIf(simpleFacets.distribution.length, `
          ?taxon wdt:${distributionPID} ?distValues.#;
                 #wdt:${distributionPID} ?distribution.
        `)}

        ?taxon wdt:${taxonRankPID} ?rank.

        ${addIf(mf.length, mf.map(([structureId, characterId], i) => `

        ?st${i} pq:${morphologyStatementStructurePID}/^wdt:${substructureOfPID}* wd:${structureId}.
        ?st${i} pq:${morphologyStatementCharacterPID}/^wdt:${subcharacterOfPID}* wd:${characterId}.
        ?st${i} pq:${morphologyStatementValuePID} ?values_${i}.
        ?st${i} pq:${morphologyStatementValuePID} ?value${i};
            pq:${morphologyStatementStructurePID} ?relatedStructure${i};
            pq:${morphologyStatementCharacterPID} ?relatedCharacter${i}.
        ?st${i} ^p:${morphologyStatementPID} ?taxon.
 
        OPTIONAL {
          ?st${i} prov:wasDerivedFrom/pr:${provenancePID} ?provenance${i} .
        }
        `).join("\n\n"))}
        OPTIONAL { ?taxon wdt:${parentTaxonPID} ?parentTaxon }
      }
      ORDER BY ASC(?taxonLabel) LIMIT 100`);
    return await fetch(url).then(async response => {
      if (response.status !== 200) {
        throw new Error("Query failed");
      }
      const data = wbApi.simplify.sparqlResults(await response.json());
      /* {
        taxon: Object { value: "QID", label: "String" }
        parentTaxon: Object { value: "QID", label: "String" }
        rank: Object { value: "QID", label: "String" }
        superStructure: Object {value: "PID", label: "String"}
        value: String
      } */
      // console.log('Taxa', data)
      // reformat result rows to group the various printouts into an array of objects
      return Array.from(data.map(row => {
        const morphHits = Array.from({length: numFacets}, (n, i) => ({
          type: 'morph',
          relatedStructure: row[`relatedStructure${i}`],
          relatedCharacter: row[`relatedCharacter${i}`],
          value: row[`value${i}`],
          provenance: row[`provenance${i}`],
        }));
        const simpleHits = {
          distribution: row.distribution || [] 
        }
        return {
          taxon: row.taxon,
          parent: row.parentTaxon,
          rank: row.rank,
          morphHits,
          simpleHits,
        }
      })
      // squash rows of the same taxon into one row with multiple search hits
      .reduce((map, row) => {
        if (map.has(row.taxon.value)) {
          const sameTaxon = map.get(row.taxon.value);
          row.morphHits.push(...sameTaxon.morphHits);
        }
        map.set(row.taxon.value, row)
        return map;
      }, new Map()).values())

    }).catch(err => {
      console.error(err);
    });
  }


  // TREATS FACETS AS /OR/ BOOLEAN QUERIES
  async function getTaxaWithCombinedFacets (facets) {
    const facetQueries = facets
    // filter out incomplete facets
    .filter(facet => facet[0] && facet[1] && facet[2] && facet[2].length)
    // map each facet row to a Promise for results
    .map(async facet => {
      const [structureId, characterId = null, values = []] = facet;
      const url = wbApi.sparqlQuery(`#
      SELECT DISTINCT 
        ?taxon ?taxonLabel 
        ?parentTaxon ?parentTaxonLabel 
        ?rank ?rankLabel 
        ?superStructure ?superStructureLabel 
        ?superCharacter ?superCharacterLabel 
        ?provenance ?provenanceLabel
        ?value 
      WHERE {
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        VALUES ?values {${values.map(v => `"${v}"`).join(' ')}}
        ?taxon wdt:${taxonRankPID} ?rank.
        ?taxon p:${morphologyStatementPID}  ?st.

        ?st pq:${morphologyStatementStructurePID} ?superStructure.
        ?superStructure wdt:${substructureOfPID}* wd:${structureId}.
        hint:Prior hint:gearing "forward".

        ?st pq:${morphologyStatementCharacterPID} ?superCharacter.
        ?superCharacter wdt:${subcharacterOfPID}* wd:${characterId}.
        hint:Prior hint:gearing "forward".

        ?st pq:${morphologyStatementValuePID} ?values.
        ?st pq:${morphologyStatementValuePID} ?value.
        
        OPTIONAL { ?taxon wdt:${parentTaxonPID} ?parentTaxon }
        OPTIONAL {
          ?st prov:wasDerivedFrom _:ref .
          _:ref pr:P12 ?provenance .
          }
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
      _:st pq:${morphologyStatementValuePID} ?value.
      _:st pq:${morphologyStatementStructurePID}/^wdt:${substructureOfPID}* wd:${structureId}.
      _:st pq:${morphologyStatementCharacterPID}/^wdt:${subcharacterOfPID}* wd:${characterId}.
    } 
    ORDER BY ASC(?value)
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

  async function getTaxaNamesOfRank (rankName) {
    const url = wbApi.sparqlQuery(`SELECT ?taxon ?taxonName{
      ?rank wdt:${fcUIDPID} "taxon/rank/${rankName}".
      ?taxon wdt:${taxonRankPID} ?rank;
             wdt:${taxonNamePID} ?taxonName.
  } ORDER BY ASC(?taxonName)`);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      return data.map(row => ({id: row.taxon.value, name: row.taxon.name}))
      // console.log(`taxa of rank ${rankName}`, data)
      // return data;
    }).catch(err => {
      console.error(err);
    });
  }

  async function getCommonDistributionValues () {
    const url = wbApi.sparqlQuery(`SELECT ?dist (COUNT(?dist) AS ?count)
    WHERE 
    {
       ?taxon wdt:P29 ?dist.
    }
    GROUP BY ?dist
    HAVING(?count > 100)
    ORDER BY DESC(?count)`);
    return await fetch(url).then(async response => {
      const data = wbApi.simplify.sparqlResults(await response.json());
      // return data.map(row => ({name: row.dist}))
      // console.log(``, data)
      return data.map(row => row.dist).sort();
    }).catch(err => {
      console.error(err);
    });
  }

  return {
    getTopLevelStructures,
    // getSecondLevelStructures,
    getTopLevelCharacters,
    getTopLevelCharactersOfStructure,
    // getPlantStructurePropertiesMatching,
    getAllSubpropertiesOf,
    getAllSubpropertyValuesOf,
    // getAllCharactersForStructure,
    getAllValuesForStructureAndCharacter,
    getTaxaWithFacets,
    getTaxonById,
    searchTaxaByName,
    getTaxaNamesOfRank,
    getCommonDistributionValues,
  }
}