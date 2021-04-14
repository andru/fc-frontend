import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import LayoutWidth from "components/layout-width";
import { fcEndpoint } from "constants/endpoints";

import { useMap, useMapEvent, MapContainer, TileLayer, LayersControl, LayerGroup, FeatureGroup, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import L from "leaflet";

import {VectorTile} from 'components/react-leaflet-vectorgrid';

import OccurrenceLayers from './map-test/occurence-layers';

// function VectorTileLayer ({ url }) {
//   const map = useMap();

//   useEffect(() => {
//     const layer = L.vectorGrid.protobuf(url, {
//       vectorTileLayerStyles: {
//         occurrence: {
//           weight: 0,
//           fillColor: '#ff0000',
//           fillOpacity: 0.5,
//           fill: true
//         }
//       },
//       maxNativeZoom: 14
//   })
//   layer.addTo(map);
//   layer.bringToFront();
  
//   }, [url, map]);

//   return null;
// }

const defaultCoords = [45.3950098, -75.7168519];
const defaultZoom = 16;
const maxZoom = 16;
const minZoom = 12;

// function GetLocation (props) {
//   const map = useMap();

//   const defaultCoords = props.defaultCoords || [0,0]

//   useEffect(() => {
    
//     var popup = L.popup();

//     function geolocationErrorOccurred(geolocationSupported, popup, latLng) {
//         popup.setLatLng(latLng);
//         popup.setContent(geolocationSupported ?
//                 '<b>Error:</b> The Geolocation service failed.' :
//                 '<b>Error:</b> This browser doesn\'t support geolocation.');
//         popup.openOn(map);
//     }

//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//             var latLng = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude
//             };

//             popup.setLatLng(latLng);
//             popup.setContent('This is your current location');
//             popup.openOn(map);

//             map.setView(latLng);
//         }, function() {
//             geolocationErrorOccurred(true, popup, map.getCenter());
//         });
//     } else {
//         //No browser support geolocation service
//         geolocationErrorOccurred(false, popup, map.getCenter());
//     }
//   }, [map])
//   return null;
// }

const Container = styled(FillBox)`
  padding: 0px;
`;
 
const Intro = styled.h3`
  font-size: 1.4em;
`;

const Warning = styled.p`
  font-size: 1.2em;
  color: #9a635a;
`;


function Home({actions}) {

  const [initialLocation, setInitialLocation] = useState(false);
  const [hasLocationError, setHasLocationError] = useState(false);

  function getLocation () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setInitialLocation([position.coords.latitude, position.coords.longitude]);
      }, function() {
        setHasLocationError(1)
        setInitialLocation(defaultCoords);
      });
    } else {
      //No browser support geolocation service
      setHasLocationError(-1);
      setInitialLocation(defaultCoords);
    }
  }

  return (
    <Container>
      {hasLocationError && `Failed to determine your location` }
      {initialLocation ? 
      <MapContainer center={initialLocation} zoom={defaultZoom} scrollWheelZoom={false} style={{height:900}} maxZoom={maxZoom} minZoom={minZoom}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="USGS.USImagery">
            <TileLayer
              url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="ArcGIS.NatGeo">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap.BlackAndWhite">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Stamen.Terrain">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay name="Occurrence">
            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              url="https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=classic.poly&bin=hex&hexPerTile=30"
            />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Vector Occurrence">
            <OccurrenceLayers />
          </LayersControl.Overlay>

          <LayersControl.Overlay name="Roads and Borders">
            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-lines/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.Overlay>
          
          <LayersControl.Overlay name="Place Names">
          <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.Overlay>

          {/* <LayersControl.Overlay name="Marker with popup">
            <Marker position={[100, 100]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </LayersControl.Overlay> */}

        </LayersControl>
      </MapContainer>
      : <button onClick={getLocation}>Get Location</button>}
    </Container>
  );
}

export default Home;
