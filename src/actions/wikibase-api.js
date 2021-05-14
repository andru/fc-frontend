import { wbApi, wdApi } from "./_init.js";
import { getPID, getUID } from "./floracommons/pid-uid.js";

import { fetchTaxonById } from "./floracommons/get-taxon.js";
import { fetchAllEntityProvenances } from "./floracommons/provenance";


/**
 * Given a wikibase API claims object, add labels for entity ids directly to the claims object,
 * and return a Map of paths to statements with referenced lables
 * @param {Unsimplified claims object from Wikibase API result} claims 
 * @returns <Map> A map of entity ids, to an array of [claim property id, statement index, label]
 */
export async function addClaimLabels (claims) {
  // iterate through all claims
  // find instances of datavalues of type "wikibase-entityid"
  // make a record to come back and enrich with a label when resolved from the API
  const entities = new Map();
  for (const propertyId in claims) {
    if (!claims.hasOwnProperty(propertyId)) continue;
    const propertyClaims = claims[propertyId];
    for (let i = 0; i < propertyClaims.length; i++) {
      const claim = propertyClaims[i];
      if (claim?.mainsnak?.datavalue?.type==="wikibase-entityid" && claim?.mainsnak?.datavalue?.value?.id) {
        const entityId = claim.mainsnak.datavalue.value.id;
        // set the path in claims object to enrich with label when resolved
        const path = [propertyId, i]
        entities.has(entityId) 
          ? entities.get(entityId).paths.push(path)
          : entities.set(entityId, {label: undefined, paths:[path]});
      }
    }
  }

  if (!entities.size) {
    return new Map();
  }

  // construct url for getting entity labels
  // @TODO - at wikibase this is limited to batches of 50, check floracommons config!
  const url = wbApi.getEntities({
    ids: [...entities.keys()],
    languages: [ 'en' ],
    props: [ 'labels' ]
  })

  // const url = wbApi.sparqlQuery(`SELECT ?id ?label {
  //   VALUES ?id {${entities.keys().map(key => `wd:${key}`)}}
  //   ?id rdfs:label ?label.
  // }`);

  // fetch API result
  return await fetch(url).then(async response => {
    const r = await response.json();
    // enrich the provided claims with labels returned from the API
    
    if (r?.entities) {
      if (Object.keys(r.entities).length !== entities.size) {
        throw new Error(`Number of entities returned from Wikibase API differed from those requested: ${r.entities.keys().length} vs ${entities.keys().length}`);
      }
      // iterate through API results 
      for (const entityId in r.entities) {
        if (!entities.has(entityId)) continue;
        const label = r.entities[entityId]?.labels?.en?.value;
        if (label) {
          // iterate through statements paths for claims, and enrich statement with label 
          const entity = entities.get(entityId);
          entity.label = label;
          entity.paths.forEach(path => {
            claims[path[0]][path[1]].mainsnak.datavalue.value.label = label;
          })
        }
      }
      return entities;
    } else {
      throw new Error(r)
    }

  }).catch(err => {
    console.error(err);
    throw new Error(err);
  });
}
/**
 * Return a list of actions scoped with a wikibase-api instance
 * @param {Object}      An instance wikibase-api  
 * @return {Array}      An object of action functions
 */
