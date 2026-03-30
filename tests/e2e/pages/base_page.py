from __future__ import annotations

from playwright.sync_api import Page


class BasePage:
    def __init__(self, page: Page, base_url: str) -> None:
        self.page = page
        self.base_url = base_url.rstrip("/")

    def goto(self, path: str) -> None:
        target = f"{self.base_url}{path}"
        self.page.goto(target, wait_until="domcontentloaded")
