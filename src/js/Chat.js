import chatHTML from '../html/chat.html';
import ModalLogin from './ModalLogin';
import HiddenTempEl from './utility';

export default class Chat {
  constructor() {
    this.els = {
      chat: null,
      btns: {
        loginLogout: null,
      },
    };

    this.selectors = {
      chat: '[data-widget="chat"]',
      btns: {
        loginLogout: '[data-action="login-logout"]',
      },
    };

    // entities
    this.ents = {
      btnLoginLogout: {
        disabled: true,
        state: 'login',
      },
    };

    this.modals = {
      login: null,
    };
  }

  async init(parentEl) {
    let htEl = new HiddenTempEl(chatHTML).el;

    this.els.chat = document.querySelector(this.selectors.chat);

    this.els.btns.loginLogout = this.els.chat.querySelector(this.selectors.btns.loginLogout);
    this.els.btns.loginLogout.addEventListener('click', this.onBtnLoginLogoutClick.bind(this));

    parentEl.append(this.els.chat);
    htEl.remove();
    htEl = null;

    this.modals.login = new ModalLogin();

    const formData = await this.getUserName();
    console.log(formData);

    if (!formData) return;
    const userName = formData.get('name');
    console.log(userName);

    // Послать запрос на сервер с проверкой, свободно ли введенное имя.
  }

  async getUserName() {
    const formData = await this.modals.login.show();

    // Если окно входа было закрыто с помощью 'Esc', то активируем кнопку login и выходим.
    if (!formData) {
      this.ents.btnLoginLogout.disabled = false;
      this.els.btns.loginLogout.disabled = false;
      return;
    }
    // eslint-disable-next-line consistent-return
    return formData;
  }

  async onBtnLoginLogoutClick() {
    if (this.ents.btnLoginLogout.state === 'login') {
      this.els.btns.loginLogout.disabled = true;

      const formData = await this.getUserName();
      // eslint-disable-next-line no-useless-return
      if (!formData) return;
    }
  }
}
