import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MentionData {
  date: string;
  // Puedes agregar otras propiedades según necesites
}

interface MentionsLineChartProps {
  data: MentionData[];
}

export default function MentionsLineChart({ data }: MentionsLineChartProps) {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (data.length === 0 || !chartRef.current) return;

    // Agrupar los datos por fecha y contar el número de menciones por día
    const mentionsByDate = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.date).toLocaleDateString()
    )
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Dimensiones y márgenes
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 928 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Limpiar cualquier gráfico anterior
    const svgContainer = d3.select(chartRef.current);
    svgContainer.selectAll('*').remove();

    // Crear contenedor SVG
    const svg = svgContainer
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr(
        'viewBox',
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
      )
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escala X (fechas)
    const x = d3.scaleTime()
      .domain([
        d3.min(mentionsByDate, (d) => d.date)!,
        d3.max(mentionsByDate, (d) => d.date)!,
      ])
      .range([0, width]);

    // Escala Y (conteo de menciones)
    const y = d3.scaleLinear()
      .domain([0, d3.max(mentionsByDate, (d) => d.count)!])
      .nice()
      .range([height, 0]);

    // Eje X (Fechas)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0))
      .selectAll("text")
      .style("font-size", "12px")
      .attr("dy", "0.75em");

    // Eje Y (Conteo de menciones)
    svg.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .selectAll("text")
      .style("font-size", "12px");

    // Dibujar la línea de menciones
    svg.append('path')
      .datum(mentionsByDate)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3.line<{ date: Date; count: number }>()
          .x((d) => x(d.date))
          .y((d) => y(d.count))
          .curve(d3.curveMonotoneX)
      );

    // Puntos interactivos en la línea
    svg.selectAll('.dot')
      .data(mentionsByDate)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.count))
      .attr('r', 4)
      .attr('fill', '#4a90e2')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', '#e26a6a');
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4)
          .attr('fill', '#4a90e2');
      });

    // Etiquetas de conteo en los puntos
    svg.selectAll('.label')
      .data(mentionsByDate)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.date) + 5)
      .attr('y', (d) => y(d.count) - 5)
      .attr('fill', 'black')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((d) => d.count);
  }, [data]);

  return <svg ref={chartRef} className="w-full h-auto"></svg>;
}
