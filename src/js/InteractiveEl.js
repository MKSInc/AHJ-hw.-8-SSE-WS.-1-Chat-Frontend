// Класс для управления интерактивного элемента: кнопки, инпуты, ссылки
// (все что кликабельно, таббабельно).
export default class InteractiveEl {
  constructor(el) {
    this.el = el;

    // Свойство, которое указываетет является ли в данный момент элемент кликабельным.
    // Можно обойтись и встроенным аттрибутом disabled, но его можно изменить в разметке
    // с помощью Dev tools.
    this.isDisabled = true;

    // Свойство, в которое можно записать текущее значение свойства this.isDisabled,
    // перед тем как this.isDisabled будет изменено, что бы потом this.isDisabled вернуть
    // в изначальное состояние.
    this.isDisabledBefore = undefined;
  }

  disable() {
    this.isDisabledBefore = this.isDisabled;
    this.el.disabled = true;
    this.isDisabled = true;
  }

  enable() {
    this.isDisabledBefore = this.isDisabled;
    this.el.disabled = false;
    this.isDisabled = false;
  }

  changeDisabledState(isDisabled) {
    if (isDisabled === true) this.disable();
    else this.enable();
  }

  changeToPrevState() {
    if (this.isDisabledBefore === true) this.disable();
    else this.enable();
  }
}
