import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function BotonDescargarResultados({ resultados, resultados2 }) {
  const [formato, setFormato] = useState('csv');

  const handleDescargar = () => {
    if (!resultados || resultados.length === 0) return;

    const datos = resultados.map((item, index) => {
      const item2 = resultados2[index] || {};
      const riesgo1 = item.probabilidad_desercion > 0.7 ? 'Alto' :
                      item.probabilidad_desercion > 0.4 ? 'Medio' : 'Bajo';
      const riesgo2 = item2.modelo_reglas > 0.7 ? 'Alto' :
                      item2.modelo_reglas > 0.4 ? 'Medio' : 'Bajo';

      return {
        Nombre: item.nombre_completo || item.nombre || `Estudiante ${index + 1}`,
        'Probabilidad Deserción': (item.probabilidad_desercion * 100).toFixed(2) + '%',
        'Nivel de Riesgo (Logístico)': riesgo1,
        'Probabilidad Reglas': item2.modelo_reglas !== undefined ? (item2.modelo_reglas * 100).toFixed(2) + '%' : '-',
        'Nivel de Riesgo (Heurístico)': riesgo2
      };
    });

    if (formato === 'csv') {
      const encabezados = Object.keys(datos[0]).join(',');
      const filas = datos.map(row => Object.values(row).map(valor => `"${valor}"`).join(','));
      const contenidoCSV = [encabezados, ...filas].join('\n');
      const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resultados_desercion.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const ws = XLSX.utils.json_to_sheet(datos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
      XLSX.writeFile(wb, 'resultados_desercion.xlsx');
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      marginTop: '2rem'
    }}>
      <h3 style={{
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        💾 Descargar Resultados
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <select
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
          style={{
            padding: '12px 15px',
            fontSize: '14px',
            borderRadius: '8px',
            border: '2px solid #e9ecef',
            background: 'white',
            color: '#495057',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          <option value="excel">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
        </select>

        <button
          onClick={handleDescargar}
          style={{
            padding: '12px 25px',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(40, 167, 69, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(40, 167, 69, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.3)';
          }}
        >
          📊 Descargar Resultados de Predicción
        </button>
      </div>
    </div>
  );
}
