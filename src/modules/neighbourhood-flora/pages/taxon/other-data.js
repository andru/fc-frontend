import { getPID, getUID } from 'actions/floracommons/pid-uid';
import React from 'react';
import styled from 'styled-components';
import { Tab, Menu } from 'semantic-ui-react'

import {getClaimProvenances} from "actions/floracommons/provenance";
import EntityLabel from 'components/wikibase-entity-label';
import Tabbed from './tabbed-provenance';

const Container = styled.div`

`;

const PaneContainer = styled.div``


const Ref = styled.span`
  padding: 0 4px;
  border-radius: 50%;
  background: #ccc;
`;


export default function MorphData (props) {
  const {
    claims 
  } = props;

  return (<Tabbed claims={[]} hideProvenances={[]} />);
}

function MorphDataPane (props) {
  const {
    allClaims
  } = props;

  
  return (<Tab.Pane attached='top'>
  </Tab.Pane>)
}
