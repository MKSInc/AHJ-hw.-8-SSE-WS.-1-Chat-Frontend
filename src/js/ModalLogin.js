import modalHTML from '../html/modal-login.html';
import Modal from './Modal';

export default class ModalLogin extends Modal {
  constructor() {
    super({ modalHTML, isCircularTab: false });
  }

  onFormSubmit(event) {
    super.onFormSubmit(event);

    const formData = new FormData(event.currentTarget);
    this.resolve(formData);
    this.hide();
  }
}
