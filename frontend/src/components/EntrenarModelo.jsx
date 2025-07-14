import React, { useState } from 'react';
import axios from 'axios';

const EntrenarModelo = () => {
  const [accuracy, setAccuracy] = useState(null);

  const entrenar = async () => {
    try {
      const res = await axios.post("http://localhost:8000/entrenar-modelo-original");
      setAccuracy(res.data.accuracy);
    } catch (error) {
      alert('Error al entrenar: ' + error.message);
    }
  };

  return (
    <div>
      <button onClick={entrenar}>Entrenar Modelo</button>
      {accuracy !== null && <p>Precisión del modelo: {accuracy * 100}%</p>}
    </div>
  );
};

export default EntrenarModelo;
