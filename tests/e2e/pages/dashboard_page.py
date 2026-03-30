from __future__ import annotations

from playwright.sync_api import expect

from .base_page import BasePage


class DashboardPage(BasePage):
    PATH = "/dashboard"

    def open(self) -> None:
        self.goto(self.PATH)
        expect(self.page.get_by_role("heading", name="开发者数据仪表盘")).to_be_visible()

    def click_dev_mode(self) -> None:
        self.page.get_by_role("button", name="开发模式（模拟数据）").click()
