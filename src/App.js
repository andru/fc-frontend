
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
  NavLink,
  useRouteMatch,
  useLocation,
} from "react-router-dom";
import {Helmet} from "react-helmet";
import { Segment, Dimmer, Loader, Image, Menu, Modal, Input, Icon } from "semantic-ui-react";
import styled, { css } from "styled-components";
import { Main, Box, FillBox } from "components/ui/Box";
import theme from "./theme";
import "semantic-ui-css/semantic.min.css";

import actions from "./actions/index.js";

import HeaderSearch from "components/taxon-name-search";
import LayoutWidth from "components/layout-width";
import Sidebar from "components/sidebar";

import Home from "pages/Home";
import StructureCharacterSearch from "pages/structure-character";
import FacetedSearch from "pages/faceted-search";
import Taxon from "pages/taxon";
import TaxonHierarchy from "pages/hierarchy";

import MapTest from "pages/MapTest";

import Neighbourhood from "modules/neighbourhood-flora/pages";


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

  /* border-bottom: 2px solid #ccc; */
  background: #b5d8a3;

  /* @media only screen and (min-width: 1400px) {
    width: 1200px;
  } */
`;

const HeaderLayoutWidth = styled(LayoutWidth)`
  display: flex;
  justify-content: center;
  padding: 10px 10px 0 10px;
`;

const AppMain = styled.main`
  grid-area: main;
  display: flex;
  justify-self: center;
  justify-content: center;
  width: 100vw;
`;

const AppTitle =  styled.h1`
  font-size: 1.4em;
  white-space: nowrap;
  margin: 0 20px 0 0;

  a {
    color: #333;
  }
`;

const ModuleTitle =  styled.h1`
  font-size: 1.4em;
  white-space: nowrap;
  margin: 0 20px 0 20px;
  flex: 1 0 auto;
  text-align: center;

  a {
    color: #333;
  }
`;

const AppSearch = styled.div`

`;
const AppSearchInput = styled(Input)``;

const HeaderNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-self: center;
  flex: 1;
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

const ModuleNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-self: center;
  flex: 1;
`;

const ModuleBaseNavItem = styled(NavLink)`
  margin-bottom: -2px;
  padding: 10px 20px;

  font-size: 16px;
  color: #555;

  &:hover {
    color: #333;
  }
`;

const ModuleNavItem = styled(({ className, ...props }) => (
  <BaseNavItem {...props} activeClassName={className} />
))`
  border-bottom: 2px solid #111;
  color: #111;
  font-weight: bold;
`;

const SidebarToggle = styled(({className, actions, ...props}) => (<Icon name="sidebar" size="big" className={className} onClick={actions.toggleSidebar} />))`
  cursor: pointer;
`;


function App() {
  const [isFetching, setIsFetching] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [sidebarIsOpen, setSidebarOpen] = useState(false);

  actions.toggleSidebar = () => {
    setSidebarOpen(!sidebarIsOpen);
  }

  return (
    <Router>
      <Helmet>
        <title>Canadian Flora Commons</title>
      </Helmet>
      <Sidebar isOpen={sidebarIsOpen} onClose={() => setSidebarOpen(false)}>
        <Module isFetching={isFetching} />
      </Sidebar>
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


function Module (props) {

  const {isFetching } = props;
  const location = useLocation()
  let { path, url } = useRouteMatch(location.pathname);

  // quick hack for module based on url path
  const modulesByPath = [
    ['my-neighbourhood-flora', {
      path: '/my-neighbourhood-flora', 
      title: 'My Neighbourhood Flora'
    }]
  ];
  console.log(url);
  const [p, module] = modulesByPath.find(([pathMatch, module]) => path.match(pathMatch)) ?? ['/', {title: "Canadian Flora Commons", path: '/'}]

  return <AppGrid>
          <Helmet>
        <title>{module.title}</title>
      </Helmet>
  <AppHeader gridArea="header">
    <HeaderLayoutWidth>
      <SidebarToggle actions={actions} />
      <AppTitle><Link to="/">CFC</Link></AppTitle>
      <ModuleTitle><Link to={module.path}>{module.title}</Link></ModuleTitle>
      {/* <HeaderNav direction="row">
        <NavItem to="/" exact>
          <Icon name="home" />Home
        </NavItem>
        <NavItem to="/faceted-search" >
          <Icon name="search" />Faceted Search
        </NavItem>
        <NavItem to="/taxon-hierarchy" >
          <Icon name="tree" />Hierarchy
        </NavItem>
        <NavItem to="/map-test" >
          <Icon name="map" />Map Test
        </NavItem>
      </HeaderNav> */}
      <AppSearch>
        <HeaderSearch actions={actions} />
      </AppSearch>
    </HeaderLayoutWidth>
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
        <Route path="/taxon-hierarchy" children={() => (
          <TaxonHierarchy actions={actions} />
        )}
        />
        <Route path="/taxon/:id">
          <Taxon actions={actions} />
        </Route>

        <Route path="/map-test" children={() => (
          <MapTest actions={actions} />
        )}
        />
        <Route path="/my-neighbourhood-flora" children={() => (
          <Neighbourhood actions={actions} />
        )}
        />
      </Switch>
  </AppMain>
</AppGrid>
}