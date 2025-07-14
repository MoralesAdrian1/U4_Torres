import pandas as pd
import numpy as np
import os
from faker import Faker
import unicodedata
import re

fake = Faker('es_MX')

# Establecer semilla para reproducibilidad
np.random.seed(42)

# Número de datos a generar
num_samples = 1000

# Funciones para generar datos por variable, usando pesos condicionales

def gen_rango_edad():
    return np.random.choice([15, 16, 19, 22, 24], p=[0.05, 0.20, 0.40, 0.25, 0.10])

def gen_sexo():
    return np.random.choice([0, 1], p=[0.5, 0.5])  # 0 = Femenino, 1 = Masculino

def gen_grado_escolar(edad):
    return 0 if edad < 18 else 1  # 0 = Preparatoria, 1 = Universidad

def gen_frecuencia_asistencia():
    return np.random.choice([0, 20, 60, 80, 100], p=[0.07, 0.10, 0.15, 0.25, 0.43])

def gen_apoyo_familiar():
    return np.random.choice([0, 1, 2, 3], p=[0.05, 0.10, 0.30, 0.55])

def gen_rendimiento_academico(apoyo, asistencia):
    base = np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.10, 0.30, 0.35, 0.20])
    if apoyo >= 2 and asistencia >= 80:
        return min(base + 1, 5)
    elif apoyo <= 1 and asistencia < 60:
        return max(base - 1, 1)
    return base

def gen_considera_desertar(rendimiento, apoyo):
    if rendimiento <= 2 or apoyo <= 1:
        return np.random.choice([1, 0], p=[0.6, 0.4])
    return np.random.choice([1, 0], p=[0.2, 0.8])

def gen_situacion_economica():
    return np.random.choice([1, 2, 3, 4], p=[0.10, 0.25, 0.45, 0.20])

def gen_acceso_tecnologia():
    return np.random.choice([0, 1, 2], p=[0.05, 0.20, 0.75])

def gen_actividades_extras():
    return np.random.choice([0, 1], p=[0.6, 0.4])

def gen_relacion_social():
    return np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.10, 0.25, 0.35, 0.25])

def gen_motivacion_estudios(rendimiento, apoyo):
    if rendimiento >= 4 and apoyo >= 2:
        return np.random.choice([4, 5], p=[0.4, 0.6])
    elif rendimiento <= 2:
        return np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2])
    return np.random.choice([2, 3, 4], p=[0.2, 0.5, 0.3])

def gen_tiempo_traslado():
    return np.random.choice([10, 22, 45, 60], p=[0.30, 0.35, 0.20, 0.15])

def gen_trabaja_estudia(edad):
    if edad >= 18:
        return np.random.choice([0, 1, 2], p=[0.60, 0.30, 0.10])
    return 0

def gen_vive_solo(edad):
    if edad >= 22:
        return np.random.choice([0, 1], p=[0.6, 0.4])
    return np.random.choice([0, 1], p=[0.9, 0.1])

def gen_horario_adecuado(asistencia):
    if asistencia >= 80:
        return np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1])
    return np.random.choice([0, 1, 2], p=[0.2, 0.4, 0.4])

def gen_abandona(rendimiento, considera_desertar, apoyo, motivacion, asistencia):
    """
    Genera la variable objetivo 'abandona' con un peso realista basado en factores clave.
    """
    prob = 0.05  # probabilidad base baja

    # Aumenta la probabilidad si el rendimiento es bajo
    if rendimiento <= 2:
        prob += 0.4
    elif rendimiento == 3:
        prob += 0.2

    # Si considera desertar
    if considera_desertar == 1:
        prob += 0.3

    # Poco apoyo familiar
    if apoyo <= 1:
        prob += 0.2

    # Baja motivación
    if motivacion <= 2:
        prob += 0.2

    # Baja asistencia
    if asistencia < 60:
        prob += 0.3
    elif asistencia < 80:
        prob += 0.1

    # Limitar probabilidad entre 0 y 1
    prob = min(prob, 0.95)

    return np.random.choice([1, 0], p=[prob, 1 - prob])


# Lista para almacenar los registros generados
datos_generados = []

# Generación de cada fila con lógica condicional
for _ in range(num_samples):
    edad = gen_rango_edad()
    sexo = gen_sexo()
    grado = gen_grado_escolar(edad)
    asistencia = gen_frecuencia_asistencia()
    apoyo = gen_apoyo_familiar()
    rendimiento = gen_rendimiento_academico(apoyo, asistencia)
    desertar = gen_considera_desertar(rendimiento, apoyo)
    economia = gen_situacion_economica()
    tecnologia = gen_acceso_tecnologia()
    extras = gen_actividades_extras()
    relacion = gen_relacion_social()
    motivacion = gen_motivacion_estudios(rendimiento, apoyo)
    traslado = gen_tiempo_traslado()
    trabaja = gen_trabaja_estudia(edad)
    vive = gen_vive_solo(edad)
    horario = gen_horario_adecuado(asistencia)

    abandona = gen_abandona(rendimiento, desertar, apoyo, motivacion, asistencia)

    fila = [abandona, edad, sexo, grado, asistencia, apoyo, rendimiento, desertar,
            economia, tecnologia, extras, relacion, motivacion, traslado,
            trabaja, vive, horario]
    datos_generados.append(fila)

# Crear DataFrame con nombres de columnas (abandona al inicio)
columnas = ['abandona','rango_edad','sexo','grado_escolar','frecuencia_asistencia','apoyo_familiar',
            'rendimiento_academico','considera_desertar','situacion_economica','acceso_tecnologia',
            'actividades_extras','relacion_social','motivacion_estudios','tiempo_traslado',
            'trabaja_estudia','vive_solo','horario_adecuado']

def limpiar_nombre(nombre):
    # Elimina acentos
    nombre = ''.join(
        (c for c in unicodedata.normalize('NFD', nombre) if unicodedata.category(c) != 'Mn')
    )
    # Quitar puntos, espacios y caracteres no alfabéticos
    nombre = re.sub(r'[^a-zA-Z]', '', nombre)
    return nombre

def generar_nombre(sexo):
    if sexo == 0:
        nombre = fake.first_name_female()
    else:
        nombre = fake.first_name_male()
    nombre = limpiar_nombre(nombre)
    return nombre


df_sintetico = pd.DataFrame(datos_generados, columns=columnas)

df_sintetico['nombre_completo'] = df_sintetico['sexo'].apply(generar_nombre)

# Reordenar columnas si lo deseas (ej: nombre primero)
columnas = ['nombre_completo'] + columnas
df_sintetico = df_sintetico[columnas]
# Guardar en CSV
df_sintetico.to_csv("datos_Entrenamiento.csv", index=False)

print("Archivo generado con columna 'abandona' incluida.")
