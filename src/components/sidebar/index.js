import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {Icon, Segment, Sidebar, Menu} from 'semantic-ui-react';

const Container = styled.div`
  width:100vw;
  height:100vh;
  z-index: 9999;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.4);

  display: grid;
  grid-template-columns: max(25vw, 250px) 1fr;
  grid-template-areas:
    "bar bg";
`;
const Bar = styled.div`
  grid-area: bar;
  display: grid;
  grid-template-areas: 
    "controls"
    "menu"
  ;
  grid-template-rows: 50px 1fr;
  background-color: white;
`;
const Background = styled.div`
  grid-area: bg;
  backdrop-filter: blur(3px);
`;

const Header = styled.div`
  display:grid;
  grid-template-areas: "title controls";
  grid-template-columns: 1fr 50px;
  grid-template-rows: 50px;
`;
const AppTitle = styled.h1`
  grid-area: title;
  margin: 0;
  padding: 0;
  color: #fff;
  font-size: 1.4em;

  align-self: center;
  justify-self: center;
`;
const Close = styled((props) => (<Icon name="close" size="big" {...props} />))`
  cursor: pointer;

  grid-area: controls;
  justify-self: flex-end;
  align-self: center;

  color: #fff;
`;
const About = styled.p`
  color: #fff;
`;
const CFCMenu = styled(Menu)`
  &.ui.menu a.item {
    flex: 1 1 33%;
  }
`;
const MenuItem = styled.a`
  display: block;
`;

const Projects = styled.div`
margin-top: 100px;
`;
const ProjectsTitle = styled.h3`
  color: #fff;
`;

export default function WithSidebar (props) {
  const {isOpen, onClose, children} = props;
  return (<Sidebar.Pushable>
    <Sidebar
      as={Menu}
      animation='overlay'
      icon='labeled'
      inverted
      onHide={() => onClose()}
      vertical
      visible={isOpen}
      width='wide'
    >
      <Header>
        <AppTitle>Canada Flora Commons</AppTitle>
        <Close onClick={onClose} />
      </Header>
      <About>Introductory text with a clear, brief explanation as to what CFC is.</About>
      <CFCMenu horizontal inverted>
        <Menu.Item href="/">
          <Icon name='home' />
          Home
        </Menu.Item>
        <Menu.Item href="/faceted-search">
          <Icon name='search' />
          Faceted Search
        </Menu.Item>
        <Menu.Item href="/taxon-hierarchy">
          <Icon name='tree' />
          Taxon Hierarchy
        </Menu.Item>
      </CFCMenu>
      <Projects>
        <ProjectsTitle>Projects</ProjectsTitle>
        <Menu vertical inverted fluid>
          <Menu.Item href="/my-neighbourhood-flora">
            <Icon name='home' />
            <h4>My Neighbourhood Flora</h4>
            <p>Ever wanted to know what what growing right in your proverbial backyard? Introductory text etc etc.</p>
          </Menu.Item>
        </Menu>
      </Projects>
    </Sidebar>

    <Sidebar.Pusher dimmed={isOpen}>
      {children}
    </Sidebar.Pusher>
  </Sidebar.Pushable>
  );


  // return <Container style={{display: isOpen ? 'grid' : 'none'}}>
  //   <Bar>
  //     <Close onClick={onClose} />
  //     <Menu>
  //       <MenuItem to={`/my-neighbourhood-flora/`}>My Neighbourhood Flora</MenuItem>
  //     </Menu>
  //   </Bar> 
  //   <Background onClick={onClose} />
  // </Container>
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
}