
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
  NavLink,
} from "react-router-dom";
import {Helmet} from "react-helmet";
import { Segment, Dimmer, Loader, Image, Menu, Modal, Input, Icon } from "semantic-ui-react";
import styled, { css } from "styled-components";
import actions from "actions";
import { Main, Box, FillBox } from "components/ui/Box";
import theme from "./theme";
import "semantic-ui-css/semantic.min.css";

import HeaderSearch from "components/taxon-name-search";

import Home from "pages/Home";
import StructureCharacterSearch from "pages/structure-character";
import FacetedSearch from "pages/faceted-search";
import Taxon from "pages/taxon";



const AppGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header"
    "main";
`;

const AppHeader = styled.header`
  grid-area: header;
  display: flex;
  justify-content: center;
  
  padding: 10px 10px 0 10px;
  border-bottom: 2px solid #ccc;
  background: #fff;
`;

const AppMain = styled.main`
  grid-area: main;
  display: flex;
  justify-self: center;
  width: 95%;

  @media only screen and (min-width: 1400px) {
    width: 1200px;
  }
`;

const AppTitle =  styled.h1`
  font-size: 1.4em;
  white-space: nowrap;
  margin-right: 20px;
`;

const AppSearch = styled.div`

`;
const AppSearchInput = styled(Input)``;

const HeaderNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-self: center;
  width: 95%;

  @media only screen and (min-width: 1400px) {
    width: 1200px;
  }
`;

const BaseNavItem = styled(NavLink)`
  margin-bottom: -2px;
  padding: 10px 20px;

  font-size: 16px;
  color: #555;

  &:hover {
    color: #333;
  }
`;

const NavItem = styled(({ className, ...props }) => (
  <BaseNavItem {...props} activeClassName={className} />
))`
  border-bottom: 2px solid #111;
  color: #111;
  font-weight: bold;
`;



function App() {
  const [isFetching, setIsFetching] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <Router>
      <Helmet>
        <title>FloraCommons</title>
      </Helmet>
      <AppGrid>
        <AppHeader gridArea="header">
          <AppTitle>Flora Commons</AppTitle>
          <HeaderNav direction="row">
            <NavItem to="/" exact>
              <Icon name="home" />Home
            </NavItem>
            <NavItem to="/faceted-search" >
              <Icon name="search" />Faceted Search
            </NavItem>
          </HeaderNav>
          <AppSearch>
            <HeaderSearch actions={actions} />
          </AppSearch>
        </AppHeader>
        <AppMain gridArea="main">
          {isFetching && (
            <Segment>
              <Dimmer active={isFetching} page>
                <Loader size="massive">Loading</Loader>
              </Dimmer>
            </Segment>
          )}
            <Switch>
              <Route exact path="/">
                <Home actions={actions} />
              </Route>
              <Route path="/structure-character-search"><Redirect to="/morphology-facets" /></Route>
              <Route path="/morphology-facets" children={() => (
                <StructureCharacterSearch actions={actions} />
              )}
              />
              <Route path="/faceted-search" children={() => (
                <FacetedSearch actions={actions} />
              )}
              />
              <Route path="/taxon/:id">
                <Taxon actions={actions} />
              </Route>
            </Switch>
        </AppMain>
      </AppGrid>
      <Modal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        basic
        size='fullscreen'
      >
        <Modal.Content>This is a modal yo
        </Modal.Content>
        {/* <Modal.Actions>
          <Button color='green' onClick={this.handleClose} inverted>
            <Icon name='checkmark' /> Got it
          </Button>
        </Modal.Actions> */}
      </Modal>
    </Router>
  );
}

export default App;
