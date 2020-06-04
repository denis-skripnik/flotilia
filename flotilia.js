require("./js_modules/ajax");
const work = require("./js_modules/work");
const helpers = require("./js_modules/helpers");
const methods = require("./js_modules/methods");
const trxdb =                  require("./js_modules/transactionsdb");
const conf = require('./config.json');
const CronJob = require('cron').CronJob;
const gpdb = require("./js_modules/gpdb");
const fgpdb = require("./js_modules/fgpdb");
const udb = require("./js_modules/usersdb");
const pdb = require("./js_modules/postsdb");
const bpdb = require("./js_modules/batterypostsdb");
const bdb = require("./js_modules/blocksdb");
const LONG_DELAY = 12000;
const SHORT_DELAY = 3000;
const SUPER_LONG_DELAY = 1000 * 60 * 15;

let PROPS = null;

let bn = 0;
let last_bn = 0;
let delay = SHORT_DELAY;

async function getNullTransfers() {
    PROPS = await methods.getProps();
            const block_n = await bdb.getBlock(PROPS.last_irreversible_block_num);
bn = block_n.last_block;

delay = SHORT_DELAY;
while (true) {
    try {
        if (bn > PROPS.last_irreversible_block_num) {
            // console.log("wait for next blocks" + delay / 1000);
            await helpers.sleep(delay);
            PROPS = await methods.getProps();
        } else {
            if(0 < await work.processBlock(bn)) {
                delay = SHORT_DELAY;
            } else {
                delay = LONG_DELAY;
            }
            bn++;
            await bdb.updateBlock(bn);
        }
    } catch (e) {
        console.log("error in work loop" + e);
        await helpers.sleep(1000);
        }
    }
}

setInterval(() => {
    if(last_bn == bn) {

        try {
                process.exit(1);
        } catch(e) {
            process.exit(1);
        }
    }
    last_bn = bn;
}, SUPER_LONG_DELAY);

getNullTransfers()

async function workingTrx() {
    const time = await helpers.unixTime();
    const trx_time = time-90;
const trx_list = await trxdb.findTransactions(trx_time);
for (let trx of trx_list) {
    try {
    const get_trx = await methods.getTransaction(trx.trx_id);
    const block = await methods.getProps();
    const block_data = await methods.getBlockHeader(block.last_irreversible_block_num);
    const lest_block_time = Date.parse(block_data.timestamp);
if (lest_block_time >= trx.time) {
    await trxdb.removeTransaction(trx._id);
}    
} catch(e) {
    if(e 
          && e.payload 
          && e.payload.error 
          && e.payload.error.data 
          && e.payload.error.data.code 
         && e.payload.error.data.code == 1020200) {
            const sendVote = await methods.sendUpvote(trx.author, trx.permlink, trx.percent);
            if (sendVote !== 0) {
                const send_time = await helpers.unixTime();
                await trxdb.updateTransaction(trx._id, sendVote, trx.author, trx.permlink, trx.percent, send_time);
            }
     }
}}
}

