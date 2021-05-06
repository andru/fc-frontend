function toDegrees(radians)
{
  return radians * (180/Math.PI);
}
function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

export default async function getFloraInBounds (center, kmRadius=10) {
  // const wktBounds = [
  //   bounds.getSouthWest(),
  //   bounds.getSouthEast(),
  //   bounds.getNorthEast(),
  //   bounds.getNorthWest(),
  //   bounds.getSouthWest(),
  // ].reduce((wktArr, latLng) => wktArr.concat(`${latLng.lng} ${latLng.lat}`), []).join(',');

      // center of square
    const longitudeCenter = center[1];    // in degrees
    const latitudeCenter = center[0];     // in degrees

    const RADIUS_EARTH = 6371;      // in km

    const latitudeN  = latitudeCenter  + toDegrees(kmRadius / RADIUS_EARTH);
    const longitudeE = longitudeCenter + toDegrees(kmRadius / RADIUS_EARTH / Math.cos(toRadians(latitudeCenter)));

    const latitudeS  = latitudeCenter  - toDegrees(kmRadius / RADIUS_EARTH);
    const longitudeW = longitudeCenter - toDegrees(kmRadius / RADIUS_EARTH / Math.cos(toRadians(latitudeCenter)));

    const wktBounds = [
        [longitudeW, latitudeS],
        [longitudeE, latitudeS],
        [longitudeE, latitudeN],
        [longitudeW, latitudeN],
        [longitudeW, latitudeS]
      ].reduce((wktArr, latLng) => wktArr.concat(latLng.join(' ')), []).join(',');

      console.log(wktBounds)

  return await fetch(`https://api.gbif.org/v1/occurrence/search?geometry=POLYGON((${wktBounds}))&kingdomKey=6&limit=0&facet=taxonKey&taxonKey.facetLimit=9999`)
  .then(res => res.json())
  .then(res => {
    console.log('Facets', res)
    if (res && res.count && res.facets?.[0]?.counts?.length) {
      // group by acceptedTaxonKey
      return res.facets[0].counts.map(row => ({key: row.name, count: row.count}));
    }
    return [];
  })
}