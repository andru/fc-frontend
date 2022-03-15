import { getPID, getUID } from 'actions/floracommons/pid-uid';
import React from 'react';
import styled from 'styled-components';
import { Tab, Menu } from 'semantic-ui-react'
import fetchEntityLabel from "actions/wikibase/fetch-entity-label"

import {getClaimProvenances} from "actions/floracommons/provenance";
import EntityLabel from 'components/wikibase-entity-label';
import Tabbed from './tabbed-provenance';

const Container = styled.div`

`;

const PaneContainer = styled.div``

const StructureGroup = styled.div`
  margin-bottom: 2em;
`;
const StructureHeader = styled.h4`
  text-transform: uppercase;
`;
const StructureClaims = styled.div`

`;
const CharacterGroup = styled.dl``;
const CharacterName = styled.dt`
  display: inline-block;
  width: 30%;
`;
const CharacterValue = styled.dd`
  display: inline-block;
  padding: 0 5px;
  margin: 0 5px 0 0;
  background: #efefef;
  border-radius: 5px;
  /* &:after {
    content: ", "
  }
  &:last-child:after {
    content: "."
  } */
`;
const Ref = styled.span`
  padding: 0 4px;
  border-radius: 50%;
  background: #ccc;
`;


export default function MorphData (props) {
  const {
    claims 
  } = props;

  return (<Tabbed claims={claims} hideProvenances={[]} paneComponent={MorphDataPane} />);
}

function MorphDataPane (props) {
  const {
    claims
  } = props;
  const structureGroups = claims.reduce((groups, claim) => {
    const structure = claim.qualifiers[getPID('taxon/morphology statement structure')]?.[0]?.datavalue?.value?.id;
    const character = claim.qualifiers[getPID('taxon/morphology statement character')]?.[0]?.datavalue?.value?.id;
    if (!groups[structure]) {
      groups[structure] = {}
    }
    if (!groups[structure][character]) {
      groups[structure][character] = []
    }
    groups[structure][character].push(claim)
    return groups;
  }, {});
  
  return (<Tab.Pane attached='top'>{Object.entries(structureGroups).sort((a, b) => a[0] > b[0] ? -1 : b[0] > a[0] ? 1 : 0).map(([structure, structureClaims]) => (
    <StructureGroup key={structure}>
      <StructureHeader><EntityLabel id={structure} /></StructureHeader>
      <StructureClaims>
        {Object.entries(structureClaims).map(([character, claims]) => <CharacterGroups character={character} claims={claims} key={character} showProvenance={false} />)}
      </StructureClaims>
    </StructureGroup>))}
  </Tab.Pane>)
}

function CharacterGroups (props) {
  const {character, claims, showProvenance} = props;
  return (
    <CharacterGroup>
      <CharacterName><EntityLabel id={character} /></CharacterName>
      <>{claims.map(claim => <CharacterState claim={claim} key={claim.id} showProvenance={showProvenance} />)}</>
    </CharacterGroup>)
}

function CharacterState (props) {
  const {claim, showProvenance} = props;
  const type = claim.mainsnak?.datavalue?.value?.id;
  const sourceStatementId = claim.references?.[0]?.snaks?.[getPID('taxon/statement source text')]?.[0]?.datavalue?.value;
  const provenances = getClaimProvenances(claim);

  return (<CharacterValue aria-label={sourceStatementId || ''}>
    {renderValueTypes(claim)}
    {!showProvenance ||  provenances.map(prov => <Ref key={prov.id}>{prov.id}</Ref>)}
  </CharacterValue>)
}

function renderValueTypes (claim) {
  const type = claim.mainsnak?.datavalue?.value?.id;
  const typeUid = getUID(type);
  if (typeUid === 'taxon/simple value') {
    return <span>{claim.qualifiers[getPID('taxon/morphology statement value')]?.[0]?.datavalue?.value}</span>
  }
  if (typeUid === 'taxon/range value') {
    const from = claim.qualifiers[getPID('taxon/morphology statement value from')]?.[0]?.datavalue?.value;
    const to = claim.qualifiers[getPID('taxon/morphology statement value from')]?.[0]?.datavalue?.value;
    if (from !== undefined && to !== undefined) {
      return <span>from <span>{from}</span> to <span>{to}</span></span>
    } 
    if (from === undefined && to !== undefined) {
      return <span>up to <span>{to}</span></span>
    }
    if (from !== undefined && to === undefined) {
      return <span>from <span>{from}</span></span>

    }
    return <span>Unspecified range value</span>
  }
}

function MorphClaim (props) {
  const {claim} = props;
  const characterId = claim.qualifiers[getPID('taxon/morphology statement character')]?.[0]?.datavalue?.value?.id;
  const value = claim.qualifiers[getPID('taxon/morphology statement value')]?.[0]?.datavalue?.value;
  return (<><dt>
      <span>{characterId ? <EntityLabel id={characterId} /> : 'Unknown character'}</span>
    </dt><dd>
    <span>{value!==undefined ? value : 'Unknown value'}</span></dd>
  </>)
}

function MorphClaims (props) {

} 
