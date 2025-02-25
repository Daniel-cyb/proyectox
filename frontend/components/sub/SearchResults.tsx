import { useEffect, useState } from 'react';
import axios from 'axios';
import https from 'https'; // Para manejar conexiones HTTPS sin verificación de certificados

interface TweetData {
  tweet_id: string;
  twitter_link: string;
  user_handle: string;
  text: string;
  date: string;
  likes: string;
  comments: string;
  sentiment: string;
  score: number;
}

const SearchResults = () => {
  const [data, setData] = useState<TweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando la solicitud a OpenSearch...");

        const response = await axios({
          method: 'get',
          url: 'https://localhost:9201/tweets_sentimientos/_search?pretty', // Cambia la URL si es necesario
          auth: {
            username: 'admin',
            password: 'Soporte18*'
          },
          headers: {
            'Content-Type': 'application/json'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignora el SSL no confiable
        });

        console.log("Datos recibidos:", response.data.hits.hits);

        // Extraemos los resultados de los tweets
        const hits = response.data.hits.hits.map((hit: any) => hit._source);
        setData(hits);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);

        if (err.response) {
          console.error('Detalles del error:', err.response.status, err.response.data);
        } else if (err.request) {
          console.error('No se recibió respuesta:', err.request);
        } else {
          console.error('Error en la solicitud:', err.message);
        }

        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Ejecuta la solicitud de datos
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">User Handle</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Tweet</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Sentiment</th>
            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tweet, index) => (
            <tr key={index}>
              <td className="text-left py-3 px-4">{tweet.user_handle}</td>
              <td className="text-left py-3 px-4">{tweet.text}</td>
              <td className="text-left py-3 px-4">{tweet.sentiment}</td>
              <td className="text-left py-3 px-4">{tweet.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResults;
