"use client";

import React, { useState } from 'react';

const Opensearch = () => {
  const iframeSrc = "http://localhost:5601/app/dashboards#/view/edf84fe0-e1a0-11e7-b6d5-4dc382ef7f5b?embed=true&_g=(filters:!(),refreshInterval:(pause:!f,value:900000),time:(from:now-7d,to:now))";
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading && <p>Cargando dashboard...</p>}
      <iframe
        src={iframeSrc}
        height="600"
        width="1400"
        title="Opensearch Dashboard"
        onLoad={() => setLoading(false)}
        onError={() => alert('Error al cargar el contenido')}
      ></iframe>
    </div>
  );
};

export default Opensearch;
