import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Button, Icon, Dropdown, List, Placeholder, Loader, Label, Input, Card, Header} from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";
import { useHistory } from "react-router-dom";
import { isFinite } from "lodash";

const Container = styled.div`
  margin-bottom: 10px;
`;
const Title = styled(Header)`
  margin-bottom: 0;
`;

export default function ValueDropdownFacet (props) {
  const {
    title,
    helpText,
    values,
    selectedValues,
    multiple=false,
    loading,
    disabled,
    onChange,
  } = props;

  const handleValueChange = (e, {value}) => {
    onChange(value);
  }
   
  return (
  <Container>
    <Title as="h5">{title}</Title>
    <Dropdown
      placeholder='Values'
      multiple={multiple}
      search
      selection
      disabled={disabled}
      loading={loading}
      options={values.map(value => (typeof value === "string" ? {
        key: value,
        text: value,
        value: value,
      } : value))}
      value={selectedValues}
      onChange={handleValueChange}
    />
  </Container>
  )
}