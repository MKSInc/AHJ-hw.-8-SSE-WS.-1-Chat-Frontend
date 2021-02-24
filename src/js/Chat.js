/* eslint-disable max-len */
import nanoid from 'nano-id';
import chatHTML from '../html/chat.html';
import UsersList from './UsersList';
import BtnLoginLogout from './BtnLoginLogout';
import ModalLogin from './ModalLogin';
import createMessageEl from './createMessageEl';
import HiddenTempEl from './utility';
import InteractiveEl from './InteractiveEl';
import ModalLogout from './ModalLogout';
import ModalHelp from './ModalHelp';

export default class Chat {
  constructor(links) {
    this.els = {
      chat: null,
      parentUsersList: null,
      messagesList: null,
      btns: {
        loginLogout: null,
        send: null,
        help: null,
      },
      input: null,
    };

    this.selectors = {
      chat: '[data-widget="chat"]',
      parentUsersList: '[data-parent="users-list"]',
      messagesList: '[data-chat="messages-list"]',
      btns: {
        loginLogout: '[data-action="login-logout"]',
        send: '[data-action="send"]',
        help: '[data-action="help"]',
      },
      input: '[data-chat="input"]',
    };

    // Общие данные для чата и встраемыех сущностей (entities)
    this.data = {
      // Имя, с которым пользователь подключился в чат.
      userName: null,

      // Текущее количество подключенных пользователей.
      usersCount: 0,

      // id последнего сообщения отправленного пользователем.
      // Так как собственное сообщение мы не выдаем в чат напрямую, а получаем от сервера
      // как все остальные пользователи, то что бы отобразить его особым образом, можно определить
      // свое сообщение с помощью lastMsgId.
      lastMsgId: null,
    };

    // entities
    this.ents = {
      btnLoginLogout: null,
      btnSend: null,
      input: null, // textarea для ввода сообщения.
      usersList: new UsersList(this.data),
      ws: null,
    };

    this.modals = {
      login: null,
      logout: null,
      help: null,
    };

    this.links = links;
  }

  async init(parentEl) {
    let htEl = new HiddenTempEl(chatHTML).el;

    this.els.chat = document.querySelector(this.selectors.chat);

    this.els.btns.loginLogout = this.els.chat.querySelector(this.selectors.btns.loginLogout);
    this.els.btns.loginLogout.addEventListener('click', this.onBtnLoginLogoutClick.bind(this));
    this.ents.btnLoginLogout = new BtnLoginLogout(this.els.btns.loginLogout);
    this.ents.btnLoginLogout.disable();

    this.els.parentUsersList = this.els.chat.querySelector(this.selectors.parentUsersList);
    this.ents.usersList.init(this.els.parentUsersList);

    this.els.messagesList = this.els.chat.querySelector(this.selectors.messagesList);

    this.els.btns.send = this.els.chat.querySelector(this.selectors.btns.send);
    this.els.btns.send.addEventListener('click', this.onBtnSendClick.bind(this));
    this.ents.btnSend = new InteractiveEl(this.els.btns.send);
    this.ents.btnSend.disable();

    this.els.btns.help = this.els.chat.querySelector(this.selectors.btns.help);
    this.els.btns.help.addEventListener('click', this.onBtnHelpClick.bind(this));

    this.els.input = this.els.chat.querySelector(this.selectors.input);
    this.els.input.addEventListener('input', this.onMessageInput.bind(this));
    this.els.input.addEventListener('keydown', this.onMessageKeyDown.bind(this));
    this.els.input.addEventListener('keyup', this.onMessageKeyUp.bind(this));
    this.ents.input = new InteractiveEl(this.els.input);
    this.ents.input.disable();

    parentEl.append(this.els.chat);
    htEl.remove();
    htEl = null;

    this.modals.help = new ModalHelp();

    this.modals.login = new ModalLogin();
    this.modals.login.show();
    this.modals.logout = new ModalLogout();

    const result = await this.activateModalLogin();

    // eslint-disable-next-line consistent-return
    return result.data;
  }

  async activateModalLogin() {
    this.modals.login.show();
    const result = await this.getUserName();

    if (!result.success) return result;
    this.modals.login.hide();
    this.data.userName = result.data.userName;
    this.ents.usersList.show(result.data);
    this.ents.btnLoginLogout.setLogoutStatus();
    this.ents.input.enable();
    this.els.input.focus();

    this.createWsConnection();

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
      this.ents.btnLoginLogout.enable();
      this.modals.login.firstEl.value = '';
      this.modals.login.hideErrMsg();
      result.success = false;
      result.data = 'Modal-login was closed with the \'Esc\' key.';
    } else {
      const checkNameResult = await this.checkUserName(formData);

      if (!checkNameResult.success) {
        this.modals.login.showErrMsg();
        this.modals.login.firstEl.focus();
        const recursionResult = await this.getUserName();
        result.success = recursionResult.success; // Для случая, когда нажали 'Esc'.
        result.data = recursionResult.data;
      } else {
        result.data = checkNameResult.data;
      }
    }

