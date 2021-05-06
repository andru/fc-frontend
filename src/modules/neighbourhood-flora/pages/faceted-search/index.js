import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";  
import { Header, Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card, Image, Form, Checkbox } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";

import LayoutWidth from "components/layout-width";
import { getTaxaWithFacets } from "actions/floracommons/taxa-facets";
import FacetRow from "./facet-row";
import ValueDropdownFacet from "./facet-creators/value-dropdown";

import {ranks} from "constants/taxonomy";
/**
 * 
 * Notes
 * 
 * Facets for...
 * Taxon rank: between [rank] and [rank]? 
 * Subtaxa of: value
 * Authority: value
 * Phenology???
 * Habitat: values [AND/OR]
 * Elevation: between [low] and [high] || [above|below] [value]
 * Introduced: boolean
 * Special Status: value
 */

const Container = styled(FillBox)`
  flex-direction: column;
  padding-top: 20px;

  display: grid;
  grid-template-areas: 'side morph' 'side results';
  grid-template-columns: 250px 1fr;
  grid-gap: 10px;
`;

const ResultsContainer = styled.div`
  grid-area: results;
  flex: 1;

  display: flex;
  flex-direction: column;
`;

const FacetBuilder = styled.nav`
  grid-area: morph;
  padding: 10px 10px;
  margin: 0px 0;
  background: white;
`;

