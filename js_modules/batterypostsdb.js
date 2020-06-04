var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/batteryposts.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getBatteryPost(url) {
    return new Promise((resolve, reject) => {
        db.findOne({url}, (err,data) => {
               if(err) {
                      reject(err);
               } else {
                      resolve(data);
               }
        });
    });
}

function updateBatteryPost(url, title, tag) {
  return new Promise((resolve, reject) => {
  db.update({url}, {url, title, tag}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
  resolve(result);
}
  });
  });
}

function removeBatteryPosts() {
  return new Promise((resolve, reject) => {
    db.remove({}, {multi: true}, function (err, numRemoved) {
if (err) {
  reject(err);
} else {
       resolve(numRemoved);
}
    });
  });
  }

function findAllBatteryPosts() {
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

module.exports.getBatteryPost = getBatteryPost;
module.exports.updateBatteryPost = updateBatteryPost;
module.exports.removeBatteryPosts = removeBatteryPosts;
module.exports.findAllBatteryPosts = findAllBatteryPosts;