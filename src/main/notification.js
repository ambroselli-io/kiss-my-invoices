const { Notification } = require('electron');

exports.displayNotification = ({ title, body }) => {
  const notif = new Notification({ title, body });

  notif.show();
};
