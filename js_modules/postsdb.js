var Datastore = require('nedb')
  , db = new Datastore({ filename: './databases/posts.db', autoload: true });
  db.persistence.setAutocompactionInterval(1000 * 60);

  function getPost(url) {
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

function updatePost(url, title, tag) {
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

function removePosts() {
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

function findAllPosts() {
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

module.exports.getPost = getPost;
module.exports.updatePost = updatePost;
module.exports.removePosts = removePosts;
module.exports.findAllPosts = findAllPosts;