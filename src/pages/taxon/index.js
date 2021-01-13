import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {Helmet} from "react-helmet";
import styled from "styled-components";  
import { Dropdown, List, Placeholder, Loader, Label, Button, Popup } from "semantic-ui-react";

import { FillBox, ScrollingFillBox } from "components/ui/Box";
import EntityLabel from "components/wikibase-entity-label";
import { getClaimProvenances } from "actions/floracommons/provenance";
import InlineProvenance from "./inline-provenance";
import TabbedProvenance from "./tabbed-provenance";
import ProvenanceFilter from "./provenance-filter";
import Description from "./description"
import MorphData from "./morph-data";

const Container = styled(FillBox)`
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

const TaxonContainer = styled.main`
  margin-top: 30px;
`;

const PageNavigation = styled.nav`
  display: flex;
  flex-direction: row;
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
`;
const TaxonName = styled.h1`
  font-size: 3em;
  flex: 1;
  font-weight: normal;
`;
const TaxonRank = styled.div`
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
const Synonym = styled.span``;

const Distribution = styled.div``;

function Taxon({actions}) {
  const { fetchTaxonById } = actions;
  const { id } = useParams();
  const [ isError, setError] = useState(undefined)
  const [ isLoading, setLoading ] = useState(true);
  const [ taxonData, setTaxonData ] = useState(undefined)
  const [ provenanceFilters, setProvenanceFilters ] = useState({})

  useEffect(() => {
    async function load() {
      fetchTaxonById(id)
      .then(applyTaxonData)
      .catch(e => setError(1))
      .finally(() => setLoading(false));
    }
    load();
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
    console.log(taxonData);
    return <TaxonContainer>
      <PageNavigation>
        <h3>Jump To</h3>
        <ol>
          <PageNavigationItem to="description">Description</PageNavigationItem>
          <PageNavigationItem to="distribution">Distribution</PageNavigationItem>
          <PageNavigationItem to="discussion">Discussion</PageNavigationItem>
          <PageNavigationItem to="morphology-data">Morphology Data</PageNavigationItem>
          <PageNavigationItem to="other-data">Other Data</PageNavigationItem>
          <PageNavigationItem to="sources">Sources</PageNavigationItem>
        </ol>
        <ProvenanceFilter provenances={provenanceFilters} onChange={setProvenanceFilters} />
      </PageNavigation>
      <TaxonId>
        <TaxonName>{taxonData.name}</TaxonName>
        <span>(<a href={`http://159.89.116.92/wiki/Item:${id}`} target="_blank">{id}</a>)</span>
        {taxonData['taxon/authority'] &&<TaxonAuthority>{taxonData['taxon/authority'].value}</TaxonAuthority>}
      </TaxonId>
      {taxonData['taxon/parent taxon'] && <h4><Link to={`/taxon/${taxonData['taxon/parent taxon'].id}`}><EntityLabel id={taxonData['taxon/parent taxon'].id} /></Link></h4>}
      {!taxonData['taxon/rank'] || <TaxonRank>
        <InlineHeader>Rank</InlineHeader>
        <EntityLabel id={taxonData['taxon/rank'].id} />
      </TaxonRank>}
      
      {/* <em>{taxonData.commonName || 'No common name'}</em> */}
      {!taxonData.provenances.length || <PresentIn>
        <InlineHeader>Present In</InlineHeader>
        {taxonData.provenances.map((id) => <EntityLabel id={id}></EntityLabel>)}
      </PresentIn>}
      {!taxonData.synonyms.length || <Synonyms>
        <InlineHeader>Synonyms</InlineHeader>
        {taxonData.synonyms.map(({text}) => <Synonym>{text}</Synonym>)}
      </Synonyms>}
      {!taxonData.commonNames.length || <Synonyms>
        <InlineHeader>Common Names</InlineHeader>
        {taxonData.commonNames.map(({text}) => <Synonym>{text}</Synonym>)}
      </Synonyms>}

      <Section id="description">
        <SectionHeader>Description</SectionHeader>
        <Description claims={taxonData.claims['taxon/description/fragment']} hideProvenances={hideProvenances}/>
      </Section>
      <Section id="distribution">
        <SectionHeader>Maps &amp; Distribution</SectionHeader>
        <InlineProvenance claims={taxonData.claims['taxon/distribution']} hideProvenances={hideProvenances}/>
      </Section>

      <Section id="discussion">
        <SectionHeader>Discussion</SectionHeader>
        {taxonData.discussion.map(d => <div>{d.text}</div>)}
      </Section>
      
      <Section id="morphology-data">
        <SectionHeader>Morphology Data</SectionHeader>
        <MorphData claims={taxonData.claims['taxon/morphology statement']} hideProvenances={hideProvenances} />
      </Section>
      
      <Section id="other-data">
        <SectionHeader>Other Data</SectionHeader>
      </Section>


    </TaxonContainer>
  }

  if (isError) {
    return (<Container>Failed to load taxon.</Container>)
  }

  return (
    <Container>
      <Helmet>
        <title>{isLoading ? id : `${taxonData.name} (${id})`} | FloraCommons</title>
      </Helmet>
      {isLoading 
      ? <TaxonPlaceholder />
      : renderTaxon()}
      {/* {isLoading 
      ? null
      : renderWikiData()} */}
    </Container>
  );
}

export default Taxon;


