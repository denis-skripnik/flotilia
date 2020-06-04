var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/flotGp.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 30);

  function getFlotGolosPower() {
    return new Promise((resolve, reject) => {
        db.findOne({}, (err,data) => {
               if(err) {
                      reject(err);
               } else {
                resolve(data);
              }
        });
    });
}

function updateFlotGolosPower(gp) {
  return new Promise((resolve, reject) => {
  db.update({}, {gp}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
  });
  });
}

module.exports.getFlotGolosPower = getFlotGolosPower;
module.exports.updateFlotGolosPower = updateFlotGolosPower;