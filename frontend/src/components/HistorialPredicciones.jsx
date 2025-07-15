import React, { useState, useEffect } from 'react';
import { obtenerHistoricos, eliminarPrediccion } from './ExportadorResultados';
import { FaSearch, FaTrash } from 'react-icons/fa';

export default function HistorialPredicciones({ onClose, onLoadPrediccion }) {
  const [historicos, setHistoricos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarHistoricos = async () => {
      setCargando(true);
      try {
        const datos = await obtenerHistoricos();
        setHistoricos(datos);
      } catch (error) {
        console.error('Error al cargar históricos:', error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarHistoricos();
  }, []);

  const filtrarHistoricos = historicos.filter(item => {
    const fecha = new Date(item.fecha).toLocaleString();
    const busquedaLower = busqueda.toLowerCase();
    return (
      fecha.toLowerCase().includes(busquedaLower) ||
      item.resumen.total.toString().includes(busqueda) ||
      item.resumen.alto.toString().includes(busqueda) ||
      item.resumen.medio.toString().includes(busqueda) ||
      item.resumen.bajo.toString().includes(busqueda)
    );
  });

  const eliminarRegistro = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await eliminarPrediccion(id);
        const nuevosHistoricos = await obtenerHistoricos();
        setHistoricos(nuevosHistoricos);
      } catch (error) {
        console.error('Error al eliminar predicción:', error);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 10px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Historial de Predicciones</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '5px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            alignItems: 'center',
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <FaSearch style={{ marginRight: '10px', color: '#7f8c8d' }} />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '16px'
              }}
            />
          </div>
          
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Cargando historial...</p>
            </div>
          ) : filtrarHistoricos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>{busqueda ? 'No se encontraron resultados' : 'No hay predicciones en el historial'}</p>
            </div>
          ) : (
            <div style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              border: '1px solid #eee',
              borderRadius: '8px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: '#f1f1f1',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Total</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Alto</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Medio</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Bajo</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarHistoricos.map((item, index) => (
                    <tr key={item.id} style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                    }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(item.fecha).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {item.resumen.total}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                        {item.resumen.alto}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#f39c12', fontWeight: 'bold' }}>
                        {item.resumen.medio}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>
                        {item.resumen.bajo}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => onLoadPrediccion(item)}
                          style={{
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            margin: '0 5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                        >
                          <FaSearch /> Ver
                        </button>
                        <button
                          onClick={() => eliminarRegistro(item.id)}
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            margin: '0 5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}