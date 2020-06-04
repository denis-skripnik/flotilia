const golos = require("golos-js")
const udb = require("./usersdb");
const bdb = require("./balancesdb");
let express = require('express');
let app = express();
golos.config.set("websocket","wss://golos.lexa.host/ws");

async function run() {
try {
	let curr_acc = "";
	let gests = [];
	let sum_gp = 0;
	let sum_balance = 0;
	let sum_sbd_balance = 0;
	
	let k = 0;
try {
	while(1) {
		//if(k++ > 10) break;

		console.error("curr", curr_acc, Object.keys(gests).length);
		const accs = await golos.api.lookupAccountsAsync(curr_acc, 100);
		if (accs[0] === curr_acc) {
			accs.splice(0, 1);
		}
		if(accs.length == 0) {
			break;
		}

		const params = await golos.api.getDynamicGlobalPropertiesAsync();

		const {total_vesting_fund_steem, total_vesting_shares} = params;
	
		const total_golos = parseFloat(total_vesting_fund_steem.split(" ")[0]);
		const total_vests = parseFloat(total_vesting_shares.split(" ")[0]);
	
		const vpg = total_vests / total_golos;

		let balances = await golos.api.getAccountsAsync(accs);
		let filtered_balances = balances.filter(function(n) {
			return n.vesting_shares !== '0.000000 GESTS' && n.balance !== '0.000 GOLOS';
		});

		for(let b of filtered_balances) {
			gests.push({name: b.name,
				gp: (parseFloat(b.vesting_shares.split(" ")[0]) / vpg).toFixed(3),
				gp_percent: parseFloat(b.vesting_shares.split(" ")[0]) / parseFloat(total_vests) * 100,
				delegated_gp: (parseFloat(b.delegated_vesting_shares.split(" ")[0]) / vpg).toFixed(3),
				received_gp: (parseFloat(b.received_vesting_shares.split(" ")[0]) / vpg).toFixed(3),
				effective_gp: ((parseFloat(b.vesting_shares.split(" ")[0]) / vpg) - (parseFloat(b.delegated_vesting_shares.split(" ")[0]) / vpg) + (parseFloat(b.received_vesting_shares.split(" ")[0]) / vpg)).toFixed(3),
				balance: parseFloat(b.balance.split(" ")[0]),
				sbd_balance: parseFloat(b.sbd_balance.split(" ")[0]),
			});
			curr_acc = b.name;
			sum_gp += parseFloat(b.vesting_shares.split(" ")[0]) / vpg;
			sum_balance += parseFloat(b.balance.split(" ")[0]);
			sum_sbd_balance += parseFloat(b.sbd_balance.split(" ")[0]);
				}
		await bdb.updateData({sum_gp, sum_balance, sum_sbd_balance});
	}
} catch (e) {
console.error(e);
process.exit(1);
}
await udb.updateTop(gests);
} catch (e) {
console.log(e);
}
}

setInterval(run, 540000)

app.get('/golos-top/', async function (req, res) {
let type = req.query.type;
if (type) {
	let b = await bdb.getData();
	let data = await udb.getTop(type);
data.sort(function(a, b) {
	if(a[type] > b[type])
	{
		return -1;
	}
else{
		return 1;
	}
});

let users = [];
let users_count = 0;
for (let user of data) {
users_count++;
	if (users_count <= 100) {
		users[users_count] = [];
		users[users_count][type] = user[type];
if (typeof b['sum_' + type] !== 'undefined') {
	users[users_count]['sum_' + type] = parseFloat(user[type]) / parseFloat(b['sum_' + type]) * 100;
}
for (let el in user) {
if (type !== el) {
	users[users_count][el] = user[el];
	if (typeof b['sum_' + el] !== 'undefined') {
		users[users_count]['sum_' + el] = parseFloat(user[el]) / parseFloat(b['sum_' + el]) * 100;
	}
}
}
} else {
	break;
}
}
res.send(users);
}
});
app.listen(4400, function () {
});