from __future__ import annotations

from playwright.sync_api import Page, expect

from pages.auth_page import AuthPage


def test_register_requires_matching_passwords(page: Page, app_base_url: str) -> None:
    auth = AuthPage(page, app_base_url)

    auth.open()
    auth.switch_to_register()
    auth.register_fill(
        name="Smoke User",
        email="smoke@example.com",
        password="ValidPass1",
        confirm_password="ValidPass2",
    )
    auth.submit_register()

    expect(page.get_by_text("两次输入的密码不一致")).to_be_visible()
