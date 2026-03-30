from __future__ import annotations

import os
import urllib.error
import urllib.request

import pytest


def _app_base_url() -> str:
    return os.getenv("APP_BASE_URL", "http://localhost:5173").rstrip("/")


@pytest.fixture(scope="session")
def app_base_url() -> str:
    return _app_base_url()


@pytest.fixture(scope="session", autouse=True)
def ensure_frontend_running(app_base_url: str) -> None:
    try:
        with urllib.request.urlopen(app_base_url, timeout=8):
            return
    except urllib.error.URLError as exc:
        pytest.exit(
            f"Frontend is not reachable at {app_base_url}. "
            "Start frontend first (`cd frontend && npm run dev`) "
            "or set APP_BASE_URL to a reachable URL.",
            returncode=1,
        )
