import React from 'react';

export const ScrollArea = ({ children, className }) => {
  return (
    <div className={`overflow-y-auto ${className}`} style={{ maxHeight: '300px' }}>
      {children}
    </div>
  );
};

