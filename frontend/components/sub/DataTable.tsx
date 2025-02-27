import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Column {
  accessor: string;
  label: string;
  type?: string;
}

interface CustomTableProps {
  apiUrl: string;
  columns: Column[];
  searchKey: string;
}

const CustomTable: React.FC<CustomTableProps> = ({ apiUrl, columns, searchKey }) => {
  const [data, setData] = useState<any[]>([]); // Datos originales
  const [filteredData, setFilteredData] = useState<any[]>([]); // Datos filtrados
  const [loading, setLoading] = useState(true); // Estado de carga
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(5); // Items por página

  // Obtener los datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl);
        console.log('Datos obtenidos:', response.data);
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Filtrar los datos según el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter((item) =>
        item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data, searchKey]);

  // Cálculo de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-blue-500 font-bold">Cargando datos...</p>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return <p className="text-center mt-4 text-gray-600">No se encontraron resultados.</p>;
  }

  return (
    <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Tabla de Datos</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder={`Buscar por ${searchKey}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
      />

      {/* Tabla de datos */}
      <table className="table-auto w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-cyan-900 text-white">
            {columns.map((col) => (
              <th key={col.accessor} className="px-4 py-2">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-100 transition duration-200">
              {columns.map((col) => (
                <td key={col.accessor} className="border px-4 py-2">
                  {col.type === 'link' ? (
                    <a
                      href={item[col.accessor]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      Ver
                    </a>
                  ) : (
                    item[col.accessor] || 'N/A'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-4 py-2 mx-1 rounded-lg ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomTable;
