import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import { useHistory } from "react-router-dom";

const FacetRow = styled.div`

`;

export default function StructureCharacterFacetRow (props) {
  const {
    allStructures,
    allCharacters,
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


  const handleStructureSelect = (e, {value}) => {
    const structureId = value;
    setSelectedStructure(structureId);
    setSelectedCharacter(undefined);
    setStructureValues([]);
    setSelectedValues([]);
    // setFetchingSub(true);
    setCharacters(allCharacters.filter(row => row.superStructure === structureId).map(row => ({
      key: row.character.value,
      value: row.character.value,
      text: row.character.label
    })));
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
    setSelectedValues(value);
    onChange([selectedStructure, selectedCharacter, value]);
  }

  const handleRemoveClick = () => {
    onRemove();
  }

  return (
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
      loading={loading}
      disabled={loading}
      value={structure}
      onChange={handleStructureSelect}
    />
    <Dropdown
      placeholder='Character'
      search
      selection
      options={characters}
      disabled={loading}
      loading={loading}
      value={character}
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
        value={values}
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

    </FacetRow>
  )

}