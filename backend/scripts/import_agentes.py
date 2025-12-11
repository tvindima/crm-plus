from pathlib import Path
import pandas as pd
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.agents.models import Agent
# Import dependent models so SQLAlchemy can resolve relationships
import app.teams.models  # noqa: F401
import app.agencies.models  # noqa: F401
import app.leads.models  # noqa: F401
import app.properties.models  # noqa: F401


CSV_PATH = Path(__file__).parent / "agentes.csv"


def load_agents(df, db: Session):
    inserted = 0
    skipped = []

    for _, row in df.iterrows():
        name = str(row.get("Nome", "")).strip()
        email = str(row.get("Email", "")).strip()
        phone = str(row.get("Telefone", "")).strip() if pd.notna(row.get("Telefone")) else None

        if not email:
            skipped.append({"email": None, "reason": "email vazio"})
            continue

        existing = db.query(Agent).filter_by(email=email).first()
        if existing:
            skipped.append({"email": email, "reason": "duplicado"})
            continue

        agent = Agent(
            name=name,
            email=email,
            phone=phone or None,
            team_id=None,
            agency_id=None,
        )
        db.add(agent)
        inserted += 1

    db.commit()
    return inserted, skipped


def main():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV não encontrado em {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)
    with SessionLocal() as db:
        inserted, skipped = load_agents(df, db)

    print(f"Importação concluída. Inseridos: {inserted}. Ignorados: {len(skipped)}.")
    if skipped:
        print("Registos ignorados:")
        for item in skipped:
            print(f"- {item['email']}: {item['reason']}")


if __name__ == "__main__":
    main()
