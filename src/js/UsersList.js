export default class UsersList {
  constructor(data) {
    this.els = {
      usersList: null,
    };

    this.data = data;
  }

  init(parentEl) {
    this.els.usersList = document.createElement('ul');
    // this.els.usersList.setAttribute('data-id', 'users-list');
    this.els.usersList.classList.add('users-list');

    parentEl.append(this.els.usersList);
  }

  show(data) {
    const { userNames } = data;
    const sortedUserNames = this.sort(userNames);

    const usersEls = sortedUserNames.map((el) => {
      const liEl = document.createElement('li');

      if (el === this.data.userName) liEl.setAttribute('data-id', 'user-name');
      liEl.classList.add('users-list__item');
      liEl.textContent = el;
      return liEl;
    });

    this.clear();
    this.els.usersList.append(...usersEls);
    this.data.usersCount = userNames.length;
  }

  clear() {
    this.els.usersList.textContent = '';
  }

  // Сортирует список имен по алфавиту.
  // eslint-disable-next-line class-methods-use-this
  sort(userNames) {
    return userNames
      .map((userName, i) => ({ index: i, value: userName.toLowerCase() }))
      .sort((a, b) => {
        if (a.value > b.value) return 1;
        if (a.value < b.value) return -1;
        return 0;
      })
      .map((el) => userNames[el.index]);
  }
}
