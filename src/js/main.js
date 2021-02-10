import Chat from './Chat';

const currLocation = window.location;
let rootURL;

if (currLocation.hostname !== 'localhost') rootURL = currLocation.href;
else rootURL = 'http://localhost:3000/';

const containerEl = document.getElementsByClassName('container')[0];

const chat = new Chat(rootURL);
chat.init(containerEl)
// eslint-disable-next-line no-console
  .then((result) => console.log('Main.js level:', result))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('⛔ Main.js level:', error));
