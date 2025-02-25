import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function CtiMap({ data, onDrillDown }) {
  const mapRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1); // Estado para el nivel de zoom
  const zoomInstance = useRef(null); // Cambia a useRef para evitar re-renderizados innecesarios

  useEffect(() => {
    if (!data || data.length === 0 || !mapRef.current) return; // Verifica que mapRef.current exista

    // Configuración inicial del tamaño más pequeño
    const width = 300;
    const height = 200;

    // Limpiar el contenedor antes de renderizar
    const svgContainer = d3.select(mapRef.current);
    svgContainer.selectAll('*').remove();

    const svg = svgContainer
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet') // Mantener el mapa centrado
      .append('g');

    // Proyección del mapa
    const projection = d3.geoMercator()
      .scale(80) // Aumentar el tamaño del mapa
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Función de zoom
    zoomInstance.current = d3.zoom()
      .scaleExtent([1, 8]) // Niveles de zoom
      .on('zoom', (event) => {
        svg.attr('transform', event.transform); // Aplica el zoom y pan
      });

    // Añadir zoom al svg
    svgContainer.call(zoomInstance.current);

    // Cargar el mapa del mundo desde GeoJSON
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(function (geoData) {
        svg.selectAll('path')
          .data(geoData.features)
          .enter().append('path')
          .attr('d', path)
          .attr('fill', function (d) {
            // Si el país es Colombia, lo resaltamos en rojo
            return d.properties.name === 'Colombia' ? 'red' : '#163e4c'; // Color personalizado
          })
          .attr('stroke', '#999')
          .attr('stroke-width', 0.5)
          .on('click', function (event, d) {
            // Llamar a la función onDrillDown pasando el país clickeado
            if (onDrillDown) {
              onDrillDown(d.properties.name);
            }
          });

        // Agregar puntos basados en los datos de amenazas desde OpenSearch
        svg.selectAll('circle')
          .data(data) // Suponiendo que los datos tienen coordenadas `longitude` y `latitude`
          .enter().append('circle')
          .attr('cx', d => projection([d.longitude, d.latitude])[0])
          .attr('cy', d => projection([d.longitude, d.latitude])[1])
          .attr('r', 3)
          .attr('fill', 'red')
          .attr('opacity', 0.7)
          .on('mouseover', function () {
            d3.select(this).transition().attr('r', 6);
          })
          .on('mouseout', function () {
            d3.select(this).transition().attr('r', 3);
          });
      })
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, [data, onDrillDown]);

  // Funciones para el zoom manual con botones
  const handleZoomIn = () => {
    if (zoomInstance.current && mapRef.current) {
      setZoomLevel((prev) => Math.min(prev + 1, 8));
      d3.select(mapRef.current).transition().call(zoomInstance.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (zoomInstance.current && mapRef.current) {
      setZoomLevel((prev) => Math.max(prev - 1, 1));
      d3.select(mapRef.current).transition().call(zoomInstance.current.scaleBy, 0.8);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center shadow-lg rounded-lg p-4 bg-white dark:bg-gray-800 relative">
      <svg ref={mapRef} className="w-full h-auto" />
      <div className="flex space-x-2 mt-4 absolute top-4 right-4 z-10">
        <button onClick={handleZoomIn} className="bg-blue-500 text-white p-2 rounded">+</button>
        <button onClick={handleZoomOut} className="bg-blue-500 text-white p-2 rounded">-</button>
      </div>
    </div>
  );
}
