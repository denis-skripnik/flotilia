async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
    }

    async function unixTime(){
        return parseInt(new Date().getTime()/1000)
        }
    
function comparePercent(a, b)
{
	if(a.percent > b.percent)
	{
		return -1;
	}
    else if (a.percent === b.percent && a.gp > b.gp)
{
return -1;
}
else if (a.percent === b.percent && a.gp < b.gp)
{
return 1;
}
else{
		return 1;
	}
}

function compareGP(a, b)
{
	if(a.gp > b.gp && a.delegat_gp > b.delegat_gp)
	{
		return -1;
	}
else{
		return 1;
	}
}

function compareTag(a, b)
{
	if(a.tag === b.tag)
	{
		return 0;
	}
	else if(a.tag > b.tag)
	{
		return 1;
	}
	else if(a.tag < b.tag) {
		return -1;
	}
}

async function getRandomInRange(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}

module.exports.unixTime = unixTime;
module.exports.sleep = sleep;
module.exports.comparePercent = comparePercent;
module.exports.compareGP = compareGP;
module.exports.getRandomInRange = getRandomInRange;