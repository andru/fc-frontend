import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";

const Container = styled(FillBox)`
  padding: 20px;
`;
 
const Intro = styled.h3`
  font-size: 1.4em;
`;

const Warning = styled.p`
  font-size: 1.2em;
  color: #9a635a;
`;

function Home({actions}) {
  return (
    <Container>
      <LayoutWidth>
      <Intro>Welcome to <em>Flora Commons</em>.</Intro>
      <Warning>This front-end UI is backed by a Flora Commons <a href={`${fcEndpoint.instance}/wiki`} target="_blank" rel="noreferrer">wikibase installation</a> and <a href={`${fcEndpoint.sparqlEndpoint}`}>sparql endpoint</a>. <br />
      All aspects of this system are under heavy active development and are not yet stable or feature complete.
      </Warning>
      <h4>Imported Datasets</h4>
      <ul>
        <li>Flora of North America, Volumes 19, 20 &amp; 21</li>
      </ul>
      <h4>Datasets Planned for Import</h4>
      <ul>
        <li>Additional Volumes of the Flora of North America</li>
        <li>Flora of BC</li>
      </ul>
      <h4>Linked External Data Sources</h4>
      <ul>
        <li>Taxa present at WikiData (not yet implemented)</li>
        <li>GBIF (not yet implemented)</li>
        <li>EOL (not yet implemented)</li>
        <li>USDA PLANTS (not yet implemented)</li>
      </ul>
      <h4>Usable Features</h4>
      <ul>
        <li><Link to="/morphology-facets">Morphology Faceted Search</Link> is partially implemented, using top-level morphology structures and characters</li>
        <li>Search taxa by name (search box in header)</li>
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
    </Container>
  );
}

export default Home;
