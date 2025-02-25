"use client";

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

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ThreatIntelligencePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedIndicatorType, setSelectedIndicatorType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cti", { cache: "no-store" });
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
    let filtered = data;

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
    setCurrentPage(1); // Reset to the first page after filtering
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

  const handleRowClick = (rowData) => {
    setModalData(rowData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const indicatorTypeCounts = filteredData.reduce((acc, item) => {
    acc[item.Indicator_Type] = (acc[item.Indicator_Type] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(indicatorTypeCounts),
    datasets: [
      {
        data: Object.values(indicatorTypeCounts),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const labelCounts = filteredData.reduce((acc, item) => {
    item.labels.forEach((label) => {
      acc[label] = (acc[label] || 0) + 1;
    });
    return acc;
  }, {});

  const sortedLabels = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const barData = {
    labels: sortedLabels.map((item) => item[0]),
    datasets: [
      {
        label: "Frequency",
        data: sortedLabels.map((item) => item[1]),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Threat Actor Name", accessor: "threat_actor_name" },
    { label: "Indicator_Type", accessor: "Indicator_Type" },
    { label: "Confidence", accessor: "confidence" },
    { label: "IOC", accessor: "ioc" },
    { label: "Labels", accessor: "labels", type: "array" },
    { label: "Timestamp", accessor: "timestamp", type: "date" },
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

          <div className="flex justify-between flex-wrap gap-6 mb-6">
            <div className="flex-1 min-w-[300px] border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Indicator Type Distribution
              </h3>
              <Pie data={pieData} />
            </div>
            <div className="flex-1 min-w-[300px] border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Top 20 Labels by Frequency
              </h3>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
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
                        {col.type === "array"
                          ? row[col.accessor]?.join(", ")
                          : col.type === "date"
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
            <p>
              <strong>ID:</strong> {modalData.id}
            </p>
            <p>
              <strong>Threat Actor Name:</strong> {modalData.threat_actor_name}
            </p>
            <p>
              <strong>Indicator Type:</strong> {modalData.Indicator_Type}
            </p>
            <p>
              <strong>Confidence:</strong> {modalData.confidence}
            </p>
            <p>
              <strong>IOC:</strong> {modalData.ioc}
            </p>
            <p>
              <strong>Description:</strong> {modalData.threat_actor_description}
            </p>
            <p>
              <strong>Labels:</strong> {modalData.labels?.join(", ")}
            </p>
            <p>
              <strong>Timestamp:</strong> {new Date(modalData.timestamp).toLocaleString()}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
