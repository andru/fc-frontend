import {wbApi, wdApi} from "./_init";
import makeWikibaseApiActions from "./wikibase-api";
import makeWikiDataApiActions from "./wikidata-api";

// get an object of actions which all components can use to query for results for wikibase
export default {
  wbApi,
  ...makeWikibaseApiActions(wbApi),
  wdApi,
  ...makeWikiDataApiActions(wdApi)
}
