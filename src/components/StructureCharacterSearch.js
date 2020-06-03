import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Dropdown, List, Placeholder, Loader, Label, Input, Card } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "./ui/Box";
import { useHistory } from "react-router-dom";
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
const FacetRow = styled.div`

`;

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
  const [isFetchingSuperStructures, setFetchingSuperStructures] = useState(true);
  const [isFetchingSub, setFetchingSub] = useState(false);
  const [isFetchingCharacters, setFetchingCharacters] = useState(false);
  const [isFetchingValues, setFetchingValues] = useState(false);
  const [isFetchingTaxa, setFetchingTaxa] = useState(false);

  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(undefined);
  const [subPropertyTree, setSubPropertyTree] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(undefined);

  const [structureValues, setStructureValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [taxaResults, setTaxaResults] = useState([]);

  const handleStructureSelect = (e, {value}) => {
    const structureId = value;
    setSelectedStructure(structureId);
    setSelectedCharacter(undefined);
    setStructureValues([]);
    setSelectedValues([]);
    // setFetchingSub(true);
    setFetchingCharacters(true);
    setCharacters(allCharacters.filter(row => row.superStructure === structureId).map(row => ({
      key: row.character.value,
      value: row.character.value,
      text: row.character.label
    })));
    setFetchingCharacters(false);
  }

  const handleCharacterSelect = (e, {value}) => {
    const characterId = value;
    setSelectedCharacter(characterId);
    setFetchingValues(true);
    const go = async () => {
      // fetch all values of the selected property and its subproperties
      const allValues = await getAllValuesForStructureAndCharacter(selectedStructure, characterId);
      setStructureValues(allValues.map(row => row.value));
      setFetchingValues(false);
    }
    go();
  }
  const handleValueChange = (e, {value}) => {
    console.log(value);
    // fetch all taxa with a value matching the selected property or any of its subproperties
    setSelectedValues(value);
    setFetchingTaxa(true);
    const go = async () => {
      const taxa = await getTaxaWithFacets(selectedStructure, selectedCharacter, value);
      setTaxaResults(taxa);
      setFetchingTaxa(false);
    }
    go(); 
  }
 
  // load structure list on component mount, don't re-run for renders
  useEffect(()=> {
    const fetchStructures = async () => {
      const data = await getTopLevelPlantStructureProperties();
      if (data) {
        allStructures.push(...data.map(row => ({
          id: row.property.value,
          label: row.property.label
        })))
        setFetchingSuperStructures(false);
      } else {
        console.error('Oops no structures')
      }
    }
    const fetchCharacters = async () => {
      setFetchingCharacters(true);

      const characters = await getAllSuperCharacters();
      if (characters) {
        allCharacters.push(...characters);
        setFetchingCharacters(false);
      } else {
        console.error('Oops no characters');
      }
    }
    fetchStructures();
    fetchCharacters();
  }, []);

  const renderSubPropertyTree = (branch) => branch.map(row => (<StructureListItem key={row.property.value}>
    <List.Icon name={row.children && row.children.length ? 'angle right' : 'bullseye'} />
    <List.Content>
      <List.Header>{row.property.label}</List.Header>
      {row.children && row.children.length && <List.List>
        {renderSubPropertyTree(row.children)}
      </List.List> || ``}
    </List.Content>
  </StructureListItem>));

const renderSubPropertyTreeDropDown = (branch) => branch.map(row => (<>
  <Dropdown.Item key={row.property.value} value={row.property.value} label={row.property.label} />
  {row.children && row.children.length && renderSubPropertyTreeDropDown(row.children) || ''}
</>));

  return (
    <Container>
      <FacetBuilder>
        <FacetRow>
        <Dropdown
          placeholder='Structure'
          search
          selection
          options={allStructures.map(structure => ({
            key: structure.id,
            text: structure.label,
            value: structure.id
          }))}
          loading={isFetchingSuperStructures}
          value={selectedStructure}
          onChange={handleStructureSelect}
        />
        <Dropdown
          placeholder='Character'
          search
          selection
          options={characters}
          disabled={!characters.length}
          loading={isFetchingCharacters}
          value={selectedCharacter}
          onChange={handleCharacterSelect}
        /> 
        <Dropdown
            placeholder='Value'
            multiple
            search
            selection
            disabled={!structureValues.length}
            loading={isFetchingValues}
            options={structureValues.map(value => ({
              key: value,
              text: value,
              value
            }))}
            onChange={handleValueChange}
          />
        {/* <Dropdown
            text='Sub structure'
            disabled={!selectedStructure}
            icon='filter'
            floating
            labeled
            button
            className='icon'
          >
            <Dropdown.Menu>
              <Input icon='search' iconPosition='left' className='search' />
              <Dropdown.Divider />
              <Dropdown.Menu scrolling>
                {renderSubPropertyTreeDropDown(subPropertyTree)}
              </Dropdown.Menu>
            </Dropdown.Menu>
          </Dropdown> */}

        </FacetRow>
      </FacetBuilder>

      <ResultsContainer>
        <TaxaResultsContainer>
          {isFetchingTaxa ? 
          <TaxaPlaceholder /> : ''}
          {!isFetchingTaxa && taxaResults.length ? <TaxaResults>
            <Card.Group>
            {taxaResults.map(({taxon, parentTaxon, rank, p_, value}) => (
               <Card link onClick={() => history.push(`/taxon/${taxon.value}`)}>
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
