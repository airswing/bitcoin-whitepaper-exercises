"use strict";

var crypto = require("crypto");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

var difficulty = 1;
var maxHash;
var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	nonce: 0,
	timestamp: Date.now(),
});
while(1) {
for (let line of poem) {
	let bl = createBlock(line);
	Blockchain.blocks.push(bl);
	console.log(`Hash (Difficulty: ${difficulty}): ${bl.hash}`);

	difficulty++;
}
}


// **********************************

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
		nonce: 0,
	};
	maxHash = getMaxHash();
	bl.hash = blockHash(bl);
	while(!hashIsLowEnough(bl.hash)) {
		bl.nonce++;
		bl.hash = blockHash(bl);
	}
	return bl;
}

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp};${bl.nonce}`
	).digest("hex");
}

function hashIsLowEnough(hash) {
	var binstr = convertHexStrToBinaryStr(hash);
	if(binstr < maxHash) {
		//console.log(Blockchain.blocks.length + hash + "\n\nHash:" + binstr + "\n\nRoof:" + maxHash);
		return true;
	}
}

function convertHexStrToBinaryStr(hex) {
	hex = hex + '';
	var charArray = hex.split('');
	var binOutput = '';
	for(let onechar of charArray) {
		binOutput = binOutput + hexInBin(onechar);
	}
	return binOutput;
}

function hexInBin(x) {
	var ret = '';
	switch(x.toUpperCase()) {
		case '0': ret = '0000'; break; case '1': ret = '0001'; break;
		case '2': ret = '0010'; break; case '3': ret = '0011'; break;
		case '4': ret = '0100'; break; case '5': ret = '0101'; break;
		case '6': ret = '0110'; break; case '7': ret = '0111'; break;
		case '8': ret = '1000'; break; case '9': ret = '1001'; break;
		case 'A': ret = '1010'; break; case 'B': ret = '1011'; break;
		case 'C': ret = '1100'; break; case 'D': ret = '1101'; break;
		case 'E': ret = '1110'; break; case 'F': ret = '1111'; break;
		default : ret = '0000';
	}
	return ret;
}

function getMaxHash() {
	var maxHash = "";
	maxHash = maxHash.padStart(256 - difficulty, "1"); //get all ones first
	maxHash = maxHash.padStart(256, "0");
	return maxHash;
}

function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
	}

	return true;
}

function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!verifyBlock(bl)) return false;
		prevHash = bl.hash;
	}

	return true;
}
