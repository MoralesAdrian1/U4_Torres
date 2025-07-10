import React, { useState } from 'react';
import axios from 'axios';

const SubirCSV = () => {
  const [archivo, setArchivo] = useState(null);
  const [resultados, setResultados] = useState([]);

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!archivo) {
      alert("Selecciona un archivo CSV primero");
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);

    try {
      const res = await axios.post('http://localhost:8000/predecir_csv', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setResultados(res.data.resultados);
    } catch (err) {
      alert("Error al subir o procesar el archivo");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Predecir desde archivo CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir y Predecir</button>

      {resultados.length > 0 && (
        <div>
          <h3>Resultados:</h3>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Probabilidad de Deserción</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{(item.probabilidad_desercion * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubirCSV;
