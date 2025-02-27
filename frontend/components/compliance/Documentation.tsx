"use client";

import { useState, useEffect } from "react";

export default function Documentation() {
  const [documents, setDocuments] = useState<string[]>([]); // Lista de documentos cargados
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null); // Documento seleccionado
  const [uploadProgress, setUploadProgress] = useState(0); // Progreso de carga de archivos
  const [isUploading, setIsUploading] = useState(false); // Estado de carga de archivo

  // Función para obtener la lista de archivos cargados del servidor
  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3052/uploads");
      if (response.ok) {
        const files = await response.json();
        setDocuments(files);
      } else {
        throw new Error("Error al obtener los documentos");
      }
    } catch (error) {
      console.error("Error al obtener los documentos:", error);
    }
  };

  // Función para manejar la carga de archivos con tipado para el evento
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append("documents", file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.open("POST", "http://localhost:3052/upload", true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("Archivo subido correctamente");
          fetchDocuments(); // Actualizar la lista de documentos después de la subida exitosa
        } else {
          console.error("Error al subir el archivo");
        }
        setIsUploading(false);
      };
      xhr.send(formData);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setIsUploading(false);
    }
  };

  // Función para seleccionar un documento de la lista
  const handleSelectDocument = (file: string) => {
    setSelectedDocument(`http://localhost:3052/uploads/${file}`);
  };

  // Cargar la lista de documentos al cargar el componente
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parte izquierda: Lista de documentos */}
        <div className="border p-4">
          <h2 className="text-xl font-semibold mb-4">Document List</h2>
          <ul>
            {documents.map((file, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer ${
                  selectedDocument === `http://localhost:3052/uploads/${file}`
                    ? "bg-blue-200"
                    : ""
                }`}
                onClick={() => handleSelectDocument(file)}
              >
                {file}
              </li>
            ))}
          </ul>
        </div>

        {/* Parte derecha: Visualización del documento PDF */}
        <div className="border p-4 col-span-2">
          {selectedDocument ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
              <iframe
                src={selectedDocument}
                width="100%"
                height="500px"
                frameBorder="0"
                title="Document Preview"
              ></iframe>
              <a
                href={selectedDocument}
                download
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded inline-block"
              >
                Descargar
              </a>
            </div>
          ) : (
            <p className="text-gray-500">
              Selecciona un documento de la lista para previsualizarlo.
            </p>
          )}
        </div>
      </div>

      {/* Parte inferior: Cargar nuevos documentos */}
      <div className="mt-6">
        <label className="block mb-2 text-lg font-medium text-gray-700">
          Cargar Documento
        </label>
        <input
          type="file"
          onChange={handleFileUpload}
          className="border p-2 w-full"
        />

        {/* Barra de progreso */}
        {isUploading && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Progreso de carga:
            </label>
            <progress value={uploadProgress} max="100" className="w-full h-4"></progress>
          </div>
        )}
      </div>
    </div>
  );
}
