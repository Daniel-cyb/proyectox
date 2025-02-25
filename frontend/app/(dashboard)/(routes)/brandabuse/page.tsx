"use client";

import { useState, useEffect } from 'react';
import CustomTable from '@/components/sub/CustomTable';
import TweetsD3Treemap from '@/components/sub/TweetsD3Treemap';
import TopUsersBarChart from '@/components/sub/TopUsersBarChart';
import LineChart from '@/components/sub/LineChart';  
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading"; 
import { Loader } from "@/components/loader"; 

export default function TweetsPage() {
  const [tweets, setTweets] = useState([]);
  const [filteredTweets, setFilteredTweets] = useState([]);
  const [monthlyTweetCount, setMonthlyTweetCount] = useState(0);
  const [sentimentCounts, setSentimentCounts] = useState({ positivo: 0, neutral: 0, negativo: 0 });
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [selectedUser, setSelectedUser] = useState(''); // Nuevo estado para el usuario seleccionado
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tweets')
      .then((response) => response.json())
      .then((data) => {
        setTweets(data);
        setFilteredTweets(data); // Inicialmente mostrar todos los tweets
        calculateMonthlyTweetCount(data);
        calculateSentimentCounts(data);
        extractBrands(data);
      })
      .catch((error) => console.error('Error fetching tweets:', error))
      .finally(() => setLoading(false));
  }, []);

  const extractBrands = (data) => {
    const uniqueBrands = [...new Set(data.map(tweet => tweet.brand))];
    setBrands(uniqueBrands);
  };

  const calculateMonthlyTweetCount = (data) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const count = data.filter(tweet => {
      const tweetDate = new Date(tweet.date);
      return tweetDate.getMonth() === currentMonth && tweetDate.getFullYear() === currentYear;
    }).length;

    setMonthlyTweetCount(count);
  };

  const calculateSentimentCounts = (data) => {
    const counts = { positivo: 0, neutral: 0, negativo: 0 };

    data.forEach(tweet => {
      if (tweet.sentiment in counts) {
        counts[tweet.sentiment]++;
      }
    });

    setSentimentCounts(counts);
  };

  // Filtrar datos basado en fecha, marca, sentimiento y usuario
  const handleFilter = () => {
    let filtered = tweets;

    if (startDate && endDate) {
      filtered = filtered.filter(tweet => {
        const tweetDate = new Date(tweet.date);
        return tweetDate >= new Date(startDate) && tweetDate <= new Date(endDate);
      });
    }

    if (selectedBrand) {
      filtered = filtered.filter(tweet => tweet.brand === selectedBrand);
    }

    if (selectedSentiment) {
      filtered = filtered.filter(tweet => tweet.sentiment === selectedSentiment); // Filtrar por sentimiento
    }

    if (selectedUser) {
      filtered = filtered.filter(tweet => tweet.user_handle === selectedUser); // Filtrar por usuario
    }

    setFilteredTweets(filtered);
    calculateMonthlyTweetCount(filtered);
    calculateSentimentCounts(filtered);
  };

  // Aplicar filtros cuando cambien la marca, la fecha, el sentimiento o el usuario
  useEffect(() => {
    handleFilter();
  }, [startDate, endDate, selectedBrand, selectedSentiment, selectedUser]);

  // Reiniciar filtros
  const resetFilter = () => {
    setFilteredTweets(tweets);
    setSelectedSentiment(''); // Reiniciar el filtro de sentimiento
    setSelectedUser(''); // Reiniciar el filtro de usuario
    calculateMonthlyTweetCount(tweets);
    calculateSentimentCounts(tweets);
  };

  // Manejar "drill down" en el treemap y top users
  const handleTreemapDrillDown = (sentiment) => {
    setSelectedSentiment(sentiment); // Filtrar los datos por sentimiento
  };

  const handleUserDrillDown = (user) => {
    setSelectedUser(user); // Filtrar los datos por usuario
  };

  const tweetColumns = [
    { label: 'User Handle', accessor: 'user_handle' },
    { label: 'Brand', accessor: 'brand' },
    { label: 'Text', accessor: 'text' },
    { label: 'Date', accessor: 'date', type: 'date' },
    { label: 'Sentiment', accessor: 'sentiment' },
    { label: 'Link', accessor: 'twitter_link', type: 'link' },
    { label: 'Score', accessor: 'score' },
    { label: 'Likes', accessor: 'likes' },
    { label: 'Comments', accessor: 'comments' },
    { label: 'Valencia', accessor: 'valencia' },
    { label: 'Tono', accessor: 'tono' },
    { label: 'Intensidad', accessor: 'intensidad' },
    { label: 'Propósito', accessor: 'proposito' },
    { label: 'Contextualización', accessor: 'contextualizacion' }
  ];

  return (
    <div className="p-2 font-sans bg-white-100 dark:bg-white-100 text-gray-900 dark:text-gray-100">
      {/* Encabezado con icono */}
      <Heading
        title="Social Media Monitoring"
        description="Monitoreo de marcas y análisis de sentimientos"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-sk-500/10"
      />

      {/* Loader mientras se cargan los datos */}
      {loading ? (
        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted shadow-lg">
          <Loader />
        </div>
      ) : (
        <>
          {/* Botón para regresar al estado inicial si hay un filtro aplicado */}
          {(selectedSentiment || selectedUser) && (
            <div className="mb-4">
              <button onClick={resetFilter} className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
                Volver al estado inicial
              </button>
            </div>
          )}

          {/* Métricas en la parte superior */}
          <div className="flex justify-around flex-wrap mb-10 font-sans">
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 w-full sm:w-48 text-center mb-4 sm:mb-0 shadow-md">
              <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">Mentions Count</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyTweetCount}</div>
            </div>
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 w-full sm:w-48 text-center mb-4 sm:mb-0 shadow-md">
              <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">Positive</h3>
              <div className="text-3xl font-bold text-green-500">{sentimentCounts.positivo}</div>
            </div>
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 w-full sm:w-48 text-center mb-4 sm:mb-0 shadow-md">
              <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">Neutral</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{sentimentCounts.neutral}</div>
            </div>
            <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 w-full sm:w-48 text-center shadow-md">
              <h3 className="mb-2 text-xl font-bold text-gray-700 dark:text-gray-300">Negative</h3>
              <div className="text-3xl font-bold text-red-500">{sentimentCounts.negativo}</div>
            </div>
          </div>

          {/* Filtro por Marca */}
          <div className="mb-6 flex flex-wrap items-center shadow-sm p-4 rounded-lg bg-white dark:bg-gray-800">
            <label className="mr-6 mb-4 sm:mb-0">
              Brand:
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="ml-3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-inner"
              >
                <option value="">All Brands</option>
                {brands.map((brand, idx) => (
                  <option key={idx} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            {/* Filtro por Fecha */}
            <div className="flex flex-wrap flex-1">
              <label className="mr-6 mb-4 sm:mb-0">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="ml-3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-inner"
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="ml-3 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-inner"
                />
              </label>
            </div>
            <div className="flex flex-wrap justify-center">
              <button onClick={handleFilter} className="ml-6 p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg mb-4 sm:mb-0 shadow-md">
                Apply Filter
              </button>
              <button onClick={resetFilter} className="ml-4 p-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg shadow-md">
                Reset Filter
              </button>
            </div>
          </div>

          {/* Gráficos */}
          <div className="flex justify-between flex-wrap gap-6 mb-10 font-sans">
            <div className="flex-1 min-w-[280px] max-w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white-100 dark:bg-gray-800 shadow-md overflow-hidden">
              <h2 className="text-center text-xl font-bold text-gray-600 dark:text-gray-400 mb-4">Sentiment Distribution</h2>
              <div className="w-full" style={{ height: '300px' }}>
                <TweetsD3Treemap data={filteredTweets} onDrillDown={handleTreemapDrillDown} />
              </div>
            </div>
            <div className="flex-1 min-w-[280px] max-w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white-100 dark:bg-gray-800 shadow-md overflow-hidden">
              <h2 className="text-center text-xl font-bold text-gray-600 dark:text-gray-400 mb-4">Top 10 Users</h2>
              <div className="w-full" style={{ height: '300px' }}>
                <TopUsersBarChart data={filteredTweets} onDrillDown={handleUserDrillDown} />
              </div>
            </div>
          </div>

          {/* Tendencia de menciones en el tiempo */}
          <div className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white-100 dark:bg-gray-800 mb-10 shadow-md font-sans overflow-hidden">
            <h2 className="text-center text-xl font-bold text-gray-600 dark:text-gray-400">Tendencia de Menciones en el Tiempo</h2>
            <div className="w-full aspect-w-16 aspect-h-9">
              <LineChart data={filteredTweets} />
            </div>
          </div>

          {/* Tabla de Tweets */}
          <div className="mt-4">
            <CustomTable data={filteredTweets} columns={tweetColumns} searchKey="user_handle" />
          </div>
        </>
      )}
    </div>
  );
}
