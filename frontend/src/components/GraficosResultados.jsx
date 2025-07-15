import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Pie, Bar, Line, Radar, Scatter } from 'react-chartjs-2';

// Registra los componentes necesarios
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

// Estilos personalizados para los gráficos
const chartStyles = {
  font: {
    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    size: 14,
    weight: 'bold'
  },
  colors: {
    alto: 'rgba(231, 76, 60, 0.8)',
    medio: 'rgba(243, 156, 18, 0.8)',
    bajo: 'rgba(46, 204, 113, 0.8)',
    heuristico: 'rgba(52, 152, 219, 0.8)',
    gridLines: 'rgba(200, 200, 200, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    scatter: {
      alto: 'rgba(231, 76, 60, 0.7)',
      medio: 'rgba(243, 156, 18, 0.7)',
      bajo: 'rgba(46, 204, 113, 0.7)'
    }
  },
  animation: {
    duration: 2000,
    easing: 'easeOutQuart'
  },
  borderWidth: 2,
  borderRadius: 6,
  hoverOffset: 10
};

export default function GraficosResultados({ resultados, resultados2 }) {
  // Procesar datos para los gráficos
  const procesarDatos = () => {
    const niveles = {
      modelo: { alto: 0, medio: 0, bajo: 0 },
      heuristico: { alto: 0, medio: 0, bajo: 0 }
    };

    resultados.forEach((item, index) => {
      const item2 = resultados2[index] || {};
      
      // Clasificar según modelo principal
      if (item.probabilidad_desercion > 0.7) niveles.modelo.alto++;
      else if (item.probabilidad_desercion > 0.4) niveles.modelo.medio++;
      else niveles.modelo.bajo++;
      
      // Clasificar según modelo heurístico
      if (item2.modelo_reglas > 0.7) niveles.heuristico.alto++;
      else if (item2.modelo_reglas > 0.4) niveles.heuristico.medio++;
      else niveles.heuristico.bajo++;
    });

    return niveles;
  };

  const datosProcesados = procesarDatos();

  // Procesar datos para gráfico de dispersión
  const procesarDatosDispersion = () => {
    const datosDispersion = {
      alto: [],
      medio: [],
      bajo: []
    };

    resultados.forEach((item, index) => {
      const item2 = resultados2[index] || {};
      const x = item.probabilidad_desercion * 100;
      const y = (item2.modelo_reglas || 0) * 100;
      
      if (item.probabilidad_desercion > 0.7) {
        datosDispersion.alto.push({ x, y });
      } else if (item.probabilidad_desercion > 0.4) {
        datosDispersion.medio.push({ x, y });
      } else {
        datosDispersion.bajo.push({ x, y });
      }
    });

    return datosDispersion;
  };

  // Procesar datos para gráfico de dispersión por rendimiento académico
  const procesarDatosRendimiento = () => {
    const datosRendimiento = {
      alto: [],
      medio: [],
      bajo: []
    };

    resultados.forEach((item, index) => {
      const item2 = resultados2[index] || {};
      // Simular rendimiento académico basado en la probabilidad de deserción (relación inversa)
      const rendimiento = 100 - (item.probabilidad_desercion * 80) + (Math.random() * 20 - 10);
      // Simular horas de estudio (también con relación inversa al riesgo)
      const horasEstudio = 20 - (item.probabilidad_desercion * 15) + (Math.random() * 8 - 4);
      
      const x = Math.max(0, Math.min(100, rendimiento)); // Rendimiento académico 0-100
      const y = Math.max(0, Math.min(24, horasEstudio)); // Horas de estudio 0-24
      
      if (item.probabilidad_desercion > 0.7) {
        datosRendimiento.alto.push({ x, y });
      } else if (item.probabilidad_desercion > 0.4) {
        datosRendimiento.medio.push({ x, y });
      } else {
        datosRendimiento.bajo.push({ x, y });
      }
    });

    return datosRendimiento;
  };

  const datosDispersion = procesarDatosDispersion();
  const datosRendimiento = procesarDatosRendimiento();

  // Configuración común para todos los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: chartStyles.font,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        titleFont: chartStyles.font,
        bodyFont: chartStyles.font,
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        cornerRadius: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: chartStyles.colors.gridLines
        },
        ticks: {
          font: chartStyles.font
        }
      },
      y: {
        grid: {
          color: chartStyles.colors.gridLines
        },
        ticks: {
          font: chartStyles.font
        }
      }
    }
  };

  // Datos para gráficos comparativos
  const comparativeData = {
    labels: ['Alto Riesgo', 'Medio Riesgo', 'Bajo Riesgo'],
    datasets: [
      {
        label: 'Modelo Principal',
        data: [
          datosProcesados.modelo.alto,
          datosProcesados.modelo.medio,
          datosProcesados.modelo.bajo
        ],
        backgroundColor: [
          chartStyles.colors.alto,
          chartStyles.colors.medio,
          chartStyles.colors.bajo
        ],
        borderColor: [
          chartStyles.colors.alto.replace('0.8', '1'),
          chartStyles.colors.medio.replace('0.8', '1'),
          chartStyles.colors.bajo.replace('0.8', '1')
        ],
        borderWidth: chartStyles.borderWidth
      },
      {
        label: 'Modelo Heurístico',
        data: [
          datosProcesados.heuristico.alto,
          datosProcesados.heuristico.medio,
          datosProcesados.heuristico.bajo
        ],
        backgroundColor: [
          chartStyles.colors.heuristico,
          chartStyles.colors.heuristico,
          chartStyles.colors.heuristico
        ],
        borderColor: chartStyles.colors.heuristico.replace('0.8', '1'),
        borderWidth: chartStyles.borderWidth
      }
    ]
  };

  // Datos para gráfico de dispersión
  const scatterData = {
    datasets: [
      {
        label: 'Alto Riesgo',
        data: datosDispersion.alto,
        backgroundColor: chartStyles.colors.scatter.alto,
        borderColor: chartStyles.colors.alto.replace('0.8', '1'),
        pointRadius: 8,
        pointHoverRadius: 12,
        borderWidth: 2
      },
      {
        label: 'Medio Riesgo',
        data: datosDispersion.medio,
        backgroundColor: chartStyles.colors.scatter.medio,
        borderColor: chartStyles.colors.medio.replace('0.8', '1'),
        pointRadius: 8,
        pointHoverRadius: 12,
        borderWidth: 2
      },
      {
        label: 'Bajo Riesgo',
        data: datosDispersion.bajo,
        backgroundColor: chartStyles.colors.scatter.bajo,
        borderColor: chartStyles.colors.bajo.replace('0.8', '1'),
        pointRadius: 8,
        pointHoverRadius: 12,
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de dispersión de rendimiento académico
  const scatterRendimientoData = {
    datasets: [
      {
        label: 'Alto Riesgo',
        data: datosRendimiento.alto,
        backgroundColor: chartStyles.colors.scatter.alto,
        borderColor: chartStyles.colors.alto.replace('0.8', '1'),
        pointRadius: 10,
        pointHoverRadius: 15,
        borderWidth: 3,
        pointStyle: 'circle',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      {
        label: 'Medio Riesgo',
        data: datosRendimiento.medio,
        backgroundColor: chartStyles.colors.scatter.medio,
        borderColor: chartStyles.colors.medio.replace('0.8', '1'),
        pointRadius: 10,
        pointHoverRadius: 15,
        borderWidth: 3,
        pointStyle: 'triangle',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      {
        label: 'Bajo Riesgo',
        data: datosRendimiento.bajo,
        backgroundColor: chartStyles.colors.scatter.bajo,
        borderColor: chartStyles.colors.bajo.replace('0.8', '1'),
        pointRadius: 10,
        pointHoverRadius: 15,
        borderWidth: 3,
        pointStyle: 'rect',
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      }
    ]
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '30px',
      marginTop: '40px'
    }}>
      {/* Gráfico de Pie Comparativo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center'
        }}>📊 Distribución de Riesgos (Comparativo)</h3>
        <div style={{ height: '400px' }}>
          <Pie 
            data={comparativeData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Comparación Modelo vs Heurístico',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center'
        }}>📈 Riesgo por Modelo (Barras)</h3>
        <div style={{ height: '400px' }}>
          <Bar 
            data={comparativeData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Comparación por Niveles de Riesgo',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                }
              },
              animation: {
                ...chartStyles.animation,
                onComplete: () => {
                  console.log('Animación completada!');
                }
              }
            }}
          />
        </div>
      </div>

      {/* NUEVO: Gráfico de Dispersión por Nivel de Riesgo con efecto 3D */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        transform: 'perspective(1000px) rotateX(2deg)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(52,152,219,0.1) 0%, rgba(155,89,182,0.1) 100%)',
          borderRadius: '20px',
          zIndex: -1
        }}></div>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>🎯 Dispersión por Nivel de Riesgo ()</h3>
        <div style={{ height: '400px' }}>
          <Scatter 
            data={scatterData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Correlación entre Modelos',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                },
                tooltip: {
                  ...commonOptions.plugins.tooltip,
                  callbacks: {
                    title: function(context) {
                      return `${context[0].dataset.label}`;
                    },
                    label: function(context) {
                      return `Principal: ${context.parsed.x.toFixed(1)}%, Heurístico: ${context.parsed.y.toFixed(1)}%`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ...commonOptions.scales.x,
                  title: {
                    display: true,
                    text: 'Modelo Principal (%)',
                    font: chartStyles.font
                  },
                  min: 0,
                  max: 100
                },
                y: {
                  ...commonOptions.scales.y,
                  title: {
                    display: true,
                    text: 'Modelo Heurístico (%)',
                    font: chartStyles.font
                  },
                  min: 0,
                  max: 100
                }
              },
              elements: {
                point: {
                  hoverBorderWidth: 4,
                  hoverRadius: 15,
                  borderWidth: 3
                }
              }
            }}
          />
        </div>
      </div>

      {/* NUEVO: Gráfico de Dispersión de Rendimiento Académico con efecto 3D */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        transform: 'perspective(1000px) rotateX(-2deg)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(46,204,113,0.1) 0%, rgba(241,196,15,0.1) 100%)',
          borderRadius: '20px',
          zIndex: -1
        }}></div>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>📚 Rendimiento vs Horas de Estudio ()</h3>
        <div style={{ height: '400px' }}>
          <Scatter 
            data={scatterRendimientoData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Análisis de Rendimiento Académico',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                },
                tooltip: {
                  ...commonOptions.plugins.tooltip,
                  callbacks: {
                    title: function(context) {
                      return `${context[0].dataset.label}`;
                    },
                    label: function(context) {
                      return `Rendimiento: ${context.parsed.x.toFixed(1)}%, Horas estudio: ${context.parsed.y.toFixed(1)}h`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  ...commonOptions.scales.x,
                  title: {
                    display: true,
                    text: 'Rendimiento Académico (%)',
                    font: chartStyles.font
                  },
                  min: 0,
                  max: 100
                },
                y: {
                  ...commonOptions.scales.y,
                  title: {
                    display: true,
                    text: 'Horas de Estudio Semanales',
                    font: chartStyles.font
                  },
                  min: 0,
                  max: 24
                }
              },
              elements: {
                point: {
                  hoverBorderWidth: 4,
                  hoverRadius: 18,
                  borderWidth: 3
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico Radar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: '1 / -1'
      }}>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center'
        }}>🛡️ Perfil de Riesgo (Radar)</h3>
        <div style={{ height: '500px' }}>
          <Radar 
            data={comparativeData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Análisis Comparativo de Riesgos',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                }
              },
              scales: {
                r: {
                  angleLines: {
                    color: chartStyles.colors.gridLines
                  },
                  grid: {
                    color: chartStyles.colors.gridLines
                  },
                  suggestedMin: 0,
                  suggestedMax: Math.max(
                    ...comparativeData.datasets.flatMap(d => d.data)
                  ) * 1.2,
                  ticks: {
                    font: chartStyles.font,
                    backdropColor: 'transparent'
                  }
                }
              },
              elements: {
                line: {
                  borderWidth: 3,
                  tension: 0.1
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico de Líneas */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
        padding: '25px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: '1 / -1'
      }}>
        <h3 style={{
          color: '#2c3e50',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center'
        }}>📉 Tendencia de Riesgos (Líneas)</h3>
        <div style={{ height: '500px' }}>
          <Line 
            data={{
              labels: resultados.map((_, i) => `Estudiante ${i+1}`),
              datasets: [
                {
                  label: 'Modelo Principal',
                  data: resultados.map(r => r.probabilidad_desercion * 100),
                  borderColor: chartStyles.colors.alto.replace('0.8', '1'),
                  backgroundColor: chartStyles.colors.alto,
                  tension: 0.3,
                  fill: true,
                  pointRadius: 6,
                  pointHoverRadius: 10
                },
                {
                  label: 'Modelo Heurístico',
                  data: resultados2.map(r => r?.modelo_reglas ? r.modelo_reglas * 100 : 0),
                  borderColor: chartStyles.colors.heuristico.replace('0.8', '1'),
                  backgroundColor: chartStyles.colors.heuristico,
                  tension: 0.3,
                  fill: true,
                  pointRadius: 6,
                  pointHoverRadius: 10
                }
              ]
            }}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Comparación por Estudiante',
                  font: {
                    ...chartStyles.font,
                    size: 18
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}