import React, {useState, useEffect, useCallback} from 'react';
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

function StaticCircle (props) {
  const map = useMap();
  const size = map.getSize();
  const center = map.getCenter()
  const bounds = map.getPixelBounds();
  const diameter = map.distance(map.containerPointToLatLng(bounds.getTopLeft()), map.containerPointToLatLng(bounds.getBottomLeft()))/1000;
  return (<svg pointerevents="none" height="100%" width="100%" style={{zIndex:500, position:"relative"}}>
    <mask id="hole">
      <rect width="100%" height="100%" fill="white"/>
      <circle cx="50%" cy="50%" r={(size.y-50)/2} fill="black" />
    </mask>
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.3)" mask="url(#hole)" />

      
    {/* <circle cx="50%" cy="50%" r={(size.y-50)/2} strokeWidth="2" stroke="red" fill="rgba(255,0,255,0.3)" /> */}
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" style={{textAlign: "center", fontWeight:"bold", fontSize:"3em"}}>{Math.floor(diameter)} km</text>
  </svg>)
}

function NeighbourhoodHome (props) {

  const {
    onLocationChange,
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

  const moveEndHandler = useCallback( () => {
    const center = map.getCenter()
    const bounds = map.getPixelBounds();
    const radius = map.distance(map.containerPointToLatLng(bounds.getTopLeft()), map.containerPointToLatLng(bounds.getBottomLeft()))/2;
    onLocationChange([center.lat, center.lng], radius);
  }, [map, onLocationChange])


  useEffect(() => {
    if (map) {
      map.on('moveend', moveEndHandler)
    }
    return (() => map && map.off('moveend', moveEndHandler))
  }, [map, moveEndHandler])

  const totalOccurrences = taxa ? taxa.reduce((sum, taxon) => sum + taxon?.occurrences ?? 0, 0) : 0;

  return (<Container>
    <MapContainer center={location ? location : defaultCoords} zoom={defaultZoom} scrollWheelZoom={false} style={{height:900, width:'100vw'}} maxZoom={maxZoom} minZoom={minZoom} whenCreated={setMap}>

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* <Circle center={location ? location : defaultCoords} radius={10000} /> */}

            <StaticCircle />

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