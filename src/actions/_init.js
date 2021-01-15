import wikibaseSDK from "wikibase-sdk";
import { fcEndpoint, wikidataEndpoint } from "../constants/endpoints.js";

// configure a wikibase api instance
export const wbApi = wikibaseSDK(fcEndpoint);
export const wdApi = wikibaseSDK(wikidataEndpoint);
