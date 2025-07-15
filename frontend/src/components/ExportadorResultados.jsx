import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Almacenamiento en memoria (reemplaza localforage)
let historicosStorage = [];

// Función para debug
const debugLog = (message, data) => {
  console.log(`[ExportadorResultados] ${message}`, data);
};

// Función para capturar gráficos de Chart.js
const captureChartAsImage = (chartId) => {
  try {
    // Buscar el canvas del gráfico específico
    const canvas = document.querySelector(`canvas[data-chart-id="${chartId}"]`) || 
                   document.querySelector(`#${chartId} canvas`) ||
                   document.querySelector(`[data-testid="${chartId}"] canvas`);
    
    if (canvas) {
      debugLog(`Canvas encontrado para ${chartId}:`, canvas);
      return canvas.toDataURL('image/png', 0.8);
    }
    
    debugLog(`No se encontró canvas para ${chartId}`);
    return null;
  } catch (error) {
    debugLog(`Error capturando gráfico ${chartId}:`, error);
    return null;
  }
};

// Función para buscar todos los canvas de gráficos
const findAllChartCanvases = () => {
  const canvases = [];
  
  // Buscar todos los canvas en el documento
  const allCanvases = document.querySelectorAll('canvas');
  
  allCanvases.forEach((canvas, index) => {
    // Verificar si es un canvas de Chart.js
    if (canvas.getContext && canvas.width > 0 && canvas.height > 0) {
      try {
        const imageData = canvas.toDataURL('image/png', 0.8);
        if (imageData && imageData !== 'data:,') {
          canvases.push({
            canvas: canvas,
            imageData: imageData,
            index: index,
            id: canvas.id || `chart-${index}`,
            width: canvas.width,
            height: canvas.height
          });
        }
      } catch (error) {
        debugLog(`Error procesando canvas ${index}:`, error);
      }
    }
  });
  
  debugLog('Canvas encontrados:', canvases.length);
  return canvases;
};

