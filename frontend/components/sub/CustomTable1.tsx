"use client";

import React, { useState, useEffect } from "react";

interface TableProps {
  data: any[];
  columns: { label: string; accessor: string; type?: string }[];
  searchKey: string;
  onRowClick?: (row: any) => void;
}

const CustomTable = ({ data, columns, searchKey, onRowClick }: TableProps) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Filtrar datos por búsqueda
  useEffect(() => {
    const filtered = data.filter((item) =>
      item[searchKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, [searchTerm, data, searchKey]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 mx-1 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
      >
        &laquo;
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => paginate(page)}
          className={`px-3 py-1 mx-1 rounded-lg ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 mx-1 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
      >
        &raquo;
      </button>
    </div>
  );

  if (data.length === 0) {
    return <p className="text-center mt-4 text-gray-600">No se encontraron resultados.</p>;
  }

  return (
    <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Tabla de Datos</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder={`Buscar por ${searchKey}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
      />

      {/* Tabla de datos */}
      <table className="table-auto w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-800 text-white">
            {columns.map((col) => (
              <th key={col.accessor} className="px-4 py-2 text-left">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-100 cursor-pointer transition"
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col) => (
                <td key={col.accessor} className="border px-4 py-2">
                  {col.type === "link" ? (
                    <a
                      href={item[col.accessor]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver
                    </a>
                  ) : Array.isArray(item[col.accessor]) ? (
                    item[col.accessor].join(", ")
                  ) : (
                    item[col.accessor] || "N/A"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {renderPagination()}
    </div>
  );
};

export default CustomTable;
