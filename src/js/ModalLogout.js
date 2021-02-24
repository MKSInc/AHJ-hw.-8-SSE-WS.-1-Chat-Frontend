import modalHTML from '../html/modal-logout.html';
import Modal from './Modal';

export default class ModalLogout extends Modal {
  constructor() {
    super({ modalHTML });
  }

  onFormSubmit(event) {
    super.onFormSubmit(event);
    this.resolve(true);
    this.hide();
  }
}
