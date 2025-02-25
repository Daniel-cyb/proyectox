import React, { useState, useEffect } from 'react';

interface TableProps {
  data: any[]; // Ahora recibe los datos directamente
  columns: { label: string; accessor: string; type?: string }[];
  searchKey: string; // Clave por la cual se hará la búsqueda
}

const CustomTable = ({ data, columns, searchKey }: TableProps) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [visiblePages, setVisiblePages] = useState([1]); // Páginas visibles

  useEffect(() => {
    const filtered = data.filter((item) =>
      item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setVisiblePages(generateVisiblePages(1, Math.ceil(filtered.length / itemsPerPage)));
  }, [searchTerm, data, searchKey]);

  // Generar páginas visibles
  const generateVisiblePages = (currentPage: number, totalPages: number) => {
    let pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (totalPages <= maxVisiblePages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      pages = Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    } else {
      pages = Array.from({ length: 5 }, (_, i) => startPage + i);
    }
    return pages;
  };

  // Obtener elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setVisiblePages(generateVisiblePages(pageNumber, Math.ceil(filteredData.length / itemsPerPage)));
  };

  if (data.length === 0) {
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
                    <a href={item[col.accessor]} target="_blank" rel="noopener noreferrer" className="text-blue-600">
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
        <button
          onClick={() => paginate(currentPage - 1)}
          className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-600"
          disabled={currentPage === 1}
        >
          &laquo;
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={`px-4 py-2 mx-1 rounded-lg ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          className="px-4 py-2 mx-1 rounded-lg bg-gray-200 text-gray-600"
          disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default CustomTable;
