import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Cambia el estado si la pantalla es menor o igual a 768px
    };

    // Añade el listener cuando se carga el componente
    window.addEventListener('resize', handleResize);

    // Ejecuta el resize inmediatamente para establecer el estado inicial
    handleResize();

    // Limpia el listener cuando se desmonta el componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export default useWindowSize;
