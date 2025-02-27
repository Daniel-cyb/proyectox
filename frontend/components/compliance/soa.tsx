"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface SOADocument {
  _id: string;
  _source: {
    [key: string]: any;
  };
}

interface Errors {
  [key: string]: string;
}

const SOAComponent: React.FC = () => {
  const [soaData, setSoaData] = useState<SOADocument[]>([]); // Almacena los datos de SOA
  const [errors, setErrors] = useState<Errors>({}); // Estado para manejar los errores de validación

  // Obtener los datos desde la API
  const fetchAllSOA = async (): Promise<void> => {
    try {
      const response = await axios.get("http://localhost:3026/api/search");
      setSoaData(response.data.hits.hits);
    } catch (error) {
      console.error("Error fetching SOA data:", error);
    }
  };

  // Función para manejar la actualización de campos
  const handleFieldChange = (documentId: string, field: string, value: any): void => {
    const updatedData = soaData.map((document) => {
      if (document._id === documentId) {
        return {
          ...document,
          _source: {
            ...document._source,
            [field]: value,
          },
        };
      }
      return document;
    });
    setSoaData(updatedData);
  };

  // Validar los campos antes de enviar la actualización
  const validateFields = (document: SOADocument): boolean => {
    const newErrors: Errors = {};

    if (!document._source["Aplica"]) {
      newErrors["Aplica"] = "Este campo es obligatorio";
    }
    if (!document._source["Implementado SI / NO"]) {
      newErrors["Implementado SI / NO"] = "Este campo es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  // Enviar la actualización a la API
  const handleUpdate = async (document: SOADocument): Promise<void> => {
    if (validateFields(document)) {
      try {
        await axios.post(`http://localhost:3026/api/update/${document._id}`, document._source);
        alert("Datos actualizados con éxito");
        fetchAllSOA(); // Volver a cargar los datos
      } catch (error) {
        console.error("Error updating SOA data:", error);
        alert("Error actualizando los datos");
      }
    } else {
      alert("Por favor, corrige los errores antes de enviar.");
    }
  };

  useEffect(() => {
    fetchAllSOA(); // Cargar los datos al iniciar el componente
  }, []);

  return (
    <div>
      <h1>Declaración de Aplicabilidad ISO 27001</h1>
      <table className="table-auto w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-cyan-900 text-white">
            <th>Cláusula</th>
            <th>Sección</th>
            <th>Objetivo de Control / Control</th>
            <th>Descripción del Control</th>
            <th>Implementado SI / NO</th>
            <th>Aplica</th>
            <th>Justificación de la inclusión o exclusión</th>
            <th>Soporte/Evidencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {soaData.map((document, idx) => (
            <tr key={idx} className="hover:bg-gray-100 transition duration-200">
              <td>{document._source["Cláusula"] || ""}</td>
              <td>{document._source["Sección"] || ""}</td>
              <td>{document._source["Objetivo de Control / Control"] || ""}</td>
              <td>{document._source["Descripción del Control"] || ""}</td>
              <td>
                <select
                  value={document._source["Implementado SI / NO"] || ""}
                  onChange={(e) =>
                    handleFieldChange(document._id, "Implementado SI / NO", e.target.value)
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <select
                  value={document._source["Aplica"] || ""}
                  onChange={(e) =>
                    handleFieldChange(document._id, "Aplica", e.target.value)
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  value={document._source["Justificación de la inclusión o exclusión"] || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      document._id,
                      "Justificación de la inclusión o exclusión",
                      e.target.value
                    )
                  }
                  className="p-2 border rounded"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={document._source["Soporte/Evidencia"] || ""}
                  onChange={(e) =>
                    handleFieldChange(document._id, "Soporte/Evidencia", e.target.value)
                  }
                  className="p-2 border rounded"
                />
              </td>
              <td>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => handleUpdate(document)}
                >
                  Guardar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SOAComponent;