async function PostAveryDay() {
    let text = `Здравствуйте. Представляем очередную статистическую информацию о Флотилии.
`;
let users = await udb.findAllUsers();
users.sort((a,b) => (a.gp+a.delegat_gp) - (b.gp+b.delegat_gp));
let users_count = users.length;
let all_users_gp = users.reduce(function(p,c){return p+c.gp;},0);
let all_delegate_gp = users.reduce(function(p,c){return p+c.delegate_gp;},0);
let all_gp = all_users_gp+all_delegate_gp;
await fgpdb.updateFlotGolosPower(all_gp);
let old_gp = await fgpdb.getFlotGolosPower();
old_gp = old_gp.gp;
let getOldGolosPower = all_gp - old_gp;
console.log('Вычитание сегодняшней СГ Флота и вчерашней.' + getOldGolosPower);
let comparison_gp = '';
if (getOldGolosPower && getOldGolosPower > 0) {
    comparison_gp = `Сила Голоса Флота стала больше на ${getOldGolosPower}, если сравнивать со вчерашним днём.`;
} else if (getOldGolosPower && getOldGolosPower < 0) {
    comparison_gp = `Сила Голоса Флота стала меньше на ${Math.abs(getOldGolosPower)}, если сравнивать со вчерашним днём.`;
}
let getTable = await gpdb.findAllPercents();
getTable.sort(helpers.comparePercent);
let uamount = await methods.upvoteAmount(all_gp, getTable);
let upvote100 = '';
let percents_table;
if (uamount !== false) {
upvote100 = `100% ап Флота даёт ${uamount.up100}`;
getTable = uamount.vp_table;
percents_table = `
| Процент апа | СГ | Сумма, которую даёт ап |
| --- | --- | --- |
`;
let chain_props = await methods.getChainProps();
for (let table of getTable) {
  let table_percent = table.percent / (40 / chain_props.vote_regeneration_per_day);
  let table_ua = parseFloat(table.upvote_amount) / (40 / chain_props.vote_regeneration_per_day) + ' GOLOS';
  percents_table += `| ${table_percent}  | ${table.gp} | ${table_ua} |
    `;
    }
    } else {
        percents_table = `
        | Процент апа | СГ |
        | --- | --- |
        `;
    for (let table of getTable) {
        percents_table += `| ${table.percent}  | ${table.gp} |
        `;
        }
}
text += `**Всего участников: ${users_count}.**
Общая СГ Флота: ${all_gp.toFixed(3)}.
${comparison_gp} ${upvote100}
## Таблица соотношения процентов к СГ
${percents_table}

Тег #мегагальян - наше Знамя!

Наша группа в телеграм: [@flotilia_mggln](https://t.me/flotilia_mggln).
Инструкция подключения: https://golos.id/ru--megagalxyan/@flotilia/flotiliya-zapusk

## Что влияет на процент апа:
1. Нормальный процент апа зависит от СГ участника, получает он его согласно таблице выше (нормальный, потому что в силу некоторых ситуаций он может отличаться);
2. Если пост со штрафом, Флот не идёт.
3. Если кураторские < 50%, половина от нормального процента апа, но если они >= 75%, процент апа умножается на 1,1
4. Если батарейка отличается от куратора в меньшую сторону на 5% и далее, процент апа в 2 раза меньше нормы.
5. Если батарейка автора отличается на 1% или далее от батарейки куратора, процент апа в 2 раза меньше нормы.

## Рекомендуем!
- Сервис просмотра профилей, публикации постов (в т.ч. отложенная публикация) и другие сервисы: https://dpos.space;
- Бустер @goloslove, который даёт апы с прибылью для авторов.
- @upromo - проект, дающий апы за сжигание.
- @loser - игра, в которой 3 человека делают ставки на одну сумму и 2 побеждают. [активные раунды](https://golos.id/stats/@loser/rounds-list).
- @one-armed - слот-машина "Три кита". [Информация](https://golos.id/ru--golos/@one-armed/slot-mashina-tri-kita), [Выигрыши: последние и возможные](https://golos.id/golos/@one-armed/last-win).`;
let now = await helpers.unixTime();
let permlink = 'stat-' + now;
let title = 'Информация о Флотилии за сегодня';
        try {
await methods.publickPost(title, permlink, text);
} catch(e) {
    await helpers.sleep(300000);
    await methods.publickPost(title, permlink, text);
}
}

async function TwoPostAveryDay() {
    let text = `Здравствуйте. Представляем очередной дайджест постов, проапанных Флотилией за сутки.
`;
    let posts = await pdb.findAllPosts();
posts.sort(helpers.compareTag);
for (let n in posts) {
    if (n > 0 && posts[n].tag !== posts[n-1].tag) {
text += `## Тег [${posts[n].tag}](https://golos.id/created/${posts[n].tag})

- [${posts[n].title}](${posts[n].url})
`;
} else if (n > 0 && posts[n].tag === posts[n-1].tag) {
text += `- [${posts[n].title}](${posts[n].url})
`;
} else {
    text += `## Тег [${posts[n].tag}](https://golos.id/created/${posts[n].tag})

- [${posts[n].title}](${posts[n].url})
`;
}
}
text += `
## Рекомендуем!
- Сервис просмотра профилей, публикации постов (в т.ч. отложенная публикация) и другие сервисы: https://dpos.space;
- Бустер @goloslove, который даёт апы с прибылью для авторов.
- @upromo - проект, дающий апы за сжигание.
- @loser - игра, в которой 3 человека делают ставки на одну сумму и 2 побеждают. [активные раунды](https://golos.id/stats/@loser/rounds-list).
- @one-armed - слот-машина "Три кита". [Информация](https://golos.id/ru--golos/@one-armed/slot-mashina-tri-kita), [Выигрыши: последние и возможные](https://golos.id/golos/@one-armed/last-win).`;
let now = await helpers.unixTime();
    let permlink = 'stat-' + now;
    let title = 'Дайджест постов Флотилии за последние сутки';
    try {
    await methods.publickPost(title, permlink, text);
await pdb.removePosts();
} catch(e) {
        await helpers.sleep(300000);
        await methods.publickPost(title, permlink, text);
    }
}


