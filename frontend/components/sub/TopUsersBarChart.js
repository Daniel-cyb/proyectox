import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function TopUsersBarChart({ data, onDrillDown }) {
  const chartRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 450, height: 250 }); // Estado inicial de las dimensiones

  // Función para actualizar las dimensiones del contenedor
  const updateDimensions = () => {
    if (chartRef.current) {
      const { width, height } = chartRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  };

  // Agregar listener para cambios de tamaño y actualizar dimensiones
  useEffect(() => {
    updateDimensions(); // Llamar la primera vez para ajustar el tamaño
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const { width, height } = dimensions; // Usar dimensiones dinámicas

    // Contar las publicaciones por usuario y ordenar por cantidad
    const userCounts = d3.rollups(
      data,
      v => v.length,
      d => d.user_handle
    ).map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Obtener solo los top 10

    const margin = { top: 20, right: 20, bottom: 30, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escala X para el número de publicaciones
    const x = d3.scaleLinear()
      .domain([0, d3.max(userCounts, d => d.count)])
      .range([0, chartWidth]);

    // Escala Y para los usuarios
    const y = d3.scaleBand()
      .domain(userCounts.map(d => d.user))
      .range([0, chartHeight])
      .padding(0.1);

    // Eje X
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    // Eje Y
    svg.append('g')
      .call(d3.axisLeft(y));

    // Dibujar las barras
    svg.selectAll('.bar')
      .data(userCounts)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.user))
      .attr('width', d => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#19b5ae')
      .on('click', (event, d) => {
        // Llama a la función `onDrillDown` con el usuario seleccionado
        if (onDrillDown) {
          onDrillDown(d.user);
        }
      });

    // Etiquetas de conteo en las barras
    svg.selectAll('.label')
      .data(userCounts)
      .enter().append('text')
      .attr('x', d => x(d.count) + 5)
      .attr('y', d => y(d.user) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .text(d => d.count);

  }, [data, dimensions, onDrillDown]);

  return <svg ref={chartRef} className="w-full h-full"></svg>;
}
