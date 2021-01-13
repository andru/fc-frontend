import React from 'react';
import styled from 'styled-components';
import { Tab } from 'semantic-ui-react'

import { getPID, getUID } from "actions/floracommons/pid-uid";
import {getClaimProvenances} from "actions/floracommons/provenance";
import TabbedProvenance from "./tabbed-provenance";

const BoldFirstWord = ({children, ...props}) => {
  const spaceIndex = children.indexOf(' ');
  const firstWord = children.substr(0, spaceIndex);
  const rest = children.substr(spaceIndex);
  const upperCaseFirstCharacter = /^[A-Z0-9]{1}/;
  if (upperCaseFirstCharacter.test(firstWord)) {
    return <span {...props}><b>{firstWord}</b> {rest} </span>
  } else {
    return <span {...props}>{firstWord} {rest} </span>
  }
}

const TaxonDescriptionFragment = styled(BoldFirstWord)`

`;

export default function TaxonDescription (props) {
  const {
    claims,
    hideProvenances
  } = props;
  return (
  <TabbedProvenance
    claims={claims}
    hideProvenances={hideProvenances}
    paneComponent={DescriptionPane} 
    />
  )
}

function DescriptionPane (props) {
  const {provenance, claims} = props;

  const statementIdRegexp = /^d0_s([0-9]+)$/;
  const getOrderFromStatementId = (id) => id && statementIdRegexp.test(id) ? parseInt(id.match(statementIdRegexp)[1]) : 9999;

  const description = claims.map((f) => {
    const id = f?.qualifiers?.[getPID('taxon/description/fragment id')][0]?.datavalue?.value;
    const numericId = getOrderFromStatementId(id);
    return ({
      text: f.mainsnak?.datavalue?.value,
      id,
      order: numericId,
      provenance: getClaimProvenances(f)
    })
  })
  .sort((a, b) => {
    a = a.order;
    b = b.order;
    return a > b ? 1 : a < b ? -1 : 0;
  })

  return (<Tab.Pane attached='top'>
  {description.map(({id, text}) => (
    <TaxonDescriptionFragment id={`stament-fragment-${id}`}>{text}</TaxonDescriptionFragment>
  ))}
  </Tab.Pane>)

}