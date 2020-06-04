var conf = require('../config.json');
var golos = require('golos-js');
golos.config.set('websocket',conf.node);

async function getOpsInBlock(bn) {
    return await golos.api.getOpsInBlockAsync(bn, false);
  }

  async function getBlockHeader(block_num) {
  return await golos.api.getBlockHeaderAsync(block_num);
  }
  
  async function getTransaction(trxId) {
  return await golos.api.getTransactionAsync(trxId);
  }

  async function getProps() {
  return await golos.api.getDynamicGlobalPropertiesAsync();
  }
  
  async function getChainProps() {
    return await golos.api.getChainPropertiesAsync();
    }

    async function getAccounts(users) {
    return await golos.api.getAccountsAsync(users);
    }

    async function getTicker() {
        return await golos.api.getTickerAsync();
        }
        
        async function upvoteAmount(gp, vp_table) {
try {
            let get_dynamic_global_properties = await getProps();
            let account = [];
                let total_vesting_fund_steem = parseFloat(get_dynamic_global_properties.total_vesting_fund_steem);
                let total_vesting_shares = parseFloat(get_dynamic_global_properties.total_vesting_shares);
                let total_reward_fund_steem = parseFloat(get_dynamic_global_properties.total_reward_fund_steem);
                let total_reward_shares2 = parseInt(get_dynamic_global_properties.total_reward_shares2);
                let golos_per_vests = total_vesting_fund_steem / total_vesting_shares;
        
            let vest_shares = parseInt(1000000 * gp / golos_per_vests);
        let chain_props = await getChainProps();
        let max_vote_denom = chain_props.vote_regeneration_per_day * (5 * 60 * 60 * 24) / (60 * 60 * 24);    
        let value_golos = [];
        for (let vp of vp_table) {
        let used_power = parseInt((vp.percent*100 + max_vote_denom - 1) / max_vote_denom);
            let rshares = ((vest_shares * used_power) / 10000);
            account["rshares"] = rshares.toFixed();
            vp.upvote_amount = (account["rshares"] * total_reward_fund_steem / total_reward_shares2).toFixed(3) + ' GOLOS';
        }

        let used_power = parseInt((10000 + max_vote_denom - 1) / max_vote_denom);
        let rshares = ((vest_shares * used_power) / 10000);
        account["rshares"] = rshares.toFixed();
        up100 = (account["rshares"] * total_reward_fund_steem / total_reward_shares2).toFixed(3) + ' GOLOS';

            return {up100, vp_table};
    } catch(e) {
console.log('Ошибка рассчёта суммы, которую даёт ап: ' + e);
        return false;
    }
        }

async function sendUpvote(author, permlink, percent) {
    let now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
    let newTx = [];
let parent_author = author;
let parent_permlink = permlink;
let weight = percent;
weight *= 100;
weight = parseInt(weight);
let body = '';
if (percent > 0) {
body = `Hello, @${author}. You received ${percent}% upvote from Flotilia.

***

Здравствуйте, @${author}. Вы получили ${percent}% апвот от Флотилии.`;
newTx.push(['vote', {voter: conf.login, author: parent_author, permlink: parent_permlink, weight}]);
} else {
    body = `Здравствуйте, @${author}.
    "Флотилия обошла ваш пост и оставила его без внимания. Значит у вас что то не так.
    Обращайтесь в чат:
    https://t.me/joinchat/HIRuuVIwMb5p1phZYZAEfA.`;
}
let comment_permlink = 'result-' + now;
let json_metadata = [];
json_metadata.app = "Flotilia/3.0";
newTx.push(['comment', {parent_author,parent_permlink,author:conf.login,permlink: comment_permlink, title: 'Flotilia: comment with results.', body, json_metadata: JSON.stringify(json_metadata)}]);
const current = await getProps();
var blockid = current.head_block_id;
n = [];
for (var i = 0; i < blockid.length; i += 2)
{
    n.push(blockid.substr(i, 2));
}
let hex = n[7] + n[6] + n[5] + n[4];
let refBlockNum = current.head_block_number & 0xffff;
let refBlockPrefix = parseInt(hex, 16)
let trx = {
    'expiration': expire,
    'extensions': [],
    'operations': newTx,
    'ref_block_num': refBlockNum,
    'ref_block_prefix': refBlockPrefix
};
let trxs = "";
try {
    trxs = await golos.auth.signTransaction(trx, {"posting": conf.posting_key});
} catch (error) {
    console.log("Не удалось подписать транзакцию: " + error.message);
}
try {
const broadcast_trx_sync = await golos.api.broadcastTransactionSynchronousAsync(trxs);
console.log(JSON.stringify(broadcast_trx_sync));
return broadcast_trx_sync.id;
} catch(e) {
console.log('Error: ' + e);
    return 0;
}
}

