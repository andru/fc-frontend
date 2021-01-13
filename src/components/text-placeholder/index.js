import React from 'react';
import styled, {keyframes} from 'styled-components';

const anim = keyframes`
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
`

const EllipsisAnim = styled.em``;
const EllipsisDot = styled.em`
  opacity: 0;
  animation: ${anim} 1s infinite;

  &:after {
    content: "."
  }
  &:nth-child(1) {
    -webkit-animation-delay: 0.0s;
    animation-delay: 0.0s;
  }
  &:nth-child(2) {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }
  &:nth-child(3) {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
`;






export default function TextLoadingAnimation (props) {
  return <EllipsisAnim {...props}><EllipsisDot /><EllipsisDot /><EllipsisDot /></EllipsisAnim>
}