import React, { useState, useEffect } from "react";
import styled from "styled-components";  
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "./ui/Box";

const Container = styled(FillBox)`
  
`;

function Home({actions}) {
  return (
    <Container>
      Welcome to Flora Commons.
    </Container>
  );
}

export default Home;
