import logging

from app.config import get_settings


def setup_logging() -> None:
    """Configure application-wide logging."""

    settings = get_settings()
    level = logging.DEBUG if settings.debug else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
