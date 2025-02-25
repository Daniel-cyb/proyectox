import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function TweetsD3BarChart({ data }) {
  const chartRef = useRef();
  const [currentLevel, setCurrentLevel] = useState('day'); // Controla el nivel de drill down
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (filteredData.length === 0) return;

    // Procesar los datos de acuerdo al nivel de drill down
    let parsedData;
    if (currentLevel === 'day') {
      // Agrupar por día y contar usuarios únicos
      parsedData = d3.rollups(
        filteredData,
        v => new Set(v.map(d => d.user_handle)).size,
        d => new Date(d.date).toISOString().split('T')[0] // Agrupar por día (YYYY-MM-DD)
      ).map(([key, value]) => ({ date: new Date(key), users: value }));
    } else if (currentLevel === 'user') {
      // Agrupar por usuario y contar menciones para un día específico
      parsedData = d3.rollups(
        filteredData,
        v => v.length, // Contar menciones por usuario
        d => d.user_handle
      ).map(([key, value]) => ({ user: key, mentions: value }));
    }

    parsedData.sort((a, b) => currentLevel === 'day' ? a.date - b.date : b.mentions - a.mentions);

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 550 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Limpiar el gráfico existente
    d3.select(chartRef.current).selectAll('*').remove();

    // Crear SVG
    const svg = d3.select(chartRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escala X
    const x = d3.scaleBand()
      .domain(currentLevel === 'day' ? parsedData.map(d => d.date) : parsedData.map(d => d.user))
      .range([0, width])
      .padding(0.1);

    // Escala Y
    const y = d3.scaleLinear()
      .domain([0, currentLevel === 'day' ? d3.max(parsedData, d => d.users) : d3.max(parsedData, d => d.mentions)])
      .range([height, 0]);

    // Eje X
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(currentLevel === 'day' ? d3.timeFormat('%b %d') : d => d))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Eje Y
    svg.append('g')
      .call(d3.axisLeft(y));

    // Dibujar las barras
    svg.selectAll('.bar')
      .data(parsedData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => currentLevel === 'day' ? x(d.date) : x(d.user))
      .attr('y', d => currentLevel === 'day' ? y(d.users) : y(d.mentions))
      .attr('width', x.bandwidth())
      .attr('height', d => currentLevel === 'day' ? height - y(d.users) : height - y(d.mentions))
      .attr('fill', '#4a90e2')
      .on('click', (event, d) => {
        if (currentLevel === 'day') {
          // Al hacer clic en un día, mostrar menciones por usuario
          const filtered = data.filter(tweet => new Date(tweet.date).toISOString().split('T')[0] === d.date.toISOString().split('T')[0]);
          setFilteredData(filtered);
          setCurrentLevel('user');
        }
      });

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 0px 6px rgba(0, 0, 0, 0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg.selectAll('.bar')
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(currentLevel === 'day'
          ? `<strong>Date:</strong> ${d.date.toLocaleDateString()}<br/><strong>Users:</strong> ${d.users}`
          : `<strong>User:</strong> ${d.user}<br/><strong>Mentions:</strong> ${d.mentions}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

  }, [filteredData, currentLevel, data]);

  return (
    <div>
      {currentLevel === 'user' && (
        <button onClick={() => {
          setFilteredData(data);
          setCurrentLevel('day');
        }} className="mb-4 p-2 bg-blue-600 text-white rounded-lg">
          Back to Days
        </button>
      )}
      <svg ref={chartRef} className="w-full h-auto"></svg>
    </div>
  );
}
