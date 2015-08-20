//-----------------------//
//--Browser Wallet v0.1--//
//-----------------------//

//--Requires BitcoinJs client library--//
//--Requires AsmCryptoJs library--//

Number.prototype.between  = function (a, b) {
	var min = Math.min.apply(Math, [a,b]),
		max = Math.max.apply(Math, [a,b]);
	return this >= min && this <= max;
};

window.walletTools = {

	timeConverter: function(UNIX_timestamp){
		var a = new Date(UNIX_timestamp*1000);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes();
		var sec = a.getSeconds();
		var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
		return time;
	},

	isBitcoinAddress: function(string) {
		if(string) {
			if(string[0] == "3" || string[0] == 1) {
				if(string.length > 26 && string.length < 35) {
					return true;
				}
			}
		}
		return false;
	},

	isValidAmount: function(input) {// bigger than 500
		if(!input || parseFloat(input)<= 0 || parseFloat(input) > 500) { //less than or equal to 0
			return false;
		}
		return true;
	},

	isNumber: function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

}

window.browserWallet = {

	unspents: [],
	minChange: 10000,
	maxDepth : 8,
	balance: 0,
	// Wallet operations
	rounds: 2048, //number of rounds for HD wallet seed

	init: function(mpk, unspents) {
		this.mPubKey = mpk;
		this.unspents  = unspents || [];
		this.refreshBalance();
		
		return this;
	},

	addUnspent: function(utxo) {
		utxo.amount = parseFloat(utxo.amount);
		if(utxo.amount < 500) {
			utxo.amount = utxo.amount*100000000;
		}
		utxo.amount = Math.round(utxo.amount);
		this.unspents.push(utxo);
		this.refreshBalance();
	},
	removeUnspents: function(utxos) {
		var shift = 0;
		for (var i = 0; i < this.unspents.length; i++) {
			for (var j = 0; j < utxos.length; j++) {
				if(!this.unspents[i-shift])
					i++;
				if(this.unspents[i-shift].txid == utxos[j].txid) {
					this.unspents.splice(i-shift,1);
					shift++;
				}
			}
		}
		this.refreshBalance();
	},
	refreshBalance: function() {
		var balance = 0;
		for (var i = 0; i < this.unspents.length; i++) {
			balance += parseFloat(this.unspents[i].amount);
		}
		this.balance = parseFloat(balance.toFixed(4));
	},
	deriveKeyFromMnemonic: function(mnemonic, result, progress) {

		console.log("Generating Keys...");
		var $this = this;
		var time_1 = new Date().getTime();
		var callback = function(seed) {
			console.log("OK in "+ (new Date().getTime()-time_1)/1000);
			//generate master node
			$this.masterNode = new bitcoin.HDNode.fromSeedHex(seed).deriveHardened(0);
			//callback
			if(result) result(seed);
		}

		asmCrypto.PBKDF2_HMAC_SHA512.hex(mnemonic, "mnemonic", $this.rounds, 64, progress, callback);
	},

	deriveKeyFromSeed: function(seed) { // BIP32 External chain : m/0'/i 
		this.masterNode = new bitcoin.HDNode.fromSeedHex(seed).deriveHardened(0);
	},

	deriveChild: function(index) {
		var child = this.masterNode.derive(index);
		return child;
	},

	// Creates a multi-signature address with its redeemscript
	// createMultiSig: function(n, pubKeys) {
	// 	var redeemScript = bitcoin.scripts.multisigOutput(n, pubKeys) // 2 of 2
	// 	var scriptPubKey = bitcoin.scripts.scriptHashOutput(redeemScript.getHash())
	// 	var multiSigAddress = bitcoin.Address.fromOutputScript(scriptPubKey).toString()
	// 	return {'address':multiSigAddress,'redeemScript':redeemScript};		
	// },

	buildTransaction: function( addresses ) {

		var txTotal = 0;
		var outputTotal = 0;
		var addressKeys = []; // Vital array for tx
		var index;

		// check transaction input [{address:'w',amount:d}]
		if(!addresses || !addresses[0]) return false;
		for (var i = addresses.length - 1; i >= 0; i--) {
			if(!addresses[i] || !addresses[i]) {
				console.log("Missing 'addresses' array");
				return false;
			}
			if(!addresses[i].amount || !addresses[i].address) {
				console.log("Invalid send object");
				return false;
			}
			addresses[i].amount = parseFloat((addresses[i].amount*100000000).toFixed(8));
			outputTotal += addresses[i].amount;
		};	

		// Sort unspents for a given amount
		var inputs = this.sortUnspents(outputTotal, addresses);
		if( inputs.set.length == 0) {
			console.log("There is not enough utxo for "+outputTotal);
			return false;
		}
		// begin transaction
		tx = new bitcoin.TransactionBuilder();
		// loop until necessary amount is achieved
		for(var i=0; i < inputs.set.length; i++)
		{	// included in transaction
			txTotal += parseFloat(inputs.set[i].amount);
			tx.addInput(inputs.set[i].txid, inputs.set[i].vout);
		}
		txTotal = parseFloat(txTotal.toFixed(8));

		//where and how much
		for (var i = 0; i < addresses.length; i++) {
			tx.addOutput(addresses[i].address, addresses[i].amount);
			addresses[i].vout = i;
		};

		tx.change 	  	= inputs.change;
		tx.fee 			= inputs.fee;
		tx.spentSet  	= inputs.set;
		tx.addresses 	= addresses;

		return tx;
	},

	// Creates a multi-signature transaction from the wallet
	// returns signed transaction hex
	completeTransaction: function(tx) {

		if(tx.change >= this.minChange) {
			if(!tx.changeAddress) {
				console.log("Change address required but not supplied.");
				return false;
			} else {
				tx.addOutput(tx.changeAddress, tx.change);
				tx.addresses[tx.addresses.length] = {amount:tx.change, address: tx.changeAddress, vout: tx.addresses.length, change: true};
			}
		}

		for(var i=0; i < tx.spentSet.length; i++) {
			child = this.deriveChild(tx.spentSet[i].to_addr_index);
			//sign
			tx.sign(i, child.privKey);
		}
		var signedTx = tx.build();
		//ready for broadcast
		var hexTx = signedTx.toHex();
		console.log(hexTx);
		console.log("No of ins: " + tx.spentSet.length + ". No of outs: "+ tx.tx.outs.length);
		console.log("Size: " + hexTx.length/2);

		signedTx.change 	= tx.change;
		signedTx.fee 		= tx.fee;
		signedTx.spentSet  	= tx.spentSet;
		signedTx.addresses 	= tx.addresses;

		return signedTx;
	},

	sortUnspents: function(total, addresses) {
		$this = this;
		var delta = this.minChange; // tx fee tolerance
		var total = total; // total output to send
		var unspents = this.unspents.slice(0);
		// sort ascending - start with minimum
		unspents.sort(function(a, b){
			return b.amount < a.amount;
		});

		var candidates = [];
		var selected   = [];
		var average_fee = this.estimateTxFee(2, addresses.length + 1,total);
		// init tx fee by average
		var tx_fee = average_fee;
		var addresses  = addresses;

		var unspentsTotal = 0;
		for(var i=0; i < unspents.length; i++) {
			unspentsTotal += unspents[i].amount;
		}
		
		if(unspentsTotal < total + average_fee) {
			// NOT ENOUGH COINS
			console.log("NOT ENOUGH COINS");
			return {
				set   : [],
				change: 0,
				fee   : average_fee,
			}
		}

		// http://stackoverflow.com/questions/5752002/find-all-possible-subset-combos-in-an-array
		var combine = function(input, amount){
		    var results = [], result, mask, sum, tx_fee, total = Math.pow(2, input.length);
		    for(mask = 0; mask < total; mask++){
		        result = [];
		        sum = 0;
		        i = input.length - 1; 
		        do{
		            if( (mask & (1 << i)) !== 0){
		            	sum += parseInt(input[i].amount);
		                result.push(input[i]);
		            }
		        }while(i--);
		        if(result.length > 0 && sum > amount){
		        	tx_fee = $this.estimateTxFee(result.length, addresses.length, amount)
		        	if(sum >= amount + tx_fee) {
		        		if(sum <= amount + tx_fee + delta) // prioritize
		        			return {set: result, tx_fee: sum - amount, change: 0}
		        		else // append candidate
		            		results.push({set: result, tx_fee: tx_fee, change: sum - (amount + tx_fee)});
		        	}
		        }
		    }
		    // exact match not found, return first candidate
		    // TODO: Better selection among candidates
		    return results[0];
		}

		// list sufficient combinations
		selected = combine(unspents, total);
		if(selected.set.length > 0) {
			return {
				set   : selected.set,
				change: selected.change,
				fee   : selected.tx_fee,
			}
		}

		console.log("No candidate inputs found.");
		return {
			set   : [],
			change: 0,
			fee   : 0,
		}
		
	},

	// Estimates transaction fee
	// Factors: tx size, amount (0.01) and priority
	estimateTxFee: function(ins, outs, amount) {
		// normalize input
		if(!walletTools.isNumber(ins) && ins.tx) {
			ins = ins.tx.ins.length;
			outs = ins.tx.outs.length;
		}
		// calculate tx size in bytes
		// each input is assumed as 250 bytes, including its signatures
		var txSize = 250 * ins + 50 * outs + 10;
		// fee for each level
		var feeLevels = [500, 1000,10000,20000,30000,40000,50000];
		// check tx size, determine its level
		var txSizeLevel = Math.floor(txSize / 1000);
		var txAmountLevel = 1;//amount < 1000000? 1:0; //0.01
		var txPriorityLevel = 1; // sum(input_value*age)/size(bytes)
		return feeLevels[txSizeLevel+txAmountLevel+txPriorityLevel];
	},

	// Check PIN - Checks whether PIN is correct or not
	// by comparing with already generated addresses
	// after new keys and addresses are generated by the PIN
	checkPIN: function() {
		if(this.masterNode.neutered().toBase58() == this.mPubKey)
			return true;
		return false;
	},

	clearKeys: function() {
		this.masterNode = null;
	},

}
