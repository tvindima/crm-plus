from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.properties.models import Property, PropertyStatus
import app.agents.models  # noqa: F401
import app.leads.models  # noqa: F401
import app.teams.models  # noqa: F401
import app.agencies.models  # noqa: F401


# Caminho preferencial (Descargas). Fallback para backend/scripts/propriedades.csv
DEFAULT_CSV = Path.home() / "Descargas" / "propriedades.csv"
FALLBACK_CSV = Path(__file__).parent / "propriedades.csv"


def parse_float(value: str) -> Optional[float]:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    # remove simbolos e troca vírgulas por ponto
    for token in ["€", "m²", " "]:
        text = text.replace(token, "")
    text = text.replace(".", "")  # remove separador de milhar
    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_date(value: str) -> Optional[datetime.date]:
    text = str(value).strip() if value is not None else ""
    if not text:
        return None
    for fmt in ("%d/%m/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def map_status(raw: str) -> PropertyStatus:
    text = (raw or "").lower()
    if "reserv" in text:
        return PropertyStatus.RESERVED
    if "vend" in text or "sold" in text:
        return PropertyStatus.SOLD
    return PropertyStatus.AVAILABLE


def load_csv() -> pd.DataFrame:
    path = DEFAULT_CSV if DEFAULT_CSV.exists() else FALLBACK_CSV
    if not path.exists():
        raise FileNotFoundError(f"CSV não encontrado em {DEFAULT_CSV} nem {FALLBACK_CSV}")
    cols = [
        "referencia",
        "negocio",
        "tipo",
        "tipologia",
        "preco",
        "quartos",
        "estado",
        "concelho",
        "freguesia",
        "area_util",
        "area_terreno",
        "ce",
        "angariador",
        "data_criacao",
    ]
    df = pd.read_csv(
        path,
        delimiter=";",
        names=cols,
        header=0,
        engine="python",
        on_bad_lines="skip",
    )
    return df


def build_property(row: pd.Series) -> dict:
    referencia = str(row.get("referencia", "")).strip()
    tipo = str(row.get("tipo", "")).strip()
    negocio = str(row.get("negocio", "")).strip()
    tipologia = str(row.get("tipologia", "")).strip()
    preco = parse_float(row.get("preco"))
    area_util = parse_float(row.get("area_util"))
    concelho = str(row.get("concelho", "")).strip()
    freguesia = str(row.get("freguesia", "")).strip()
    estado_raw = str(row.get("estado", "")).strip()
    data_criacao = parse_date(row.get("data_criacao"))

    title = referencia if referencia else f"{tipo or 'Propriedade'}"
    description_parts = [
        f"Negócio: {negocio}" if negocio else "",
        f"Tipo: {tipo}" if tipo else "",
        f"Tipologia: {tipologia}" if tipologia else "",
        f"Referência: {referencia}" if referencia else "",
    ]
    description = " | ".join(part for part in description_parts if part)

    location_parts = [concelho, freguesia]
    location = ", ".join([p for p in location_parts if p])

    return {
        "title": title,
        "description": description or None,
        "price": preco,
        "area": area_util,
        "location": location or None,
        "status": map_status(estado_raw),
        "agent_id": None,
        "created_at": data_criacao,
        "updated_at": None,
    }


def import_properties(df: pd.DataFrame, db: Session):
    inserted = 0
    skipped = []
    errors = []

    for _, row in df.iterrows():
        referencia = str(row.get("referencia", "")).strip()
        data = build_property(row)

        # Dedupe pela referência (usamos título como referência)
        existing = db.query(Property).filter_by(title=data["title"]).first()
        if existing:
            skipped.append(referencia or data["title"])
            continue

        try:
            prop = Property(**data)
            db.add(prop)
            inserted += 1
        except Exception as exc:  # noqa: BLE001
            errors.append({"referencia": referencia or data["title"], "error": str(exc)})

    db.commit()
    return inserted, skipped, errors


def main():
    df = load_csv()
    with SessionLocal() as db:
        inserted, skipped, errors = import_properties(df, db)

    print(f"Importação concluída. Inseridos: {inserted}. Ignorados (duplicados): {len(skipped)}.")
    if skipped:
        print("Referências ignoradas:")
        for ref in skipped:
            print(f"- {ref}")
    if errors:
        print("Erros encontrados:")
        for err in errors:
            print(f"- {err['referencia']}: {err['error']}")


if __name__ == "__main__":
    main()
