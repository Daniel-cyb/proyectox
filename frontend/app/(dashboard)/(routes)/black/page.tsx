"use client";
import { useEffect, useState } from 'react';

interface ListaNegraData {
  id: string;
  ioc: string;
  threat_type: string;
  ioc_type: string;
  malware: string;
  confidence_level: number;
  first_seen: string;
  last_seen: string | null;
}

const ListaNegraResults = () => {
  const [blacklistData, setBlacklistData] = useState<ListaNegraData[]>([]);
  const [filteredData, setFilteredData] = useState<ListaNegraData[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener los datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/listas_negras');
        const data = await response.json();
        setBlacklistData(data);
        setFilteredData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    let filtered = blacklistData;

    if (startDate && endDate) {
      filtered = blacklistData.filter(entry => {
        const entryDate = new Date(entry.first_seen);
        return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [startDate, endDate]);

  const resetFilter = () => {
    setFilteredData(blacklistData);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6 font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-center mb-6 text-2xl font-bold">Lista Negra - Resultados</h1>

      {/* Filtro por Fecha */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap flex-1">
          <label className="mr-6 mb-4 sm:mb-0">
            Start Date:
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="ml-3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </label>
          <label>
            End Date:
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="ml-3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </label>
        </div>
        <div className="flex flex-wrap justify-center">
          <button onClick={handleFilter} className="ml-6 p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg mb-4 sm:mb-0">
            Apply Filter
          </button>
          <button onClick={resetFilter} className="ml-4 p-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg">
            Reset Filter
          </button>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-gray-200 dark:bg-gray-800 overflow-auto max-h-96">
        <h2 className="text-center text-xl text-blue-600 dark:text-blue-400">All Lista Negra Data</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">ID</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">IOC</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">Threat Type</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">Malware</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">Confidence Level</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">First Seen</th>
              <th className="border p-3 bg-gray-700 dark:bg-gray-900 text-white">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry, index) => (
              <tr key={index}>
                <td className="border p-3">{entry.id}</td>
                <td className="border p-3">{entry.ioc}</td>
                <td className="border p-3">{entry.threat_type}</td>
                <td className="border p-3">{entry.malware}</td>
                <td className="border p-3">{entry.confidence_level}</td>
                <td className="border p-3">{new Date(entry.first_seen).toLocaleString()}</td>
                <td className="border p-3">{entry.last_seen ? new Date(entry.last_seen).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaNegraResults;
