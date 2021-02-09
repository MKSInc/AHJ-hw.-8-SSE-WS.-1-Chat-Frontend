import Chat from './Chat';

const containerEl = document.getElementsByClassName('container')[0];

const chat = new Chat();
chat.init(containerEl)
// eslint-disable-next-line no-console
  .then((result) => console.log(result))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('⛔', error));