const SimpleFacets = styled.div`
  grid-area: side;
  display: flex;
  flex-direction: column;

  padding: 10px 10px;
  margin: 0px 0 0 0;
  background: white;
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
    {new Array(20).fill(true).map((a, i) => (<Placeholder.Header key={i}>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>))}
  </Placeholder>
))`
`;

const ErrorContainer = styled.div``;


// const AddFacetButton = styled(Button)``;

const AddFacetButton = ({onClick}) => (
  <Button icon labelPosition='left' onClick={onClick}>
    <Icon name='add' />
    Add Morphology Facet
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



const TaxonRankFacet = ({selectedValues, onChange}) => {
  return (<ValueDropdownFacet
    title="Taxonomic Rank"
    values={ranks.map(({id, label}) => ({key:id, value:id, text:label}))}
    selectedValues={selectedValues}
    onChange={onChange}
    multiple={true}
  />) 
}

const FamilyFacet = ({loading, values, selectedValues, onChange}) => {
  return (<ValueDropdownFacet
    title="Member of family"
    values={values}
    loading={loading}
    selectedValues={selectedValues}
    onChange={onChange}
    multiple={true}
  />) 
}

const DistributionFacet = ({loading, values, selectedValues, onChange}) => {
  return (<ValueDropdownFacet
    title="Distribution"
    values={values}
    loading={loading}
    selectedValues={selectedValues}
    onChange={onChange}
    multiple={true}
  />) 
} 

const CacheBreakerPref = ({onChange, checked}) => {
  return (<Form.Field>
    <Checkbox toggle label="Avoid Query Cache" onChange={onChange} />
  </Form.Field>)
}


const allStructures = [];
const allCharacters = [];
let structureCharacters = {};

export default function FacetedSearch({actions}) {
  const {
    getWikiDataImagesForTaxa,
    getTaxaNamesOfRank,
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
  const [isError, setError] = useState(false);
  const [taxaResults, setTaxaResults] = useState([]);
  const [isFetchingTaxaImages, setFetchingTaxaImages] = useState(true);
  const [taxaImages, setTaxaImages] = useState({});

  const [facets, setFacets] = useState({
    family: [],
    rank: [],
    distribution: [],
  });
  const [morphFacetRows, setMorphFacetRows] = useState([]);

  const [selectedRankValues, setSelectedRankValues] = useState([]);

  const [familyValues, setFamilyValues] = useState([]);
  const [selectedFamilyValues, setSelectedFamilyValues] = useState([]);

  const [distributionValues, setDistributionValues] = useState([]);
  const [selectedDistributionValues, setSelectedDistributionValues] = useState([]);

  const [queryOptions, setQueryOptions] = useState({breakCache: false});


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
    const fetchStructureCharacterCache = async () => {
      const list = await fetch('/structure-character.json').then(r => r.json());
      console.log(list);
      return list;
    }
    const fetchTaxaCache = async () => {
      return fetch('/taxa.json').then(r => r.json());
    }
    const initialise = async () => {
      // const [structures, characters] = await Promise.all([fetchStructures(), fetchCharacters()]);

      const [strChrs, taxaCache, families] = await Promise.all([
        fetchStructureCharacterCache(),
        fetchTaxaCache(),
        getTaxaNamesOfRank('family')
      ])
      // filter structures to only return those which have characters
      allStructures.push(...strChrs.structures.filter(([id, label]) => strChrs.structureToCharacters[id]?.length).map( ([id, label]) => ({id, label}) ));
      allCharacters.push(...strChrs.characters.map(([id, label]) => ({id, label})));
      structureCharacters = strChrs.structureToCharacters;


      // loadFacetsFromURL();
      setFamilyValues(families.map(({id, name}) => ({key: id, text:name, value: id})));
      setDistributionValues(taxaCache.distribution)

      setInitialised(true);
    }
    initialise();
  }, []);

  const doSearch = async (newMorphFacetRows, newFacets) => {
    setFetchingTaxa(true);
    setFetchingTaxaImages(true);
    if (!newMorphFacetRows) {
      newMorphFacetRows = morphFacetRows;
    }
    if (!newFacets) {
      newFacets = facets;
    }
    try {
      const taxa = await getTaxaWithFacets(newMorphFacetRows, newFacets, queryOptions);
      console.log(taxa);
      setTaxaResults(taxa);
      if (taxa.length) {
        setFetchingTaxa(false);
        setFetchingTaxaImages(true);
        const taxaImages = await getWikiDataImagesForTaxa(taxa.map(row => row.taxon.label));
        setTaxaImages(taxaImages);
        setFetchingTaxaImages(false);
      } else {
        setFetchingTaxa(false);
        // display no results message
      }
    } catch (e) {
      console.error(e);
      setFetchingTaxa(false);
      setError(true);
    }
  }

  // handler for the onChange event of a FacetRow
  const handleFacetRowChange = (facetIndex, [structure, character, values]) => {
    // copy factetRows and update with the new facet info
    const newFacetRows = [...morphFacetRows];
    newFacetRows[facetIndex] = [structure, character, values];
    setMorphFacetRows(newFacetRows);
    // persistFacetsToURL(newFacetRows);
    // run the search with the updated facet rows
    doSearch(newFacetRows); 
  }

  // handler for the onRemove event of a FacetRow
  const handleFacetRowRemove = (facetIndex) => {
    // copy morphFacetRows and update to remove the facet at index `facetIndex`
    const newFacetRows = [...morphFacetRows];
    newFacetRows.splice(facetIndex, 1);
    setMorphFacetRows(newFacetRows);
    // persistFacetsToURL(newFacetRows);
    // run the search with the updated morphFacetRows
    doSearch(newFacetRows)

    // if (newFacetRows.length) {
    //   doSearch(newFacetRows)
    // } else {
    //   setTaxaResults([]);
    // }
  }

  const handleAddFacetClick = () => {
    setMorphFacetRows([...morphFacetRows, [undefined, undefined, []]]);
  }

  const updateFacets = (updatedFacets) => {
    const newFacets = {...facets, ...updatedFacets};
    setFacets(newFacets)
    doSearch(null, newFacets);
    return newFacets;
  }

  const handleRankChange = (values) => {
    updateFacets({rank: values})
    setSelectedRankValues(values);
  }

  const handleFamilyChange = (values) => {
    updateFacets({family: values})
    setSelectedFamilyValues(values);
  }

  const handleDistributionChange = (values) => {
    updateFacets({distribution: values})
    setSelectedDistributionValues(values);
  }

  const handleCacheBreakerChange = () => {
    setQueryOptions(
      {
        ...queryOptions,
        breakCache: !queryOptions.breakCache
      }
    )
  }
  // const persistFacetsToURL = (facetRows) => {
  //   const filterIncomplete = ([type, data]) => type && data.length > 0;
  //   if (facetRows.length < 1 || !facetRows.filter(filterIncomplete)?.length) {
  //     history.replace(`/faceted-search`);
  //   } else {
  //     const encodedFacets = facetRows.filter(filterIncomplete).map(([type, data]) => `${type}:${data.join(';')}`).join('/');
  //     history.replace(`/faceted-search?${encodedFacets}`)
  //   }
  // }

  // const loadFacetsFromURL = () => {
  //   if (location.search && location.search.length > 1) {
  //     const rows = location.search.substr(1).split('/').map(r => {
  //       const row = r.split(':');
  //       if (row.length !== 3 || !row[2]) {
  //         return null;
  //       }
  //       row[2] = row[2].split(',');
  //       return row;
  //     });
  //     const validRows = rows.filter(r => r !== null);
  //     if (validRows.length) {
  //       setFacetRows(validRows);
  //       doSearch(validRows);
  //     }
  //     console.log(rows);
  //   }
  // }


  return (
    <LayoutWidth><Container>
      <SimpleFacets>
        <FamilyFacet onChange={handleFamilyChange} selectedValues={selectedFamilyValues} values={familyValues} loading={!isInitialised} />
        <TaxonRankFacet onChange={handleRankChange} selectedValues={selectedRankValues} loading={!isInitialised} />
        <DistributionFacet onChange={handleDistributionChange} selectedValues={selectedDistributionValues} values={distributionValues} loading={!isInitialised} />
        <hr />
        <CacheBreakerPref onChange={handleCacheBreakerChange} />
      </SimpleFacets>
      <FacetBuilder>
        <Header as="h3">Morphology</Header>
        {morphFacetRows.map((facet, i) => (
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
      {isError
        ? <ErrorContainer>Oops! Something went wrong.</ErrorContainer>
        : <Results {...{isFetchingTaxa, taxaResults, isFetchingTaxaImages, taxaImages}} />
      }
    </Container></LayoutWidth>
  );
}

function Results (props) {
  const {
    isFetchingTaxa,
    taxaResults,
    isFetchingTaxaImages,
    taxaImages
  } = props;
  return (
  <ResultsContainer>
    <TaxaResultsContainer>
      {isFetchingTaxa ? 
      <TaxaPlaceholder /> : ''}
      {!isFetchingTaxa && taxaResults?.length ? <TaxaResults>
        <Card.Group>
        {taxaResults.map(({taxon, parentTaxon, rank, morphHits, simpleHits}) => (
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
                  {simpleHits.morphology?.length ? <div>Distribution <b>{simpleHits.distribution.join(', ')}</b></div> : null}
                  {morphHits.map(hit => (<div>
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

</ResultsContainer>)
}