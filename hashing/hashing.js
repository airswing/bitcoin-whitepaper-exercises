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

for (let line of poem) {
	var block = {
		index: Blockchain.blocks.length,
		data: line,
		timestamp: Date.now(),
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash
	};
	block.hash = blockHash(block)
	Blockchain.blocks.push(block)
}

console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);


// **********************************

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		bl.index + bl.hash + bl.data + bl.timestamp + bl.prevHash
	).digest("hex");
}

function verifyChain(chain) {
	for(var i = 1; i < chain.blocks.length; i++) {
		if(chain.blocks[i].prevHash !== chain.blocks[i-1].hash){
			console.log('Invalid block at index:' + i + ' hash comparison failed with previous block')
			return false;
		}
		if(chain.blocks[i].timestamp < chain.blocks[i-1].timestamp){
			console.log('Invalid block at index:' + i + ' miner has no concept of the order of time')
			return false;
		}
		if(chain.blocks[i].data !== poem[i-1]) {
			console.log('Invalid block at index:' + i + ' Tupacs poem is invalid')
			return false;
		}
	}
	return true;
}
