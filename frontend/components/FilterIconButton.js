// components/FilterIconButton.js
import React from 'react';
import PropTypes from 'prop-types';

const FilterIconButton = ({ filters, handleRemoveFilter }) => {
  return (
    <div>
      {Object.keys(filters).map((filterKey) => (
        <button key={filterKey} onClick={() => handleRemoveFilter(filterKey)}>
          {filterKey}
        </button>
      ))}
    </div>
  );
};

FilterIconButton.propTypes = {
  filters: PropTypes.object.isRequired,
  handleRemoveFilter: PropTypes.func.isRequired,
};

export default FilterIconButton;
