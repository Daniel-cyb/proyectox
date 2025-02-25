import React, { useState } from 'react';
import axios from 'axios';

const SocialMediaMonitoring = () => {
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('');
  const [id, setId] = useState(''); // Nuevo estado para el ID del objetivo

  // Función genérica para manejar cambios en los inputs
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(event.target.value);
  };

  // Función para crear un nuevo monitoreo
  const handleSubmit = async () => {
    try {
      if (!username) {
        alert('El nombre de la marca es requerido');
        return;
      }

      const response = await axios.post('/api/monitor', {
        username,
        domain,
      });

      alert(`Monitoreando usuario o marca: ${response.data.data.brandName}`);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Hubo un error al intentar monitorear la marca o usuario.');
    }
  };

  // Función para modificar un objetivo existente
  const handleUpdate = async () => {
    try {
      if (!id) {
        alert('El ID del objetivo es requerido para modificar.');
        return;
      }

      const response = await axios.put('/api/monitor', {
        id,
        username,
        domain,
      });

      alert(`Objetivo actualizado: ${response.data.data.brandName}`);
    } catch (error) {
      console.error('Error al modificar el objetivo:', error);
      alert('Hubo un error al intentar modificar el objetivo.');
    }
  };

  // Función para eliminar un objetivo existente
  const handleDelete = async () => {
    try {
      if (!id) {
        alert('El ID del objetivo es requerido para eliminar.');
        return;
      }

      await axios.delete('/api/monitor', {
        data: { id },
      });

      alert('Objetivo eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el objetivo:', error);
      alert('Hubo un error al intentar eliminar el objetivo.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-sky-600">Brand Monitoring</h2>
      <p className="text-gray-600 mb-4 text-center">Ingresa el usuario o marca que deseas monitorear o modificar.</p>

      {/* Campo para ingresar el ID del objetivo (para modificar o eliminar) */}
      <input
        type="text"
        value={id}
        onChange={(e) => handleInputChange(e, setId)}
        placeholder="ID del objetivo (para modificar o eliminar)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
      />

      <input
        type="text"
        value={username}
        onChange={(e) => handleInputChange(e, setUsername)}
        placeholder="Ej. your brand"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
      />

      <input
        type="text"
        value={domain}
        onChange={(e) => handleInputChange(e, setDomain)}
        placeholder="Ej. domain.com"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4"
      />

      <div className="flex justify-between gap-4">
        {/* Botón para crear un nuevo monitoreo */}
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Iniciar Monitoreo
        </button>

        {/* Botón para modificar un objetivo */}
        <button
          onClick={handleUpdate}
          className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
        >
          Modificar
        </button>

        {/* Botón para eliminar un objetivo */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default SocialMediaMonitoring;
