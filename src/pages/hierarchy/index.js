import React, { useState, useEffect } from "react";
import styled from "styled-components";  
// import { Segment, Dropdown, List, Placeholder, Loader, Label, Button, Popup } from "semantic-ui-react";

import LayoutWidth from "components/layout-width";

import SubTaxa from "./subtaxa";

const HierarchyLayoutWidth = styled(LayoutWidth)`
  font-size: 1.3em;
`;

export default function TaxonHierarchy (props) {



  return (<HierarchyLayoutWidth>
    <SubTaxa />
  </HierarchyLayoutWidth>)
}

