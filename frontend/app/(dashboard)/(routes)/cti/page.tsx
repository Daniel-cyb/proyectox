"use client"; // Marca este componente como un Client Component

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import Modal from "@/components/sub/Modal";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Registrar módulos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Definir la estructura de datos esperada
interface ThreatData {
  id: string;
  threat_actor_name: string;
  Indicator_Type: string;
  confidence: string;
  ioc: string;
  labels: string[];
  timestamp: string;
  threat_actor_description?: string;
}

export default function ThreatIntelligencePage() {
  const [data, setData] = useState<ThreatData[]>([]);
  const [filteredData, setFilteredData] = useState<ThreatData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [selectedIndicatorType, setSelectedIndicatorType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ThreatData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cti", { cache: "no-store" });
        const result: ThreatData[] = await response.json();
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
    let filtered = [...data];

    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }

    if (selectedLabel) {
      filtered = filtered.filter((item) =>
        item.labels.some((label) =>
          label.toLowerCase().includes(selectedLabel.toLowerCase())
        )
      );
    }

    if (selectedIndicatorType) {
      filtered = filtered.filter(
        (item) => item.Indicator_Type === selectedIndicatorType
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilter();
  }, [startDate, endDate, selectedLabel, selectedIndicatorType]);

  const resetFilter = () => {
    setFilteredData(data);
    setSelectedLabel("");
    setSelectedIndicatorType("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleRowClick = (rowData: ThreatData) => {
    setModalData(rowData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
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
              type="text"
              placeholder="Search Labels"
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedIndicatorType}
              onChange={(e) => setSelectedIndicatorType(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Indicator Types</option>
              <option value="FileHash-SHA256">Hash</option>
              <option value="url">URL</option>
              <option value="IPv4">IP</option>
              <option value="domain">Domain</option>
            </select>
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
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>

          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-500">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-white">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Threat Actor Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Indicator Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-white">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} onClick={() => handleRowClick(row)}>
                    <td>{row.id}</td>
                    <td>{row.threat_actor_name}</td>
                    <td>{row.Indicator_Type}</td>
                    <td>{row.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
