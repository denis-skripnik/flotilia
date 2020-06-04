var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/trxs.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 30);

function addTransaction(transaction_id, author, permlink, percent, time) {
  return new Promise((resolve, reject) => {
  db.insert({trx_id: transaction_id, author, permlink, percent, time}, function (err, newDoc) {
if (err) {
  reject(err);
} else {
  resolve(newDoc);
}
    });
  });
  }

function updateTransaction(db_id, new_trx, author, permlink, percent, time) {
  return new Promise((resolve, reject) => {
  db.update({_id: db_id}, {trx_id: new_trx, author, permlink, percent, time}, {}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
  });
  });
}

function removeTransaction(db_id) {
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

function findTransactions(trx_time) {
  return new Promise((resolve, reject) => {
  db.find({time: {"$lt":trx_time}}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
      });
});
}

module.exports.addTransaction = addTransaction;
module.exports.updateTransaction = updateTransaction;
module.exports.removeTransaction = removeTransaction;
module.exports.findTransactions = findTransactions;