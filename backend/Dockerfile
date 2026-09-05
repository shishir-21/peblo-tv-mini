FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt backend/requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

COPY backend/ .
COPY seed_data/ ./seed_data/

CMD ["sh", "-c", "set -e; if [ \"${RUN_SEED_ON_START:-false}\" = \"true\" ]; then python -m app.seed; fi; exec uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8000}\""]
