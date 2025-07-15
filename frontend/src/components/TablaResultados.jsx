import React from "react";

export default function TablaResultados({ resultados, resultados2 }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "25px",
          color: "white",
        }}
      >
        <h3
          style={{
            margin: "0",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          📊 Ranking de Riesgo por Estudiante
        </h3>
      </div>

      <div
        style={{
          maxHeight: "600px",
          overflow: "auto",
          background: "#fafafa",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              {[
                "👤 Estudiante",
                "📈 Probabilidad de Abandono",
                "⚠️ Nivel de Riesgo",
                "📈 Probabilidad de Abandono (heurístico)",
                "⚠️ Nivel de Riesgo (heurístico)",
              ].map((titulo, i) => (
                <th
                  key={i}
                  style={{
                    padding: "20px 15px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#2c3e50",
                    borderBottom: "2px solid #dee2e6",
                    fontSize: "16px",
                  }}
                >
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {resultados.map((item, index) => {
              const item2 = resultados2[index] || {};

              const riesgo =
                item.probabilidad_desercion > 0.7
                  ? "Alto"
                  : item.probabilidad_desercion > 0.4
                  ? "Medio"
                  : "Bajo";
              const riesgoColor =
                item.probabilidad_desercion > 0.7
                  ? "#e74c3c"
                  : item.probabilidad_desercion > 0.4
                  ? "#f39c12"
                  : "#27ae60";
              const riesgoIcon =
                item.probabilidad_desercion > 0.7
                  ? "🔴"
                  : item.probabilidad_desercion > 0.4
                  ? "🟡"
                  : "🟢";

              const riesgo2 =
                item2.modelo_reglas > 0.7
                  ? "Alto"
                  : item2.modelo_reglas > 0.4
                  ? "Medio"
                  : "Bajo";
              const riesgoColor2 =
                item2.modelo_reglas > 0.7
                  ? "#e74c3c"
                  : item2.modelo_reglas > 0.4
                  ? "#f39c12"
                  : "#27ae60";
              const riesgoIcon2 =
                item2.modelo_reglas > 0.7
                  ? "🔴"
                  : item2.modelo_reglas > 0.4
                  ? "🟡"
                  : "🟢";

              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #dee2e6",
                    transition: "all 0.3s ease",
                    background: index % 2 === 0 ? "white" : "#f8f9fa",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#e3f2fd";
                    e.currentTarget.style.transform = "scale(1.01)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "white" : "#f8f9fa";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <td style={{ padding: "20px 15px", textAlign: "left" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {index + 1}
                      </div>
                      {item.nombre_completo ||
                        item.nombre ||
                        `Estudiante ${index + 1}`}
                    </div>
                  </td>

                  <td style={{ padding: "20px 15px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: `linear-gradient(135deg, ${riesgoColor}15 0%, ${riesgoColor}25 100%)`,
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `2px solid ${riesgoColor}30`,
                        color: riesgoColor,
                        fontSize: "16px",
                        fontWeight: "700",
                      }}
                    >
                      {(item.probabilidad_desercion * 100).toFixed(1)}%
                    </div>
                  </td>

                  <td style={{ padding: "20px 15px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: `linear-gradient(135deg, ${riesgoColor}15 0%, ${riesgoColor}25 100%)`,
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `2px solid ${riesgoColor}30`,
                        color: riesgoColor,
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{riesgoIcon}</span>
                      {riesgo}
                    </div>
                  </td>

                  <td style={{ padding: "20px 15px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-block",
                        background: `linear-gradient(135deg, ${riesgoColor2}15 0%, ${riesgoColor2}25 100%)`,
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `2px solid ${riesgoColor2}30`,
                        color: riesgoColor2,
                        fontSize: "16px",
                        fontWeight: "700",
                      }}
                    >
                      {item2.modelo_reglas !== undefined
                        ? (item2.modelo_reglas * 100).toFixed(1) + "%"
                        : "-"}
                    </div>
                  </td>

                  <td style={{ padding: "20px 15px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: `linear-gradient(135deg, ${riesgoColor2}15 0%, ${riesgoColor2}25 100%)`,
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `2px solid ${riesgoColor2}30`,
                        color: riesgoColor2,
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{riesgoIcon2}</span>
                      {riesgo2}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
