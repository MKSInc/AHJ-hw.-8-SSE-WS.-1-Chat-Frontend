import InteractiveEl from './InteractiveEl';

export default class BtnLoginLogout extends InteractiveEl {
  constructor(el) {
    super(el);
    this.status = 'login';
  }

  setLoginStatus() {
    this.el.textContent = 'Login';
    this.status = 'login';
  }

  setLogoutStatus() {
    this.el.textContent = 'Logout';
    this.status = 'logout';
    this.enable();
  }
}
