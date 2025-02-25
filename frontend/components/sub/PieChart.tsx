import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

interface PieChartProps {
  apiUrl: string;
}

const PieChart: React.FC<PieChartProps> = ({ apiUrl }) => {
  const [chartData, setChartData] = useState({ sentiments: [], counts: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl]);

  const data = {
    labels: chartData.sentiments,
    datasets: [
      {
        data: chartData.counts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return <Pie data={data} />;
};

export default PieChart;
