import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import { useHistory } from "react-router-dom";

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


const allStructures = [];
const allCharacters = [];

function StructureCharacterSearch({actions}) {
  const {
    getPlantStructurePropertiesMatching,
    getTopLevelPlantStructureProperties,
    getAllSuperCharacters,
    getAllSubpropertiesOf,
    getAllSubpropertyValuesOf,
    getAllCharactersForStructure,
    getAllValuesForStructureAndCharacter,
    getTaxaWithFacets
  } = actions;

  const history = useHistory();
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

  const [facetRows, setFacetRows] = useState([[undefined, undefined, []]]);

  // load structure list on component mount, don't re-run for renders
  useEffect(()=> {
    const fetchStructures = async () => {
      const data = await getTopLevelPlantStructureProperties();
      if (data) {
        allStructures.push(...data.map(row => ({
          id: row.property.value,
          label: row.property.label
        })))
      } else {
        console.error('Oops no structures')
      }
    }
    const fetchCharacters = async () => {
      const characters = await getAllSuperCharacters();
      if (characters) {
        allCharacters.push(...characters);
      } else {
        console.error('Oops no characters');
      }
    }
    const initialise = async () => {
      await Promise.all([fetchStructures(), fetchCharacters()]);
      setInitialised(true);
    }
    initialise();
  }, []);

  const handleFacetRowChange = (facetIndex, [structure, character, values]) => {
    // fetch all taxa with a value matching the selected property or any of its subproperties
    const newFacetRows = [...facetRows];
    newFacetRows[facetIndex] = [structure, character, values];
    setFacetRows(newFacetRows);
    setFetchingTaxa(true);
    const go = async () => {
      const taxa = await getTaxaWithFacets(newFacetRows);
      setTaxaResults(taxa);
      setFetchingTaxa(false);
    }
    go(); 
  }

  const handleFacetRowRemove = (facetIndex) => {
    const newFacetRows = [...facetRows];
    newFacetRows.splice(facetIndex, 1);
    setFacetRows(newFacetRows);
  }

  const handleAddFacetClick = () => {
    console.log("Adding facet");
    setFacetRows([...facetRows, [undefined, undefined, []]]);
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
          {!isFetchingTaxa && taxaResults.length ? <TaxaResults>
            <Card.Group>
            {taxaResults.map(({taxon, parentTaxon, rank, p_, value}) => (
               <Card key={taxon.value} link onClick={() => history.push(`/taxon/${taxon.value}`)}>
                  <Card.Content>
                    <Card.Header>{taxon.label}</Card.Header>
                    <Card.Meta>{parentTaxon.label}</Card.Meta>
                    <Card.Description>
                      {p_.label}: <b>{value}</b>
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
