import modalHTML from '../html/modal-login.html';
import Modal from './Modal';

export default class ModalLogin extends Modal {
  constructor() {
    super({ modalHTML, isCircularTab: false });

    this.els = {
      ...this.els,
      errMsg: null,
    };

    this.selectors = {
      errMsg: '[data-modal="err-msg"]',
    };

    this.init();
  }

  init() {
    this.firstEl.addEventListener('input', this.hideErrMsg.bind(this));
    this.els.errMsg = this.els.form.querySelector(this.selectors.errMsg);
  }

  showErrMsg() {
    this.els.errMsg.removeAttribute('data-visibility');
  }

  hideErrMsg() {
    this.els.errMsg.dataset.visibility = 'v-hidden';
  }

  show() {
    super.show();
    this.hideErrMsg();
  }

  onFormSubmit(event) {
    super.onFormSubmit(event);

    const formData = new FormData(event.currentTarget);
    this.resolve(formData);
  }
}
