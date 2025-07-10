import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from utils.limpiar_csv import formatear_dataframe

modelo = None  # modelo global

def entrenar_modelo():
    global modelo
    data = pd.read_csv("C:\\Users\\adria\\Desktop\\utng\\noveno\\Torres\\U4\\IDE\\Backend\\data\\datos_Entrenamiento.csv")

    y = data['abandona']
    columnas_excluir = ['nombre', 'abandona'] if 'nombre' in data.columns else ['abandona']
    X = data.drop(columns=columnas_excluir)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    modelo = LogisticRegression(max_iter=1000)
    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    return round(accuracy, 4)

def predecir_estudiante(estudiante):
    global modelo
    if modelo is None:
        raise Exception("El modelo no está entrenado. Usa el endpoint /entrenar primero.")

    datos = np.array([[estudiante.edad,
                       estudiante.promedio,
                       estudiante.asistencia,
                       int(estudiante.apoyo_familiar),
                       int(estudiante.problemas_economicos)]])

    probabilidad = modelo.predict_proba(datos)[0][1]
    return round(probabilidad, 4)

from utils.limpiar_csv import formatear_dataframe  # importa tu formateador

def predecir_csv(df):
    global modelo
    if modelo is None:
        raise Exception("El modelo no está entrenado. Usa el endpoint /entrenar primero.")

    df_limpio = formatear_dataframe(df)

    columnas_req = ['rango_edad','sexo','grado_escolar','frecuencia_asistencia','apoyo_familiar',
                    'rendimiento_academico','considera_desertar','situacion_economica',
                    'acceso_tecnologia','actividades_extras','relacion_social',
                    'motivacion_estudios','tiempo_traslado','trabaja_estudia','vive_solo','horario_adecuado']

    X = df_limpio[columnas_req]
    proba = modelo.predict_proba(X)[:, 1]

    df_limpio['probabilidad_desercion'] = np.round(proba, 4)

    return df_limpio[['nombre', 'probabilidad_desercion']].to_dict(orient="records")


