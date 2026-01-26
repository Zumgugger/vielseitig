.PHONY: help dev run test lint format clean migrate seed

help:
	@echo "Available commands:"
	@echo "  make dev      - Start development server with auto-reload"
	@echo "  make run      - Run production server"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linting (flake8)"
	@echo "  make format   - Format code (black)"
	@echo "  make clean    - Clean cache and build artifacts"
	@echo "  make migrate  - Run database migrations"
	@echo "  make seed     - Seed database with initial data"

dev:
	.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run:
	.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

test:
	.venv/bin/pytest -v

lint:
	.venv/bin/flake8 app/ --max-line-length=120 --exclude=__pycache__,*.pyc,.venv

format:
	.venv/bin/black app/ --line-length=120

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

migrate:
	.venv/bin/alembic upgrade head

seed:
	.venv/bin/python -m app.db.seed
