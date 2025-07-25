import React, { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import SubirArchivo from "./subirArchivo/SubirArchivo";
import FiltrosForm from "./FiltrosForm";
import TablaResultados from "./TablaResultados";
import GraficosResultados from "./GraficosResultados";
import { exportarAPDF, exportarACSV } from "./ExportadorResultados";
import { FaFilePdf, FaFileCsv, FaHistory } from 'react-icons/fa';
import HistorialPredicciones from "./HistorialPredicciones";

const EDADES = [
  { label: "Menos de 15 años", value: 15 },
  { label: "15 a 17 años", value: 16 },
  { label: "18 a 20 años", value: 19 },
  { label: "21 a 24 años", value: 22 },
  { label: "Más de 24 años", value: 24 },
];

const SEXOS = [
  { label: "Femenino", value: "0" },
  { label: "Masculino", value: "1" },
];

const GRADOS = [
  { label: "Preparatoria", value: "0" },
  { label: "Universidad", value: "1" },
];

export default function PredecirCsv({ accuracy }) {
  const [archivo, setArchivo] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [resultados2, setResultados2] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicho, setPredicho] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [edadSeleccionada, setEdadSeleccionada] = useState(EDADES.map(e => String(e.value)));
  const [sexoSeleccionado, setSexoSeleccionado] = useState(SEXOS.map(s => s.value));
  const [gradoSeleccionado, setGradoSeleccionado] = useState(GRADOS.map(g => g.value));

  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handlePredecir = async () => {
    if (!archivo) {
      setError("Por favor, selecciona un archivo CSV.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultados([]);
    setResultados2([]);

    Papa.parse(archivo, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const dataFiltrada = filtrarDatos(results.data);

        if (dataFiltrada.length === 0) {
          setError("No hay datos que coincidan con los filtros seleccionados.");
          setLoading(false);
          return;
        }

        try {
          const csvFiltered = Papa.unparse(dataFiltrada);
          const blob = new Blob([csvFiltered], { type: "text/csv" });
          const formData = new FormData();
          formData.append("file", blob, "filtrado.csv");

          const res1 = await axios.post("http://localhost:8000/predecir", formData);
          setResultados(res1.data.resultados);

          const res2 = await axios.post("http://localhost:8000/comparar-modelos", formData);
          setResultados2(res2.data.comparacion);

          setPredicho(true);
        } catch (err) {
          setError(err.response?.data?.detail || err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError("Error al leer el archivo: " + err.message);
        setLoading(false);
      },
    });
  };

  const toggleEdad = (val) => {
    setEdadSeleccionada((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const toggleSexo = (val) => {
    setSexoSeleccionado((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const toggleGrado = (val) => {
    setGradoSeleccionado((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const filtrarDatos = (data) => {
    return data.filter((fila) => {
      const edad = Number(fila.rango_edad || 18);
      if (
        edadSeleccionada.length > 0 &&
        !edadSeleccionada.some((edadSel) => edad === Number(edadSel))
      )
        return false;

      const sexo = fila.sexo;
      if (sexoSeleccionado.length > 0 && !sexoSeleccionado.includes(sexo))
        return false;

      const grado = fila.grado_escolar;
      if (gradoSeleccionado.length > 0 && !gradoSeleccionado.includes(grado))
        return false;

      return true;
    });
  };

  const resetProcess = () => {
    setArchivo(null);
    setResultados([]);
    setResultados2([]);
    setError(null);
    setLoading(false);
    setPredicho(false);
    setEdadSeleccionada(EDADES.map(e => String(e.value)));
    setSexoSeleccionado(SEXOS.map(s => s.value));
    setGradoSeleccionado(GRADOS.map(g => g.value));
    
    const fileInput = document.getElementById("input-csv");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const cargarPrediccionHistorica = async (prediccion) => {
    setCargandoHistorial(true);
    setResultados(prediccion.resultados);
    setResultados2(prediccion.resultados2);
    setPredicho(true);
    setMostrarHistorial(false);
    setCargandoHistorial(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Predicción de Deserción</h1>
      <p>
        Sube un archivo CSV con los datos de los estudiantes para obtener la probabilidad de deserción.
      </p>

      {!predicho && (
        <>
          <SubirArchivo archivo={archivo} handleArchivo={handleArchivo} loading={loading} />

          <FiltrosForm
            EDADES={EDADES}
            SEXOS={SEXOS}
            GRADOS={GRADOS}
            edadSeleccionada={edadSeleccionada}
            sexoSeleccionado={sexoSeleccionado}
            gradoSeleccionado={gradoSeleccionado}
            toggleEdad={toggleEdad}
            toggleSexo={toggleSexo}
            toggleGrado={toggleGrado}
          />

          <button
            onClick={handlePredecir}
            disabled={loading}
            style={{ marginLeft: "1rem", padding: "10px 20px" }}
          >
            {loading ? "Procesando..." : "Predecir"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}

      {predicho && (
        <>
          {/* Encabezado con precisión */}
          <div
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(67, 233, 123, 0.3)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                animation: "float 8s ease-in-out infinite",
              }}
            ></div>

            <h2
              style={{
                color: "white",
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 15px 0",
                textShadow: "0 4px 8px rgba(0,0,0,0.2)",
                position: "relative",
                zIndex: 1,
              }}
            >
              🎯 Resultados del Análisis Predictivo
            </h2>

            {accuracy && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "15px",
                  padding: "20px",
                  margin: "20px auto 0",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  position: "relative",
                  zIndex: 1,
                  maxWidth: "280px",
                }}
              >
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "800",
                    color: "white",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    marginBottom: "10px",
                  }}
                >
                  {(accuracy * 100).toFixed(1)}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: "500",
                  }}
                >
                  Precisión del Modelo de IA
                </div>
              </div>
            )}
          </div>

          {/* Controles de exportación */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            margin: '30px 0'
          }}>
            <button
              onClick={() => exportarAPDF(resultados, resultados2)}
              style={{
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(231, 76, 60, 0.4)'
              }}
            >
              <FaFilePdf /> Exportar a PDF
            </button>
            
            <button
              onClick={() => exportarACSV(resultados, resultados2)}
              style={{
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #27ae60 0%, #219653 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(39, 174, 96, 0.4)'
              }}
            >
              <FaFileCsv /> Exportar a CSV
            </button>
            
            <button
              onClick={() => setMostrarHistorial(true)}
              style={{
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(52, 152, 219, 0.4)'
              }}
            >
              <FaHistory /> Ver Historial
            </button>
          </div>

          {/* Tabla de resultados */}
          <TablaResultados resultados={resultados} resultados2={resultados2} />
          
          {/* Gráficos */}
          <GraficosResultados 
            resultados={resultados} 
            resultados2={resultados2} 
            idPrefix="chart"
          />

          {/* Botón para reiniciar */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={resetProcess}
              style={{
                padding: "18px 40px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 15px 35px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 20px 40px rgba(102, 126, 234, 0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 15px 35px rgba(102, 126, 234, 0.4)";
              }}
            >
              🔄 Analizar Nuevo Grupo de Estudiantes
            </button>
          </div>
        </>
      )}

      {mostrarHistorial && (
        <HistorialPredicciones 
          onClose={() => setMostrarHistorial(false)}
          onLoadPrediccion={cargarPrediccionHistorica}
        />
      )}
    </div>
  );
}