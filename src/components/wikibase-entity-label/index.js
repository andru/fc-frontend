import React, {useState, useEffect} from "react";
import TextPlaceholder from "components/text-placeholder";
import fetchEntityLabel from "actions/wikibase/fetch-entity-label"

export default function EntityLabel ({id, children}) {
  const [isLoaded, setLoaded] = useState(false);
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(children || '');
    setLoaded(false);
    if (id) {
      fetchEntityLabel(id).then(label => {
        setLabel(label);
        setLoaded(true);
      });
    } else {
      
    }
  }, [id])
  return <span>{isLoaded ? label : <TextPlaceholder />}</span>
} 