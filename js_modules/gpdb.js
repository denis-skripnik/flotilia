var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/table.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getPercent(gp) {
    return new Promise((resolve, reject) => {
        db.find({gp: {"$lte":gp}}).sort({gp:-1}).limit(1).exec((err,data) => {
               if(err) {
                      reject(err);
               } else {
                      if(data && data.length) {
                            resolve(data[0]);
                      }
                      else resolve(null);
               }
        });
    });
}
  
function updatePercent(percent, gp) {
  return new Promise((resolve, reject) => {
  db.update({percent}, {percent, gp}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
  resolve(result);
}
  });
  });
}

function removePercent(db_id) {
  return new Promise((resolve, reject) => {
    db.remove({_id: db_id}, {}, function (err, numRemoved) {
if (err) {
  reject(err);
} else {
       resolve(numRemoved);
}
    });
  });
  }

function findAllPercents() {
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

module.exports.getPercent = getPercent;
module.exports.updatePercent = updatePercent;
module.exports.removePercent = removePercent;
module.exports.findAllPercents = findAllPercents;