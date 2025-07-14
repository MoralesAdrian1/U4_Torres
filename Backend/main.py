from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
import traceback

from utils.validaciones import preparar_datos
from AlgoritmoPropio import calcular_probabilidad_manualmente
from logisticModel import entrenar_modelo as entrenar_modelo_original, predecir_csv as predecir_csv_original

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variables globales
modelo_config = {
    'df': None,
    'target_col': None,
    'features': None,
    'df_predicciones': None,
    'df_comparacion': None
}
modelo_entrenado = None

# Modelos Pydantic
class ConfigModelo(BaseModel):
    target_col: str
    features: List[str]

class EstudianteEntrada(BaseModel):
    edad: int
    promedio: float
    asistencia: float
    apoyo_familiar: bool
    problemas_economicos: bool

# ENDPOINTS

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

        df = modelo_config['df']

        # Validar columnas existentes
        for col in [config.target_col] + config.features:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"La columna {col} no existe en los datos")

        # Validar columnas numéricas
        columnas_id = ['nombre', 'nombre_completo']
        columnas_a_validar = [col for col in config.features if col not in columnas_id]
        columnas_invalidas = [col for col in columnas_a_validar if not pd.api.types.is_numeric_dtype(df[col])]
        if columnas_invalidas:
            raise HTTPException(status_code=400, detail=f"Las siguientes columnas no son numéricas y no pueden usarse como features: {columnas_invalidas}")

        modelo_config['target_col'] = config.target_col
        modelo_config['features'] = config.features

        logger.info(f"Modelo configurado. Target: {config.target_col}, Features: {config.features}")
        return {"mensaje": "Modelo configurado", "target": config.target_col, "features": config.features}

    except Exception as e:
        logger.error(f"Error en configuración: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/entrenar-modelo")
