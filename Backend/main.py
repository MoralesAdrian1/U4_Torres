from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import logging
import io
import tempfile
import os
import traceback
from logisticModel import entrenar_modelo as entrenar_modelo_original, predecir_csv as predecir_csv_original

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variables globales para almacenar configuración y modelo
modelo_config = {
    'df': None,
    'target_col': None,
    'features': None,
    'df_predicciones': None
}
modelo_entrenado = None

class ConfigModelo(BaseModel):
    target_col: str
    features: List[str]

class EstudianteEntrada(BaseModel):
    edad: int
    promedio: float
    asistencia: float
    apoyo_familiar: bool
    problemas_economicos: bool

@app.post("/cargar-datos")
async def cargar_datos(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        modelo_config['df'] = df
        logger.info(f"Datos cargados correctamente. Columnas: {df.columns.tolist()}")
        return {
            "mensaje": "Datos cargados exitosamente",
            "columnas": df.columns.tolist(),
            "preview": df.head().to_dict(orient='records')
        }
    except Exception as e:
        logger.error(f"Error al cargar datos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/configurar-modelo")
async def configurar_modelo(config: ConfigModelo):
    try:
        if modelo_config['df'] is None:
            raise HTTPException(status_code=400, detail="Primero cargue un archivo CSV")
        
        # Validar que las columnas existan
        for col in [config.target_col] + config.features:
            if col not in modelo_config['df'].columns:
                raise HTTPException(status_code=400, detail=f"La columna {col} no existe en los datos")
        
        modelo_config['target_col'] = config.target_col
        modelo_config['features'] = config.features
        
        logger.info(f"Modelo configurado. Target: {config.target_col}, Features: {config.features}")
        return {
            "mensaje": "Modelo configurado",
            "target": config.target_col,
            "features": config.features
        }
    except Exception as e:
        logger.error(f"Error en configuración: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/entrenar-modelo")
async def entrenar_modelo():
    try:
        if modelo_config['df'] is None or modelo_config['target_col'] is None:
            raise HTTPException(status_code=400, detail="Configuración no establecida")
        
        df = modelo_config['df']
        X = df[modelo_config['features']]
        y = df[modelo_config['target_col']]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        global modelo_entrenado
        modelo_entrenado = LogisticRegression(max_iter=1000)
        modelo_entrenado.fit(X_train, y_train)
        
        # Calcular precisión
        y_pred = modelo_entrenado.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Guardar modelo
        joblib.dump(modelo_entrenado, 'modelo_entrenado.pkl')
        
        logger.info(f"Modelo entrenado. Accuracy: {accuracy}")
        return {
            "mensaje": "Modelo entrenado exitosamente",
            "accuracy": round(accuracy, 4)
        }
    except Exception as e:
        logger.error(f"Error al entrenar modelo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predecir")
async def predecir_datos(file: UploadFile = File(...)):
    try:
        if modelo_entrenado is None:
            raise HTTPException(status_code=400, detail="Modelo no entrenado")
        
        df = pd.read_csv(file.file)
        
        # Verificar que están todas las features necesarias
        for col in modelo_config['features']:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Falta la columna {col} en los datos de entrada")
        
        X = df[modelo_config['features']]
        probabilidades = modelo_entrenado.predict_proba(X)[:, 1]
        
        # Guardar predicciones para posible descarga
        df['probabilidad_desercion'] = np.round(probabilidades, 4)
        modelo_config['df_predicciones'] = df
        
        # Agregar nombres si existen
        if 'nombre' in df.columns:
            resultados = pd.DataFrame({
                'nombre': df['nombre'],
                'probabilidad_desercion': df['probabilidad_desercion']
            })
        else:
            resultados = pd.DataFrame({
                'probabilidad_desercion': df['probabilidad_desercion']
            })
        
        logger.info(f"Predicciones generadas para {len(df)} estudiantes")
        return {"resultados": resultados.to_dict(orient='records')}
    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    

@app.get("/descargar-datos/{tipo}/{formato}")
async def descargar_datos(tipo: str, formato: str):
    try:
        logger.info(f"Iniciando descarga de {tipo} en formato {formato}")
        
        if tipo == "entrenamiento":
            if modelo_config['df'] is None:
                raise HTTPException(status_code=400, detail="No hay datos de entrenamiento cargados")
            
            columnas_descarga = [modelo_config['target_col']] + modelo_config['features']
            df_descarga = modelo_config['df'][columnas_descarga].copy()
            logger.info(f"Preparando datos de entrenamiento con {len(df_descarga)} filas")
            
        elif tipo == "predicciones":
            if modelo_config['df_predicciones'] is None:
                raise HTTPException(status_code=400, detail="No hay predicciones disponibles")
            
            df_descarga = modelo_config['df_predicciones'].copy()
            logger.info(f"Preparando predicciones con {len(df_descarga)} filas")
            
        else:
            raise HTTPException(status_code=400, detail="Tipo de descarga no válido")
        
        if formato == 'csv':
            # Crear archivo CSV en memoria
            stream = io.StringIO()
            df_descarga.to_csv(stream, index=False)
            response = StreamingResponse(
                iter([stream.getvalue()]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment;filename=datos_{tipo}.csv"
                }
            )
            logger.info("Archivo CSV generado con éxito")
            return response
            
        else:  # excel por defecto
            # Crear archivo Excel en memoria
            stream = io.BytesIO()
            with pd.ExcelWriter(stream, engine='xlsxwriter') as writer:
                df_descarga.to_excel(writer, index=False, sheet_name=f'Datos_{tipo}')
            response = StreamingResponse(
                iter([stream.getvalue()]),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f"attachment;filename=datos_{tipo}.xlsx"
                }
            )
            logger.info("Archivo Excel generado con éxito")
            return response
            
    except Exception as e:
        logger.error(f"Error en descarga: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar archivo: {str(e)}"
        )

# Integración con el modelo original
@app.post("/entrenar-modelo-original")
async def entrenar_modelo_original_endpoint():
    try:
        accuracy = entrenar_modelo_original()
        return {"mensaje": "Modelo original entrenado", "accuracy": accuracy}
    except Exception as e:
        logger.error(f"Error en modelo original: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/entrenar")
async def entrenar():
    try:
        # Aquí llamas al modelo basado en archivo fijo
        accuracy = entrenar_modelo_original()
        return {"mensaje": "Modelo original entrenado", "accuracy": accuracy}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predecir-csv-original")
async def predecir_csv_original_endpoint(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        resultados = predecir_csv_original(df)
        return {"resultados": resultados}
    except Exception as e:
        logger.error(f"Error en predicción original: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)