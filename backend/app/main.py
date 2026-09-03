from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.auth import router as auth_router
from app.api.artwork import router as artwork_router
from app.api.publish import router as publish_router
from app.api.categories import router as categories_router
from app.api.shows import router as shows_router
from app.api.seasons import router as seasons_router
from app.api.episodes import router as episodes_router
from app.api.validation import router as validation_router

app = FastAPI(
    title="Peblo TV CMS API",
    description="The Content Management System API for Peblo TV Mini",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", # CMS
        "http://localhost:5174", # Viewer
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(artwork_router)
app.include_router(publish_router)
app.include_router(categories_router)
app.include_router(shows_router)
app.include_router(seasons_router)
app.include_router(episodes_router)
app.include_router(validation_router)

storage_path = Path(__file__).resolve().parents[2] / "storage"
storage_path.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(storage_path)), name="storage")

@app.get("/health")
def health_check():
    return {"status": "ok"}
