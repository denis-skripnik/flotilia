var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/activists.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getActivist(login) {
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

function updateActivist(login, percent) {
  return new Promise((resolve, reject) => {
  db.update({login}, {login, percent}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
  resolve(result);
}
  });
  });
}

function removeActivist(login) {
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

function findAllActivists() {
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

module.exports.getActivist = getActivist;
module.exports.updateActivist = updateActivist;
module.exports.removeActivist = removeActivist;
module.exports.findAllActivists = findAllActivists;