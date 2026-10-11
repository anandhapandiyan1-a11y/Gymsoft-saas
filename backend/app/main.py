from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.routers import auth, owner, trainer, member
from app.routers import super_admin
from app.config import settings
import os

app = FastAPI(title="GymSoft SaaS API", version="1.0.0")

# Initialize database
init_db()

# Static files for poster images
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS - use allowed origins from settings
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(owner.router)
app.include_router(trainer.router)
app.include_router(member.router)
app.include_router(super_admin.router)

@app.get("/")
def root():
    return {"status": "GymSoft Backend Running Live", "version": "1.0.0", "environment": settings.ENVIRONMENT}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "gymsoft-api"}