import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { Card, Placeholder, Icon, Segment } from 'semantic-ui-react';
import { getTaxaWithFacets } from "actions/floracommons/taxa-facets";

import LayoutWidth from 'components/layout-width'


const Container = styled.div`

`;

const Facets = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 230px;
  gap: 40px;
  margin-bottom: 30px;
`;
const Facet = styled.div`
  display: grid;
  grid-template-areas: "image" "title" "description";
  grid-template-rows: 1fr 2.3em 1.7em;

  background: white;
`;
const FacetImage = styled.div`
  background: #dedede;
`;
const FacetTitle = styled.h3`
  margin: 0;
  padding: 5px 10px;
  line-height: 1em;
`;
const FacetDescription = styled.div`
  padding: 0 10px;
`;

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

const ResultsContainer = styled(Segment)`
  margin-top: 40px;
`;

const habitValues = [
  '',
  'aquatics',
  'cespitose',
  'climbing',
  'clonal',
  'cushion',
  'herb',
  'low-clustered',
  'mat-forming',
  'matted',
  'mound-forming',
  'multistemmed',
  'not',
  'plant',
  'procumbent',
  'shrub',
  'shrublike',
  'subshrub',
  'suckering',
  'terrestrial',
  'tree',
  'vine',
];

const leafShapeValues = [
  '',
  '2-lobed',
  '3-8-palmatifid',
  '3[2]-fid',
  'acute',
  'bractlike',
  'bristly-dentate',
  'cylindric',
  'distal',
  'divided',
  'elliptic',
  'emarginate',
  'entire',
  'filiform',
  'flat',
  'folded',
  'incised',
  'lanceolate',
  'leaflike',
  'like',
  'linear',
  'lobed',
  'oblanceolate',
  'oblong',
  'obovate',
  'ovate',
  'pinnate',
  'planar',
  'scale-like',
  'sheathing',
  'spatulate',
  'suborbiculate',
  'subulate',
  'tapering',
  'thread-like',
  'unlobed',
]
//  plant/structure/whole organism
//  plant/character/growth form


function NeighbourhoodIdentify (props) {

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

  const [habits, setHabits] = useState([]);
  const [leafShapes, setLeafShapes] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const facetOptions = {
      querySubstructures: false,
      querySubcharacters: false,
    } 
    const facets = [];
    if (habits.length) {
      facets.push(['Q74', 'Q763', habits, facetOptions]);
    }
    if (leafShapes.length) {
      facets.push(['Q57', 'Q476', leafShapes, facetOptions]);
    }

    if (facets.length) {
      getTaxaWithFacets(facets, {}).then(res => {
        console.log('Identify results', res)
        setResults(res);
      })
    }
  }, [habits, leafShapes]);
  

  return (<Container>
    <LayoutWidth>
      <Facets>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Form or Habit</FacetTitle>
          <FacetDescription>Is it a tree? A bush? A vine?</FacetDescription>
          <select onChange={(e) => setHabits([e.target.value])}>{habitValues.map(value => <option value={value} selected={habits[0]==={value}}>{value}</option>)}</select>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Leaf Shape</FacetTitle>
          <FacetDescription>Round? Pointy? Smooth?</FacetDescription>
          <select onChange={(e) => setLeafShapes([e.target.value])}>{leafShapeValues.map(value => <option value={value} selected={leafShapes[0]==={value}}>{value}</option>)}</select>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Flower Shape</FacetTitle>
          <FacetDescription>Choose a flower shape...</FacetDescription>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Colour &amp; Texture</FacetTitle>
          <FacetDescription>Anything destinctive?</FacetDescription>
        </Facet>
      </Facets>
    </LayoutWidth>
    <LayoutWidth>
      <ResultsContainer>
        <h3>Results</h3>
        <Card.Group>
          {results.map(({taxon, parentTaxon, rank, morphHits, simpleHits}) => 
          <Card key={taxon.entity} link href={`/my-neighbourhood-flora/taxon/${taxon.entity}`}>
          {isFetchingTaxaImages
            ? <Placeholder>
                <Placeholder.Image square />
              </Placeholder>
            : taxaImages[taxon.label]
              ? <TaxonImage imageUrl={taxaImages[taxon.label]} />
              : <NoTaxonImage />
          }
          <Card.Content>
            <Card.Header>{taxon.label}</Card.Header>
            <Card.Description>
            {morphHits.map(hit => (<div>
                        {hit.relatedStructure.label} {hit.relatedCharacter.label} <b>{hit.value}</b><br />
                        {/* {hit.provenance.label} */}
                      </div>))}
            </Card.Description>
          </Card.Content>
        </Card>)}
      </Card.Group>
    </ResultsContainer>
    </LayoutWidth>

  </Container>)
}

export default NeighbourhoodIdentify;