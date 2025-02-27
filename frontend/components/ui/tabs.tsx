import React, { useState, ReactNode } from 'react';

interface TabsProps {
  children: ReactNode;
}

export function Tabs({ children }: TabsProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <div>
      <div className="tabs-list flex">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return (
              <button
                key={index}
                className={`tab-trigger ${activeTab === index ? 'active-tab' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {child.props.label}
              </button>
            );
          }
          return null;
        })}
      </div>
      <div className="tabs-content">
        {React.Children.map(children, (child, index) =>
          activeTab === index ? <div key={index}>{child}</div> : null
        )}
      </div>
    </div>
  );
}

export function TabsList({ children }: TabsProps) {
  return <div className="tabs-list">{children}</div>;
}

interface TabsTriggerProps {
  isActive: boolean;
  children: ReactNode;
  onClick: () => void;
}

export function TabsTrigger({ isActive, children, onClick }: TabsTriggerProps) {
  return (
    <button onClick={onClick} className={isActive ? 'active-tab' : ''}>
      {children}
    </button>
  );
}

export function TabsContent({ children }: TabsProps) {
  return <div>{children}</div>;
}
