"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import { scaleLinear } from "d3-scale";

ChartJS.register(ArcElement, Tooltip, Legend);

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function ThreatIntelligencePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de datos
    const fetchData = async () => {
      setLoading(true);
      const mockData = [
        { country: "USA", count: 15 },
        { country: "BRA", count: 10 },
        { country: "DEU", count: 5 },
      ];
      setData(mockData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const countryCounts = data.reduce((acc, item) => {
    acc[item.country] = (acc[item.country] || 0) + item.count;
    return acc;
  }, {});

  const colorScale = scaleLinear()
    .domain([0, Math.max(...Object.values(countryCounts))])
    .range(["#E0F7FA", "#006064"]);

  const pieData = {
    labels: Object.keys(countryCounts),
    datasets: [
      {
        data: Object.values(countryCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#F7464A",
        ],
      },
    ],
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          <div className="w-1/2">
            <h3>Ransomware Distribution</h3>
            <Pie data={pieData} />
          </div>
          <div className="w-1/2">
            <h3>Global Map</h3>
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
                            fill: colorScale(count),
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
      )}
    </div>
  );
}
