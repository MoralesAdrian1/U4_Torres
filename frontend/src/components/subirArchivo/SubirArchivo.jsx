import React from "react";

export default function SubirArchivo({ archivo, handleArchivo, loading }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(255, 154, 158, 0.3)",
        position: "relative",
        overflow: "hidden",
        marginBottom: "40px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
        }}
      ></div>

      <h2
        style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "600",
          marginBottom: "20px",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        📁 Subir Archivo CSV
      </h2>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "15px",
          padding: "30px",
          border: "2px dashed rgba(255, 255, 255, 0.5)",
          textAlign: "center",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "20px",
            opacity: "0.8",
          }}
        >
          📊
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleArchivo}
          disabled={loading}
          style={{ display: "none" }}
          id="file-input"
        />

        <label
          htmlFor="file-input"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            padding: "15px 30px",
            borderRadius: "25px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(79, 172, 254, 0.4)",
            transition: "all 0.3s ease",
            border: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 15px 35px rgba(79, 172, 254, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(79, 172, 254, 0.4)";
          }}
        >
          Seleccionar Archivo CSV
        </label>

        {/* Aquí mostramos el nombre del archivo si existe */}
        {archivo && (
          <p
            style={{
              color: "white",
              marginTop: "20px",
              fontWeight: "600",
              fontSize: "16px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: "300px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            title={archivo.name}
          >
            📄 Archivo seleccionado: {archivo.name}
          </p>
        )}

        <p
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "14px",
            marginTop: "10px",
            lineHeight: "1.6",
          }}
        >
          Arrastra y suelta tu archivo aquí o haz clic para seleccionar
          <br />
          <strong>Formato requerido:</strong> CSV con columnas como{" "}
          <code>rango_edad</code>, <code>sexo</code>, <code>grado_escolar</code>...
        </p>
      </div>
    </div>
  );
}
