import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

modelo = None  # Variable global para guardar el modelo entrenado

def entrenar_modelo():
    global modelo

    # Simulación de dataset para ejemplo (puedes leer desde CSV si lo tienes)
    data = pd.DataFrame({
        'edad': [17, 18, 19, 20, 18, 17, 21],
        'promedio': [8.5, 6.4, 7.2, 9.1, 5.8, 7.0, 8.0],
        'asistencia': [95, 60, 80, 99, 55, 70, 90],
        'apoyo_familiar': [1, 0, 1, 1, 0, 1, 0],
        'problemas_economicos': [0, 1, 1, 0, 1, 0, 1],
        'abandona': [0, 1, 1, 0, 1, 0, 1]
    })

    X = data.drop(columns=['abandona'])
    y = data['abandona']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    modelo = LogisticRegression()
    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    return round(accuracy, 2)

def predecir_estudiante(estudiante):
    global modelo

    if modelo is None:
        raise Exception("El modelo no está entrenado. Usa el endpoint /entrenar primero.")

    datos = np.array([[estudiante.edad,
                       estudiante.promedio,
                       estudiante.asistencia,
                       int(estudiante.apoyo_familiar),
                       int(estudiante.problemas_economicos)]])

    probabilidad = modelo.predict_proba(datos)[0][1]  # Probabilidad de clase "1" (abandona)
    return round(probabilidad, 4)
def predecir_csv(df):
    global modelo

    if modelo is None:
        raise Exception("El modelo no está entrenado.")

    # Validar columnas necesarias
    requeridas = {'nombre', 'edad', 'promedio', 'asistencia', 'apoyo_familiar', 'problemas_economicos'}
    if not requeridas.issubset(set(df.columns)):
        raise Exception(f"Faltan columnas en el CSV. Requiere: {requeridas}")

    X = df[['edad', 'promedio', 'asistencia', 'apoyo_familiar', 'problemas_economicos']]
    probabilidades = modelo.predict_proba(X)[:, 1]

    resultados = []
    for nombre, prob in zip(df['nombre'], probabilidades):
        resultados.append({"nombre": nombre, "probabilidad": round(float(prob), 4)})

    return resultados