async function batteryPost() {
    let text = `Здравствуйте. Представляем очередной дайджест постов, проапанных Флотилией с 90% силой благодаря тому, что батарейка куратора была >= 99%.
`;
    let posts = await bpdb.findAllBatteryPosts();
if (posts.length > 0) {
    for (let n in posts) {
text += `${n}. [${posts[n].title}](${posts[n].url})
`;
}
text += `
## Рекомендуем!
- Сервис просмотра профилей, публикации постов (в т.ч. отложенная публикация) и другие сервисы: https://dpos.space;
- Бустер @goloslove, который даёт апы с прибылью для авторов.
- @upromo - проект, дающий апы за сжигание.
- @loser - игра, в которой 3 человека делают ставки на одну сумму и 2 побеждают. [активные раунды](https://golos.id/stats/@loser/rounds-list).
- @one-armed - слот-машина "Три кита". [Информация](https://golos.id/ru--golos/@one-armed/slot-mashina-tri-kita), [Выигрыши: последние и возможные](https://golos.id/golos/@one-armed/last-win).`;
let now = await helpers.unixTime();
    let permlink = 'battery-posts-' + now;
    let title = 'Дайджест постов Флотилии, проапанных с 90% силой при батарейке >= 99%';
    try {
    await methods.publickPost(title, permlink, text);
await bpdb.removeBatteryPosts();
} catch(e) {
        await helpers.sleep(300000);
        await methods.publickPost(title, permlink, text);
    }
}
}

async function topPost() {
    let text = `Здравствуйте. Ниже таблица участников Флота, отсортированная по СГ.
| Номер | Логин | личная СГ (если участник пользуется ботами от vik) | делегировано Флоту |
| --- | --- | --- | --- |
`;
    let users = await udb.findAllUsers();
    let online_users = users.map(function(user) {if (user.gp > 0 && user.delegate_gp === 0) {return user.login;}});
    let props = await methods.getProps();
    let steem_per_vests = 1000000*parseFloat(props.total_vesting_fund_steem)/parseFloat(props.total_vesting_shares);
    let accounts = await methods.getAccounts(online_users);
    let blockchain_users = accounts.map(function(acc) {let gp = (parseFloat(acc.vesting_shares) + parseFloat(acc.received_vesting_shares) - parseFloat(acc.delegated_vesting_shares)) / 1000000 * steem_per_vests; gp=gp.toFixed(3); gp = parseFloat(gp); return {login: acc.name, gp, delegate_gp: 0};});
    let other_users = [];
for (let user of users) {
if (user.gp > 0 && user.delegate_gp > 0) {
    let accounts = await methods.getAccounts([user.login]);
    acc = accounts[0];
    let gp = (parseFloat(acc.vesting_shares) + parseFloat(acc.received_vesting_shares) - parseFloat(acc.delegated_vesting_shares)) / 1000000 * steem_per_vests;
gp=gp.toFixed(3);
gp = parseFloat(gp);
other_users.push({login: user.login, gp, delegate_gp: user.delegate_gp});
}
}
let all_users = blockchain_users.concat(other_users);
all_users.sort((a,b) => -(a.gp+a.delegate_gp) + (b.gp+b.delegate_gp))
for (let n in all_users) {
    let position = parseFloat(n)+1
    text += `| ${position}. | @${all_users[n].login} | ${all_users[n].gp} | ${all_users[n].delegate_gp} |
`;
if (n === 99) {
break;
}
}
text += `
## Рекомендуем!
- Сервис просмотра профилей, публикации постов (в т.ч. отложенная публикация) и другие сервисы: https://dpos.space;
- Бустер @goloslove, который даёт апы с прибылью для авторов.
- @upromo - проект, дающий апы за сжигание.
- @loser - игра, в которой 3 человека делают ставки на одну сумму и 2 побеждают. [активные раунды](https://golos.id/stats/@loser/rounds-list).
- @one-armed - слот-машина "Три кита". [Информация](https://golos.id/ru--golos/@one-armed/slot-mashina-tri-kita), [Выигрыши: последние и возможные](https://golos.id/golos/@one-armed/last-win).`;
let now = await helpers.unixTime();
    let permlink = 'top-' + now;
    let now_date = new Date(now * 1000);
    let year = now_date.getFullYear();let month = now_date.getMonth()+1;
    let date = now_date.getDate();
    let publish_date = date + '.' + month + '.' + year;
    let title = 'Топ 100 участников Флота ' + publish_date;
    try {
    await methods.publickPost(title, permlink, text);
} catch(e) {
        await helpers.sleep(300000);
        await methods.publickPost(title, permlink, text);
    }
}

new CronJob('0 0 4 * * *', PostAveryDay, null, true);
new CronJob('0 0 16 * * *', TwoPostAveryDay, null, true);    
new CronJob('0 0 22 * * *', batteryPost, null, true);    
new CronJob('0 0 10 * * *', topPost, null, true);    
setInterval(() => workingTrx(), 90000);