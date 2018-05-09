"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");

const KEYS_DIR = path.join(__dirname,"keys");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

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

const maxBlockSize = 4;
const blockFee = 5;
var difficulty = 16;

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

var transactionPool = [];

addPoem();
processPool();
countMyEarnings();


// **********************************

function addPoem() {
	for(let line of poem) {
		var tx = createTransaction(line);
		tx.fee = Math.floor(Math.random() * 10);
		transactionPool.push(tx);
	}
}

function processPool() {
	var sortedPool = transactionPool.sort((a, b) => parseInt(b.fee) - parseInt(a.fee));

	var blockData = [];

	while (sortedPool.length > 0){
    blockData.push(sortedPool.splice(0, maxBlockSize - 1)); // -1 because we need to keep a spot open for the coinbase tx
	}

	for(let data of blockData) {
		data.unshift({
			'blockFee': blockFee,
			'account': PUB_KEY_TEXT,
		});
		console.log('Mining block #', Blockchain.blocks.length, ' ...\n', data);
		Blockchain.blocks.push(createBlock(data));
		console.log('Proof of work complete for block', Blockchain.blocks.length-1);
	}
}

function countMyEarnings() {
	var totalEarnings = 0;
	for(var i = 1; i < Blockchain.blocks.length; i++) {
		totalEarnings += Blockchain.blocks[i].data[0].blockFee;
		for(var k = 1; k < Blockchain.blocks[i].data.length; k++) {
			totalEarnings += Blockchain.blocks[i].data[k].fee;
		}
	}
	console.log('Total earnings: ', totalEarnings);
}

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);

	return bl;
}

function blockHash(bl) {
	while (true) {
		bl.nonce = Math.trunc(Math.random() * 1E7);
		let hash = crypto.createHash("sha256").update(
			`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp};${bl.nonce}`
		).digest("hex");

		if (hashIsLowEnough(hash)) {
			return hash;
		}
	}
}

function hashIsLowEnough(hash) {
	var neededChars = Math.ceil(difficulty / 4);
	var threshold = Number(`0b${"".padStart(neededChars * 4,"1111".padStart(4 + difficulty,"0"))}`);
	var prefix = Number(`0x${hash.substr(0,neededChars)}`);
	return prefix <= threshold;
}

function createTransaction(data) {
	var tr = {
		data,
	};

	tr.hash = transactionHash(tr);

	return tr;
}

function transactionHash(tr) {
	return crypto.createHash("sha256").update(
		`${JSON.stringify(tr.data)}`
	).digest("hex");
}
