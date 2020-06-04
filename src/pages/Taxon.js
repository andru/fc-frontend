import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";  
import { Dropdown, List, Placeholder, Loader, Label } from "semantic-ui-react";
import { FillBox, ScrollingFillBox } from "components/ui/Box";

const Container = styled(FillBox)`
  
`;

const TaxonPlaceholder = styled(({className, children, ...props}) => (
  <Placeholder fluid className={className}>
    {new Array(20).fill(true).map(a => (<Placeholder.Header>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>))}
  </Placeholder>
))`
`;

const TaxonContainer = styled.main`
  margin-top: 30px;
`;

const TaxonId = styled.header`
  display: flex;
  flex-direction: row;
`;
const TaxonName = styled.h1`
  flex: 1;
`;
const TaxonAuthority = styled.h4`

`;

function Taxon({actions}) {
  const { getTaxonById } = actions;
  const { id } = useParams();
  const [ isLoading, setLoading ] = useState(true);
  const [ taxonData, setTaxonData ] = useState(undefined)

  useEffect(() => {
    async function load() {
      const taxon = await getTaxonById(id);
      setTaxonData(taxon[0]);
      setLoading(false);
    }
    load();
  }, [id]);

  function renderTaxon () {
    return <TaxonContainer>
      <TaxonId>
        <TaxonName>{taxonData.name}</TaxonName>
        <TaxonAuthority>{taxonData.taxonAuthority}</TaxonAuthority>
      </TaxonId>
      {taxonData.parentTaxon && <h4><Link to={`/taxon/${taxonData.parentTaxon.value}`}>{taxonData.parentTaxon.label}</Link></h4>}
      {taxonData.family && <h4><Link to={`/taxon/${taxonData.family.value}`}>{taxonData.family.label}</Link></h4>}
      <em>{taxonData.commonName || 'No common name'}</em>

    </TaxonContainer>
  }

  return (
    <Container>
      {isLoading 
      ? <TaxonPlaceholder />
      : renderTaxon()}
    </Container>
  );
}

export default Taxon;
