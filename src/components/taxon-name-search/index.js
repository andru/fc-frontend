import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Search } from "semantic-ui-react";
import { debounce } from "lodash";


export default function TaxonNameSearch ({actions}) {
  const {
    searchTaxaByName
  } = actions;

  const history = useHistory();
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]);
  const [searchValue, setSearchValue] = useState('');


  const handleSearchChange = (e, { value }) => {
    setSearchValue(value);
    if (value.length > 3) {
      setIsFetching(true);
      debounceSearch(value);
    } else {
      // reset results from a previous search 
      if (results.length) {
        setResults([]);
      }
    }
  };
  const doSearch = async (value) => {
    console.log("Searching", value);
    const data = await searchTaxaByName(value);
    console.log('Search res', data);
    setResults(data.map(result => ({
      id: result.taxon.value,
      title: result.taxon.name
    })));
    setIsFetching(false);
  }
  const debounceSearch = useCallback(debounce(doSearch, 600), []);

  const handleResultSelect = (e, {result}) => {
    // debouncedSearchChangeHandler.cancel();
    history.push(`/taxon/${result.id}`)
  }
  
  return (
    <Search 
      loading={isFetching}
      minCharacters={4}
      onResultSelect={handleResultSelect}
      onSearchChange={handleSearchChange}
      results={results}
      value={searchValue}
      selectFirstResult={true}
      showNoResults={!isFetching && !results.length}
    />
  )
}