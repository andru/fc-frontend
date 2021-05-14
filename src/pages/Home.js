import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import LayoutWidth from 'components/layout-width'
import {fcEndpoint} from 'constants/endpoints' 
import EntityLabel from "components/wikibase-entity-label";
import {getPID} from "actions/floracommons/pid-uid";
const Container = styled(FillBox)`
  padding: 20px;
`;
 
const Intro = styled.h2`
  font-size: 1.4em;
`;

const Warning = styled.p`
  font-size: 1.2em;
  color: #9a635a;
`;

const GBIFtaxonkeyPID = getPID('identifiers/gbif');

function Home({actions}) {
  return (
    <Container>
      <LayoutWidth>
      <Intro>Welcome to this <em>Candian Flora Commons</em> demo.</Intro>
      
      <Warning>This front-end UI is backed by a <a href={`${fcEndpoint.instance}/wiki`} target="_blank" rel="noreferrer">wikibase installation</a> and <a href={`${fcEndpoint.sparqlEndpoint}`}>sparql endpoint</a>. <br />
      All aspects of this system are under heavy active development and are not yet stable or feature complete.
      </Warning>

      <p>
        For a list of all taxa in this demo, see the <Link to="/taxon-hierarchy">Taxon Hierarchy</Link>
      </p>
      <h4>Imported Datasets</h4>
      <ul>
        <li>Flora of North America</li>
        <li>Flora of BC</li>
      </ul>
      <h4>Datasets Planned for Import</h4>
      <ul>
        <li>Additional Volumes of the Flora of North America</li>
      </ul>
      <h4>Linked External Data Sources</h4>
      <ul>
        <li>GBIF taxon keys (see <a href={`${fcEndpoint.instance}/wiki/Property:${GBIFtaxonkeyPID}`}><EntityLabel id={GBIFtaxonkeyPID} /></a>)</li>
        <li>Taxa present at WikiData (currently implemented via name matching)</li>
        <li>EOL (not yet implemented)</li>
        <li>USDA PLANTS (not yet implemented)</li>
      </ul>
      <h4>Not Yet Implemented</h4>
      <ul>
        <li>Taxon detail pages</li>
        <li>Additional search facets
          <ul>
            <li>More specific morphology structures and characters</li>
            <li>Authority, publication, habitat, elevation, distribution</li>
          </ul>
        </li>
        <li>Taxonomic hierarchy navigation / visualisation</li>
      </ul>
      </LayoutWidth>
    </Container>
  );
}

export default Home;
