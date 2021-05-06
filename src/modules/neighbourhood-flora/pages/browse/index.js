import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import LayoutWidth from 'components/layout-width';

import {Menu, Header, Placeholder, Card, Icon} from 'semantic-ui-react';

const Container = styled.div`

`;



function NeighbourhoodBrowse (props) {

  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa
  } = props

  return (<Container>
    <LayoutWidth>
      {isLoadingTaxa 
      ? <Loading {...props} />
      : <RenderTaxa {...props} />
      }
    </LayoutWidth>


  </Container>)
}

function Loading (props) {
  return (<div>Loading...</div>);
}

const FacetedBrowser = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-areas:
    "facets results";
  `;
const FacetList = styled(Menu)`
  grid-area: facets;
  /* list-style: none;
  padding: 0; */
`;
const Facet = styled(Menu.Item)``;
const FacetTitle = styled(Header)``;
const FacetDescription = styled.p``;

const Taxa = styled.ul`
  grid-area: results;
  list-style: none;
  padding: 0;
`;
const TaxonCard = styled(Card)``;
const TaxonName = styled.h3``;
const TaxonOccurences = styled.div``;

const TaxonImageBase = styled.div`
  width: 100%;
  height: 250px;
  background-size:cover;
  background-position: center;
`;
const TaxonImage = styled(TaxonImageBase)`
  background-image: url(${props => props.imageUrl});
`;

const NoTaxonImageContainer = styled(TaxonImageBase)`
  display:flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  i {
    opacity: 0.5;
  }
`;

const NoTaxonImage = () => (
  <NoTaxonImageContainer>
    <Icon name="file image outline" size="huge" color="grey" />
  </NoTaxonImageContainer>
)

function RenderTaxa (props) {
  const {
    locationPermissionStatus,
    hasLocationError,
    location,
    getLocation,
    isLoadingTaxa,
    taxa,
    isFetchingTaxaImages,
    taxaImages
  } = props

  const [facet, setFacet] = useState('none');

  const facetFilters = {
    none: () => true,
    common: (taxon) => taxon.occurrences > 19,
    rare: (taxon) => taxon.occurrences < 20,
  }

  const filteredTaxa = taxa.sort((a,b) => a.occurrences < b.occurrences ? 1 : -1).filter(facetFilters[facet])

  return (<FacetedBrowser>
    <FacetList vertical>
      <Facet onClick={() => setFacet('none')} active={facet==='none'}>
        <FacetTitle>Everything</FacetTitle>
        <FacetDescription>All plants spotted in your neighbourhood.</FacetDescription>
      </Facet>
      <Facet onClick={() => setFacet('common')} active={facet==='common'}>
        <FacetTitle>Common Plants</FacetTitle>
        <FacetDescription>Plants you're sure to see around your neighbourhood</FacetDescription>
      </Facet>
      <Facet onClick={() => setFacet('rare')} active={facet==='rare'}>
        <FacetTitle>Rare Plants</FacetTitle>
        <FacetDescription>Plants recorded in your area which might be harder to spot!</FacetDescription>
      </Facet>
    </FacetList>
    <Taxa>
      <Card.Group>
      {filteredTaxa.map(taxon => 
      <Card key={taxon.entity} link href={`/taxon/${taxon.entity}`}>
      {isFetchingTaxaImages
        ? <Placeholder>
            <Placeholder.Image square />
          </Placeholder>
        : taxaImages[taxon.name]
          ? <TaxonImage imageUrl={taxaImages[taxon.name]} />
          : <NoTaxonImage />
      }
      <Card.Content>
        <Card.Header>{taxon.name}</Card.Header>
        <Card.Description>
          Spotted {taxon.occurrences} times
        </Card.Description>
      </Card.Content>
    </Card>)}
    </Card.Group>
    </Taxa>
  </FacetedBrowser>)
}

export default NeighbourhoodBrowse;