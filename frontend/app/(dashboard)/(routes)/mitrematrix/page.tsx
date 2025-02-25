"use client";
// ./app/(dashboard)/(routes)/analist/page.tsx
import React from 'react';
import MitreMatrix from "@/components/MitreMatrix";

const Home = () => {
  return (
    <div>
      <h1>MITRE ATT&CK Matrix</h1>
      <MitreMatrix />
    </div>
  );
};

export default Home;
