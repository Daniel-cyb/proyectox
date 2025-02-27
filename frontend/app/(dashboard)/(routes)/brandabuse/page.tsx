"use client";

import { useState, useEffect, useCallback } from 'react';
import CustomTable from '@/components/sub/CustomTable';
import TweetsD3Treemap from '@/components/sub/TweetsD3Treemap';
import TopUsersBarChart from '@/components/sub/TopUsersBarChart';
import LineChart from '@/components/sub/LineChart';
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";

// Definimos la estructura de los tweets
interface Tweet {
  user_handle: string;
  brand: string;
  text: string;
  date: string;
  sentiment: "positivo" | "neutral" | "negativo";
}

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [filteredTweets, setFilteredTweets] = useState<Tweet[]>([]);
  const [monthlyTweetCount, setMonthlyTweetCount] = useState<number>(0);
  const [sentimentCounts, setSentimentCounts] = useState<Record<string, number>>({
    positivo: 0, neutral: 0, negativo: 0
  });
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/tweets')
      .then(response => response.json())
      .then((data: Tweet[]) => {
        if (!Array.isArray(data)) return;
        setTweets(data);
        setFilteredTweets(data);
        calculateMonthlyTweetCount(data);
        calculateSentimentCounts(data);
        extractBrands(data);
      })
      .catch(error => console.error('Error fetching tweets:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = useCallback(() => {
    let filtered = [...tweets];

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
      filtered = filtered.filter(tweet => tweet.sentiment === selectedSentiment);
    }

    if (selectedUser) {
      filtered = filtered.filter(tweet => tweet.user_handle === selectedUser);
    }

    setFilteredTweets(filtered);
    calculateMonthlyTweetCount(filtered);
    calculateSentimentCounts(filtered);
  }, [tweets, startDate, endDate, selectedBrand, selectedSentiment, selectedUser]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  const extractBrands = (data: Tweet[]) => {
    if (!Array.isArray(data)) return;
    const uniqueBrands = Array.from(new Set(data.map(tweet => tweet.brand).filter(Boolean)));
    setBrands(uniqueBrands);
  };

  const calculateMonthlyTweetCount = (data: Tweet[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const count = data.filter(tweet => {
      const tweetDate = new Date(tweet.date);
      return tweetDate.getMonth() === currentMonth && tweetDate.getFullYear() === currentYear;
    }).length;
    setMonthlyTweetCount(count);
  };

  const calculateSentimentCounts = (data: Tweet[]) => {
    const counts: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0 };
    data.forEach(tweet => {
      if (["positivo", "neutral", "negativo"].includes(tweet.sentiment)) {
        counts[tweet.sentiment]++;
      }
    });
    setSentimentCounts(counts);
  };

  const resetFilter = () => {
    setFilteredTweets(tweets);
    setSelectedSentiment('');
    setSelectedUser('');
    calculateMonthlyTweetCount(tweets);
    calculateSentimentCounts(tweets);
  };

  return (
    <div className="p-2 font-sans bg-white-100 dark:bg-white-100 text-gray-900 dark:text-gray-100">
      <Heading
        title="Social Media Monitoring"
        description="Monitoreo de marcas y análisis de sentimientos"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-sk-500/10"
      />

      {loading ? (
        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted shadow-lg">
          <Loader />
        </div>
      ) : (
        <>
          {(selectedSentiment || selectedUser) && (
            <button onClick={resetFilter} className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
              Volver al estado inicial
            </button>
          )}

          <div className="flex justify-around flex-wrap mb-10">
            {Object.entries(sentimentCounts).map(([key, value], i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-700 w-full sm:w-48 text-center shadow-md">
                <h3 className="mb-2 text-xl font-bold">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                <div className="text-3xl font-bold">{value}</div>
              </div>
            ))}
          </div>

          <CustomTable data={filteredTweets} columns={[
            { label: 'User Handle', accessor: 'user_handle' },
            { label: 'Brand', accessor: 'brand' },
            { label: 'Text', accessor: 'text' },
            { label: 'Date', accessor: 'date', type: 'date' },
            { label: 'Sentiment', accessor: 'sentiment' }
          ]} searchKey="user_handle" />
        </>
      )}
    </div>
  );
}
