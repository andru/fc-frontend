import react, {useState, useEffect, useCallback} from 'react';
import {useMap, useMapEvent, createLayerComponent, LayerGroup, Circle, CircleMarker, Popup} from 'react-leaflet';

// function createOccurrence (props, context) {
//   const instance = new L.Rectangle(getBounds(props))
//   return { instance, context: { ...context, overlayContainer: instance } }
// }
// function updateOccurrence (instance, props, prevProps) {
//   if (props.center !== prevProps.center || props.size !== prevProps.size) {
//     instance.setBounds(getBounds(props))
//   }
// }

// const Square = createPathComponent(createOccurrence, updateOccurrence)

export default function OccurrenceLayers(props) {
  const map = useMap();
  const [occurences, setOccurences] = useState([])
  const [zoom, setZoom] = useState(map.getZoom());

  async function getOccurenceInBounds (bounds) {
    const wktBounds = [
      bounds.getSouthWest(),
      bounds.getSouthEast(),
      bounds.getNorthEast(),
      bounds.getNorthWest(),
      bounds.getSouthWest(),
    ].reduce((wktArr, latLng) => wktArr.concat(`${latLng.lng} ${latLng.lat}`), []).join(',');
    
    await fetch(`https://api.gbif.org/v1/occurrence/search?geometry=POLYGON((${wktBounds}))&kingdomKey=6&limit=300`)
    .then(res => res.json())
    .then(res => {
      console.log(res)
      if (res && res.count && res.results?.length) {
        // group by acceptedTaxonKey
        setOccurences(res.results);

        // force update of all children somehow...


        return res.results;
        // return res.results.reduce((groups, r) => {
        //   const o = {
        //     scientificName: r.scientificName,
        //     acceptedTaxonKey: r.acceptedTaxonKey,
        //   };
        //   groups.has(r.scientificName) ? groups.get(r.scientificName).push(o) : groups.set(r.scientificName, [o]);
        //   return groups;
        // }, new Map ())
      }
    }).then(groups => console.log(groups))
  }
   
  useEffect(() => {
    const bounds = map.getBounds(); 
    getOccurenceInBounds(bounds);
  }, []);

  const onChange = useCallback(() => {
    const bounds = map.getBounds(); 
    getOccurenceInBounds(bounds);

  }, [map])
  useMapEvent('moveend', onChange)


  // switch between raster and vector based on zoom level
  let url = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857`//&country=CA`

  const onZoom = useCallback(() => {
    console.log(map.getZoom());
    setZoom(map.getZoom());
  }, [map])

  useMapEvent('zoom', onZoom)
  console.log('Drawing occurrence layer')
  // if (zoom < 12) {
  //   return <VectorTile url={`${url}&bin=hex&hexPerTile=${Math.floor(400/zoom)}`} />
  // } else {
  //   return <VectorTile url={url} />
  // }

  return (<LayerGroup>
    {occurences.map(o => (<CircleMarker key={o.key} center={[o.decimalLatitude, o.decimalLongitude]} eventHandlers={{click: (e)=>{console.log('click', o)}}} >
      <Popup>
        {o.scientificName}
      </Popup>
    </CircleMarker>))}
  </LayerGroup>);
}