import {wbApi} from "../_init.js";
import { getPID, getUID } from "./pid-uid.js";

export async function fetchAllEntityProvenances(id) {
  const url = wbApi.sparqlQuery(`SELECT DISTINCT ?ref ?refLabel {
    wd:Q900 (<>|!<>)*/pr:${getPID('core/provenance')} ?ref.
    ?ref rdfs:label ?refLabel.
  }`);
  return await fetch(url).then(async response => {
    const data = wbApi.simplify.sparqlResults(await response.json());
    return data;
  }).catch(err => {
    console.error(err);
  });
}

export function getClaimProvenances (claimObj) {
  if (!claimObj) {
    throw new Error('Invalid claim object passed to getClaimProvenances');
  }
  if (!claimObj.references ||  !claimObj.references.length) {
    return []
  }
  const provenancePID = getPID('core/provenance');
  return claimObj.references.reduce((provs, ref) => {
    if (ref.snaks[provenancePID]) {
      ref.snaks[provenancePID].forEach(ref => {
        if (ref.datavalue?.type === 'wikibase-entityid' && ref.datavalue?.value?.id) {
          provs.push({
            id: ref.datavalue.value.id,
            ref
          })
        }
      })
    }
    return provs;
  }, []);
}