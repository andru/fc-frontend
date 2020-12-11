import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import { useHistory } from "react-router-dom";
import { isFinite } from "lodash";

const FacetRowContainer = styled.div`

`;

export default function FacetRow (props) {
  const {
    allStructures,
    allCharacters,
    structureCharacters,
    structure,
    character,
    values,
    loading,
    onChange,
    onRemove,
    actions
  } = props;

  const {
    getAllValuesForStructureAndCharacter
  } = actions;


  const [isFetchingValues, setFetchingValues] = useState(false);

  const [selectedStructure, setSelectedStructure] = useState(undefined);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(undefined);

  const [structureValues, setStructureValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    const init = async ()  => {
      if (structure) {
        setSelectedStructure(structure);
      }
      if (structure && character) {
        setCharacters(selectStructureCharacters(structure));
        setSelectedCharacter(character);
      }
    };
    init();
  }, [structure, character, values])

  useEffect(() => {
    const init = async ()  => {
      if (structure && character && values) {
        setSelectedValues(values);
        await populateValues(structure, character);
      }
    };
    init();
  }, [structure, character])

  const selectStructureCharacters = (structureId) => {
    return structureCharacters[structureId].map(characterId => ({
      key: characterId,
      value: characterId,
      text: allCharacters.find(c => c.id === characterId)?.label || 'Label Missing'
    }))
  }

  const populateValues = async (structureId, characterId) => {
    setFetchingValues(true);
    // fetch all values of the selected property and its subproperties
    const allValues = await getAllValuesForStructureAndCharacter(structureId, characterId);
    if (!allValues) {
      setFetchingValues(false);
      throw new Error("Query for values returned no results");
    }
    setStructureValues(allValues.map(row => row.value));
    setFetchingValues(false);
  }
  

  const handleStructureSelect = (e, {value}) => {
    const structureId = value;
    setSelectedStructure(structureId);
    setSelectedCharacter(undefined);
    setStructureValues([]);
    setSelectedValues([]);
    // setFetchingSub(true);
    setCharacters(selectStructureCharacters(structureId));
  }

  const handleCharacterSelect = (e, {value}) => {
    const characterId = value;
    setSelectedCharacter(characterId);
    setStructureValues([]);
    setSelectedValues([]);
    populateValues(selectedStructure, characterId);
  }
  const handleValueChange = (e, {value}) => {
    setSelectedValues(value);
    onChange([selectedStructure, selectedCharacter, value]);
  }

  const handleRemoveClick = () => {
    onRemove();
  }

  return (
    <FacetRowContainer>
    <Dropdown
      placeholder='Structure'
      search
      selection
      options={allStructures.map(structure => ({
        key: structure.id,
        text: structure.label,
        value: structure.id
      }))}
      loading={loading}
      disabled={loading}
      value={selectedStructure}
      onChange={handleStructureSelect}
    />
    <Dropdown
      placeholder='Character'
      search
      selection
      options={characters}
      disabled={loading}
      loading={loading}
      value={selectedCharacter}
      onChange={handleCharacterSelect}
    /> 
    <Dropdown
        placeholder='Values'
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
        value={selectedValues}
        onChange={handleValueChange}
      />
      <Button icon="remove" onClick={handleRemoveClick} />
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

    </FacetRowContainer>
  )

}