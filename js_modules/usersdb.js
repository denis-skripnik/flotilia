var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/users.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getUser(login) {
    return new Promise((resolve, reject) => {
        db.findOne({login}, (err,data) => {
               if(err) {
                      reject(err);
               } else {
                      resolve(data);
               }
        });
    });
}

function updateUser(login, gp, delegate_gp) {
  return new Promise((resolve, reject) => {
  db.update({login}, {login, gp, delegate_gp}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
  resolve(result);
}
  });
  });
}

function removeUser(login) {
  return new Promise((resolve, reject) => {
    db.remove({login}, {}, function (err, numRemoved) {
if (err) {
  reject(err);
} else {
       resolve(numRemoved);
}
    });
  });
  }

function findAllUsers() {
  return new Promise((resolve, reject) => {
  db.find({}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
      });
});
}

module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.removeUser = removeUser;
module.exports.findAllUsers = findAllUsers;