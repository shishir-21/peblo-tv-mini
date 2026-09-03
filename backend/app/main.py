from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.artwork import router as artwork_router
from app.api.publish import router as publish_router
from app.api.categories import router as categories_router
from app.api.shows import router as shows_router
from app.api.seasons import router as seasons_router
from app.api.episodes import router as episodes_router
from app.api.validation import router as validation_router

app = FastAPI(
    title="Peblo TV Mini API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(artwork_router)
app.include_router(publish_router)
app.include_router(categories_router)
app.include_router(shows_router)
app.include_router(seasons_router)
app.include_router(episodes_router)
app.include_router(validation_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
