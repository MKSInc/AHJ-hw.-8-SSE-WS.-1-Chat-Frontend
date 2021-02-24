import links from './links';
import Chat from './Chat';

const containerEl = document.getElementsByClassName('container')[0];

const chat = new Chat(links);
chat.init(containerEl)
// eslint-disable-next-line no-console
  .then((result) => console.log('Main.js level:', result))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('⛔ Main.js level:', error));
