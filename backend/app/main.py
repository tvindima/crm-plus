import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.leads.routes import router as leads_router
from app.properties.routes import router as properties_router
from app.agents.routes import router as agents_router
from app.teams.routes import router as teams_router
from app.agencies.routes import router as agencies_router
from app.calendar.routes import router as calendar_router
from app.feed.routes import router as feed_router
from app.match_plus.routes import router as match_plus_router
from app.assistant.routes import router as assistant_router
from app.notifications.routes import router as notifications_router
from app.billing.routes import router as billing_router
from app.reports.routes import router as reports_router

from app.api.ingestion import router as ingestion_router
from app.api.health_db import router as health_db_router
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router

# Domínios CORS finais permitidos (pode ser override por env CRMPLUS_CORS_ORIGINS)
DEFAULT_ALLOWED_ORIGINS = [
    "https://crm-plus-site.vercel.app",
    "https://institucional.crmplus.com",
    "https://imoveismais-site.vercel.app",
    "https://imoveismais.pt",
    "https://crm-plus-backoffice.vercel.app",
    "https://app.crmplus.com",
    # beta/staging
    "https://beta.crmplus.com",
    "https://web-steel-gamma-66.vercel.app",
    # desenvolvimento
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI(
    title="CRM PLUS Backend",
    description="API principal do sistema CRM PLUS para gestão imobiliária inteligente.",
    version="1.0.0",
)

# CORS configurável para ambientes remotos (ex.: Vercel/Expo). Use CRMPLUS_CORS_ORIGINS com lista separada por vírgulas.
raw_origins = os.environ.get("CRMPLUS_CORS_ORIGINS", "")
env_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
# Merge defaults + env to evitar falta de domínios críticos (inclui backoffice vercel)
allow_origins = list({*DEFAULT_ALLOWED_ORIGINS, *env_origins})
if not allow_origins:
    allow_origins = DEFAULT_ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router)
app.include_router(properties_router)
app.include_router(agents_router)
app.include_router(teams_router)
app.include_router(agencies_router)
app.include_router(calendar_router)
app.include_router(feed_router)
app.include_router(match_plus_router)
app.include_router(assistant_router)
app.include_router(notifications_router)
app.include_router(billing_router)
app.include_router(reports_router)

app.include_router(ingestion_router)
app.include_router(health_db_router)
app.include_router(health_router)
app.include_router(auth_router)

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/")
def root():
    return {"message": "CRM PLUS backend operacional."}
