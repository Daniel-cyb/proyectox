// components/SearchInput.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SearchInput = ({ variant, onSubmit, keyword }) => {
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(searchKeyword);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
};

SearchInput.propTypes = {
  variant: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  keyword: PropTypes.string.isRequired,
};

export default SearchInput;


