from __future__ import annotations

from playwright.sync_api import expect

from .base_page import BasePage


class AuthPage(BasePage):
    PATH = "/auth"

    def open(self) -> None:
        self.goto(self.PATH)
        expect(self.page.get_by_role("heading", name="登录与注册")).to_be_visible()

    def switch_to_register(self) -> None:
        self.page.get_by_role("button", name="注册", exact=True).click()
        expect(self.page.get_by_role("heading", name="注册新账户")).to_be_visible()

    def switch_to_login(self) -> None:
        self.page.get_by_role("button", name="登录", exact=True).click()
        expect(self.page.get_by_role("heading", name="登录", exact=True)).to_be_visible()

    def submit_login(self) -> None:
        self.page.locator("form").get_by_role("button", name="登录", exact=True).click()

    def login_fill(self, email: str = "", password: str = "") -> None:
        self.page.locator("#email").fill(email)
        self.page.locator("#password").fill(password)

    def submit_register(self) -> None:
        self.page.locator("form").get_by_role("button", name="注册", exact=True).click()

    def register_fill(
        self,
        name: str = "",
        email: str = "",
        password: str = "",
        confirm_password: str = "",
    ) -> None:
        self.page.locator("#name").fill(name)
        self.page.locator("#email").fill(email)
        self.page.locator("#password").fill(password)
        self.page.locator("#confirmPassword").fill(confirm_password)
