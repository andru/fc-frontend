import React from "react";
import styled from "styled-components";
import EntityLabel from "components/wikibase-entity-label";
import {getClaimProvenances} from "actions/floracommons/provenance";

const Container = styled.ul`
  display: inline;
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
  &:last-child:after{
    content: ".";
  }

`;
const Label = styled.span``;
const Ref = styled.span`
  padding: 0 4px;
  border-radius: 50%;
  background: #ccc;
`;

/**
 * Renders an inline list of claims, grouped and filterable by provenance
 * @param {*} props 
 */
export default function InlineProvenance (props) {
  const {
    claims,
    hideProvenances = [],
    showToken = true,
    children
  } = props;

  const RenderComp = typeof children === "function" ? children : InlineProvenanceClaim;

  return (<Container>{claims.filter(claim => {
    const provs = getClaimProvenances(claim);
    //  hide claim if all provenances are hidden
    const allProvsHidden = provs.reduce((hide, prov) => hide && hideProvenances.indexOf(prov.id) > -1, true);
    return !allProvsHidden;
  }).map(claim => <RenderComp claim={claim} key={claim.id} hideProvenances={hideProvenances} showToken={showToken} />)}</Container>)
}

export function InlineProvenanceClaim (props) {
  const {claim, hideProvenances, showToken} = props;
  const provenances = getClaimProvenances(claim).filter(prov => hideProvenances.indexOf(prov.id) < 0);
  switch(claim?.mainsnak?.datatype) {
    case 'wikibase-item':
      return <ClaimContainer>
        <Label><EntityLabel id={claim?.mainsnak?.datavalue?.value?.id} /></Label>
        {!showToken || provenances.map(prov => <Ref key={prov.id}>{prov.id}</Ref>)}
      </ClaimContainer>
    case 'quantity':
    case 'string':
    default:
      return <ClaimContainer>
        <Label>{claim?.mainsnak?.datavalue?.value}</Label>
        {!showToken || provenances.map(prov => <Ref key={prov.id}>{prov.id}</Ref>)}
      </ClaimContainer>
  }
}