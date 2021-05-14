import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";  
import { Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card, Image } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";

import FacetRow from "./facet-row";

const Container = styled(FillBox)`
  flex-direction: column;
`;
const PropertyTreeContainer = styled.div`
  flex: 0 0 300px;

  display: flex;
`;
const ResultsContainer = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;
//   const StructureListItem = styled(({ className, children, ...props }) => (
//   <List.Item className={className} {...props}>
//     {children}
//   </List.Item>
// ))`
// cursor: pointer;
// &:hover {
//   color: red;
// }
// &.active {
//   color: orange;
// }
// `;
const StructureListItem = styled(List.Item)`
  .header {
    cursor: pointer;
  }
  &:hover {
    color: lightblue;
  }
  &.active, 
  .ui.list &.active.item .header, 
  &.active .list > .item .header {
    color: lightblue;
  }
`;

const StructureValuesList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;
const StructureValuesListItem = styled(Label)`
  &.active {
    background-color: lightblue;
  }
  cursor: pointer;
  &:hover {
    background-color: lightblue;
    /* color: white; */
  }
`;
const TaxaResultsContainer = styled.div`
  flex: 1;
  padding: 20px;
  background: #fff;
`;
const TaxaResults = styled(List)`

`;
const TaxonResult = styled(({className, children, ...props}) => (
  <List.Item>
    <List.Content>{children}</List.Content>
  </List.Item>
))``;

const TaxaPlaceholder = styled(({className, children, ...props}) => (
  <Placeholder fluid className={className}>
    {new Array(20).fill(true).map(a => (<Placeholder.Header>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>))}
  </Placeholder>
))`
`;

const FacetBuilder = styled.nav`
  padding: 20px 20px;
  margin: 20px 0;
  background: white;
`;
// const AddFacetButton = styled(Button)``;

const AddFacetButton = ({onClick}) => (
  <Button icon labelPosition='left' onClick={onClick}>
    <Icon name='add' />
    Add Facet
  </Button>
)
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


const allStructures = [];
const allCharacters = [];
let structureCharacters = {};

