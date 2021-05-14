import React from "react";
import styled from "styled-components";
import {Popup} from "semantic-ui-react";
import EntityLabel from "components/wikibase-entity-label";
import {getClaimProvenances} from "actions/floracommons/provenance";
import getProvenanceIndex from "./prov-index";

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
const Ref = styled.sup`
  padding: 0 4px;
  border-radius: 50%;
  background: #ccc;
  cursor: help;
`;

function ProvenanceLabel (props) {
  const {
    provId
  } = props;
  return (<Popup
    trigger={<Ref key={provId}>{getProvenanceIndex(provId)}</Ref>}
    content={<>Source: <EntityLabel id={provId} /></>}
    inverted
  />)
}

/**
 * Renders an inline list of claims, grouped and filterable by provenance
 * @param {*} props 
 */
export default function InlineProvenance (props) {
  const {
    claims,
    className,
    hideProvenances = [],
    showToken = true,
    children
  } = props;

  const RenderComp = typeof children === "function" ? children : InlineProvenanceClaim;

  return (<Container className={className}>{claims.filter(claim => {
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
        {!showToken || provenances.map(prov => <ProvenanceLabel provId={prov.id} />)}
      </ClaimContainer>
    case 'quantity':
    case 'string':
    default:
      return <ClaimContainer>
        <Label>{claim?.mainsnak?.datavalue?.value}</Label>
        {!showToken || provenances.map(prov => <ProvenanceLabel provId={prov.id} />)}
      </ClaimContainer>
  }
}