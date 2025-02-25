import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function TweetsD3Treemap({ data, onDrillDown }) {
  const chartRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 }); // Estado inicial

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

    // Agrupar los datos por sentimiento y contar las ocurrencias
    const sentimentCounts = d3.rollups(
      data,
      v => v.length,
      d => d.sentiment
    ).map(([name, value]) => ({ name, value }));

    // Crear una estructura jerárquica para el treemap
    const root = d3.hierarchy({ values: sentimentCounts }, d => d.values)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const treemapWidth = width - margin.left - margin.right;
    const treemapHeight = height - margin.top - margin.bottom;

    const treemapLayout = d3.treemap()
      .size([treemapWidth, treemapHeight])
      .padding(2);

    treemapLayout(root);

    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const color = d3.scaleOrdinal()
      .domain(["positivo", "neutral", "negativo", "desconocido", "error"])
      .range(['#19b5ae', '#00a6ff', '#b51920', '#cccccc', '#8400ff']);

    const nodes = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .on('click', (event, d) => {
        // Llama a la función `onDrillDown` con el sentimiento seleccionado
        if (onDrillDown) {
          onDrillDown(d.data.name);
        }
      });

    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => color(d.data.name));

    nodes.append('text')
      .attr('x', 5)
      .attr('y', 20)
      .attr('fill', 'white')
      .attr('font-size', d => {
        const rectHeight = d.y1 - d.y0;
        return rectHeight > 20 ? '12px' : '8px'; // Ajustar tamaño de fuente según el tamaño del rectángulo
      })
      .attr('font-weight', 'bold')
      .text(d => {
        const rectHeight = d.y1 - d.y0;
        const rectWidth = d.x1 - d.x0;
        const text = `${d.data.name}: ${d.data.value}`;
        return rectWidth > 50 && rectHeight > 20 ? text : ''; // Mostrar texto solo si el rectángulo es suficientemente grande
      });
  }, [data, dimensions, onDrillDown]);

  return <svg ref={chartRef} className="w-full h-full"></svg>;
}
