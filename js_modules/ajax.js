let express = require('express');
let app = express();
const helpers = require("./helpers");
const methods = require("./methods");
const udb = require("./usersdb");
const adb = require("./activistsdb");
const gpdb = require("./gpdb");
const conf = require('../config.json');
const pass = 'fmggln';

app.get('/flotilia/', async function (req, res) {
let page = req.query.page; // получили параметр page из url
let user = req.query.user; // получили параметр user из url
let key = req.query.key;
let add_users = req.query.add_users;
let del_user = req.query.del_user;
let activists = req.query.add_activists;
let del_activists = req.query.del_activists;
let table = req.query.table;
let remove_percent = req.query.remove_percent;
if (page === 'table') {
let table = await gpdb.findAllPercents();
table.sort(helpers.comparePercent);
res.send(JSON.stringify(table));
} else if (page === 'users') {
    let users = await udb.findAllUsers();
    users.sort(helpers.compareGP);
    if (users) {
        res.send(JSON.stringify(users));
    }
} else if (page === 'activists') {
    let activists_list = await adb.findAllActivists();
    activists_list.sort(helpers.comparePercent);
    res.send(JSON.stringify(activists_list));
} else if (page === 'author_percent' && user) {
    let isUser = await udb.getUser(user);
    if (isUser != null) {
        let data = await gpdb.getPercent(isUser.gp);
        res.send(JSON.stringify(data));
    } else {
        res.send('Not user.');
    }
} else if (key === pass) {
if (remove_percent) {
let status = await gpdb.removePercent(remove_percent);
res.send(JSON.stringify(status));
} else if (table) {
let flot_map = table.split(',');
let results = [];
for (let el of flot_map) {
let data = el.split('-');
console.log(parseFloat(data[0]), parseFloat(data[1]));
let status = await gpdb.updatePercent(parseFloat(data[0]), parseFloat(data[1]));
results.push(status);
}
res.send(JSON.stringify(results));
} else if (add_users) {
let users = add_users.split(',');
    let accounts = await methods.getAccounts(users);
    let props = await methods.getProps();
    let steem_per_vests = 1000000*parseFloat(props.total_vesting_fund_steem)/parseFloat(props.total_vesting_shares);
    let results = [];
    for (let acc of accounts) {
        let gests = parseFloat(acc.vesting_shares) + parseFloat(acc.received_vesting_shares) - parseFloat(acc.delegated_vesting_shares);
        let gp = gests / 1000000 * steem_per_vests;
    gp = gp.toFixed(3);
    gp = parseFloat(gp);
    let isUser = await udb.getUser(acc.name);
    let status;
    if (isUser != null) {
    status = await udb.updateUser(acc.name, gp, isUser.delegate_gp);
    } else {
        status = await udb.updateUser(acc.name, gp, 0);
    }
    results.push(status);
}
    res.send(JSON.stringify( results));
} else if (del_user) {
    let result_list = [];
    if (del_user.indexOf(',') > -1) {
    let remove_users = del_user.split(',');
    for (let remove_user of remove_users) {
    let status = await udb.removeUser(remove_user);
result_list.push(status);
}
} else {
    let status = await udb.removeUser(del_user);
result_list.push(status);
}
res.send(JSON.stringify(result_list));
} else if (activists) {
    let activists_array = activists.split(',');
    let results = [];
    for (let el of activists_array) {
    let data = el.split(':');
    let status = await adb.updateActivist(data[0], parseFloat(data[1]));
    results.push(status);
    }
    res.send(JSON.stringify(results));
} else if (del_activists) {
    let result_list = [];
    if (del_activists.indexOf(',') > -1) {
    let remove_activists = del_activists.split(',');
    for (let remove_activist of remove_activists) {
    let status = await adb.removeActivist(remove_activist);
result_list.push(status);
}
} else {
    let status = await adb.removeActivist(del_activists);
result_list.push(status);
}
res.send(JSON.stringify(result_list));
}
}
});


app.listen(conf.port, function () {
});