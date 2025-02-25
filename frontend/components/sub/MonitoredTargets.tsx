import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Target {
  id: string;
  brandName: string;
  domain?: string;
  vipName?: string;
  createdAt: string;
}

const MonitoredTargets = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para paginación
  const [targetsPerPage] = useState(5); // Cantidad de objetivos por página

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await axios.get('/api/monitored-targets');
        setTargets(response.data.targets);
      } catch (error) {
        console.error('Error al obtener los objetivos monitoreados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  // Filtrar los objetivos en base al término de búsqueda
  const filteredTargets = targets.filter((target) =>
    target.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener los objetivos actuales para la página
  const indexOfLastTarget = currentPage * targetsPerPage;
  const indexOfFirstTarget = indexOfLastTarget - targetsPerPage;
  const currentTargets = filteredTargets.slice(indexOfFirstTarget, indexOfLastTarget);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-blue-500 font-bold">Cargando objetivos monitoreados...</p>
      </div>
    );
  }

  if (targets.length === 0) {
    return <p className="text-center mt-4 text-gray-600">No hay objetivos monitoreados actualmente.</p>;
  }

  return (
    <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Objetivos Monitoreados</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre de marca..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
      />

      {/* Tabla de objetivos */}
      <table className="table-auto w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-cyan-900 text-white">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Nombre de la Marca</th>
            <th className="px-4 py-2">Dominio</th>
            <th className="px-4 py-2">VIP</th>
            <th className="px-4 py-2">Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {currentTargets.map((target) => (
            <tr key={target.id} className="hover:bg-gray-100 transition duration-200">
              <td className="border px-4 py-2">{target.id}</td>
              <td className="border px-4 py-2">{target.brandName}</td>
              <td className="border px-4 py-2">{target.domain || 'N/A'}</td>
              <td className="border px-4 py-2">{target.vipName || 'N/A'}</td>
              <td className="border px-4 py-2">{new Date(target.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredTargets.length / targetsPerPage) }, (_, i) => (
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

export default MonitoredTargets;
