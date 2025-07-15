import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import PredecirCsv from './PredecirCsv';

const SubirCSV = () => {
  const [archivo, setArchivo] = useState(null);
  const [datosPreview, setDatosPreview] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [targetCol, setTargetCol] = useState('abandona');
  const [features, setFeatures] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formatoDescarga, setFormatoDescarga] = useState('excel');
  const [resultados2,setResultados2] = useState([]);
  const [entrenado, setEntrenado] = useState(false);  
  const [predicho, setPredicho] = useState(false);  

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await axios.post('http://localhost:8000/cargar-datos', formData);
      
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setArchivo(file);
          setDatosPreview(results.data.slice(0, 5));
          setColumnas(results.meta.fields);
          setPaso(2);
          setLoading(false);
        },
        error: (error) => {
          setError("Error al leer el archivo: " + error.message);
          setLoading(false);
        }
      });
    } catch (err) {
      setError("Error al subir el archivo: " + err.message);
      setLoading(false);
    }
  };

// Elimina la definición y uso del estado 'features':
// const [features, setFeatures] = useState([]);

// Modifica handleConfigurar para enviar todas las columnas excepto la targetCol como features:
const handleConfigurar = async () => {
  if (!targetCol) {
    setError("Debes seleccionar una columna objetivo");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Aquí construimos todas las features automáticamente:
    const allFeatures = columnas.filter(col => col !== targetCol);

    const configRes = await axios.post('http://localhost:8000/configurar-modelo', {
      target_col: targetCol,
      features: allFeatures,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const trainRes = await axios.post('http://localhost:8000/entrenar-modelo');
    setAccuracy(trainRes.data.accuracy);
    setEntrenado(true);
    await handlePredict();
  } catch (err) {
    setError(err.response?.data?.detail || err.message);
    setLoading(false);
  }
};


  const handlePredict = async () => {
    if (!archivo) return;
    
    try {
      const formData = new FormData();
      formData.append('file', archivo);
      
      const predictRes = await axios.post('http://localhost:8000/predecir', formData);
      setResultados(predictRes.data.resultados);
      const predictRes2 = await axios.post('http://localhost:8000/comparar-modelos', formData);
      setResultados2(predictRes2.data.comparacion);
      console.log(predictRes2.data.comparacion);

      setPaso(3);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarDatos = (tipo) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000/descargar-datos/${tipo}/${formatoDescarga}`;
    link.setAttribute('download', '');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFeature = (col) => {
    if (features.includes(col)) {
      setFeatures(features.filter(f => f !== col));
    } else {
      setFeatures([...features, col]);
    }
  };

  const resetProcess = () => {
    setArchivo(null);
    setDatosPreview([]);
    setColumnas([]);
    setTargetCol('abandona');
    setFeatures([]);
    setResultados([]);
    setAccuracy(null);
    setPaso(1);
    setError(null);
  };

  const LoadingSpinner = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
      margin: '20px 0'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid #fff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ 
        color: 'white', 
        fontSize: '18px', 
        fontWeight: '600',
        marginTop: '20px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Procesando datos con IA...
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  const ErrorAlert = ({ message }) => (
    <div style={{
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '15px',
      margin: '20px 0',
      boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)'
      }}></div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: '24px',
          height: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '15px',
          fontSize: '16px'
        }}>
          ⚠️
        </div>
        <div>
          <strong style={{ fontSize: '16px' }}>Error Detectado</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: '0.9' }}>{message}</p>
        </div>
      </div>
    </div>
  );

  const StepIndicator = ({ currentStep }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '30px 0',
      position: 'relative'
    }}>
      {[1, 2, 3].map((step) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: step <= currentStep 
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: step <= currentStep ? 'white' : '#999',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: step <= currentStep 
              ? '0 10px 25px rgba(79, 172, 254, 0.4)'
              : '0 5px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            border: '3px solid ' + (step <= currentStep ? 'rgba(255,255,255,0.3)' : 'transparent')
          }}>
            {step}
          </div>
          {step < 3 && (
            <div style={{
              width: '100px',
              height: '4px',
              background: step < currentStep 
                ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                : 'linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)',
              borderRadius: '2px',
              margin: '0 20px',
              transition: 'all 0.3s ease'
            }}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '25px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1
          }}>
            🎓 Sistema de Detección de Abandono Escolar
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            margin: '10px 0 0 0',
            fontWeight: '400',
            position: 'relative',
            zIndex: 1
          }}>
            Predicción Inteligente con Machine Learning
          </p>
          <style>
            {`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
              }
            `}
          </style>
        </div>

        <div style={{ padding: '40px 30px' }}>
          <StepIndicator currentStep={paso} />
          
          {loading && <LoadingSpinner />}
          {error && <ErrorAlert message={error} />}
          
          {paso === 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(255, 154, 158, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)'
              }}></div>
              
              <h2 style={{
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '20px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                📁 Subir Archivo CSV
              </h2>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '15px',
                padding: '30px',
                border: '2px dashed rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  opacity: '0.8'
                }}>📊</div>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{
                    display: 'none'
                  }}
                  id="file-input"
                />
                
                <label htmlFor="file-input" style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(79, 172, 254, 0.4)',
                  transition: 'all 0.3s ease',
                  border: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(79, 172, 254, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 172, 254, 0.4)';
                }}>
                  Seleccionar Archivo CSV
                </label>
                
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  marginTop: '20px',
                  lineHeight: '1.6'
                }}>
                  Arrastra y suelta tu archivo aquí o haz clic para seleccionar<br/>
                  <strong>Formato requerido:</strong> CSV con columnas como rango_edad, asistencia, rendimiento_academico
                </p>
              </div>
            </div>
          )}
          
          {paso === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                padding: '30px',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(168, 237, 234, 0.3)',
                textAlign: 'center'
              }}>
                <h2 style={{
                  color: '#2c3e50',
                  fontSize: '24px',
                  fontWeight: '600',
                  margin: '0 0 15px 0'
                }}>
                  ⚙️ Configuración del Modelo Predictivo
                </h2>
                <p style={{
                  color: '#34495e',
                  fontSize: '16px',
                  margin: '0'
                }}>
                  Configura las variables para entrenar el modelo de inteligencia artificial
                </p>
              </div>
              
              {/* Preview Data */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '20px',
                  color: 'white'
                }}>
                  <h3 style={{
                    margin: '0',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    📋 Previsualización de Datos
                  </h3>
                  <p style={{
                    margin: '5px 0 0 0',
                    fontSize: '14px',
                    opacity: '0.9'
                  }}>
                    Primeras 5 filas del dataset
                  </p>
                </div>
                
                <div style={{
                  maxHeight: '400px',
                  overflow: 'auto',
                  background: '#fafafa'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        {columnas.map(col => (
                          <th key={col} style={{
                            padding: '15px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#2c3e50',
                            borderBottom: '2px solid #dee2e6'
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datosPreview.map((row, i) => (
                        <tr key={i} style={{
                          borderBottom: '1px solid #dee2e6',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}>
                          {columnas.map(col => (
                            <td key={`${i}-${col}`} style={{
                              padding: '12px',
                              color: '#495057'
                            }}>
                              {row[col] !== undefined ? String(row[col]) : 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Target Column Selection */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
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
                  🎯 Columna Objetivo
                </h3>
                
                <select
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef',
                    background: 'white',
                    color: '#495057',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4facfe';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <option value="">-- Selecciona la columna que indica abandono --</option>
                  {columnas.map(col => (
                    <option key={`target-${col}`} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              
              
              {/* Download Section */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
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
                  📥 Descargar Datos
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <select
                    value={formatoDescarga}
                    onChange={(e) => setFormatoDescarga(e.target.value)}
                    style={{
                      padding: '12px 15px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      background: 'white',
                      color: '#495057',
                      cursor: 'pointer',
                      minWidth: '140px'
                    }}>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                  </select>
                  
                  <button
                    onClick={() => handleDescargarDatos('entrenamiento')}
                    disabled={!targetCol || loading}
                    style={{
                      padding: '12px 25px',
                      background: (!targetCol ) 
                        ? 'linear-gradient(135deg, #ced4da 0%, #adb5bd 100%)'
                        : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (!targetCol ) ? 'not-allowed' : 'pointer',
                      boxShadow: (!targetCol) 
                        ? 'none'
                        : '0 8px 20px rgba(40, 167, 69, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (targetCol ) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(40, 167, 69, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (targetCol ) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(40, 167, 69, 0.3)';
                      }
                    }}>
                    📊 Descargar Datos para Entrenamiento
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
                marginTop: '30px'
              }}>
                <button
                  onClick={resetProcess}
                  disabled={loading}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(108, 117, 125, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(108, 117, 125, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.3)';
                  }}>
                  ↩️ Cancelar
                </button>
                
                <button
                  onClick={handleConfigurar}
                  disabled={!targetCol  || loading}
                  style={{
                    padding: '15px 40px',
                    background: (!targetCol === 0) 
                      ? 'linear-gradient(135deg, #ced4da 0%, #adb5bd 100%)'
                      : 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: (!targetCol ) ? 'not-allowed' : 'pointer',
                    boxShadow: (!targetCol ) 
                      ? 'none'
                      : '0 15px 35px rgba(255, 107, 107, 0.4)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    if (targetCol ) {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 107, 0.5)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (targetCol ) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.4)';
                    }
                  }}>
                  🚀 Entrenar Modelo y Predecir
                </button>
              </div>
            </div>
          )}
          
          {paso === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Results Header */}
              {entrenado && (
              <PredecirCsv accuracy = {accuracy}/>
            )}

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubirCSV;