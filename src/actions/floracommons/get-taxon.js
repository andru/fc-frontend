import {wbApi} from "../_init.js";
import { getPID, getUID } from "./pid-uid.js";
import { getClaimProvenances } from "./provenance.js";

export async function fetchTaxonById (taxonId) {
  // const url = wbApi.sparqlQuery(`
  // SELECT ?name ?family ?familyLabel ?rank ?rankLabel ?parentTaxon ?parentTaxonLabel ?commonName ?taxonId ?taxonAuthority ?taxonRank ?taxonRankLabel WHERE {
  //   BIND(<http://wikibase.svc/entity/${taxonId}> AS ?taxon)
  //   ?taxon wdt:${getPID("taxon/name")} ?name;
  //          wdt:${getPID("taxon/rank")} ?rank.
  //   OPTIONAL {
  //     ?taxon wdt:${getPID("taxon/family")} ?family;
  //   }
  //   OPTIONAL { 
  //     ?taxon wdt:${getPID("taxon/parent taxon")} ?parentTaxon.
  //   } 
  //   OPTIONAL {
  //     ?taxon wdt:${getPID("taxon/common name")} ?commonName
  //   }
  //   OPTIONAL {
  //     ?taxon p:${getPID("taxon/accepted id")} _:b1.
  //     _:b1 ps:${getPID("taxon/accepted id")} ?taxonId;
  //          pq:${getPID("taxon/authority")} ?taxonAuthority;
  //          pq:${getPID("taxon/rank")} ?taxonRank.
  //   }
  //   SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  // }`);
  const url = wbApi.getEntities({
    ids: [ taxonId ],
    languages: [ 'en' ], // returns all languages if not specified
    //props: [ 'info', 'claims' ], // returns all data if not specified
    redirections: true // defaults to true
  })
  return await fetch(url).then(async response => {
    const resJson = await response.json();
    return await normaliseResult(resJson);
  }).catch(err => {
    console.error(err);
    throw new Error(err);
  });
}

async function parseClaims (claims) {
  return Object.fromEntries(Object.entries(claims).map(
    ([key, value]) => ([getUID(key), value])
  ))
  
}

async function normaliseResult (json) {

  const data = wbApi.simplify.entities(json, {
    keepRichValues: true,
    keepQualifiers: true,
    keepReferences: true,
    keepIds: true,
    keepRanks: true,
  }); //wbApi.simplify.sparqlResults(json);
  // console.log('Unsimplified', json);
  if (!json.success) {
    throw new Error('Wikibase API request failed');
  }
  const entities = Object.values(json.entities);
  if (!entities.length) {
    throw new Error(`No entities returned by API for taxon`);
  }
  // const claimLabels = await addClaimLabels(entity.claims);
  if (entities.length) {
    const entity = entities[0];
    console.log(`Entity`, entity);
    const claims =  await parseClaims(entity.claims);
    console.log(`Claims`, claims);
    const simpleClaims =  wbApi.simplify.claims(claims, {keepAll: true});
    console.log(`Simplified claims`, simpleClaims)

    const getClaims = (uid) => claims[uid] ? claims[uid] : undefined;
    const getClaim = (uid) => getClaims(uid) && getClaims(uid).length ? getClaims(uid)[0] : undefined;
    // const getLabel = (pid) => claimLabels.has(pid) ? claimLabels.get(pid).label : pid;
    const mapClaims = (uid, mapFn) => {
      if (typeof uid === 'object' && uid.length) {
        
      }
      const selectedClaims = getClaims(uid);
      if (!selectedClaims || !selectedClaims.length) 
        return [];
      return selectedClaims.map(mapFn);
    }

    const addSimpleValue = (uid) => {
      const claimObj = getClaim(uid);
      // const prov = claimObj.references?.[0].snaks?.[getPID('core/provenance')]?.
      if (claimObj) {
        switch(claimObj?.mainsnak?.datatype) {
          case 'wikibase-item':
            taxon[uid] = {
              id: claimObj?.mainsnak?.datavalue?.value?.id
            }
            break;
          case 'quantity':
          case 'string':
          default:
            taxon[uid] = {
              value: claimObj?.mainsnak?.datavalue?.value
            }
        }
      }
    }

    const statementIdRegexp = /^d0_s([0-9]+)$/;
    const getOrderFromStatementId = (id) => id && statementIdRegexp.test(id) ? parseInt(id.match(statementIdRegexp)[1]) : 9999;
    const description = mapClaims('taxon/description/fragment', (f) => {
      const id = f?.qualifiers?.[getPID('taxon/description/fragment id')][0]?.datavalue?.value;
      const numericId = getOrderFromStatementId(id);
      return ({
        text: f.mainsnak?.datavalue?.value,
        id,
        order: numericId,
        provenance: getClaimProvenances(f)
      })
    })
    .sort((a, b) => {
      a = a.numericId;
      b = b.numericId;
      return a > b ? 1 : a < b ? -1 : 0;
    })
    
    const synonyms = mapClaims('taxon/synonym', synonym => ({
      text: synonym.mainsnak?.datavalue?.value,
      provenance: getClaimProvenances(synonym)
    }))

    const commonNames = mapClaims('taxon/common name', name => ({
      text: name.mainsnak?.datavalue?.value,
      provenance: getClaimProvenances(name)
    }))

    const distribution = mapClaims('taxon/distribution', dist => ({
      text: dist.mainsnak?.datavalue?.value,
      provenance: getClaimProvenances(dist)
    }))

    const discussion = mapClaims('taxon/discussion', discussion => ({
      text: discussion.mainsnak?.datavalue?.value,
      provenance: getClaimProvenances(discussion)
    }))

    const provenances = Array.prototype.concat(...Object.values(claims)).reduce((uniqueProvs, claim) => {
      getClaimProvenances(claim).forEach(p => uniqueProvs.indexOf(p.id) < 0 && uniqueProvs.push(p.id))
      return uniqueProvs;
    }, [])

    // const allProvenances = Object.values(simpleClaims).reduce

    const taxon = {
      name: getClaim('taxon/name').mainsnak?.datavalue?.value,
      description,
      distribution,
      synonyms,
      commonNames,
      discussion,
      provenances,
      claims,
      simpleClaims,
    } 
    addSimpleValue('taxon/parent taxon');
    addSimpleValue('taxon/authority');
    addSimpleValue('taxon/rank');

    console.log('Taxon', taxon);
    return taxon;
  }
}

export async function getCommonDistributionValues () {
  const url = wbApi.sparqlQuery(`SELECT ?dist (COUNT(?dist) AS ?count)
  WHERE 
  {
     ?taxon wdt:${getPID('taxon/distribution')} ?dist.
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