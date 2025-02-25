import React, { useState } from 'react';

export function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <div className="tabs-list flex">
        {React.Children.map(children, (child, index) => (
          <button
            key={index}
            className={`tab-trigger ${activeTab === index ? 'active-tab' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {React.Children.map(children, (child, index) => (
          activeTab === index && <div key={index}>{child}</div>
        ))}
      </div>
    </div>
  );
}

export function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ isActive, children, onClick }) {
  return (
    <button onClick={onClick} className={isActive ? 'active-tab' : ''}>
      {children}
    </button>
  );
}

export function TabsContent({ children }) {
  return <div>{children}</div>;
}
