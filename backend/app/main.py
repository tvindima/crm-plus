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

app = FastAPI(
    title="CRM PLUS Backend",
    description="API principal do sistema CRM PLUS para gestão imobiliária inteligente.",
    version="1.0.0",
)

# CORS configurável para ambientes remotos (ex.: Vercel/Expo). Use CRMPLUS_CORS_ORIGINS com lista separada por vírgulas.
raw_origins = os.environ.get(
    "CRMPLUS_CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:19006,http://127.0.0.1:19006",
)
allow_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
if not allow_origins:
    allow_origins = ["*"]

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

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/")
def root():
    return {"message": "CRM PLUS backend operacional."}
