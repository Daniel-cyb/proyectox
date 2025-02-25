// components/MitreTable.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './MitreTable.css'; // Asegúrate de que el archivo CSS esté en la misma carpeta

const MitreTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/data/enterprise-attack.json');
      const attackPatterns = response.data.objects.filter(item => item.type === 'attack-pattern');
      setData(attackPatterns);
      setFilteredData(attackPatterns);
    };

    fetchData();
  }, []);

  useEffect(() => {
    createTable(filteredData);
  }, [filteredData]);

  const createTable = (data) => {
    const table = d3.select(tableRef.current);
    table.selectAll("*").remove(); // Clear any previous content

    const thead = table.append('thead');
    const tbody = table.append('tbody');

    // Define columns
    const columns = ['ID', 'Name', 'Type', 'Description'];

    // Append header row
    thead.append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text(column => column);

    // Create a row for each object in the data
    const rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // Create a cell in each row for each column
    rows.selectAll('td')
      .data(row => columns.map(column => {
        switch (column) {
          case 'ID':
            return row.id;
          case 'Name':
            return row.name;
          case 'Type':
            return row.type;
          case 'Description':
            return row.description;
          default:
            return '';
        }
      }))
      .enter()
      .append('td')
      .text(d => d);
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div>
      <h1>Enterprise ATT&CK</h1>
      <input 
        type="text" 
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by name or description" 
        className="search-bar"
      />
      <table ref={tableRef} className="mitre-table"></table>
    </div>
  );
};

export default MitreTable;
