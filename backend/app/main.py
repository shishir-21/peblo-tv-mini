from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.artwork import router as artwork_router


app = FastAPI(
    title="Peblo TV Mini API",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(artwork_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
