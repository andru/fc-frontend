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
  const { getCommonDistributionValues } = makeWikibaseApiActions(wbApi);
  


  console.log(`Caching distribution values with > 100 occurences`)
  const dist = await getCommonDistributionValues();
 
  const cachePath = path.resolve('./public')

  const cache = {
    distribution: dist
  }

  await writeFile(`${cachePath}/taxa.json`, JSON.stringify(cache));

  console.log("Done!");
}