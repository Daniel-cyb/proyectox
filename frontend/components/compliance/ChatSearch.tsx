"use client";
import { useState } from "react";

const ChatSearch = () => {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar la entrada de texto con el tipo correcto para el evento
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setError(null); // Limpiar el error cuando se cambia el input
  };

  // Función para manejar el envío de consultas
  const handleSend = async () => {
    if (!inputText.trim()) {
      setError("El campo de consulta no puede estar vacío.");
      return;
    }

    setLoading(true);

    // Agregar la consulta al historial de chat
    setChatHistory((prevChat) => [...prevChat, { sender: "user", message: inputText }]);

    try {
      // Llamada al servicio de embeddings
      const embeddingResponse = await fetch("http://localhost:5011/api/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: inputText }),
      });

      if (!embeddingResponse.ok) {
        throw new Error("Error al obtener embeddings");
      }

      const { embeddings } = await embeddingResponse.json();

      // Verificar si embeddings es válido
      if (!embeddings || embeddings.length === 0) {
        throw new Error("Embeddings no generados correctamente");
      }

      // Llamada al servicio de búsqueda con los embeddings
      const searchResponse = await fetch("http://localhost:5002/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeddings }),
      });

      if (!searchResponse.ok) {
        throw new Error("Error en la búsqueda de documentos");
      }

      const data = await searchResponse.json();

      // Verificar si se obtuvieron resultados
      if (!data.results || data.results.length === 0) {
        setChatHistory((prevChat) => [
          ...prevChat,
          { sender: "bot", message: "No se encontraron resultados." },
        ]);
      } else {
        // Agregar la respuesta del backend al historial de chat
        const resultMessage = data.results
          .map((result: any) => `Documento: ${result.document}, Relevancia: ${result.score}`)
          .join("\n");

        setChatHistory((prevChat) => [...prevChat, { sender: "bot", message: resultMessage }]);
      }

      // Limpiar el campo de texto después de enviar la consulta
      setInputText("");
    } catch (error) {
      console.error("Error al buscar en el chat:", error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "bot", message: "Error al obtener respuesta." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4">Search Documents</h2>

      <div className="chat-window mb-4 h-64 overflow-y-scroll bg-gray-100 p-4 border rounded">
        {/* Mostrar el historial del chat */}
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`mb-2 ${chat.sender === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg ${
                chat.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {chat.message}
            </span>
          </div>
        ))}
      </div>

      {/* Mostrar errores */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Input para ingresar la consulta */}
      <div className="flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Escribe tu consulta..."
          className="border p-2 flex-grow rounded"
        />
        <button onClick={handleSend} disabled={loading} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
          {loading ? "Buscando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default ChatSearch;