export default function makeActions () {
    

    /**
   * Get a list of structures with one parent structure
   */
  // async function getSecondLevelStructures () {

  // }

  // async function getPlantStructurePropertiesMatching (string) {
  //   const url = wbApi.sparqlQuery(`
  //   SELECT ?property ?propertyLabel ?parentProperty WHERE {
  //     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      
  //     ?property wdt:${getPID('core/instance of')} "plant structure".
  //     ?property rdfs:label ?label 
      
  //     FILTER(LANG(?label) ="en"). 
  //     FILTER (regex(?label,"^${string}")).   
      
  //     OPTIONAL {?property wdt:${getPID("core/substructure of")} ?parentProperty.}
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
      ?property wdt:${getPID('core/instance of')}+ wd:${propertyId}.
      OPTIONAL {?property wdt:${getPID("core/substructure of")} ?parent.}
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
  //     ?property wdt:${getPID('core/instance of')} "morphology property". #property instance of "morphology property"
  //     # reduce to properties which are related to the given structure
  //     ?property wdt:${getPID("core/substructure of")}* wd:${structureId}.
  //     # get the related character for each property
  //     ?property wdt:${getPID('core/subcharacter of')} ?character.
  //     # reduce to top level characters
  //     ?character wdt:${getPID('core/instance of')} "plant supercharacter"

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






  function facetFragmentFamily (facet) {
    if (!facet.length) {
      return '';
    } 
    return `
      ?taxon wdt:${getPID("taxon/parent taxon")}* ${facet}
    `;
  }

  // TREATS FACETS AS /AND/ BOOLEAN QUERIES
  async function getTaxaWithFacets (morphFacets, simpleFacets, queryOptions) {
    queryOptions = queryOptions ? queryOptions : {
      breakCache: false
    }
    const defaultFacetOptions = {
      querySubstructures: true,
      querySubcharacters: true,
    }
    const mf = morphFacets.filter(facet => facet[0] && facet[1] && facet[2] && facet[2].length).map(facet => (facet[3] = {...facet[3] ?? {}, ...defaultFacetOptions}) && facet);
    const numFacets = mf.length;
    const addIf = (condition, fragment) => condition ? fragment : '';
    const url = wbApi.sparqlQuery(`#
      SELECT DISTINCT 
        ?taxon ?taxonLabel 
        ?parentTaxon ?parentTaxonLabel 
        ?rank ?rankLabel 
        ${addIf(mf.length, mf.map((f,i) => (`
        ?relatedStructure${i} ?relatedStructure${i}Label 
        ?relatedCharacter${i} ?relatedCharacter${i}Label 
        ?provenance${i} ?provenance${i}Label
        ?value${i}`).join("\n\n"))
        )}
        #?distribution
      WHERE {
        SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
        ${ addIf(mf.length, mf.map(([structureId, characterId, values], i) => `VALUES ?values_${i} {${values.map(v => `"${v}"`).join(' ')}}`).join("\n"))}
        ${ addIf(simpleFacets.family.length, `VALUES ?families {${simpleFacets.family.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
        ${ addIf(simpleFacets.rank.length, `VALUES ?ranks {${simpleFacets.rank.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
        ${ addIf(simpleFacets.distribution.length, `VALUES ?distValues {${simpleFacets.distribution.map(v => `"${v}"`).join(' ')}}`)}

        ${ addIf(simpleFacets.family.length, `
          ?taxon wdt:${getPID("taxon/parent taxon")}+ ?families.
        `)}
        ${ addIf(simpleFacets.rank.length, `
          ?taxon wdt:${getPID("taxon/rank")} ?ranks.
        `)}
        ${ addIf(simpleFacets.distribution.length, `
          ?taxon wdt:${getPID("taxon/distribution")} ?distValues.
        `)}

        ?taxon wdt:${getPID("taxon/rank")} ?rank.

        ${addIf(mf.length, mf.map(([structureId, characterId, values, opts = {}], i) => `

        ?st${i} pq:${getPID("taxon/morphology statement structure")}${opts.querySubstructures ? `/^wdt:${getPID("core/substructure of")}*` : ``} wd:${structureId}.
        ?st${i} pq:${getPID("taxon/morphology statement character")}${opts.querySubcharacters ? `/^wdt:${getPID('core/subcharacter of')}*` : ``} wd:${characterId}.
        ?st${i} pq:${getPID("taxon/morphology statement value")} ?values_${i}.
        ?st${i} pq:${getPID("taxon/morphology statement value")} ?value${i};
            pq:${getPID("taxon/morphology statement structure")} ?relatedStructure${i};
            pq:${getPID("taxon/morphology statement character")} ?relatedCharacter${i}.
 
        OPTIONAL {
          ?st${i} prov:wasDerivedFrom/pr:${getPID("code/provenance")} ?provenance${i} .
        }
        `).join("\n\n"))}
        OPTIONAL { ?taxon wdt:${getPID("taxon/parent taxon")} ?parentTaxon }
      }
      ORDER BY ASC(?taxonLabel) LIMIT 100`);
    return await fetch(`${url}${queryOptions.breakCache ? '&nocache=true' : ''}`).then(async response => {
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
        ?taxon wdt:${getPID("taxon/rank")} ?rank.
        ?taxon p:${getPID("taxon/morphology statement")}  ?st.

        ?st pq:${getPID("taxon/morphology statement structure")} ?superStructure.
        ?superStructure wdt:${getPID("core/substructure of")}* wd:${structureId}.
        hint:Prior hint:gearing "forward".

        ?st pq:${getPID("taxon/morphology statement character")} ?superCharacter.
        ?superCharacter wdt:${getPID('core/subcharacter of')}* wd:${characterId}.
        hint:Prior hint:gearing "forward".

        ?st pq:${getPID("taxon/morphology statement value")} ?values.
        ?st pq:${getPID("taxon/morphology statement value")} ?value.
        
        OPTIONAL { ?taxon wdt:${getPID("taxon/parent taxon")} ?parentTaxon }
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
      _:st pq:${getPID("taxon/morphology statement value")} ?value.
      _:st pq:${getPID("taxon/morphology statement structure")}/^wdt:${getPID("core/substructure of")}* wd:${structureId}.
      _:st pq:${getPID("taxon/morphology statement character")}/^wdt:${getPID('core/subcharacter of')}* wd:${characterId}.
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



  async function searchTaxaByName (partialTaxonName) {
    const url = wbApi.sparqlQuery(`SELECT ?taxon ?taxonName{
      ?taxon wdt:${getPID('core/instance of')} "taxon".
      ?taxon wdt:${getPID("taxon/name")} ?taxonName.
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
      ?rank wdt:${getPID('fc-uid')} "taxon/rank/${rankName}".
      ?taxon wdt:${getPID("taxon/rank")} ?rank;
             wdt:${getPID("taxon/name")} ?taxonName.
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

  return {
    // getSecondLevelStructures,
    // getPlantStructurePropertiesMatching,
    getAllSubpropertiesOf,
    getAllSubpropertyValuesOf,
    // getAllCharactersForStructure,
    getAllValuesForStructureAndCharacter,
    getTaxaWithFacets,
    fetchTaxonById,
    fetchAllEntityProvenances,
    addClaimLabels,
    searchTaxaByName,
    getTaxaNamesOfRank,
  }
}