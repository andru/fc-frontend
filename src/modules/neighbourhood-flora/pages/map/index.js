import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';

import LayoutWidth from 'components/layout-width';

import {Menu, Header, Placeholder, Card, Icon} from 'semantic-ui-react';


import { useMap, useMapEvent, MapContainer, TileLayer, LayersControl, LayerGroup, FeatureGroup, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

import L from "leaflet";

import OccurrenceLayer from './occurence-layer';


const Container = styled.div`
  width: 100vw;
  height: calc(100vh - 92px);
  display: flex;
`;

function NeighbourhoodBrowse (props) {

  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa
  } = props

  return (<Container>
      {isLoadingTaxa 
      ? <Loading {...props} />
      : <RenderTaxa {...props} />
      }
  </Container>)
}

function Loading (props) {
  return (<div>Loading...</div>);
}

const FacetedBrowser = styled.div`
  width: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-areas:
    "facets results";
  `;
const FacetList = styled(Menu)`
  grid-area: facets;
  overflow-y: scroll;
  /* list-style: none;
  padding: 0; */
  &.ui.vertical.menu{
    width: auto;
  }
`;
const Facet = styled(Menu.Item)``;
const FacetTitle = styled(Header)``;
const FacetDescription = styled.p``;

const Taxa = styled.div`
  grid-area: results;
`;

const TaxonImageBase = styled.div`
  width: 100%;
  height: 250px;
  background-size:cover;
  background-position: center;
`;
const TaxonImage = styled(TaxonImageBase)`
  background-image: url(${props => props.imageUrl});
`;

const NoTaxonImageContainer = styled(TaxonImageBase)`
  display:flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  i {
    opacity: 0.5;
  }
`;
const NoTaxonImage = () => (
  <NoTaxonImageContainer>
    <Icon name="file image outline" size="huge" color="grey" />
  </NoTaxonImageContainer>
)


const defaultZoom = 12;
const maxZoom = 14;
const minZoom = 10;

function RenderTaxa (props) {
  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa,
    isFetchingTaxaImages,
    taxaImages,
    onLocationChange
  } = props

  const [facet, setFacet] = useState('none');
  const [selectedTaxon, setSelectedTaxon] = useState(taxa.length ? taxa[0] : null)

  const [map, setMap] = useState(undefined);

  const [lat, lng] = location

  useEffect(() => {
    if (map) {
      map.setView([lat, lng])
    }
  }, [map, lat, lng])

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

  const facetFilters = {
    none: () => true,
    common: (taxon) => taxon.occurrences > 19,
    rare: (taxon) => taxon.occurrences < 20,
  }

  const filteredTaxa = taxa.sort((a,b) => a.occurrences < b.occurrences ? 1 : -1)

  function renderCard () {
    return (<Card key={selectedTaxon.entity}>
    {isFetchingTaxaImages
      ? <Placeholder>
          <Placeholder.Image square />
        </Placeholder>
      : taxaImages[selectedTaxon.name]
        ? <TaxonImage imageUrl={taxaImages[selectedTaxon.name]} />
        : <NoTaxonImage />
    }
    <Card.Content>
      <Card.Header>{selectedTaxon.name}</Card.Header>
      <Card.Description>
        Spotted {selectedTaxon.occurrences} times
      </Card.Description>
    </Card.Content>
  </Card>)
  }

  return (<FacetedBrowser>
    <FacetList vertical>
      {filteredTaxa.map(taxon => 
      <Facet onClick={() => setSelectedTaxon(taxon)} active={selectedTaxon.entity===taxon.entity}>
        <FacetTitle>{taxon.name}</FacetTitle>
        <p>Spotted {taxon.occurrences} times.</p>
      </Facet>
      )}
    </FacetList>
    <Taxa>
    <MapContainer center={location} zoom={defaultZoom} scrollWheelZoom={false} style={{height:'100%'}} maxZoom={maxZoom} minZoom={minZoom} whenCreated={setMap}>
        <LayersControl position="topright">

          <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

          

          <LayersControl.Overlay name="Raster Occurrence (better performance)">
            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              url={`https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=classic.poly&bin=hex&hexPerTile=30&taxonKey=${selectedTaxon?.gbifkey}`}
            />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Occurrence">
            <OccurrenceLayer gbifKey={selectedTaxon?.gbifkey} entityId={selectedTaxon?.entity} />
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
    </Taxa>
  </FacetedBrowser>)
}

export default NeighbourhoodBrowse;