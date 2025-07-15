import React from "react";

export default function FiltrosForm({
  EDADES,
  SEXOS,
  GRADOS,
  edadSeleccionada,
  sexoSeleccionado,
  gradoSeleccionado,
  toggleEdad,
  toggleSexo,
  toggleGrado
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      marginBottom: '40px'
    }}>
      <h3 style={{
        color: '#2c3e50',
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🔍 Filtros de Datos para Predicción
      </h3>
      <p style={{
        color: '#6c757d',
        fontSize: '14px',
        marginBottom: '25px',
        lineHeight: '1.6'
      }}>
        Puedes conservar únicamente los rangos, géneros o niveles educativos que te interesen.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        {/* Edad */}
        {EDADES.map(({ label, value }) => (
          <label key={value} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            background: edadSeleccionada.includes(String(value))
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            color: edadSeleccionada.includes(String(value)) ? 'white' : '#495057',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid ' + (edadSeleccionada.includes(String(value)) ? 'rgba(255,255,255,0.3)' : 'transparent'),
            boxShadow: edadSeleccionada.includes(String(value))
              ? '0 10px 25px rgba(79, 172, 254, 0.3)'
              : '0 5px 15px rgba(0, 0, 0, 0.08)',
            fontWeight: '500'
          }}
            onMouseOver={(e) => {
              if (!edadSeleccionada.includes(String(value))) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!edadSeleccionada.includes(String(value))) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}>
            <input
              type="checkbox"
              checked={edadSeleccionada.includes(String(value))}
              onChange={() => toggleEdad(String(value))}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '12px',
                cursor: 'pointer',
                accentColor: edadSeleccionada.includes(String(value)) ? '#fff' : '#4facfe'
              }}
            />
            <span style={{ fontSize: '14px' }}>{label}</span>
          </label>
        ))}

        {/* Sexo */}
        {SEXOS.map(({ label, value }) => (
          <label key={value} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            background: sexoSeleccionado.includes(value)
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            color: sexoSeleccionado.includes(value) ? 'white' : '#495057',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid ' + (sexoSeleccionado.includes(value) ? 'rgba(255,255,255,0.3)' : 'transparent'),
            boxShadow: sexoSeleccionado.includes(value)
              ? '0 10px 25px rgba(79, 172, 254, 0.3)'
              : '0 5px 15px rgba(0, 0, 0, 0.08)',
            fontWeight: '500'
          }}
            onMouseOver={(e) => {
              if (!sexoSeleccionado.includes(value)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!sexoSeleccionado.includes(value)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}>
            <input
              type="checkbox"
              checked={sexoSeleccionado.includes(value)}
              onChange={() => toggleSexo(value)}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '12px',
                cursor: 'pointer',
                accentColor: sexoSeleccionado.includes(value) ? '#fff' : '#4facfe'
              }}
            />
            <span style={{ fontSize: '14px' }}>{label}</span>
          </label>
        ))}

        {/* Grado escolar */}
        {GRADOS.map(({ label, value }) => (
          <label key={value} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px 20px',
            background: gradoSeleccionado.includes(value)
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            color: gradoSeleccionado.includes(value) ? 'white' : '#495057',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid ' + (gradoSeleccionado.includes(value) ? 'rgba(255,255,255,0.3)' : 'transparent'),
            boxShadow: gradoSeleccionado.includes(value)
              ? '0 10px 25px rgba(79, 172, 254, 0.3)'
              : '0 5px 15px rgba(0, 0, 0, 0.08)',
            fontWeight: '500'
          }}
            onMouseOver={(e) => {
              if (!gradoSeleccionado.includes(value)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (!gradoSeleccionado.includes(value)) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}>
            <input
              type="checkbox"
              checked={gradoSeleccionado.includes(value)}
              onChange={() => toggleGrado(value)}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '12px',
                cursor: 'pointer',
                accentColor: gradoSeleccionado.includes(value) ? '#fff' : '#4facfe'
              }}
            />
            <span style={{ fontSize: '14px' }}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
