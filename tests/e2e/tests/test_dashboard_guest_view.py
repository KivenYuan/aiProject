from __future__ import annotations

from playwright.sync_api import Page, expect

from pages.dashboard_page import DashboardPage


def test_dashboard_guest_shows_login_options(page: Page, app_base_url: str) -> None:
    dashboard = DashboardPage(page, app_base_url)

    dashboard.open()

    expect(page.get_by_role("link", name="使用 GitHub 登录")).to_be_visible()
    expect(page.get_by_role("button", name="开发模式（模拟数据）")).to_be_visible()
