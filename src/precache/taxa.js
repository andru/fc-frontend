import util from "util";
import fs from "fs";
import path from "path";


import { getCommonDistributionValues } from "../actions/floracommons/get-taxon.js"

const writeFile = util.promisify(fs.writeFile);

export default async function fetchAndCache () {

  console.log(`Caching distribution values with > 100 occurences`)
  const dist = await getCommonDistributionValues();
 
  const cachePath = path.resolve('./public')

  const cache = {
    distribution: dist
  }

  await writeFile(`${cachePath}/taxa.json`, JSON.stringify(cache));

  console.log("Done!");
}