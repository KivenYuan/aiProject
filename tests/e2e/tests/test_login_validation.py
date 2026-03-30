from __future__ import annotations

from playwright.sync_api import Page, expect

from pages.auth_page import AuthPage


def test_login_requires_email_and_password(page: Page, app_base_url: str) -> None:
    auth = AuthPage(page, app_base_url)

    auth.open()
    auth.login_fill(email="", password="")
    auth.submit_login()

    expect(page.get_by_text("邮箱不能为空")).to_be_visible()
    expect(page.get_by_text("密码不能为空")).to_be_visible()