function StructureCharacterSearch({actions}) {
  const {
    getTaxaWithFacets,
    getWikiDataImagesForTaxa
  } = actions;

  const history = useHistory();
  const location = useLocation();

  // async function doIt () {
  //   await getPlantStructurePropertiesMatching('leaf')
  //   await getTopLevelPlantStructureProperties()
  //   await getAllSubpropertiesOf('P248')
  //   await getAllSubpropertyValuesOf('P248')
  // } 
  // doIt();
  const [isInitialised, setInitialised] = useState(false);
  const [isFetchingTaxa, setFetchingTaxa] = useState(false);
  const [taxaResults, setTaxaResults] = useState([]);
  const [isFetchingTaxaImages, setFetchingTaxaImages] = useState(true);
  const [taxaImages, setTaxaImages] = useState({});

  const [facetRows, setFacetRows] = useState([[undefined, undefined, []]]);

  // load structure list on component mount, don't re-run for renders
  useEffect(()=> {
    // const fetchStructures = async () => {
    //   const data = await getTopLevelStructures();
    //   if (data) {
    //     return data.map(row => ({
    //       id: row.property.value,
    //       label: row.property.label
    //     }))
    //   } else {
    //     console.error('Oops no structures')
    //   }
    // }
    // const fetchCharacters = async () => {
    //   const characters = await getTopLevelCharacters();
    //   if (characters) {
    //     return characters;
    //   } else {
    //     console.error('Oops no characters');
    //   }
    // }
    const fetchCachedList = async () => {
      const list = await fetch('/structure-character-baked.json').then(r => r.json());
      console.log(list);
      return list;
    }
    const initialise = async () => {
      // const [structures, characters] = await Promise.all([fetchStructures(), fetchCharacters()]);

      const list = await fetchCachedList();
      // filter structures to only return those which have characters
      allStructures.push(...list.structures.filter(([id, label]) => list.structureToCharacters[id]?.length).map( ([id, label]) => ({id, label}) ));
      allCharacters.push(...list.characters.map(([id, label]) => ({id, label})));
      structureCharacters = list.structureToCharacters;

      loadFacetsFromURL();

      setInitialised(true);
    }
    initialise();
  }, []);

  const doSearch = async (searchFacetRows) => {
    setFetchingTaxa(true);
    setFetchingTaxaImages(true);
    if (!searchFacetRows) {
      searchFacetRows = facetRows;
    }
    try {
      const taxa = await getTaxaWithFacets(searchFacetRows);
      console.log(taxa);
      setTaxaResults(taxa);
      if (taxa.length) {
        setFetchingTaxaImages(true);
        const taxaImages = await getWikiDataImagesForTaxa(taxa.map(row => row.taxon.label));
        setTaxaImages(taxaImages);
        setFetchingTaxaImages(false);
      }
      setFetchingTaxa(false);
    } catch (e) {
      setFetchingTaxa(false);
    }
  }

  // handler for the onChange event of a FacetRow
  const handleFacetRowChange = (facetIndex, [structure, character, values]) => {
    // copy factetRows and update with the new facet info
    const newFacetRows = [...facetRows];
    newFacetRows[facetIndex] = [structure, character, values];
    setFacetRows(newFacetRows);
    persistFacetsToURL(newFacetRows);
    // run the search with the updated facet rows
    doSearch(newFacetRows); 
  }

  // handler for the onRemove event of a FacetRow
  const handleFacetRowRemove = (facetIndex) => {
    // copy facetRows and update to remove the facet at index `facetIndex`
    const newFacetRows = [...facetRows];
    newFacetRows.splice(facetIndex, 1);
    setFacetRows(newFacetRows);
    persistFacetsToURL(newFacetRows);
    // run the search with the updated facetRows
    if (newFacetRows.length) {
      doSearch(newFacetRows)
    } else {
      setTaxaResults([]);
    }
  }

  const handleAddFacetClick = () => {
    setFacetRows([...facetRows, [undefined, undefined, []]]);
  }

  const persistFacetsToURL = (facetRows) => {
    const filterIncomplete = ([s, c, v]) => s && c && v?.length > 0;
    if (facetRows.length < 1 || !facetRows.filter(filterIncomplete)?.length) {
      history.replace(`/morphology-facets`);
    } else {
      const encodedFacets = facetRows.filter(filterIncomplete).map(([structure, character, values]) => `${structure}:${character}:${values.join(',')}`).join('/');
      history.replace(`/morphology-facets?${encodedFacets}`)
    }
  }

  const loadFacetsFromURL = () => {
    if (location.search && location.search.length > 1) {
      const rows = location.search.substr(1).split('/').map(r => {
        const row = r.split(':');
        if (row.length !== 3 || !row[2]) {
          return null;
        }
        row[2] = row[2].split(',');
        return row;
      });
      const validRows = rows.filter(r => r !== null);
      if (validRows.length) {
        setFacetRows(validRows);
        doSearch(validRows);
      }
      console.log(rows);
    }
  }

//   const renderSubPropertyTree = (branch) => branch.map(row => (<StructureListItem key={row.property.value}>
//     <List.Icon name={row.children && row.children.length ? 'angle right' : 'bullseye'} />
//     <List.Content>
//       <List.Header>{row.property.label}</List.Header>
//       {row.children && row.children.length && <List.List>
//         {renderSubPropertyTree(row.children)}
//       </List.List> || ``}
//     </List.Content>
//   </StructureListItem>));

// const renderSubPropertyTreeDropDown = (branch) => branch.map(row => (<>
//   <Dropdown.Item key={row.property.value} value={row.property.value} label={row.property.label} />
//   {row.children && row.children.length && renderSubPropertyTreeDropDown(row.children) || ''}
// </>));

  return (
    <Container>
      <FacetBuilder>
        {facetRows.map((facet, i) => (
          <FacetRow
          key={i}
          actions={actions}
          allStructures={allStructures}
          allCharacters={allCharacters}
          structureCharacters={structureCharacters}
          loading={!isInitialised}
          structure={facet[0]}
          character={facet[1]}
          values={facet[2]}
          onChange={(facetRowValues) => handleFacetRowChange(i, facetRowValues)}
          onRemove={() => handleFacetRowRemove(i)}
          />
        ))}
        <AddFacetButton onClick={handleAddFacetClick} />
      </FacetBuilder>

      <ResultsContainer>
        <TaxaResultsContainer>
          {isFetchingTaxa ? 
          <TaxaPlaceholder /> : ''}
          {!isFetchingTaxa && taxaResults?.length ? <TaxaResults>
            <Card.Group>
            {taxaResults.map(({taxon, parentTaxon, rank, hits}) => (
               <Card key={taxon.value} link href={`/taxon/${taxon.value}`}>
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
                    {parentTaxon && <Card.Meta>{parentTaxon.label}</Card.Meta>}
                    <Card.Description>
                      {hits.map(hit => (<div>
                        {hit.relatedStructure.label} {hit.relatedCharacter.label} <b>{hit.value}</b><br />
                        {/* {hit.provenance.label} */}
                      </div>))}
                    </Card.Description>
                  </Card.Content>
                </Card>
            )) }
            </Card.Group>
            </TaxaResults>
          : ''}
        </TaxaResultsContainer>

    </ResultsContainer>

    </Container>
  );
}

export default StructureCharacterSearch;
