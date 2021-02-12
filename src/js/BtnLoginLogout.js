export default class BtnLoginLogout {
  constructor(btnEl) {
    this.btnEl = btnEl;
    this.status = 'login';
    this.disabled = true;
  }

  setLoginStatus() {
    this.btnEl.textContent = 'Login';
    this.status = 'login';
    this.disable();
  }

  setLogoutStatus() {
    this.btnEl.textContent = 'Logout';
    this.status = 'logout';
    this.enable();
  }

  disable() {
    this.btnEl.disabled = true;
    this.disabled = true;
  }

  enable() {
    this.btnEl.disabled = false;
    this.disabled = false;
  }
}
