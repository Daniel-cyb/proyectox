import React, { useState } from 'react';

export const Slider = ({ min, max, value, onChange }) => {
  const [sliderValue, setSliderValue] = useState(value);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSliderValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={sliderValue}
        onChange={handleChange}
        className="slider"
      />
      <span>{sliderValue}</span>
    </div>
  );
};