export async function exportarAPDF(resultados, resultados2, graficosReact) {
  debugLog('Iniciando exportación a PDF', { resultados: resultados.length, resultados2: resultados2.length });
  
  const doc = new jsPDF();
  
  // Título del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Reporte de Predicción de Abandono Escolar', 105, 20, { align: 'center' });
  
  // Fecha y hora
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
  
  // Buscar y agregar gráficos al PDF
  doc.setFontSize(16);
  doc.setTextColor(0);
  let yPosition = 45;
  
  try {
    // Buscar todos los canvas de gráficos
    const chartCanvases = findAllChartCanvases();
    
    if (chartCanvases.length > 0) {
      // TÍTULOS ACTUALIZADOS PARA TODOS LOS GRÁFICOS
      const titles = [
        'Distribución de Riesgos (Comparativo)',
        'Riesgo por Modelo (Barras)',
        'Dispersión por Nivel de Riesgo',
        'Rendimiento vs Horas de Estudio',
        'Perfil de Riesgo (Radar)',
        'Tendencia de Riesgos (Líneas)'
      ];
      
      // ELIMINAR EL LÍMITE DE 4 GRÁFICOS - PROCESAR TODOS
      for (let i = 0; i < chartCanvases.length; i++) {
        const chart = chartCanvases[i];
        
        // Verificar si necesitamos una nueva página
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Título del gráfico (usar título dinámico o genérico)
        const titulo = titles[i] || `Gráfico ${i + 1}`;
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(titulo, 105, yPosition, { align: 'center' });
        yPosition += 10;
        
        // Calcular dimensiones para el PDF
        const maxWidth = 160;
        const maxHeight = 100;
        const aspectRatio = chart.width / chart.height;
        
        let pdfWidth = maxWidth;
        let pdfHeight = maxWidth / aspectRatio;
        
        if (pdfHeight > maxHeight) {
          pdfHeight = maxHeight;
          pdfWidth = maxHeight * aspectRatio;
        }
        
        // Centrar el gráfico
        const xPosition = (210 - pdfWidth) / 2; // 210 es el ancho de la página A4
        
        // Agregar la imagen
        doc.addImage(chart.imageData, 'PNG', xPosition, yPosition, pdfWidth, pdfHeight);
        yPosition += pdfHeight + 20;
        
        debugLog(`Gráfico ${i + 1} (${titulo}) agregado al PDF`);
      }
      
      debugLog(`Total de gráficos procesados: ${chartCanvases.length}`);
      
    } else {
      // Si no se encuentran gráficos, mostrar mensaje
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No se encontraron gráficos para exportar', 105, yPosition, { align: 'center' });
      yPosition += 30;
    }
    
  } catch (error) {
    debugLog('Error al agregar gráficos:', error);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Error al cargar gráficos', 105, yPosition, { align: 'center' });
    yPosition += 30;
  }
  
  // Agregar resumen estadístico
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Resumen Estadístico', 105, 20, { align: 'center' });
  
  const totalEstudiantes = resultados.length;
  const altoRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.7).length;
  const medioRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.4 && r.probabilidad_desercion <= 0.7).length;
  const bajoRiesgo = resultados.filter(r => r.probabilidad_desercion <= 0.4).length;
  
  doc.setFontSize(12);
  doc.text(`Total de estudiantes analizados: ${totalEstudiantes}`, 20, 40);
  doc.text(`Estudiantes en alto riesgo: ${altoRiesgo} (${(altoRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 55);
  doc.text(`Estudiantes en riesgo medio: ${medioRiesgo} (${(medioRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 70);
  doc.text(`Estudiantes en bajo riesgo: ${bajoRiesgo} (${(bajoRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 85);
  
  // Tabla de resultados
  doc.text('Resultados Detallados', 105, 110, { align: 'center' });
  
  const headers = [
    'Estudiante', 
    'Prob. Abandono', 
    'Riesgo', 
    'Prob. Heurístico', 
    'Riesgo Heurístico'
  ];
  
  const data = resultados.map((item, i) => {
    const item2 = resultados2[i] || {};
    return [
      item.nombre_completo || `Estudiante ${i+1}`,
      `${(item.probabilidad_desercion * 100).toFixed(1)}%`,
      item.probabilidad_desercion > 0.7 ? 'Alto' : 
        item.probabilidad_desercion > 0.4 ? 'Medio' : 'Bajo',
      item2.modelo_reglas ? `${(item2.modelo_reglas * 100).toFixed(1)}%` : '-',
      item2.modelo_reglas && item2.modelo_reglas > 0.7 ? 'Alto' : 
        item2.modelo_reglas && item2.modelo_reglas > 0.4 ? 'Medio' : 'Bajo'
    ];
  });
  
  debugLog('Generando tabla con datos:', data.length);
  
  // Usar autoTable correctamente
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 120,
    styles: {
      halign: 'center',
      cellPadding: 3,
      fontSize: 9
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 }
    }
  });
  
  // Guardar en histórico
  const registro = {
    id: `prediccion_${Date.now()}`,
    fecha: new Date().toISOString(),
    resultados,
    resultados2,
    resumen: {
      total: resultados.length,
      alto: altoRiesgo,
      medio: medioRiesgo,
      bajo: bajoRiesgo
    }
  };
  
  debugLog('Guardando registro en historial:', registro);
  
  // Agregar al almacenamiento en memoria
  historicosStorage.push(registro);
  
  // Mantener solo los últimos 50 registros
  if (historicosStorage.length > 50) {
    historicosStorage = historicosStorage.slice(-50);
  }
  
  debugLog('Historial actualizado. Total registros:', historicosStorage.length);
  
  // Descargar PDF
  const fileName = `prediccion_abandono_${new Date().toISOString().slice(0,10)}.pdf`;
  debugLog('Descargando PDF:', fileName);
  doc.save(fileName);
  
  return registro; // Retornar el registro para confirmación
}

// Función helper para esperar a que los gráficos se rendericen
export function waitForChartsToRender() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000); // Aumentar tiempo de espera a 2 segundos
  });
}

// NUEVA FUNCIÓN: Exportar con mejor detección de gráficos
export async function exportarAPDFMejorado(resultados, resultados2, graficosReact) {
  debugLog('Iniciando exportación mejorada a PDF');
  
  // Esperar a que los gráficos se rendericen completamente
  await waitForChartsToRender();
  
  const doc = new jsPDF();
  
  // Título del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Reporte de Predicción de Abandono Escolar', 105, 20, { align: 'center' });
  
  // Fecha y hora
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
  
  let yPosition = 45;
  
  try {
    // Buscar gráficos por diferentes métodos
    const chartCanvases = findAllChartCanvases();
    
    // También buscar por selectores específicos de Chart.js
    const chartJsCanvases = document.querySelectorAll('canvas[role="img"]');
    const reactChartCanvases = document.querySelectorAll('[data-testid*="chart"] canvas, [class*="chart"] canvas');
    
    debugLog('Canvas encontrados por diferentes métodos:', {
      general: chartCanvases.length,
      chartJs: chartJsCanvases.length,
      react: reactChartCanvases.length
    });
    
    if (chartCanvases.length > 0) {
      const titles = [
        'Distribución de Riesgos (Comparativo)',
        'Riesgo por Modelo (Barras)',
        'Dispersión por Nivel de Riesgo',
        'Rendimiento vs Horas de Estudio',
        'Perfil de Riesgo (Radar)',
        'Tendencia de Riesgos (Líneas)'
      ];
      
      // Procesar TODOS los gráficos encontrados
      for (let i = 0; i < chartCanvases.length; i++) {
        const chart = chartCanvases[i];
        
        // Nueva página si es necesario
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Título del gráfico
        const titulo = titles[i] || `Gráfico ${i + 1}`;
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(titulo, 105, yPosition, { align: 'center' });
        yPosition += 10;
        
        // Calcular dimensiones
        const maxWidth = 160;
        const maxHeight = 100;
        const aspectRatio = chart.width / chart.height;
        
        let pdfWidth = maxWidth;
        let pdfHeight = maxWidth / aspectRatio;
        
        if (pdfHeight > maxHeight) {
          pdfHeight = maxHeight;
          pdfWidth = maxHeight * aspectRatio;
        }
        
        const xPosition = (210 - pdfWidth) / 2;
        
        // Agregar la imagen
        doc.addImage(chart.imageData, 'PNG', xPosition, yPosition, pdfWidth, pdfHeight);
        yPosition += pdfHeight + 20;
        
        debugLog(`Gráfico ${i + 1} (${titulo}) agregado al PDF`);
      }
      
      debugLog(`Total de gráficos procesados: ${chartCanvases.length}`);
      
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No se encontraron gráficos para exportar', 105, yPosition, { align: 'center' });
      yPosition += 30;
    }
    
  } catch (error) {
    debugLog('Error al agregar gráficos:', error);
  }
  
  // Agregar resumen estadístico (igual que antes)
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Resumen Estadístico', 105, 20, { align: 'center' });
  
  const totalEstudiantes = resultados.length;
  const altoRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.7).length;
  const medioRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.4 && r.probabilidad_desercion <= 0.7).length;
  const bajoRiesgo = resultados.filter(r => r.probabilidad_desercion <= 0.4).length;
  
  doc.setFontSize(12);
  doc.text(`Total de estudiantes analizados: ${totalEstudiantes}`, 20, 40);
  doc.text(`Estudiantes en alto riesgo: ${altoRiesgo} (${(altoRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 55);
  doc.text(`Estudiantes en riesgo medio: ${medioRiesgo} (${(medioRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 70);
  doc.text(`Estudiantes en bajo riesgo: ${bajoRiesgo} (${(bajoRiesgo/totalEstudiantes*100).toFixed(1)}%)`, 20, 85);
  
  // Tabla de resultados
  doc.text('Resultados Detallados', 105, 110, { align: 'center' });
  
  const headers = [
    'Estudiante', 
    'Prob. Abandono', 
    'Riesgo', 
    'Prob. Heurístico', 
    'Riesgo Heurístico'
  ];
  
  const data = resultados.map((item, i) => {
    const item2 = resultados2[i] || {};
    return [
      item.nombre_completo || `Estudiante ${i+1}`,
      `${(item.probabilidad_desercion * 100).toFixed(1)}%`,
      item.probabilidad_desercion > 0.7 ? 'Alto' : 
        item.probabilidad_desercion > 0.4 ? 'Medio' : 'Bajo',
      item2.modelo_reglas ? `${(item2.modelo_reglas * 100).toFixed(1)}%` : '-',
      item2.modelo_reglas && item2.modelo_reglas > 0.7 ? 'Alto' : 
        item2.modelo_reglas && item2.modelo_reglas > 0.4 ? 'Medio' : 'Bajo'
    ];
  });
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 120,
    styles: {
      halign: 'center',
      cellPadding: 3,
      fontSize: 9
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 }
    }
  });
  
  // Guardar en histórico
  const registro = {
    id: `prediccion_${Date.now()}`,
    fecha: new Date().toISOString(),
    resultados,
    resultados2,
    resumen: {
      total: totalEstudiantes,
      alto: altoRiesgo,
      medio: medioRiesgo,
      bajo: bajoRiesgo
    }
  };
  
  historicosStorage.push(registro);
  
  if (historicosStorage.length > 50) {
    historicosStorage = historicosStorage.slice(-50);
  }
  
  const fileName = `prediccion_abandono_completo_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(fileName);
  
  return registro;
}

// Resto del código sin cambios...
export async function exportarACSV(resultados, resultados2) {
  debugLog('Iniciando exportación a CSV', { resultados: resultados.length, resultados2: resultados2.length });
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Encabezados principales
  csvContent += "Estudiante,Probabilidad Abandono,Riesgo,Probabilidad Heurístico,Riesgo Heurístico,Fecha Analisis\n";
  
  // Datos principales
  resultados.forEach((item, i) => {
    const item2 = resultados2[i] || {};
    csvContent += [
      `"${item.nombre_completo || `Estudiante ${i+1}`}"`,
      (item.probabilidad_desercion * 100).toFixed(1) + "%",
      item.probabilidad_desercion > 0.7 ? "Alto" : 
        item.probabilidad_desercion > 0.4 ? "Medio" : "Bajo",
      item2.modelo_reglas ? (item2.modelo_reglas * 100).toFixed(1) + "%" : "-",
      item2.modelo_reglas && item2.modelo_reglas > 0.7 ? "Alto" : 
        item2.modelo_reglas && item2.modelo_reglas > 0.4 ? "Medio" : "Bajo",
      new Date().toISOString().slice(0,10)
    ].join(",") + "\n";
  });
  
  // Agregar resumen estadístico
  csvContent += "\n";
  csvContent += "RESUMEN ESTADÍSTICO\n";
  csvContent += "Métrica,Valor\n";
  
  const totalEstudiantes = resultados.length;
  const altoRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.7).length;
  const medioRiesgo = resultados.filter(r => r.probabilidad_desercion > 0.4 && r.probabilidad_desercion <= 0.7).length;
  const bajoRiesgo = resultados.filter(r => r.probabilidad_desercion <= 0.4).length;
  
  csvContent += `Total de estudiantes,${totalEstudiantes}\n`;
  csvContent += `Alto riesgo,${altoRiesgo} (${(altoRiesgo/totalEstudiantes*100).toFixed(1)}%)\n`;
  csvContent += `Riesgo medio,${medioRiesgo} (${(medioRiesgo/totalEstudiantes*100).toFixed(1)}%)\n`;
  csvContent += `Bajo riesgo,${bajoRiesgo} (${(bajoRiesgo/totalEstudiantes*100).toFixed(1)}%)\n`;
  csvContent += `Fecha de análisis,${new Date().toLocaleString()}\n`;
  
  // Agregar datos por categoría de riesgo
  csvContent += "\n";
  csvContent += "ESTUDIANTES POR CATEGORÍA DE RIESGO\n";
  csvContent += "Categoría,Estudiante,Probabilidad\n";
  
  resultados.forEach((item, i) => {
    const categoria = item.probabilidad_desercion > 0.7 ? "Alto" : 
                     item.probabilidad_desercion > 0.4 ? "Medio" : "Bajo";
    csvContent += `${categoria},"${item.nombre_completo || `Estudiante ${i+1}`}",${(item.probabilidad_desercion * 100).toFixed(1)}%\n`;
  });
  
  // Guardar en histórico
  const registro = {
    id: `prediccion_${Date.now()}`,
    fecha: new Date().toISOString(),
    resultados,
    resultados2,
    resumen: {
      total: totalEstudiantes,
      alto: altoRiesgo,
      medio: medioRiesgo,
      bajo: bajoRiesgo
    }
  };
  
  debugLog('Guardando registro CSV en historial:', registro);
  
  // Agregar al almacenamiento en memoria
  historicosStorage.push(registro);
  
  // Mantener solo los últimos 50 registros
  if (historicosStorage.length > 50) {
    historicosStorage = historicosStorage.slice(-50);
  }
  
  debugLog('Historial actualizado. Total registros:', historicosStorage.length);
  
  // Descargar CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const fileName = `prediccion_abandono_${new Date().toISOString().slice(0,10)}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  debugLog('CSV descargado:', fileName);
  
  return registro; // Retornar el registro para confirmación
}

export async function obtenerHistoricos() {
  debugLog('Obteniendo históricos. Total almacenados:', historicosStorage.length);
  
  // Retornar los históricos ordenados por fecha (más reciente primero)
  const historicos = historicosStorage.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
  debugLog('Históricos ordenados:', historicos.map(h => ({ id: h.id, fecha: h.fecha })));
  
  return historicos;
}

export async function cargarPrediccion(id) {
  debugLog('Cargando predicción:', id);
  
  const prediccion = historicosStorage.find(item => item.id === id);
  
  debugLog('Predicción encontrada:', !!prediccion);
  
  return prediccion;
}

export async function eliminarPrediccion(id) {
  debugLog('Eliminando predicción:', id);
  
  const longitudAnterior = historicosStorage.length;
  historicosStorage = historicosStorage.filter(item => item.id !== id);
  
  const eliminado = historicosStorage.length < longitudAnterior;
  debugLog('Predicción eliminada:', eliminado, 'Restantes:', historicosStorage.length);
  
  return eliminado;
}

// Función para obtener el estado del almacenamiento (para debugging)
export function getStorageState() {
  return {
    total: historicosStorage.length,
    items: historicosStorage.map(h => ({ id: h.id, fecha: h.fecha, total: h.resumen.total }))
  };
}