async function getContent(author, permlink) {
try {
let post = await golos.api.getContentAsync(author, permlink, -1);
if (post.created === post.last_update) {
let reward_weight = post.reward_weight;
let curation_rewards_percent = post.curation_rewards_percent;
let voters_count = 0;
for (let vote of post.active_votes) {
if (vote.voter === conf.login) {
voters_count += 1;
}
}
return {code: 1, reward_weight, curation_rewards_percent, voters_count};
} else {
    return {code: 0, error: 'Post is edited'};
}
} catch(e) {
return {code: -1, error: e};
}
}

async function battery(blockchain_time, percent, last_vote_time) {
    try {
        let current_time = new Date(blockchain_time);
        current_time = current_time.getTime();
        let last_vote_datetime = new Date(last_vote_time).getTime();
        let last_vote_seconds = last_vote_datetime;
        let fastpower;
        fastpower = 10000/432000;
        fast_power = fastpower.toFixed(5);
        let volume_not = (percent+((current_time-last_vote_seconds)/1000)*fast_power); //расчет текущей Voting Power
        let volume = parseInt(volume_not);
         
        let charge;
        if (volume>=10000) {
        charge = 10000;
        }
        else {
            charge=volume;
        }
return charge;
    } catch(e) {
    console.log(e);
    return await battery();
    }
    }

    async function publickPost(title, permlink, body) {
        let now = new Date().getTime() + 18e5,
        expire = new Date(now).toISOString().split('.')[0];
        let newTx = [];
            let wif = conf.posting_key;
        let parentAuthor = '';
        let parentPermlink = 'stats';
        let author = conf.login;
let jsonMetadata = {};
jsonMetadata.app = 'flotilia/3.0';
jsonMetadata.tags = ["ru--megagalxyan","ru--flotilia","ru--statistika"];
        let benif = [];
        benif.push({account: 'denis-skripnik', weight: 10000});
let chain_props = await getChainProps();
let curation_percent = 5000;
if (chain_props.min_curation_percent > 5000) {
    curation_percent = chain_props.min_curation_percent;
}
const extensions = [];
                extensions.push([0,{beneficiaries:benif}]);
                extensions.push([2,{percent:curation_percent}]);
                newTx.push(['comment', {parent_author: parentAuthor, parent_permlink: parentPermlink,author:conf.login,permlink, title, body, json_metadata: JSON.stringify(jsonMetadata)}]);
        newTx.push(['comment_options', {author:conf.login,permlink, 'max_accepted_payout':'1000000.000 GBG','percent_steem_dollars':10000,'allow_votes':true,'allow_curation_rewards':true,extensions}]);
        const current = await getProps();
var blockid = current.head_block_id;
n = [];
for (var i = 0; i < blockid.length; i += 2)
{
    n.push(blockid.substr(i, 2));
}
let hex = n[7] + n[6] + n[5] + n[4];
let refBlockNum = current.head_block_number & 0xffff;
let refBlockPrefix = parseInt(hex, 16)
let trx = {
    'expiration': expire,
    'extensions': [],
    'operations': newTx,
    'ref_block_num': refBlockNum,
    'ref_block_prefix': refBlockPrefix
};
let trxs = "";
try {
    trxs = await golos.auth.signTransaction(trx, {"posting": conf.posting_key});
} catch (error) {
    console.log("Не удалось подписать транзакцию: " + error.message);
}
try {
const broadcast_trx_sync = await golos.api.broadcastTransactionSynchronousAsync(trxs);
console.log(JSON.stringify(broadcast_trx_sync));
return broadcast_trx_sync.id;
} catch(e) {
console.log('Error: ' + e);
    return 0;
}
}
    
async function witnessVoteAction(witness, approve) {
        return await golos.broadcast.accountWitnessVoteAsync(conf.active_key, conf.login, witness, approve);
}

      module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getBlockHeader = getBlockHeader;
module.exports.getTransaction = getTransaction;
	  module.exports.getProps = getProps;
      module.exports.getChainProps = getChainProps;
      module.exports.getContent = getContent;
module.exports.getAccounts = getAccounts;
module.exports.upvoteAmount = upvoteAmount;
module.exports.sendUpvote = sendUpvote;
module.exports.battery = battery;
module.exports.publickPost = publickPost;
module.exports.witnessVoteAction = witnessVoteAction;