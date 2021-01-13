import {wbApi} from "../_init";

const maxQueueLength = 48;
// cache is an array of label *promises*
const cache = new Map();
let currentQueue = null;

export default async function (id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  return addToQueue(id);
}

function addToQueue (id) {
  currentQueue = currentQueue || startQueue();
  const [qp, add] = currentQueue;
  cache.set(id, add(id));
  return cache.get(id);
}

function startQueue () {
  const queue = [];
  let timeout;
  let addToQueue;
  const queuePromise = new Promise((resolve, reject) => {

    timeout = setTimeout(() => {
      flushQueue(queue).then((idResults) => {
        resolve(idResults);
      }).catch(e => reject(e));
    }, 100);

    addToQueue = function addToQueue (id) {
      if (queue.length > maxQueueLength) {
        clearTimeout(timeout);
        flushQueue(queue).then((idResults) => {
          resolve(idResults);
        }).catch(e => reject(e));
      }
      queue.push(id);
      return new Promise((resolve, reject) => {
        queuePromise.then(ids => {
          if (ids[id]) {
            resolve(ids[id])
          } else {
            reject(`Entity id ${id} not found in API response`)
          }
        }).catch(e => reject(e))
      });
    }
  })

  async function flushQueue (queue) {
    const ids = [...queue];
    currentQueue = null;
    return fetchLabels(ids);
  }

  return [queuePromise, addToQueue, queue, timeout]
}


async function fetchLabels (ids, languages=['en']) {

  const url = wbApi.getEntities({
    ids,
    languages: languages,
    props: [ 'labels' ]
  })

  // fetch API result
  return await fetch(url).then(async response => {
    const r = await response.json();
    // enrich the provided claims with labels returned from the API
    const labels = {}
    if (r?.entities) {
      if (!Object.keys(r.entities).length) {
        throw new Error(`No entities in wikibase API response`);
      }
      // iterate through API results 
      for (const entityId in r.entities) {
        const label = r.entities[entityId]?.labels?.en?.value;
        //cache.set(entityId, label);
        if (label) {
          labels[entityId] = label;
        }
      }
      return labels;
    } else {
      throw new Error(r)
    }

  }).catch(err => {
    console.error(err);
    throw new Error(err);
  });
}