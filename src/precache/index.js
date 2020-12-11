import dotenv from "dotenv";
import fetch from "node-fetch";
import structureCharacter from './structure-character-list.js';
import taxa from './taxa.js'

dotenv.config();
global.fetch = fetch;

(async function () {
  await structureCharacter();
  await taxa();
})();