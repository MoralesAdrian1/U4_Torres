import pandas as pd
import numpy as np

# Leer archivo CSV
df = pd.read_csv('C:\\Users\\adria\\Desktop\\utng\\noveno\\Torres\\U4\\IDE\\utils\\data.csv')
# print(df)
df.columns = [
    'marca_temporal',
    'rango_edad',
    'sexo',
    'grado_escolar',
    'frecuencia_asistencia',
    'apoyo_familiar',
    'rendimiento_academico',
    'considera_desertar',
    'situacion_economica',
    'acceso_tecnologia',
    'actividades_extras',
    'relacion_social',
    'motivacion_estudios',
    'tiempo_traslado',
    'trabaja_estudia',
    'vive_solo',
    'horario_adecuado'
]
# print(df)
df = df.drop('marca_temporal',axis=1)

df['rango_edad'] = df['rango_edad'].apply(
    lambda x: 15 if x == 'Menos de 15 años' else (
        16 if x == '15 a 17 años' else (
            19 if x == '18 a 20 años' else (
                22 if x == '21 a 24 años' else (
                    24 if x == 'Más de 24 años' else 18
                )
            )
        )
    ))
df['sexo'] = df['sexo'].apply(lambda x: '0' if x == 'Femenino' else '1')
df['grado_escolar'] = df['grado_escolar'].apply(lambda x: '0' if x == 'Preparatoria' else '1')
df['frecuencia_asistencia'] = df['frecuencia_asistencia'].apply(
    lambda x: 100 if x == 'Siempre' else(
        80 if x=='Casi siempre' else(
            60 if x == 'A veces' else(
                20 if x == 'Rara vez' else 0
            )
        )
    ))
df['apoyo_familiar'] = df['apoyo_familiar'].apply(
    lambda x: 3 if x == 'Mucho apoyo' else(
        2 if x == 'Algo de apoyo' else(
            1 if x == 'Poco apoyo' else 0
        )
    ))
df['rendimiento_academico'] = df['rendimiento_academico'].apply(
    lambda x: 5 if x == 'Excelente' else(
        4 if x == 'Bueno' else(
            3 if x == 'Regular' else(
                2 if x == 'Malo' else 1
            ) 
        )
    ))
df['considera_desertar'] = df['considera_desertar'].apply(lambda x: 0 if x == 'No' else 1)

df['situacion_economica'] = df['situacion_economica'].apply(
    lambda x: 4 if x == 'Muy estable' else (
        3 if x == 'Estable' else (
            2 if x == 'Inestable' else 1
        )
    ))

df['acceso_tecnologia'] = df['acceso_tecnologia'].apply(lambda x: 1 if x == 'A veces' else (0 if x == 'No' else 2))

df['actividades_extras'] = df['actividades_extras'].apply(lambda x: 0 if x == 'No' else 1)

print(df['relacion_social'])
# valores de 1 (Muy mala) a 5(Muy buena)

print(df['motivacion_estudios'])
# valores de 1 (Nada motivado) a 5(Muy motivado)

df['tiempo_traslado'] = df['tiempo_traslado'].apply(
    lambda x: 10 if x == 'Menos de 15 minutos' else(
        22 if x == 'Entre 15 y 30 minutos' else(
            45 if x == 'Entre 30 y 60 minutos' else 60
        )
    ))

df['trabaja_estudia'] = df['trabaja_estudia'].apply(lambda x: 0 if x == 'No trabajo' else (1 if x == 'Sí, medio tiempo' else 2))

df['vive_solo'] = df['vive_solo'].apply(lambda x: 0 if x == 'No' else 1)

df['horario_adecuado'] = df['horario_adecuado'].apply(lambda x: 2 if x == 'No, me afecta bastante' else (1 if x == 'Más o menos' else 0))

# Generar nombres aleatorios
nombres_aleatorios = ["Ana", "Luis", "María", "Carlos", "Sofía", "Juan", "Elena", "Pedro", 
                      "Laura", "Miguel", "Isabel", "Jorge", "Marta", "Diego", "Lucía"]
nombres = np.random.choice(nombres_aleatorios, size=len(df))

# Insertar la columna al inicio
df.insert(0, 'nombre', nombres)

# Guardar en nuevo CSV
df.to_csv('dataLimpia_conNombres.csv', index=False)






