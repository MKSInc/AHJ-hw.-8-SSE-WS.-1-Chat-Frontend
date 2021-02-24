/* В зависимости от типа сообщения формирует элемент соответствующего содержания:
   'connected' - в чат подключился новый пользователь
   'disconnected' - из чата вышел пользователь
   'message' - обычное сообщение от пользователя
*/
export default function createMessageEl(message) {
  const liEl = document.createElement('li');
  if (message.type !== message) liEl.dataset.messageType = message.type;
  liEl.classList.add('messages-list__item', 'message');

  const spanEl = document.createElement('span');
  spanEl.classList.add('message__header');

  const strongEl = document.createElement('strong');
  strongEl.textContent = message.userName;

  spanEl.append(strongEl);

  if (message.type === 'connected') spanEl.insertAdjacentText('beforeend', ' connected');
  else if (message.type === 'disconnected'
    || message.type === 'connectionError') spanEl.insertAdjacentText('beforeend', ' disconnected');

  const created = new Date();
  const date = created.toLocaleDateString('ru');
  const time = created.toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric' });

  spanEl.insertAdjacentText('beforeend', `, ${time} ${date}`);

  liEl.append(spanEl);

  if (message.type === 'message' || message.type === 'connectionError') {
    const pEl = document.createElement('p');
    if (message.isMyMessage) liEl.dataset.messageType = 'my-message';
    pEl.classList.add('message__text');

    let messageTextHTML = '';
    if (message.type === 'message') {
      for (const char of message.text) {
        if (char.charCodeAt(0) === 10) messageTextHTML += '<br>';
        else messageTextHTML += char;
      }
    } else if (message.type === 'connectionError') {
      messageTextHTML = 'Connection interrupted! Try logging in again.';
    }

    pEl.innerHTML = messageTextHTML;
    liEl.append(pEl);
  }

  return liEl;
}
