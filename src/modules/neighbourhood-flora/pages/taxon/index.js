import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {Helmet} from "react-helmet";
import styled from "styled-components";  
import { Segment, Dropdown, List, Placeholder, Loader, Label, Button, Popup } from "semantic-ui-react";

import { fcEndpoint } from "constants/endpoints";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import EntityLabel from "components/wikibase-entity-label";
import LayoutWidth from "components/layout-width";
// import { getClaimProvenances } from "actions/floracommons/provenance";
import TaxonHierarchy from './hierarchy';
import InlineProvenance from "./inline-provenance";
import TabbedProvenance from "./tabbed-provenance";
import ProvenanceFilter from "./provenance-filter";
import Description from "./description"
import Geography  from "./geography";
import MorphData from "./morph-data";
import OtherData from "./other-data";

import GbifDistributionMap from "./gbifmap"

const Main = styled(FillBox)`
  display: flex;
  flex-direction: column;
`;
const Section = styled.section`
  margin-top: 3em;
`;
const SectionHeader = styled.h2``;
const SectionBody = styled.div`

`;


const TaxonPlaceholder = styled(({className, children, ...props}) => (
  <Placeholder fluid className={className}>
    {new Array(20).fill(true).map(a => (<Placeholder.Header>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>))}
  </Placeholder>
))`
`;

const TaxonContainer = styled.div`
  width: 100%;
`;

const PageNavigation = styled.nav`
  display: flex;
  flex-direction: row;
  margin-top: 50px;
  h3 {
    margin: 0;
    padding: 0;
    margin-right: 1em;

    font-size: 1em;
    text-transform: uppercase;
    font-weight: normal;
  }
  ol{
    flex: 1;
    display: flex;
    flex-direction: row;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin: 0 1em 0 0;
    padding: 0;
  }
`;
const PageNavigationItem = ({to, children, ...props}) => {
  return <li {...props}><a href={`#${to}`}>{children}</a></li>
}


const TaxonId = styled.header`
  display: flex;
  flex-direction: row;
  margin-top: 3em;
`;
const TaxonName = styled.h1`
  font-size: 3em;
  flex: 1;
  font-weight: normal;
`;
const TaxonAuthority = styled.h4`

`;
// const TaxonDescription = styled.div`
  

const InlineHeader = styled.b`
  margin-right: 5px;
`;
const PresentIn = styled.div`
  span {
    &:after {
      content: ", "
    }
    &:last-child:after {
      content: "."
    }
  }
`;
const Synonyms = styled.div``;

const TabbedNoData = styled(Segment)`
  background: #fff;
`;

const CommonNames = styled(InlineProvenance)`
  li {
    span:first-child {
      font-size:1.4em;
    }
    span:nth-child(2) {
      font-size:0.8em;
    }
  }
`;

function Taxon({actions}) {
  const { fetchTaxonById } = actions;
  const { id } = useParams();
  const [ isError, setError] = useState(undefined)
  const [ isLoading, setLoading ] = useState(true);
  const [ taxonData, setTaxonData ] = useState(undefined)
  const [ provenanceFilters, setProvenanceFilters ] = useState({})

  useEffect(() => {
    setLoading(true);
    async function load() {
      fetchTaxonById(id)
      .then(applyTaxonData)
      .catch(e => setError(1))
      .finally(() => setLoading(false));
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyTaxonData = (data) => {
    setTaxonData(data);
    setProvenanceFilters(Object.fromEntries(data.provenances.map(p => [p, true])))
  }

  const Prov =  ({id, ...props}) => {
    return <span>{taxonData.provenances.indexOf(id) + 1}</span>
  }

  const hideProvenances = Object.entries(provenanceFilters).filter(([id, enabled]) => enabled===false).map(([id]) => id);

  function renderTaxon () {
    return <TaxonContainer>
      <LayoutWidth>

        <TaxonId>
          <TaxonName>{taxonData.name}</TaxonName>
          {taxonData['taxon/authority'] &&<TaxonAuthority>{taxonData['taxon/authority'].value}</TaxonAuthority>}
        </TaxonId>
        {!taxonData.claims['taxon/common name']?.length || <Synonyms>
          <CommonNames claims={taxonData.claims['taxon/common name']} hideProvenances={hideProvenances}/>
        </Synonyms>}
      </LayoutWidth>
      

      <div style={{height: '50vh', width: '100vw'}}>
      <GbifDistributionMap gbifTaxonKey={taxonData['identifiers/gbif']?.value} taxonName={taxonData.name} />
      </div>

      <LayoutWidth>

        <Section id="description">
          <SectionHeader>Description</SectionHeader>
          <Description claims={taxonData.claims['taxon/description/fragment']} hideProvenances={hideProvenances}/>
        </Section>
        <Section id="distribution">
          <SectionHeader>Distribution, Elevation &amp; Habitat</SectionHeader>
          <Geography allClaims={taxonData.claims} provenances={taxonData.provenances} hideProvenances={hideProvenances} />
        </Section>

        <Section id="wikibase">
          To see all data at CFC, see the base record for <Link to={`/taxon/${id}`}>{taxonData.name}</Link>, or to see the raw data and contribute edits, see the WikiBase entity <a href={`${fcEndpoint.instance}/wiki/Item:${id}`} target="_blank" rel="noreferrer">{id}</a>
        </Section>

      </LayoutWidth>
    </TaxonContainer>
  }

  if (isError) {
    return (<Main>Failed to load taxon.</Main>)
  }

  return (
    <>
      <Helmet>
        <title>{isLoading ? id : `${taxonData.name} (${id})`} | FloraCommons</title>
      </Helmet>
      {isLoading 
      ? <TaxonPlaceholder />
      : renderTaxon()}
    </>
  );
}

export default Taxon;


