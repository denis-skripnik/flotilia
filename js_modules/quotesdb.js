var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/quotes.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

function updateQuote(text) {
  return new Promise((resolve, reject) => {
  db.update({text}, {text}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
  resolve(result);
}
  });
  });
}

function removeQuotes() {
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

function findAllQuotes() {
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

module.exports.updateQuote = updateQuote;
module.exports.removeQuotes = removeQuotes;
module.exports.findAllQuotes = findAllQuotes;