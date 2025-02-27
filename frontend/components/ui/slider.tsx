import React, { useState } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (newValue: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ min, max, value, onChange }) => {
  const [sliderValue, setSliderValue] = useState<number>(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
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
