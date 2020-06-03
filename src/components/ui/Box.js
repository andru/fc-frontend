import styled from "styled-components";

export const Box = styled.div`
  display: flex;
  flex-direction: column;

  ${({fill}) => fill && `flex: 1;`}
`;
export const FillBox = styled(Box)`
  flex: 1 1 auto;
`;
export const ScrollingFillBox = styled(Box)`
  flex: 1 1 auto;
  overflow-y: scroll;
`;
export const Main = styled(ScrollingFillBox)``;