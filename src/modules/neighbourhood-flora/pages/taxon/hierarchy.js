import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { Popup } from 'semantic-ui-react';

import { fetchHigherTaxa, fetchSubTaxa } from 'actions/floracommons/taxa-hierarchy'
import EntityLabel from 'components/wikibase-entity-label';
import LayoutWidth from 'components/layout-width';

const Section = styled.div`
  background: #fff;
`;
const List = styled.ul`
  display: flex;
  flex-direction: row;
  justify-items: left;
  list-style: none;
  padding: 0;
  margin: 0;
`;
const Taxon = styled.li`
  padding: 0;
  margin: 0 2em 0 0;

`;
const Name = styled.div`

`;
const Rank = styled.div`
  font-size: 0.7em;
  text-transform: uppercase;
`;
const SubTaxaLink = styled.span`
  cursor: pointer;
  color: #4183c4;
`;
const SubTaxa = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const SubTaxon = styled.li`
  margin: 0;
  padding: 0;
`;

export default function TaxonHierarchy (props) {
  const {taxonId} = props;
  const [hierarchy, setHierarchy] = useState(undefined)
  const [subTaxa, setSubTaxa] = useState(undefined)

  useEffect(() => {
    setHierarchy(undefined);
    setSubTaxa(undefined);
    fetchHigherTaxa(taxonId).then(hierarchy => {
      setHierarchy(hierarchy);
    })
    fetchSubTaxa(taxonId).then(res => {
      setSubTaxa(res)
    })
  }, [taxonId])
  return (
    <Section>
      <LayoutWidth>
        <List>
          {hierarchy 
            ? hierarchy.map(({id, rank, distance}) => 
              <Taxon key={id}>
                <Rank><EntityLabel id={rank} /></Rank>
                <Name>{id === taxonId ? <EntityLabel id={id} /> : <Link to={`/taxon/${id}`}><EntityLabel id={id} /></Link>}</Name>
              </Taxon>)
            : 'Loading'
          }
          <Taxon>
            <Rank>Lower Taxa</Rank>
            <Name>{subTaxa !== undefined
            ? <SubTaxaPopUp taxa={subTaxa} />
            : '...'}
            </Name>
          </Taxon>
        </List>
      </LayoutWidth>
    </Section>
  )
}

function SubTaxaPopUp (props) {
  const {taxa} = props
  if (!taxa.length) {
    return 'None';
  }
  return (
  <Popup
    trigger={<SubTaxaLink>{`${taxa.length} lower taxa`}</SubTaxaLink>}
    on='click'
    position='bottom left'
  >
    <SubTaxa>{taxa.map(taxon => <SubTaxon><Link to={`/taxon/${taxon.taxon}`}>{taxon.name}</Link></SubTaxon>)}</SubTaxa>
  </Popup>);
}

