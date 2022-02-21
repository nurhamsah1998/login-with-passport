const monggose = require('mongoose');

const User = monggose.Schema({
  username: String,
  password: String,
});
module.exports = monggose.model('User', User);
