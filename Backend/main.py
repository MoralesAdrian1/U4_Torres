from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from model.logisticModel import entrenar_modelo, predecir_estudiante,predecir_csv
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
app = FastAPI()

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],  # O restringe solo a "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Modelo de entrada para un estudiante
class EstudianteEntrada(BaseModel):
    edad: int
    promedio: float
    asistencia: float
    apoyo_familiar: bool
    problemas_economicos: bool

# Endpoint para entrenamiento del modelo
@app.post("/entrenar")
def entrenar():
    try:
        accuracy = entrenar_modelo()
        return {"mensaje": "Modelo entrenado correctamente", "accuracy": accuracy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para predecir la probabilidad de deserción de un nuevo estudiante
@app.post("/predecir")
def predecir(estudiante: EstudianteEntrada):
    try:
        probabilidad = predecir_estudiante(estudiante)
        return {"probabilidad_de_desercion": probabilidad}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/test")
def test():
    try:
        return {"Hola"}
    except Exception as e:
        raise HTTPException(status_code = 500,detail= str(e))


@app.post("/predecir_csv")
def predecir_desde_csv(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        resultados = predecir_csv(df)
        return {"resultados": resultados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
