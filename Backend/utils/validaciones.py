from fastapi import HTTPException
import pandas as pd

def preparar_datos(df: pd.DataFrame, features: list[str]) -> tuple[pd.DataFrame, pd.Series | None]:
    columnas_id = ['nombre', 'nombre_completo']
    col_identificacion = next((col for col in columnas_id if col in df.columns), None)

    features_filtradas = [col for col in features if col not in columnas_id]

    for col in features_filtradas:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Falta la columna {col} en los datos")

    try:
        X = df[features_filtradas].apply(pd.to_numeric, errors='raise')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error de tipo en columnas: {str(e)}")

    identificadores = df[col_identificacion] if col_identificacion else None
    return X, identificadores
