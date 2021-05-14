import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';

import LayoutWidth from 'components/layout-width';

import {Menu, Header, Placeholder, Card, Icon} from 'semantic-ui-react';


import { useMap, useMapEvent, MapContainer, TileLayer, LayersControl, LayerGroup, FeatureGroup, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import L from "leaflet";


const Container = styled.div`
  width: 100vw;
  height: calc(100vh - 92px);
  display: flex;
`;

const defaultZoom = 4;
const maxZoom = 14;
const minZoom = 4;

function GbifDistributionMap (props) {

  const {
    gbifTaxonKey,
    taxonName
  } = props

  const [map, setMap] = useState(undefined);
  const [lat, lng] = [59, -103]

  useEffect(() => {
    if (map) {
      map.setView([lat, lng])
    }
  }, [map, lat, lng])
  console.log(gbifTaxonKey)
  console.log('gbif url', `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=classic.poly&bin=hex&hexPerTile=30&${gbifTaxonKey ? `taxonKey=${gbifTaxonKey}` : `name=${taxonName}`}`)

  return (
    <MapContainer center={[lat, lng]} zoom={defaultZoom} scrollWheelZoom={false} style={{height:'100%'}} maxZoom={maxZoom} minZoom={minZoom} whenCreated={setMap}>

            {/* <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            /> */}

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=classic.poly&bin=hex&hexPerTile=30&${gbifTaxonKey ? `taxonKey=${gbifTaxonKey}` : `name=${taxonName}`}`}
            />
      </MapContainer>)
}

export default GbifDistributionMap;