import React from 'react';
import styled from 'styled-components';
import { Tab, Menu } from 'semantic-ui-react'

import { getPID, getUID } from 'actions/floracommons/pid-uid';
import { getClaimProvenances } from "actions/floracommons/provenance";
import EntityLabel from 'components/wikibase-entity-label';
import Tabbed, { groupClaimsByProvenance } from './tabbed-provenance';
import Inline from './inline-provenance';

const Container = styled.div`

`;

const PaneContainer = styled.div``

const InlineHeader = styled.b`
  margin-right: 5px;
`;


export default function GeographyData (props) {
  const {
    allClaims,
    hideProvenances,
    provenances,
  } = props;

  if (!allClaims['taxon/distribution'] || !allClaims['taxon/distribution'].length) {
    return null;
  }
 
  const GeographyDataPane = makeGeographyDataPane(allClaims);
  return (<Tabbed provenances={provenances} hideProvenances={hideProvenances} paneComponent={GeographyDataPane} />);
}

function makeGeographyDataPane (allClaims) {
  return function GeographyDataPane (props) {
    const {
      provenance,
      provenances,
      showCombined,
      hideProvenances
    } = props;

    const distributionClaims = allClaims['taxon/distribution'];
    const provDistributionClaims = groupClaimsByProvenance(distributionClaims);
    const elevationClaims = allClaims['taxon/elevation'] || [];
    const provElevationClaims = groupClaimsByProvenance(elevationClaims);

    return (<Tab.Pane attached='top'>
      <div>
        <InlineHeader>Distribution</InlineHeader>
        <Inline claims={provDistributionClaims[provenance]} showToken={false} /></div>
      {!elevationClaims.length || <div>
        <InlineHeader>Elevation</InlineHeader>
        <Inline claims={provElevationClaims[provenance]} showToken={false} />
      </div>}
    </Tab.Pane>)
  }
}


