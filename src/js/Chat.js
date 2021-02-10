/* eslint-disable max-len */
import chatHTML from '../html/chat.html';
import ModalLogin from './ModalLogin';
import HiddenTempEl from './utility';

export default class Chat {
  constructor(rootURL) {
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

    this.URL = {
      root: rootURL,
      users: `${rootURL}users`,
      addUser: `${rootURL}login`,
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

    const result = await this.activateModalLogin();

    // eslint-disable-next-line consistent-return
    return result.data;
  }

  async activateModalLogin() {
    this.modals.login.show();
    const result = await this.getUserName();

    if (!result.success) return result;
    this.modals.login.hide();
    console.log('Users list:', result);
    return result;
  }

  /* Рекурсивная функция. (Как реализовать получение и проверку имени без рекурсии пока придумать не удалось)
     1. Ожидает от пользователя ввода имени.
     2. Если пользователь нажал 'Esc' (modal-login закрылось), то делает кнопку login кликабельной
        и возвращает результат.
     3. Получив имя, проверяет свободно ли оно с помощью checkUserName().
     4. Если имя занято, сообщает об этом пользователю и запускает саму себя, алгоритм возвращается на пункт 1.
     5. Если имя свободно, записывает результат проверки и возвращает его.
     6. Если имя прошло проверку с первого раза т.е. рекурсивного запуска не было, то результат возвращается
        во внешний метод activateModalLogin(). Если были рекурсивные запуски, то результат будет возвращатся
        в саму себя на предыдущий уровень вложенности, пока не дойдет до самого первого и не вернет во внешний метод. */
  async getUserName() {
    const result = {
      success: true,
      data: '',
    };

    const formData = await this.modals.login.getData();

    // Если окно входа было закрыто с помощью 'Esc', то активируем кнопку login и выходим.
    if (!formData) {
      this.ents.btnLoginLogout.disabled = false;
      this.els.btns.loginLogout.disabled = false;
      result.success = false;
      result.data = 'Modal-login was closed with the \'Esc\' key.';
    } else {
      const checkNameResult = await this.checkUserName(formData);

      if (!checkNameResult.success) {
        this.modals.login.showErrMsg();
        const recursionResult = await this.getUserName();
        result.success = recursionResult.success; // Для случая, когда нажали 'Esc'.
        result.data = recursionResult.data;
      } else {
        result.data = checkNameResult.data;
      }
    }

    return result;
  }

  /* Отправляет на сервер полученное имя от пользователя.
     Если имя свободно сервер возвращает это имя и список подключенных пользователей. */
  async checkUserName(formData) {
    const userName = formData.get('name');
    // Послать запрос на сервер с проверкой, свободно ли введенное имя.
    const response = await fetch(this.URL.addUser, {
      method: 'POST',
      body: userName,
    });

    const result = await response.json();
    return result;
  }

  async onBtnLoginLogoutClick() {
    if (this.ents.btnLoginLogout.state === 'login') {
      this.els.btns.loginLogout.disabled = true;

      // eslint-disable-next-line no-unused-vars
      const result = await this.activateModalLogin();
    }
  }
}
