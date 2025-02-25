"use client";
// ./app/(dashboard)/(routes)/analist/page.tsx
import React from 'react';
import MitreTable from "@/components/MitreTable";

const Home = () => {
  return (
    <div>
      <h1>MITRE ATT&CK Matrix</h1>
      <MitreTable />
    </div>
  );
};

export default Home;
