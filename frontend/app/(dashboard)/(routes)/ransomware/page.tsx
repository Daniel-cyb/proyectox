"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import Modal from "@/components/sub/Modal";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic"; // Importamos la escala de color correcta

ChartJS.register(ArcElement, Tooltip, Legend);

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

export default function ThreatIntelligencePage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/ransomware", { cache: "no-store" });
        const result = await response.json();
        if (Array.isArray(result)) {
          setData(result);
          setFilteredData(result);
        } else {
          console.error("Unexpected data format:", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    if (startDate && endDate) {
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [startDate, endDate]);

  const resetFilter = () => {
    setFilteredData(data);
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleRowClick = (rowData: any) => {
    setModalData(rowData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const countryCounts = filteredData.reduce<Record<string, number>>((acc, item) => {
    if (item.country) {
      acc[item.country] = (acc[item.country] || 0) + 1;
    }
    return acc;
  }, {});

  const top20Countries = Object.entries(countryCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 20);

  const pieData = {
    labels: top20Countries.map(([country]) => country || "Unknown"),
    datasets: [
      {
        data: top20Countries.map(([, count]) => count),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360",
          "#AC64AD", "#FFA07A", "#8A2BE2", "#7FFF00", "#DC143C",
          "#00CED1", "#9400D3", "#FFD700", "#32CD32", "#FF4500",
        ],
      },
    ],
  };

  // Corrección: Usamos scaleSequential en lugar de scaleLinear
  const colorScale = scaleSequential(interpolateBlues)
    .domain([0, Math.max(...Object.values(countryCounts)) || 1]);

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Country", accessor: "country" },
    { label: "Date", accessor: "date", type: "date" },
    { label: "Domain", accessor: "domain" },
    { label: "Summary", accessor: "summary" },
    { label: "Title", accessor: "title" },
    { label: "Translated Summary", accessor: "translated_summary" },
    { label: "URL", accessor: "url" },
    { label: "Victim", accessor: "victim" },
  ];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Heading
        title="Cyber Threat Intelligence Platform"
        description="Advanced Threat Intelligence Dashboard"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      {loading ? (
        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted shadow-lg">
          <Loader />
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={resetFilter}
              className="p-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex-1 min-w-[300px] border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              Global Map
            </h3>
            <ComposableMap>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryISO = geo.properties.ISO_A3;
                    const count = countryCounts[countryISO] || 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: count > 0 ? colorScale(count) : "#E0F7FA",
                            outline: "none",
                          },
                          hover: {
                            fill: "#FFD700",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
        </>
      )}
    </div>
  );
}
