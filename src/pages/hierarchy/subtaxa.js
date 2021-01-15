import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { Placeholder, Loader, Icon } from "semantic-ui-react";
import {Link} from 'react-router-dom';

import { fetchSubTaxa } from "actions/floracommons/taxa-hierarchy";

const Wrapper = styled.div`
  margin-bottom: 1em;
`;
const Taxa = styled.ul`
  /* margin-bottom: 1.5em; */
  list-style: none;
`;
const Taxon = styled.li`
  font-size: 0.95em;
  ${({depth}) => depth < 2 && `margin-bottom: 1em;`}
`;
const TaxonLeaf = styled.div`
`;
const NumSubTaxa = styled.span`
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;

  width: 20px;
  text-align: center;

  color: #aaa;

  &:hover{
    background: #ddd;
  }
`;

export default function SubTaxa (props) {
  const { of, depth=1 } = props

  useEffect(()=>{
    setTaxa(undefined);
    fetchSubTaxa(of).then(res => {
      setTaxa(res)
    })
  }, [of]);

  const [taxa, setTaxa] = useState(undefined);
  const [openTaxa, setOpenTaxa] = useState([]);

  const updateOpenTaxa = taxon => {
    setOpenTaxa(oldOpenTaxa => {
      const openTaxa = [...oldOpenTaxa];
      if (openTaxa.indexOf(taxon.taxon) > -1) {
        openTaxa.splice(openTaxa.indexOf(taxon.taxon));
      } else {
        openTaxa.push(taxon.taxon);
      }
      console.log(openTaxa);
      return openTaxa;
    })
  }

  const handleTaxonClick = (ev, taxon) => {
    updateOpenTaxa(taxon)
  }

  return (
    <Wrapper>{taxa === undefined 
      ? <Loader />
      : <Taxa>
        {taxa.map(taxon => (
        <Taxon key={taxon.taxon} depth={depth}>
           <TaxonLeaf>
             {taxon.numSubTaxa 
              ? <NumSubTaxa onClick={(ev) => handleTaxonClick(ev,taxon)}>{/*taxon.numSubTaxa*/} <Icon name="angle down" /></NumSubTaxa>
              : <NumSubTaxa />
            }
             <Link to={`/taxon/${taxon.taxon}`}>{taxon.name}</Link> 
           </TaxonLeaf>
          {openTaxa.indexOf(taxon.taxon) > -1 && taxon.numSubTaxa > 0 && <SubTaxa of={taxon.taxon} depth={depth+1} />}
        </Taxon>))}
      </Taxa>
    }</Wrapper>
  )
}