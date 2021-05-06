import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import LayoutWidth from 'components/layout-width'


import { useMap, useMapEvent, MapContainer, TileLayer, LayersControl, LayerGroup, FeatureGroup, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import L from "leaflet";

import {VectorTile} from 'components/react-leaflet-vectorgrid';

const Container = styled.div`

`;

const TaxonCount = styled(LayoutWidth)`
  text-align: center;
  padding-top: 20px;
`;

const defaultCoords = [45.3950098, -75.7168519];
const defaultZoom = 12;
const maxZoom = 14;
const minZoom = 10;

function NeighbourhoodHome (props) {

  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa
  } = props

  const [map, setMap] = useState(undefined);

  useEffect(() => {
    if (map && location) {
      map.setView(location)
    }
  }, [map, location])

  const totalOccurrences = taxa ? taxa.reduce((sum, taxon) => sum + taxon?.occurrences ?? 0, 0) : 0;

  return (<Container>
    <MapContainer center={location ? location : defaultCoords} zoom={defaultZoom} scrollWheelZoom={false} style={{height:900, width:'100vw'}} maxZoom={maxZoom} minZoom={minZoom} whenCreated={setMap}>

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />

            <Circle center={location ? location : defaultCoords} radius={10000} />

      </MapContainer>

      <TaxonCount>{isLoadingTaxa ? <>Loading...</> :  <h2>There {totalOccurrences} recorded sightings of {taxa.length} plants in this neighbourhood.</h2>}</TaxonCount>

      <LayoutWidth>
      {locationPermissionStatus === 'prompt'
        && <div><button onClick={()=>getLocation()}>Find My Neighbourhood</button></div>
      }
      {locationPermissionStatus === 'granted' && !location && <div>Finding your location...</div>}
      {/* {location && <div>{location[0]}, {location[1]}</div>} */}
      {hasLocationError !== 0 && <div>Location Error: GeoLocation API unavailable over insecure connection</div>}
    </LayoutWidth>


  </Container>)
}

export default NeighbourhoodHome;