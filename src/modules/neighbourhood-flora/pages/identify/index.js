import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { Card, Placeholder, Icon, Segment } from 'semantic-ui-react';
import { taxaFacetsQuery } from "actions/floracommons/taxa-facets";
import { getPID } from "actions/floracommons/pid-uid";
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

const flowerShapeValues = [
  '',
'2(-3)-pinnate',
'2-3-pinnate',
'2-pinnate',
'asymmetric',
'buttonlike',
'capitate',
'compressed',
'conelike',
'conic',
'convex',
'cylindric',
'distal',
'domed',
'ellipsoid',
'elliptic',
'elongate',
'emersed',
'globose',
'headlike',
'irregular',
'lance-cylindric',
'linear',
'linear to narrowly',
'moniliform',
'ovoid',
'ovoid-ellipsoid',
'pinnate',
'pyramidal',
'sheathing',
'short-cylindric',
'spikel-like',
'spikelike',
'terete',
'umbel-like',
]

const ResultsPlaceholder = styled(({className, children, ...props}) => (
  <Placeholder fluid className={className}>
    {new Array(20).fill(true).map((a, i) => (<Placeholder.Header key={i}>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>))}
  </Placeholder>
))`
`;


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

  const [isFetching, setFetching] = useState(false)
  const [habits, setHabits] = useState([]);
  const [leafShapes, setLeafShapes] = useState([]);
  const [flowerShapes, setFlowerShapes] = useState([]);

  const [results, setResults] = useState([]);

  useEffect(() => {
    const facetOptions = {
      querySubstructures: false,
      querySubcharacters: false,
    } 
    const facets = [];
    if (habits.length) {
      // facets.push([getPID('plant/structure/whole organism'), getPID('plant/character/growth form'), habits, facetOptions]);
      facets.push(['Q74', 'Q2988', habits, facetOptions]);

    }
    if (leafShapes.length) {
      // facets.push([getPID('plant/structure/leaf'), getPID('plant/character/shape'), leafShapes, facetOptions]);
      facets.push(["Q57", "Q476", leafShapes, facetOptions]);

    }
    if (flowerShapes.length) {
      // facets.push([getPID('plant/structure/inflorescence'), getPID('plant/character/shape'), flowerShapes, facetOptions]);
      facets.push(['Q55', 'Q476', flowerShapes, facetOptions]);
    }

    if (facets.length) {
      setFetching(true)
      taxaFacetsQuery(facets, {}).fetch().then(res => {
        console.log('Identify results', res)
        setResults(res);
        setFetching(false);
      })
    }
  }, [habits, leafShapes, flowerShapes]);
  

  return (<Container>
    <LayoutWidth>
      <Facets>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Leaf Shape</FacetTitle>
          <FacetDescription>Round? Pointy? Smooth?</FacetDescription>
          <select onChange={(e) => !!e.target.value ? setLeafShapes([e.target.value]) : setLeafShapes([])}>{leafShapeValues.map(value => <option value={value} selected={leafShapes[0]==={value}}>{value}</option>)}</select>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Flower Shape</FacetTitle>
          <FacetDescription>Choose a flower shape...</FacetDescription>
          <select onChange={(e) => !!e.target.value ? setFlowerShapes([e.target.value]) : setFlowerShapes([])}>{flowerShapeValues.map(value => <option value={value} selected={leafShapes[0]==={value}}>{value}</option>)}</select>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Form or Habit</FacetTitle>
          <FacetDescription>Is it a tree? A bush? A vine?</FacetDescription>
          <select onChange={(e) => !!e.target.value ? setHabits([e.target.value]) : setHabits([])}>{habitValues.map(value => <option value={value} selected={habits[0]==={value}}>{value}</option>)}</select>
        </Facet>
        <Facet>
          <FacetImage></FacetImage>
          <FacetTitle>Colour &amp; Texture</FacetTitle>
          <FacetDescription>Anything destinctive?</FacetDescription>
        </Facet>
      </Facets>
    </LayoutWidth>
    <LayoutWidth>
      {isFetching 
      ? <ResultsPlaceholder />
      : results.length ? 
      <ResultsContainer>
        
        <h3>{results.length > 99 && 'Over '}{results.length} Results</h3>
        <Card.Group>
          {results.map(({taxon, parentTaxon, rank, morphHits, simpleHits}) => 
          <Card key={taxon.value} link href={`/my-neighbourhood-flora/taxon/${taxon.value}`}>
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
    </ResultsContainer> : null}
    </LayoutWidth>

  </Container>)
}

export default NeighbourhoodIdentify;