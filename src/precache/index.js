import dotenv from "dotenv";
import fetch from "node-fetch";
import structureCharacter from './structure-character-list.js';
import taxa from './taxa.js'
import path from 'path'

dotenv.config({path: path.resolve(process.cwd(), '.env')});
global.fetch = fetch;

(async function () {
  await structureCharacter();
  await taxa();
})();