import React from 'react';
import styled from 'styled-components';
import { Button, Popup } from "semantic-ui-react";
import EntityLabel from "components/wikibase-entity-label";

export default function ProvenanceFilter (props) {
  const {
    provenances,
    onChange
  } = props;

  const toggleProvenance = (provId) => {
    onChange({
      ...provenances,
      [provId]: !provenances[provId]
    })
  }

  return (
    <Popup
      trigger={
        <Button color='green' icon='filter' content='Filter Sources' />
      }
      content={Object.keys(provenances).map((provId) => <div><label><input type="checkbox" checked={provenances[provId]} onChange={(ev) => toggleProvenance(provId)} /> <EntityLabel id={provId} /></label></div>)}
      on='click'
      position='bottom left'
      />
    )
}