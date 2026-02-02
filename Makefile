.PHONY: help dev dev-backend run test lint format clean migrate seed kill-ports

# Activate venv for all commands
VENV := . .venv/bin/activate &&

help:
	@echo "Available commands:"
	@echo "  make dev          - Start backend (uvicorn) and frontend (vite) dev servers"
	@echo "  make dev-backend  - Start backend dev server only"
	@echo "  make run          - Run production server"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linting (flake8)"
	@echo "  make format       - Format code (black)"
	@echo "  make clean        - Clean cache and build artifacts"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database with initial data"
	@echo "  make kill-ports   - Free common dev ports (3000, 5173, 8000)"

dev:
	$(MAKE) kill-ports >/dev/null
	bash -c 'set -e; trap "kill 0" INT TERM EXIT; \
		($(VENV) uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) & \
		(cd frontend && npm run dev -- --host 0.0.0.0 --port 3000) & \
		wait'

kill-ports:
	@for port in 3000 5173 8000; do \
		pids=$$(lsof -ti:$$port 2>/dev/null || true); \
		if [ -n "$$pids" ]; then \
			echo "Killing processes on port $$port: $$pids"; \
			kill -9 $$pids 2>/dev/null || true; \
		fi; \
		if command -v fuser >/dev/null 2>&1; then \
			fuser -k $$port/tcp >/dev/null 2>&1 || true; \
		fi; \
	done

dev-backend:
	$(VENV) uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

run:
	$(VENV) uvicorn app.main:app --host 0.0.0.0 --port 8000

test:
	$(VENV) pytest -v

lint:
	$(VENV) flake8 app/ --max-line-length=120 --exclude=__pycache__,*.pyc,.venv

format:
	$(VENV) black app/ --line-length=120

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

migrate:
	$(VENV) alembic upgrade head

seed:
	$(VENV) python -m app.db.seed
