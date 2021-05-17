
import { wbApi } from "../_init.js";
import { getPID } from "./pid-uid.js";

// TREATS FACETS AS /AND/ BOOLEAN QUERIES
export async function getTaxaWithFacets (morphFacets, simpleFacets, queryOptions) {
  queryOptions = queryOptions ? queryOptions : {
    breakCache: false
  }
  const defaultFacetOptions = {
    querySubstructures: true,
    querySubcharacters: true,
  }
  const mf = morphFacets.filter(facet => facet[0] && facet[1] && facet[2] && facet[2].length).map(facet => (facet[3] = {...defaultFacetOptions, ...(facet[3] ?? {})}) && facet);

  console.log(`Morph facets`, mf);
  const numFacets = mf.length;
  const addIf = (condition, args, fragment) => condition ? fragment(...args) : '';
  const url = wbApi.sparqlQuery(`#
    SELECT DISTINCT 
      ?taxon ?taxonLabel 
      ?parentTaxon ?parentTaxonLabel 
      ?rank ?rankLabel 
      ${addIf(numFacets, [numFacets], (numFacets) => mf.map((f,i) => `
      ?relatedStructure${i} ?relatedStructure${i}Label 
      ?relatedCharacter${i} ?relatedCharacter${i}Label 
      ?provenance${i} ?provenance${i}Label
      ?value${i}`).join("\n\n")
      )}
      #?distribution
    WHERE {
      SERVICE wikibase:label {bd:serviceParam wikibase:language "en" }
      # order of execution is important, so better slow and accurate than optimised and wrong
      hint:Query hint:optimizer "None".
      ${ addIf(numFacets, [mf], (mf) => mf.map(([structureId, characterId, values], i) => `VALUES ?values_${i} {${values.map(v => `"${v}"`).join(' ')}}`).join("\n"))}
      ${ addIf(simpleFacets?.family?.length, [simpleFacets], (sf) => `VALUES ?families {${sf?.family.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
      ${ addIf(simpleFacets?.rank?.length, [simpleFacets], (sf) =>`VALUES ?ranks {${sf?.rank.map(v => `<http://wikibase.svc/entity/${v}>`).join(' ')}}`)}
      ${ addIf(simpleFacets?.distribution?.length, [simpleFacets], (sf) =>`VALUES ?distValues {${sf?.distribution.map(v => `"${v}"`).join(' ')}}`)}

      ${ addIf(simpleFacets?.family?.length, [simpleFacets], (sf) =>`
        ?taxon wdt:${getPID("taxon/parent taxon")}+ ?families.
      `)}
      ${ addIf(simpleFacets?.rank?.length, [simpleFacets], (sf) =>`
        ?taxon wdt:${getPID("taxon/rank")} ?ranks.
      `)}
      ${ addIf(simpleFacets?.distribution?.length, [simpleFacets], (sf) =>`
        ?taxon wdt:${getPID("taxon/distribution")} ?distValues.
      `)}

      ${addIf(numFacets, [mf], (mf) => mf.map(([structureId, characterId, v, opts], i) => `

      ?st${i} pq:${getPID("taxon/morphology statement value")} ?values_${i}.
      wd:${structureId} ${opts.querySubstructures ? `(^wdt:${getPID("core/substructure of")})*/` : ``}(^pq:${getPID("taxon/morphology statement structure")}) ?st${i}.
      wd:${characterId} ${opts.querySubcharacters ? `(^wdt:${getPID('core/subcharacter of')})*/` : ``}(^pq:${getPID("taxon/morphology statement character")}) ?st${i}.
      ?st${i} ^p:${getPID("taxon/morphology statement")} ?taxon.

      ?st${i} pq:${getPID("taxon/morphology statement value")} ?value${i};
              pq:${getPID("taxon/morphology statement structure")} ?relatedStructure${i};
              pq:${getPID("taxon/morphology statement character")} ?relatedCharacter${i}.

      OPTIONAL {
        ?st${i} prov:wasDerivedFrom/pr:${getPID("core/provenance")} ?provenance${i} .
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
    // console.log('Taxon facet results', data);
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