async def entrenar_modelo():
    global modelo_entrenado
    try:
        if modelo_config['df'] is None or modelo_config['target_col'] is None or modelo_config['features'] is None:
            raise HTTPException(status_code=400, detail="Configuración no establecida")

        df = modelo_config['df'].copy()
        features = modelo_config['features']
        target = modelo_config['target_col']

        columnas_id = ['nombre', 'nombre_completo']
        features_filtradas = [col for col in features if col not in columnas_id]

        for col in features_filtradas:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Falta la columna de feature: {col}")
        if target not in df.columns:
            raise HTTPException(status_code=400, detail=f"Falta la columna objetivo: {target}")

        X = df[features_filtradas]
        y = df[target]

        try:
            X = X.apply(pd.to_numeric, errors='raise')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Las columnas de features deben ser numéricas. Error: {str(e)}")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        modelo_entrenado = LogisticRegression(max_iter=1000)
        modelo_entrenado.fit(X_train, y_train)

        y_pred = modelo_entrenado.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        joblib.dump(modelo_entrenado, 'modelo_entrenado.pkl')

        logger.info(f"Modelo entrenado. Accuracy: {accuracy}")
        return {"mensaje": "Modelo entrenado exitosamente", "accuracy": round(accuracy, 4)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al entrenar modelo: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predecir")
async def predecir_datos(file: UploadFile = File(...)):
    try:
        if modelo_entrenado is None:
            raise HTTPException(status_code=400, detail="Modelo no entrenado")

        df = pd.read_csv(file.file)
        all_features = modelo_config['features']

        columnas_id = ['nombre', 'nombre_completo']
        col_identificacion = next((col for col in columnas_id if col in df.columns), None)
        features_filtradas = [col for col in all_features if col not in columnas_id]

        for col in features_filtradas:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Falta la columna {col} en los datos de entrada")

        X = df[features_filtradas]

        try:
            X = X.apply(pd.to_numeric, errors='raise')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error en columnas numéricas: {str(e)}")

        probabilidades = modelo_entrenado.predict_proba(X)[:, 1]
        df['probabilidad_desercion'] = np.round(probabilidades, 4)
        modelo_config['df_predicciones'] = df

        if col_identificacion:
            resultados = df[[col_identificacion, 'probabilidad_desercion']]
        else:
            resultados = df[['probabilidad_desercion']]

        logger.info(f"Predicciones generadas para {len(df)} estudiantes")
        return {"resultados": resultados.to_dict(orient='records')}

    except Exception as e:
        logger.error(f"Error en predicción: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predecir-avanzado")
async def predecir_con_reglas_avanzado_endpoint(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        resultados = calcular_probabilidad_manualmente(df)
        return {"resultados": resultados}
    except Exception as e:
        logger.error(f"Error en predicción avanzada: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/comparar-modelos")
async def comparar_modelos(file: UploadFile = File(...)):
    try:
        if modelo_entrenado is None:
            raise HTTPException(status_code=400, detail="Modelo de regresión logística no entrenado")
        if modelo_config['features'] is None:
            raise HTTPException(status_code=400, detail="Modelo no configurado")

        df = pd.read_csv(file.file)
        features = modelo_config['features']

        # Preparar datos con función externa que debe devolver X y columnas identificadoras
        X, identificadores = preparar_datos(df, features)
        if X.empty:
            raise HTTPException(status_code=400, detail="No hay datos válidos para predicción después de preparar_datos")

        # Predicción regresión logística
        y_logistico = np.round(modelo_entrenado.predict_proba(X)[:, 1], 4)

        # Predicción algoritmo manual
        try:
            df['probabilidad_algoritmo'] = df.apply(calcular_probabilidad_manualmente, axis=1)
        except Exception as e:
            logger.error(f"Error en algoritmo manual: {str(e)}")
            raise HTTPException(status_code=500, detail="Error en cálculo de algoritmo manual")

        resultados = []
        for i in range(len(df)):
            prob_logistico = float(y_logistico[i])
            prob_reglas = float(df.loc[i, 'probabilidad_algoritmo'])
            resultado = {
                "indice": i,
                "modelo_logistico": prob_logistico,
                "modelo_reglas": prob_reglas,
                "diferencia": round(abs(prob_logistico - prob_reglas), 4)
            }
            if identificadores is not None:
                resultado["nombre"] = identificadores.iloc[i]
            resultados.append(resultado)

        modelo_config['df_comparacion'] = pd.DataFrame(resultados)
        logger.info(f"Comparación completada con {len(resultados)} registros")
        return {"comparacion": resultados}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en comparación: {traceback.format_exc()}")
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

        elif tipo == "comparacion":
            if modelo_config['df_comparacion'] is None:
                raise HTTPException(status_code=400, detail="No hay comparación disponible")

            df_descarga = modelo_config['df_comparacion'].copy()
            logger.info(f"Preparando comparación con {len(df_descarga)} filas")

        else:
            raise HTTPException(status_code=400, detail="Tipo de descarga no válido")

        if formato == 'csv':
            stream = io.StringIO()
            df_descarga.to_csv(stream, index=False)
            response = StreamingResponse(
                iter([stream.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment;filename=datos_{tipo}.csv"}
            )
            logger.info("Archivo CSV generado con éxito")
            return response
        else:
            stream = io.BytesIO()
            with pd.ExcelWriter(stream, engine='xlsxwriter') as writer:
                df_descarga.to_excel(writer, index=False, sheet_name=f'Datos_{tipo}')
            response = StreamingResponse(
                iter([stream.getvalue()]),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment;filename=datos_{tipo}.xlsx"}
            )
            logger.info("Archivo Excel generado con éxito")
            return response

    except Exception as e:
        logger.error(f"Error en descarga: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error al generar archivo: {str(e)}")


# Endpoints para modelo original (integración externa)

@app.post("/entrenar-modelo-original")
async def entrenar_modelo_original_endpoint():
    try:
        accuracy = entrenar_modelo_original()
        return {"mensaje": "Modelo original entrenado", "accuracy": accuracy}
    except Exception as e:
        logger.error(f"Error en modelo original: {str(e)}")
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
