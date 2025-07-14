import pandas as pd
import numpy as np

def calcular_probabilidad_manualmente(row):
    prob = 0.05  # base
    
    # 1. Rendimiento académico bajo
    if row['rendimiento_academico'] <= 2:
        prob += 0.35
    elif row['rendimiento_academico'] == 3:
        prob += 0.15
    elif row['rendimiento_academico'] == 4:
        prob += 0.05

    # 2. Considera desertar
    if row['considera_desertar'] == 1:
        prob += 0.25

    # 3. Poco apoyo familiar y baja motivación juntos
    if row['apoyo_familiar'] <= 1 and row['motivacion_estudios'] <= 2:
        prob += 0.25
    elif row['apoyo_familiar'] <= 1:
        prob += 0.10
    elif row['motivacion_estudios'] <= 2:
        prob += 0.10

    # 4. Frecuencia de asistencia
    if row['frecuencia_asistencia'] < 50:
        prob += 0.30
    elif row['frecuencia_asistencia'] < 75:
        prob += 0.15

    # 5. Condiciones económicas y acceso a tecnología
    if row['situacion_economica'] == 1 and row['acceso_tecnologia'] == 0:
        prob += 0.20
    elif row['situacion_economica'] == 1:
        prob += 0.10
    elif row['acceso_tecnologia'] == 0:
        prob += 0.08

    # 6. Relación social
    if row['relacion_social'] <= 2:
        prob += 0.10

    # 7. Actividades extraescolares
    if row['actividades_extras'] == 0 and row['motivacion_estudios'] <= 2:
        prob += 0.10

    # 8. Tiempo de traslado largo
    if row['tiempo_traslado'] >= 60:
        prob += 0.10
    elif row['tiempo_traslado'] >= 45:
        prob += 0.05

    # 9. Trabaja y estudia (y tiene rendimiento bajo)
    if row['trabaja_estudia'] >= 1 and row['rendimiento_academico'] <= 2:
        prob += 0.10

    # 10. Vive solo y sin apoyo familiar
    if row['vive_solo'] == 1 and row['apoyo_familiar'] <= 1:
        prob += 0.10

    # 11. Horario inadecuado
    if row['horario_adecuado'] == 2:
        prob += 0.08
    elif row['horario_adecuado'] == 1:
        prob += 0.04

    # 12. Segmento por edad
    if row['rango_edad'] >= 22 and row['trabaja_estudia'] >= 1:
        prob += 0.05  # adultos con trabajo tienden a desertar más si no tienen apoyo

    # Penalización por acumulación de factores críticos
    factores_criticos = 0
    if row['rendimiento_academico'] <= 2:
        factores_criticos += 1
    if row['motivacion_estudios'] <= 2:
        factores_criticos += 1
    if row['frecuencia_asistencia'] < 60:
        factores_criticos += 1
    if row['apoyo_familiar'] <= 1:
        factores_criticos += 1
    if row['considera_desertar'] == 1:
        factores_criticos += 1

    if factores_criticos >= 4:
        prob += 0.10

    # Limitar entre 0 y 1
    prob = min(max(prob, 0), 1)

    return round(prob, 4)

def predecir_con_reglas_avanzado(df: pd.DataFrame):
    columnas_req = [
        'rango_edad','sexo','grado_escolar','frecuencia_asistencia','apoyo_familiar',
        'rendimiento_academico','considera_desertar','situacion_economica',
        'acceso_tecnologia','actividades_extras','relacion_social',
        'motivacion_estudios','tiempo_traslado','trabaja_estudia','vive_solo','horario_adecuado'
    ]

    for col in columnas_req:
        if col not in df.columns:
            raise ValueError(f"Falta la columna requerida: {col}")

    df['probabilidad_desercion'] = df.apply(calcular_probabilidad_manualmente, axis=1)

    if 'nombre_completo' in df.columns:
        return df[['nombre_completo', 'probabilidad_desercion']].to_dict(orient='records')
    else:
        return df[['probabilidad_desercion']].to_dict(orient='records')
