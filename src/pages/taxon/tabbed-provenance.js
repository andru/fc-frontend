import React, {useState} from "react";
import styled from "styled-components";
import { Tab, Menu } from 'semantic-ui-react'

import EntityLabel from "components/wikibase-entity-label";
import {getClaimProvenances} from "actions/floracommons/provenance";

const Container = styled.div`

`;
const TabContent = styled.div``;
const TabBar = styled.nav`

`;
const TabButton = styled.button`

`;

const ClaimGroup = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
const ClaimContainer = styled.li`
  display: inline;
  margin: 0;
  padding: 0;
  list-style: none;

  &:after{
      content: ", ";
    }
  &:after:last-child{
    content: ".";
  }

`;
const Label = styled.span``;
const Ref = styled.span`
  padding: 0 4px;
  border-radius: 50%;
  background: #ccc;
`;

export function groupClaimsByProvenance (claims) {
  return claims.reduce((groups, claim) => {
    const provenances = getClaimProvenances(claim);
    provenances.forEach(prov => {
      if (!groups[prov.id]) {
        groups[prov.id] = []
      }
      groups[prov.id].push(claim);
    })
    return groups;
  }, {})
}

/**
 * Renders an inline list of claims, grouped and filterable by provenance
 * @param {*} props 
 */
export default function TabbedProvenance (props) {
  const {
    claims, // one of claims OR...
    provenances, // .... allProvenances are required
    initialActiveProvenance,
    showCombined = false,
    hideProvenances,
    paneComponent,
    children
  } = props;

  const RenderComp = typeof children === "function" ? children : TabbedProvenanceRenderer;
  let groupedClaims;
  let allProvenances;
  if (claims) {
    groupedClaims = groupClaimsByProvenance(claims);
    // const allProvsHidden = provs.reduce((hide, prov) => hide && hideProvenances.indexOf(prov.id) > -1, true);
    allProvenances = Object.keys(groupedClaims).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}))
  } else if (props.provenances) { 
    allProvenances = provenances
  } else {
    throw new Error("One of claims or allProvenances is required")
  }
  const [activeProvenance, setActiveProvenance] = useState(
    allProvenances.indexOf(initialActiveProvenance) > -1 ? initialActiveProvenance : undefined
  );

  return (<Container>
    <RenderComp 
      {...{groupedClaims, activeProvenance, provenances, paneComponent, showCombined, hideProvenances}}
    />
  </Container>)
}

export function TabbedProvenanceRenderer (props) {
  const {
    groupedClaims,
    activeProvenance,
    provenances,
    showCombined,
    hideProvenances,
    paneComponent
  } = props;

  const PaneComponent = typeof paneComponent === "function" ? paneComponent : TabPane;

  let panes;
  if (groupedClaims) {
    panes = Object.entries(groupedClaims).map(([prov, provClaims]) => ({
      menuItem: (
        <Menu.Item key={prov}>
          <EntityLabel id={prov} />
        </Menu.Item>
      ),
      render: () => <PaneComponent provenance={prov} claims={provClaims} {...{provenances, showCombined, hideProvenances}} />
    }));
  } else {
    panes = provenances.map((prov) => ({
      menuItem: (
        <Menu.Item key={prov}>
          <EntityLabel id={prov} />
        </Menu.Item>
      ),
      render: () => <PaneComponent provenance={prov} {...{provenances, showCombined, hideProvenances}} />
    }));
  }

  return (<Tab
      menu={{ attached: 'bottom' }} 
      defaultActiveIndex={activeProvenance ? provenances.indexOf(activeProvenance) : 0} 
      panes={panes} 
    />)
}

export function TabPane (props) {
  const {claims} = props;
  return (<Tab.Pane attached='top'>
    <ClaimGroup>
    {claims.map(claim => <ProvenanceClaim claim={claim} />)}
    </ClaimGroup>
  </Tab.Pane>)
}

export function ProvenanceClaim (props) {
  const {claim} = props;
  switch(claim?.mainsnak?.datatype) {
    case 'wikibase-item':
      return <ClaimContainer>
        <Label><EntityLabel id={claim?.mainsnak?.datavalue?.value?.id} /></Label>
      </ClaimContainer>
    case 'quantity':
    case 'string':
    default:
      return <ClaimContainer>
        <Label>{claim?.mainsnak?.datavalue?.value}</Label>
      </ClaimContainer>
  }
}