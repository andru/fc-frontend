import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import LayoutWidth from 'components/layout-width'


const Container = styled.div`

`;


function NeighbourhoodMedia (props) {

  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa
  } = props



  return (<Container>
    <LayoutWidth>
      <div>Not implemented yet.</div>
    </LayoutWidth>

  </Container>)
}

export default NeighbourhoodMedia;