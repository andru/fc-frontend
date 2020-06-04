import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";

const Container = styled(FillBox)`
  flex-direction: row;
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

function Home({actions}) {
  const {
    getPlantStructurePropertiesMatching,
    getTopLevelPlantStructureProperties,
    getAllSubpropertiesOf,
    getAllSubpropertyValuesOf,
    getTaxaByPropertyPathValue
  } = actions;
  // async function doIt () {
  //   await getPlantStructurePropertiesMatching('leaf')
  //   await getTopLevelPlantStructureProperties()
  //   await getAllSubpropertiesOf('P248')
  //   await getAllSubpropertyValuesOf('P248')
  // } 
  // doIt();
  const [isFetching, setFetching] = useState(true);
  const [isFetchingSub, setFetchingSub] = useState(false);
  const [isFetchingValues, setFetchingValues] = useState(false);
  const [isFetchingTaxa, setFetchingTaxa] = useState(false);

  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(undefined);
  const [subPropertyTree, setSubPropertyTree] = useState([]);
  const [structureValues, setStructureValues] = useState([]);
  const [selectedStructureValues, setSelectedStructureValues] = useState([]);
  const [taxaResults, setTaxaResults] = useState([]);

  const handleStructureSelect = (id) => {
    setSelectedStructure(id);
    setFetchingSub(true);
    setFetchingValues(true);
    const go = async () => {
      // fetch all subproperties of the selected property
      const allSubProperties = await getAllSubpropertiesOf(id);
      const buildTree = (parentIdentifier = undefined) => 
        allSubProperties
          .filter(row => row.parent === parentIdentifier)
          .map(row => Object.assign(row, {children: buildTree(row.property.value)}));
      const subPropertyTree = buildTree(id);
      console.log('tree', subPropertyTree);
      setSubPropertyTree(subPropertyTree);
      setFetchingSub(false);
      // fetch all values of the selected property and its subproperties
      const allValues = await getAllSubpropertyValuesOf(id);
      setStructureValues(allValues.map(row => row.value));
      setFetchingValues(false);
    }
    go();
  }
  const handleStructureValueChange = (value) => {
    // fetch all taxa with a value matching the selected property or any of its subproperties
    setSelectedStructureValues(value);
    setFetchingTaxa(true);
    const go = async () => {
      const taxa = await getTaxaByPropertyPathValue(selectedStructure, value);
      setTaxaResults(taxa);
      setFetchingTaxa(false);
    }
    go(); 
  }
 
  // load structure list on component mount, don't re-run for renders
  useEffect(()=> {
    const fetch = async () => {
      const data = await getTopLevelPlantStructureProperties();
      if (data) {
        setStructures(data.map(row => ({
          id: row.property.value,
          label: row.property.label
        })));
        setFetching(false);
      }
    }
    fetch();
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

  return (
    <Container>
      <PropertyTreeContainer>
        {isFetching && <Loader active />}
        {!isFetching && 
        <List> 
          {structures.map(structure => (
          <StructureListItem key={structure.id} onClick={() => handleStructureSelect(structure.id)} active={selectedStructure===structure.id}>
            <List.Icon name={selectedStructure === structure.id ? 'angle right': 'angle down'} />
            <List.Content>
              <List.Header>{structure.label}</List.Header>
              {selectedStructure === structure.id && subPropertyTree.length &&
              <List.List>
                {renderSubPropertyTree(subPropertyTree)}
              </List.List>
              || ``}
            </List.Content>
          </StructureListItem>
          ))}
          </List>
        }
      </PropertyTreeContainer>
      <ResultsContainer>
        {isFetchingValues && <Loader active inline='centered' />}
        {!isFetchingValues && !selectedStructure && !structureValues.length && <div>Select a property from the left to show available values.</div>}
        {!isFetchingValues && selectedStructure && !structureValues.length && <div>There are no values in the system for the selected property.</div>}
        {!isFetchingValues && structureValues.length ? <StructureValuesList>
          {structureValues.map(value => <StructureValuesListItem key={value} size="medium" onClick={() => handleStructureValueChange(value) } active={selectedStructureValues===value}>{value}</StructureValuesListItem>)}
        </StructureValuesList> : ''}
        <TaxaResultsContainer>
          {isFetchingTaxa ? 
          <TaxaPlaceholder /> : ''}
          {!isFetchingTaxa && taxaResults.length ? <TaxaResults>
            {taxaResults.map(({taxon, parentTaxon, rank}) => <TaxonResult key={taxon.value}><a href={`http://159.89.116.92/wiki/Item:${taxon.value}`} target="_blank">{taxon.label}</a> ({rank.label})</TaxonResult>) }
            </TaxaResults>
          : ''}
        </TaxaResultsContainer>

    </ResultsContainer>

    </Container>
  );
}

export default Home;
