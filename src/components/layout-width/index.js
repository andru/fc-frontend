import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;

  @media only screen and (min-width: 1400px) {
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
`;

export default function LayoutWidth (props) {
  return (
    <Container {...props}>{props.children}</Container>
  )
}