import modalHTML from '../html/modal-help.html';
import Modal from './Modal';

export default class ModalHelp extends Modal {
  constructor() {
    super({ modalHTML });
  }
}
