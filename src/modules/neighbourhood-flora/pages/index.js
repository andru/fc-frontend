import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
  NavLink,
  useRouteMatch
} from "react-router-dom";
import styled from 'styled-components';

import { Segment, Dimmer, Loader, Image, Menu, Modal, Input, Icon } from "semantic-ui-react";

import getFloraInBounds from 'actions/gbif/get-flora-in-bounds'
import {getTaxaByGBIFKeys} from 'actions/floracommons/get-taxon'

import LayoutWidth from 'components/layout-width';

import Home from './home';
import Browse from './browse';
import Map from './map';
import Identify from './identify';
// import Media from './media';
import Search from './faceted-search';
import Taxon from './taxon';


const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModuleNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-self: center;
  flex: 1;
  margin-bottom: 5px;
`;

const ModuleBaseNavItem = styled(NavLink)`
  margin-bottom: -2px;
  padding: 10px 20px;

  font-size: 16px;
  color: #555;

  &:hover {
    color: #333;
  }
`;

const ModuleNavItem = styled(({ className, ...props }) => (
  <ModuleBaseNavItem {...props} activeClassName={className} />
))`
  border-bottom: 2px solid #111;
  color: #111;
  font-weight: bold;
`;


const defaultCoords = [45.3950098, -75.7168519];

export default function NeighbourhoodFlora(props) {
  const {actions} = props;
  let { path, url } = useRouteMatch();

  

  const [location, setLocation] = useState(false);
  const [radius, setRadius] = useState(10000);

  const [locationPermissionStatus, setLocationPermissionStatus] = useState(undefined)
  const [hasLocationError, setHasLocationError] = useState(0);
  const [isLoadingTaxa, setTaxaLoading] = useState(true)
  const [hasError, setError] = useState(false);
  const [isFetchingTaxaImages, setFetchingTaxaImages] = useState(true);
  const [taxaImages, setTaxaImages] = useState({});

  // const [gbifTaxa, setGbifTaxa] = useState([]);
  const [taxa, setTaxa] = useState([]);

  const [lat, lng] = location ? location : [0,0];

  const {
    getWikiDataImagesForTaxa
  } = actions;

  function getLocation () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        setLocation([position.coords.latitude, position.coords.longitude]);
      }, function() {
        setHasLocationError(1)
        setLocation(defaultCoords)
      });
    } else {
      //No browser support geolocation service
      setHasLocationError(-1);
      setLocation(defaultCoords)

    }
  }

  async function hasLocation () {
    const permissionStatus = await navigator?.permissions?.query({name: 'geolocation'})
    const p = permissionStatus?.state ?? false
    setLocationPermissionStatus(p);
    return p;
  }

  useEffect(() => {
    // get location at load if it's already been granted
    // hasLocation().then(hasIt => hasIt === 'granted' && getLocation())
    getLocation();
  }, [hasLocationError, locationPermissionStatus])


  useEffect(() => {
    if (location) {
      getFloraInBounds(location, radius/1000).then(async gbifRows => {
        // console.log(gbifRows)
        // console.log('Getting FC taxa for GBIF keys')
        const taxa = await getTaxaByGBIFKeys(gbifRows.map(row => row.key));
        if (taxa.length) {
          setFetchingTaxaImages(true);
          const taxaImages = await getWikiDataImagesForTaxa(taxa.map(taxon => taxon.name));
          setTaxaImages(taxaImages);
          setFetchingTaxaImages(false);
        }
        const taxaWithOccurrence = taxa
          // only genus and lower
          .filter(t => ['genus', 'subgenus', 'species', 'subspecies', 'variety', 'form'].indexOf(t.rank) > -1)
          // add occurrence coult
          .map(t => (t.occurrences = gbifRows.find(r => r.key === t.gbifkey)?.count) && t)
        return taxaWithOccurrence;
      }).then(fcTaxa => {
        console.log(fcTaxa);
        setTaxa(fcTaxa);
        setTaxaLoading(false);
      }).catch((e) => {
        setError(e)
      })
    }
  }, [lat, lng, radius])

  const handleLocationChange = (coords, radius) => {
    setLocation(coords);
    setRadius(radius);
  }

  return (<Container>
            <LayoutWidth>
            <ModuleNav direction="row">
              <ModuleNavItem to={`${path}`} exact>
                <Icon name="home" />
              </ModuleNavItem>
              <ModuleNavItem to={`${path}/map`} >
                <Icon name="map" />Map
              </ModuleNavItem>
              <ModuleNavItem to={`${path}/browse`} >
                <Icon name="tree" />Browse
              </ModuleNavItem>
              <ModuleNavItem to={`${path}/identify`} >
                <Icon name="eye" />Identify
              </ModuleNavItem>
              <ModuleNavItem to={`${path}/search`} >
                <Icon name="search" />Properties
              </ModuleNavItem>
              {/* <ModuleNavItem to={`${path}/media`} >
                <Icon name="map" />Photos
              </ModuleNavItem> */}
            </ModuleNav>
          </LayoutWidth>
  {hasError 
  ? <div>Error encountered. This MVP doesn't have great error handling yet, sorry! Please check console for details and refresh the page to try again.

    <div>{hasError}</div>
  </div>
  : <Switch>
    <Route exact path={`${path}`}>
      <Home actions={actions} onLocationChange={handleLocationChange} {...{location, getLocation, locationPermissionStatus, hasLocationError, taxa, isLoadingTaxa}} />
    </Route>
    <Route path={`${path}/browse`}>
      <Browse actions={actions} {...{location, getLocation, locationPermissionStatus, hasLocationError, taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route>
    <Route path={`${path}/map`}>
      <Map actions={actions} onLocationChange={handleLocationChange} {...{location, getLocation, locationPermissionStatus, hasLocationError, taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route>
    <Route path={`${path}/search`}>
      <Search actions={actions} {...{location, getLocation, locationPermissionStatus, hasLocationError, allLocalTaxa: taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route>
    <Route path={`${path}/identify`}>
      <Identify actions={actions} {...{location, getLocation, locationPermissionStatus, hasLocationError, allLocalTaxa: taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route>
    <Route path={`${path}/taxon/:id`}>
      <Taxon actions={actions} {...{location, getLocation, locationPermissionStatus, hasLocationError, allLocalTaxa: taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route>
    {/* <Route path={`${path}/media`}>
      <Media actions={actions} {...{location, getLocation, locationPermissionStatus, hasLocationError, taxa, isLoadingTaxa, isFetchingTaxaImages, taxaImages}} />
    </Route> */}
  </Switch>}
  </Container>)
}