import React, { useState } from 'react';
import axios from 'axios';

const EstudianteForm = () => {
  const [formData, setFormData] = useState({
    edad: '',
    promedio: '',
    asistencia: '',
    apoyo_familiar: false,
    problemas_economicos: false,
  });

  const [resultado, setResultado] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/predecir', {
        ...formData,
        edad: parseInt(formData.edad),
        promedio: parseFloat(formData.promedio),
        asistencia: parseFloat(formData.asistencia)
      });
      setResultado(response.data.probabilidad_de_desercion);
    } catch (error) {
      alert('Error al predecir: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Predecir Deserción Escolar</h2>
      <form onSubmit={handleSubmit}>
        <label>Edad: <input type="number" name="edad" value={formData.edad} onChange={handleChange} /></label><br />
        <label>Promedio: <input type="number" step="0.1" name="promedio" value={formData.promedio} onChange={handleChange} /></label><br />
        <label>Asistencia (%): <input type="number" step="0.1" name="asistencia" value={formData.asistencia} onChange={handleChange} /></label><br />
        <label>Apoyo Familiar: <input type="checkbox" name="apoyo_familiar" checked={formData.apoyo_familiar} onChange={handleChange} /></label><br />
        <label>Problemas Económicos: <input type="checkbox" name="problemas_economicos" checked={formData.problemas_economicos} onChange={handleChange} /></label><br />
        <button type="submit">Predecir</button>
      </form>

      {resultado !== null && (
        <div>
          <h3>Probabilidad de deserción:</h3>
          <p>{(resultado * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default EstudianteForm;
