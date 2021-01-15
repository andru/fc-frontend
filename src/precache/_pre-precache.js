import util from "util";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import fetch from "node-fetch";

import wikibaseSDK from "wikibase-sdk";

dotenv.config();
global.fetch = fetch;

const fcUIDLabel = 'fc-uid';
const fcTypeLabel = 'fc-type';

const writeFile = util.promisify(fs.writeFile);

(async function fetchAndCache () {

  const fcEndpoint = {
    instance: process.env.REACT_APP_WIKI || 'http://localhost',
    sparqlEndpoint: process.env.REACT_APP_SPARQL || 'http://localhost:8989/bigdata/sparql', 
  }
  const wbApi = wikibaseSDK(fcEndpoint);
  
  console.log(`Caching core PID values`)

  const fcUidQueryUrl = wbApi.sparqlQuery(`
  SELECT ?propertyLabel ?property WHERE {
    ?property wikibase:propertyType ?propertyType.
    ?property rdfs:label ?propertyLabel.
    FILTER(?propertyLabel = "${fcUIDLabel}"@en || ?propertyLabel = "${fcTypeLabel}"@en)
  }`);


  const res = await fetch(`${fcUidQueryUrl}&nocache=true`).then(async response => {
    const data = wbApi.simplify.sparqlResults(await response.json());
    return data;
  }).catch(err => {
    console.error(err);
  });
  

  let fcType, fcUID;
  if (res) {
    res.forEach(row => {
      if (row.property.label === fcUIDLabel) {
        fcUID = row.property.value;
      }
      if (row.property.label === fcTypeLabel) {
        fcType = row.property.value;
      }
    });
  }

  if (!fcType || !fcUID) {
    throw new Error(`Failted to retrieve entity id for fc-type or fc-uid`);
  }

  // console.log(`fcType: ${fcType}; fcUID: ${fcUID}`)

  const url = wbApi.sparqlQuery(`
    SELECT ?pid ?uid {
      VALUES ?types {"core" "taxon"}
      ?pid wdt:${fcType} ?types.
      ?pid wdt:${fcUID} ?uid.
    }
  `);


  const data = await fetch(`${url}&nocache=true`).then(async response => {
    const res = await response.json();
    const data = wbApi.simplify.sparqlResults(res);
    return data;
  });

  if (!data || !data.length) {
    throw new Error(`Error querying core entities`)
  }
  const uidToPid = data.reduce((map, row) => {
    map[row.uid] = row.pid;
    return map;
  }, {
    [fcUIDLabel]: fcUID,
    [fcTypeLabel]: fcType
  })

  const cachePath = path.resolve('./src/constants')

  await writeFile(`${cachePath}/pids.js`, `export default ${JSON.stringify(uidToPid, false, 2)}`);

  console.log("Done!");
})();

// export default fetchAndCache;