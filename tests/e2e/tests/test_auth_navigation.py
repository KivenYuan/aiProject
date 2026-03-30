from __future__ import annotations

from playwright.sync_api import Page, expect

from pages.auth_page import AuthPage


def test_auth_tab_switching(page: Page, app_base_url: str) -> None:
    auth = AuthPage(page, app_base_url)

    auth.open()
    auth.switch_to_register()
    auth.switch_to_login()

    expect(page.get_by_text("演示账号", exact=True)).to_be_visible()