    return result;
  }

  // Отправляет на сервер полученное имя от пользователя.
  // Если имя свободно сервер возвращает это имя и список подключенных пользователей.
  async checkUserName(formData) {
    const userName = formData.get('name');
    // Послать запрос на сервер с проверкой, свободно ли введенное имя.
    const response = await fetch(this.links.login, {
      method: 'POST',
      body: userName,
    });

    const result = await response.json();
    return result;
  }

  createWsConnection() {
    this.ents.ws = new WebSocket(this.links.ws);

    this.ents.ws.addEventListener('open', () => {
      this.ents.ws.send(JSON.stringify({
        type: 'connected',
        userName: this.data.userName,
      }));
    });

    this.ents.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'connected':
          // Подключился новый пользователь. Обновляем список пользователей.
          this.ents.usersList.show(message);
          if (this.data.usersCount > 1 && this.els.input.value !== '') {
            if (this.modals.help.isOpen) this.ents.btnSend.isDisabledBefore = false;
            else this.ents.btnSend.enable();
          }
          break;
        case 'disconnected':
          // Какой-то пользователь отключился. Обновляем список пользователей.
          this.ents.usersList.show(message);
          if (this.data.usersCount === 1) {
            if (this.modals.help.isOpen) this.ents.btnSend.isDisabledBefore = true;
            else this.ents.btnSend.disable();
          }
          break;
        case 'message':
          if (message.id === this.data.lastMsgId) {
            message.isMyMessage = true;
          }
          break;
        default: throw Error(`Unknown message type ${message.type}`);
      }

      this.showMessage(message);
    });

    this.ents.ws.addEventListener('close', (event) => {
      if (event.wasClean) {
        this.showMessage({
          type: 'disconnected',
          userName: this.data.userName,
        });
      } else {
        this.showMessage({
          type: 'connectionError',
          userName: this.data.userName,
        });
        this.setChatStateToDisconnected();
      }
    });

    this.ents.ws.addEventListener('error', (event) => {
      // eslint-disable-next-line no-console
      console.log('error', event);
    });
  }

  async onBtnLoginLogoutClick() {
    if (this.ents.btnLoginLogout.isDisabled === true) return;
    if (this.ents.btnLoginLogout.status === 'login') {
      this.ents.btnLoginLogout.disable();

      // eslint-disable-next-line no-unused-vars
      await this.activateModalLogin();
    } else if (this.ents.btnLoginLogout.status === 'logout') {
      this.modals.logout.show();
      const result = await this.modals.logout.getData();

      if (!result) return;
      this.setChatStateToDisconnected();
      this.ents.ws.close();
    }
  }

  // При разлогинивании (пользователь вышел сам или произошел разрыв сосединения) переводит состояние
  // интерактивных элементов чата в соответсвующее состояние.
  setChatStateToDisconnected() {
    this.ents.btnLoginLogout.setLoginStatus();
    this.ents.btnSend.disable();
    this.ents.input.disable();
    this.ents.usersList.clear();
    this.data.usersCount = 0;
  }

  showMessage(message) {
    const messageEl = createMessageEl(message);
    this.els.messagesList.append(messageEl);
    messageEl.scrollIntoView({ behavior: 'smooth' });
  }

  onMessageInput() {
    if (this.data.usersCount < 2 || this.els.input.value === '') {
      this.ents.btnSend.disable();
    } else this.ents.btnSend.enable();
  }

  // событие 'keydown' срабатывает повторно при удерживании клавиш.
  onMessageKeyDown(event) {
    // Отменяем для нажатия 'Enter' действие по умолчанию - переход на новую строку.
    if (event.key === 'Enter') {
      event.preventDefault();
    }

    if ((event.key === 'Enter' && event.altKey) || (event.key === 'Enter' && event.shiftKey)) {
      // Enter + Alt (в отличии от Enter + Shift) не переходит на новую строку по умолчанию,
      // поэтому вручную добавляем '\n'. В случае нажатия Enter + Shift не будет перехода сразу на две строки
      // так как уже убрано действие по умолчанию в условии выше (event.key === 'Enter').
      this.els.input.value += '\n';
    }
  }

  // событие 'keyup' не срабатывает повторно при удерживании клавиш.
  onMessageKeyUp(event) {
    // Если 'Enter' нажат без Shift или Alt, значит это отправка сообщения.
    if ((event.key === 'Enter' && !event.altKey) && (event.key === 'Enter' && !event.shiftKey)) {
      this.onBtnSendClick();
    }
  }

  onBtnSendClick() {
    if (this.ents.btnSend.isDisabled) return;
    if (!this.ents.ws) return;
    if (this.ents.ws.readyState === WebSocket.OPEN) {
      this.data.lastMsgId = nanoid();
      const message = {
        id: this.data.lastMsgId,
        type: 'message',
        userName: this.data.userName,
        text: this.els.input.value,
      };

      this.ents.ws.send(JSON.stringify(message));
      this.els.input.value = '';
      this.els.input.focus();
    }
  }

  // Нажатие на кнопку 'help' показывает либо закрывает окно 'modal-help'.
  async onBtnHelpClick() {
    if (this.modals.help.isOpen) this.modals.help.close();
    else {
      this.modals.help.show();

      // Запрещаем пользователю взаимодействие с другими элементами, пока он не закроет окно 'modal-help'.
      this.ents.btnLoginLogout.disable();
      this.ents.btnSend.disable();
      this.ents.input.disable();

      // Ожидаем закрытия 'modal-help'.
      await this.modals.help.getData();

      // Вернуть интерактивные элементы в их прежние состояния после закрытия модального окна 'help'.
      this.ents.btnLoginLogout.changeToPrevState();
      this.ents.btnSend.changeToPrevState();
      this.ents.input.changeToPrevState();
    }
  }
}
