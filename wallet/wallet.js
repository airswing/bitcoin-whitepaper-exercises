"use strict";

var path = require("path");
var fs = require("fs");

var Blockchain = require(path.join(__dirname,"blockchain.js"));

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.pub.pgp.key"),"utf8");
const PRIV_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.pub.pgp.key"),"utf8");

var wallet = {
	accounts: {},
};

addAccount(PRIV_KEY_TEXT_1,PUB_KEY_TEXT_1);
addAccount(PRIV_KEY_TEXT_2,PUB_KEY_TEXT_2);

// fake an initial balance in account #1
wallet.accounts[PUB_KEY_TEXT_1].outputs.push(
	{
		account: PUB_KEY_TEXT_1,
		amount: 42,
	}
);

main().catch(console.log);


// **********************************

async function main() {

	await spend(
		wallet.accounts[PUB_KEY_TEXT_1],
		wallet.accounts[PUB_KEY_TEXT_2],
		13
	);

	await spend(
		wallet.accounts[PUB_KEY_TEXT_2],
		wallet.accounts[PUB_KEY_TEXT_1],
		5
	);

	await spend(
		wallet.accounts[PUB_KEY_TEXT_1],
		wallet.accounts[PUB_KEY_TEXT_2],
		31
	);

	try {
		await spend(
			wallet.accounts[PUB_KEY_TEXT_2],
			wallet.accounts[PUB_KEY_TEXT_1],
			40
		);
	}
	catch (err) {
		console.log(err);
	}

	console.log(accountBalance(PUB_KEY_TEXT_1));
	console.log(accountBalance(PUB_KEY_TEXT_2));
	console.log(await Blockchain.verifyChain(Blockchain.chain));
}

function addAccount(privKey,pubKey) {
	wallet.accounts[pubKey] = {
		privKey,
		pubKey,
		outputs: []
	};
}

async function spend(fromAccount, toAccount, amountToSpend) {
	var trData = {
		inputs: [],
		outputs: [],
	};

	// pick inputs to use from fromAccount's outputs (i.e. previous txns, see line 22), sorted descending
	var sortedInputs = [...fromAccount.outputs].sort((a, b) => parseFloat(a.amount) + parseFloat(b.amount));

	var inputsToUse = [];
	var inputAmounts = 0;

 	for (let input of sortedInputs) {
		// remove input from output-list
		fromAccount.outputs.splice(fromAccount.outputs.indexOf(input),1);

		inputsToUse.push(input);
		inputAmounts += input.amount;

		if(inputAmounts >= amountToSpend) break;
 	}

	if (inputAmounts < amountToSpend) {
		fromAccount.outputs.push(...inputsToUse);
		throw `Don't have enough to spend ${amountToSpend}!`;
	}

	for(let input of inputsToUse) {
		trData.inputs.push(
			await Blockchain.authorizeInput({
				account: input.account,
				amount: input.amount,
			}, fromAccount.privKey)
		);
	}
	//record output
	trData.outputs.push({account: toAccount.pubKey, amount: amountToSpend});

	// is "change" output needed?
	if(inputAmounts >= amountToSpend){
		trData.outputs.push({account: fromAccount.pubKey, amount: (inputAmounts - amountToSpend)});
	}

	// create transaction and add it to blockchain
	var tr = Blockchain.createTransaction(trData);
	Blockchain.insertBlock(Blockchain.createBlock([tr]));

	// record outputs in our wallet (if needed)
	for(let output of trData.outputs){
		if(output.account in wallet.accounts){
			wallet.accounts[output.account].outputs.push(output);
		}
	}
}

function accountBalance(account) {
	var balance = 0;

	if (account in wallet.accounts) {
		for(let output of wallet.accounts[account].outputs) {
			balance += output.amount;
		}
 	}
 	return balance;
}
