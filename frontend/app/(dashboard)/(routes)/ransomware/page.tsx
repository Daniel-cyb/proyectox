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
import { scaleLinear } from "d3-scale";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// URL del TopoJSON para el mapa
const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

export default function ThreatIntelligencePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Obtener datos desde la API
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

  // Filtrar datos por rango de fechas
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

  const handleRowClick = (rowData) => {
    setModalData(rowData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // Preparar datos para el gráfico de torta
  const countryCounts = filteredData.reduce((acc, item) => {
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
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#F7464A",
          "#46BFBD",
          "#FDB45C",
          "#949FB1",
          "#4D5360",
          "#AC64AD",
          "#FFA07A",
          "#8A2BE2",
          "#7FFF00",
          "#DC143C",
          "#00CED1",
          "#9400D3",
          "#FFD700",
          "#32CD32",
          "#FF4500",
        ],
      },
    ],
  };

  const colorScale = scaleLinear()
    .domain([0, Math.max(...Object.values(countryCounts)) || 1])
    .range(["#E0F7FA", "#006064"]);

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

  const paginate = (pageNumber) => {
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
              onClick={handleFilter}
              className="p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilter}
              className="p-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex justify-between flex-wrap gap-6 mb-6">
            <div className="flex-1 min-w-[300px] border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Top 20 Countries by Ransomware Activity
              </h3>
              <Pie data={pieData} />
            </div>
            <div className="flex-1 min-w-[300px] border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Global Map</h3>
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
          </div>

          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-500">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="px-4 py-2 text-left font-semibold text-white"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.accessor}
                        className="px-4 py-2 border-t text-sm text-gray-800"
                      >
                        {col.type === "date"
                          ? new Date(row[col.accessor]).toLocaleString()
                          : row[col.accessor] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
            >
              &laquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 mx-1 rounded-lg ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
            >
              &raquo;
            </button>
          </div>
        </>
      )}

      {isModalOpen && modalData && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Detailed Information">
          <div className="space-y-2">
            {columns.map((col) => (
              <p key={col.accessor}>
                <strong>{col.label}:</strong>{" "}
                {col.type === "date"
                  ? new Date(modalData[col.accessor]).toLocaleString()
                  : modalData[col.accessor] || "N/A"}
              </p>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
