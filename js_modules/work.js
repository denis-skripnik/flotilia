const helpers = require("./helpers");
const methods = require("./methods");
const udb = require("./usersdb");
const adb = require("./activistsdb");
const pdb = require("./postsdb");
const bpdb = require("./batterypostsdb");
const trxdb = require("./transactionsdb");
const gpdb = require("./gpdb");
const conf = require('../config.json');

async function sendOp(author, permlink, percent, parent_permlink, title) {
percent = percent.toFixed(2);
percent = parseFloat(percent);
console.log(author + ', ' + permlink + ', ' + percent);
try {
    const upvote = await methods.sendUpvote(author, permlink, percent);
    console.log(upvote);
    if (upvote !== 0) {
        const time = await helpers.unixTime();
        await trxdb.addTransaction(upvote, author, permlink, percent, time);
        await pdb.updatePost(`https://golos.id/${parent_permlink}/@${author}/${permlink}`, title, parent_permlink);
        return {code: 1, msg: 'OK'};
        } else {
            return {code: 0, msg: 'Not send upvote.'};
        }
    } catch(error) {
        return {code: 0, msg: error};
    }
    }

async function processBlock(bn) {
    const block = await methods.getOpsInBlock(bn);
    let props = await methods.getProps();
    let chainProps = await methods.getChainProps();
    let steem_per_vests = 1000000*parseFloat(props.total_vesting_fund_steem)/parseFloat(props.total_vesting_shares);
    let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                            case "delegate_vesting_shares":
if (opbody.delegatee === conf.login) {
    let isUser = await udb.getUser(opbody.delegator);
    if (isUser != null) {
    let gp = parseFloat(opbody.vesting_shares) / 1000000 * steem_per_vests;
gp = gp.toFixed(3);
gp = parseFloat(gp);
    try {
    if (gp > 0) {
    await udb.updateUser(opbody.delegator, isUser.gp, gp);
    ok_ops_count += 1;
    }
} catch(e) {
    ok_ops_count = 0;
}
    } else {
        let gp = parseFloat(opbody.vesting_shares) / 1000000 * steem_per_vests;
        gp = gp.toFixed(3);
        gp = parseFloat(gp);
        try {
            if (gp > 0) {
            await udb.updateUser(opbody.delegator, 0, gp);
            ok_ops_count += 1;
            }
        } catch(e) {
            ok_ops_count = 0;
        }
    }
} else {
    ok_ops_count += 0;
}
break;
case "delegate_vesting_shares_with_interest":
if (opbody.delegatee === conf.login) {
    let isUser = await udb.getUser(opbody.delegator);
    if (isUser != null) {
    let gp = parseFloat(opbody.vesting_shares) / 1000000 * steem_per_vests;
gp = gp.toFixed(3);
gp = parseFloat(gp);
    try {
    if (gp > 0) {
    await udb.updateUser(opbody.delegator, isUser.gp, gp);
    ok_ops_count += 1;
    }
} catch(e) {
    ok_ops_count = 0;
}
    } else {
        let gp = parseFloat(opbody.vesting_shares) / 1000000 * steem_per_vests;
        gp = gp.toFixed(3);
        gp = parseFloat(gp);
        try {
            if (gp > 0) {
            await udb.updateUser(opbody.delegator, 0, gp);
            ok_ops_count += 1;
            }
        } catch(e) {
            ok_ops_count = 0;
        }
    }
} else {
    ok_ops_count += 0;
}
break;
case "comment":
try {
            if (opbody.parent_author === '') {
            let isAuthor = await udb.getUser(opbody.author);
            if (isAuthor != null) {
                await helpers.sleep(3000);
                let content = await methods.getContent(opbody.author, opbody.permlink);
if (content && content.code === 1 && content.voters_count  === 0) {
let accounts = await methods.getAccounts([opbody.author, 'belisey']);
let acc = accounts[0];
let golos_time = props.time;
let author_vp = await methods.battery(golos_time, acc.voting_power, acc.last_vote_time);
let flot_vp = await methods.battery(golos_time, accounts[1].voting_power, accounts[1].last_vote_time);
console.log('Батарейка автора: ' + author_vp/100 + '%. Батарейка Флота: ' + flot_vp/100 + '%');
    let gests = parseFloat(acc.vesting_shares) + parseFloat(acc.received_vesting_shares) - parseFloat(acc.delegated_vesting_shares);
    let gp = gests / 1000000 * steem_per_vests;
    gp = gp.toFixed(3);
    gp = parseFloat(gp);
    if (gp !== isAuthor.gp && isAuthor.gp !== 0 && !isNaN(gp)) {
        await udb.updateUser(opbody.author, gp,isAuthor.delegate_gp);
        }
        if (isNaN(gp) || gp == null) {
            gp = isAuthor.gp;
                }
                gp += isAuthor.delegate_gp;
                let percent = await gpdb.getPercent(gp);
    percent = percent.percent;
    if (isAuthor.gp !== 0) {
    let normal_vp = flot_vp - author_vp;
if (normal_vp <= -100) {
percent /= 2;
} else if (normal_vp < 1000) {
if (content.curation_rewards_percent < 5000) {
percent *= 0.5;
percent = parseFloat(percent);
} else if (content.curation_rewards_percent >= 7500) {
    percent *= 1.1;
    percent = parseFloat(percent);
}
} else {
    percent /= 2;
    percent = percent.toFixed(2);
    percent = parseFloat(percent);
}    
    } else {
            if (content.curation_rewards_percent < 5000) {
            percent *= 0.5;
            percent = parseFloat(percent);
            } else if (content.curation_rewards_percent >= 7500) {
                percent *= 1.1;
                percent = parseFloat(percent);
            }
    }
if (flot_vp >= 9900 && content.curation_rewards_percent >= 5000) {
    percent = 90;
    await bpdb.updateBatteryPost(`https://golos.id/${opbody.parent_permlink}/@${opbody.author}/${opbody.permlink}`, opbody.title, opbody.parent_permlink);
}
if (opbody.author === 'flotilia') {
    percent = 90;
}
if (content.reward_weight < 10000) {
    percent = 0;
    }
percent = percent / (40 / chainProps.vote_regeneration_per_day);
console.log(`Процент при ${chainProps.vote_regeneration_per_day} апах: ` + percent / (40 / chainProps.vote_regeneration_per_day));
if (percent > 100) {
percent = 100;
}
let ops_return = await sendOp(opbody.author, opbody.permlink, percent, opbody.parent_permlink, opbody.title);
console.log('Сообщение: ' + ops_return.msg);
ok_ops_count += ops_return['code'];
} else {
console.log('Пост https://golos.id/@' + opbody.author + '/' + opbody.permlink + ' не найден или получил апвот.');
ok_ops_count += 0;
}
} else {
ok_ops_count += 0;
}
let percent = await adb.getActivist(opbody.author);
if (percent != null) {
    percent = percent.percent;
    percent = percent / (40 / chainProps.vote_regeneration_per_day);
    console.log(`Процент при ${chainProps.vote_regeneration_per_day} апах: ` + percent / (40 / chainProps.vote_regeneration_per_day));
    if (percent > 100) {
    percent = 100;
    }
    let ops_return = await sendOp(opbody.author, opbody.permlink, percent, opbody.parent_permlink, opbody.title);
    console.log('Сообщение: ' + ops_return.msg);
    ok_ops_count += ops_return['code'];
} else {
    ok_ops_count += 0;
}
}               
        } catch(e) {
console.log(e);
        }
            break;
            case "chain_properties_update":
let properties = opbody.props[1];
let acc = await methods.getAccounts([conf.login]);
let witness_votes = acc[0].witness_votes;
if (properties.min_curation_percent && properties.min_curation_percent === 2500 && properties.max_curation_percent && properties.max_curation_percent === 7500 && properties.curation_reward_curve && properties.curation_reward_curve === "square_root" && properties.allow_return_auction_reward_to_fund && properties.allow_return_auction_reward_to_fund === false && properties.worker_reward_percent && properties.worker_reward_percent === 1000 && properties.witness_reward_percent && properties.witness_reward_percent === 1500 && properties.vesting_reward_percent && properties.vesting_reward_percent === 1000 && properties.worker_request_approve_min_percent && properties.worker_request_approve_min_percent === 1000 && properties.sbd_debt_convert_rate && properties.sbd_debt_convert_rate === 100 && properties.vote_regeneration_per_day && properties.vote_regeneration_per_day === 10 && witness_votes.indexOf(opbody.owner) === -1) {
            await methods.witnessVoteAction(opbody.owner, true);
} else {
if (witness_votes.indexOf(opbody.owner) > -1) {
                await methods.witnessVoteAction(opbody.owner, false);
} 
            }
            break;
            default:
                    //неизвестная команда
            }
        }
        return ok_ops_count;
    }

module.exports.processBlock = processBlock;