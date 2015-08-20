coinvoyWallet.factory('txFeed',[function(){

	var txFeed = {
		transactions: [],
		contacts: [],
		feed: [],
		unspents: [],
		balance: 0,
	};

	txFeed.init = function(txs, cts) {
		txFeed.transactions = txs;
		txFeed.contacts = cts;

		txFeed.prepareUI();
	}

	txFeed.prepareUI = function() {

        var recent = txFeed.transactions.slice(0).reverse(); //.sort(function(a, b) {return b.time - a.time});
        var note;
        txFeed.unspents = [];
        var balance = 0;
        for(var i=0; i < recent.length; i++) {
            var tx = recent[i];
            var text = "";
            var extraText = "";
            // modify coinfeed tx
            tx.change = false;
            tx.fee    = parseInt(tx.fee) || 0;
            tx.amount = parseInt(tx.amount);
            tx.btcAmount = parseFloat(((tx.amount + tx.fee) / 100000000).toFixed(4));

            // dynamic tx time (now, 5m ago etc)
            timenow  = parseInt((new Date).getTime()/1000);
            diffSecs = timenow - parseInt(tx.time);
            daySeconds = 3600*24;
            if(diffSecs <= 60) {
                tx.hdate = "Now";
            } else if(diffSecs <= 3600) {
                tx.hdate = parseInt(diffSecs/60) + " minutes ago";
            } else if(diffSecs < daySeconds && diffSecs > 3600) {
                tx.hdate = parseInt(diffSecs/3600) + " hours ago";
            } else {
                tx.hdate = walletTools.timeConverter(tx.time);
            }
            tx.date = walletTools.timeConverter(tx.time);

            if(tx.from_user_id == user.id) {
                if(tx.to_user_id == user.id) {
                    tx.change = true;
                } else {
                    tx.sent = true;
                    // get contact
                    if(txFeed.contacts[tx.to_user_id]) {
                        tx.to = txFeed.contacts[tx.to_user_id];
                    } else {
                        tx.to = {id:0,name:"external address", avatar:window.defaultAvatar}
                    }
                    tx.avatar = tx.to.avatar;
                    // set text
                    text = "me, " + tx.to.name || tx.to.email;
                }
            } else {
                tx.sent = false;
                if(txFeed.contacts[tx.from_user_id]) {
                    tx.from = txFeed.contacts[tx.from_user_id];
                } else {
                    tx.from = {id:0,name:"external address", avatar:window.defaultAvatar}
                }
                tx.avatar = tx.from.avatar;
                // set text
                text = tx.from.name || tx.from.email;
            }
            tx.text = text;
            tx.note = tx.hdate;
            // if unspent
            if(tx.sent == false || tx.change == true) {
                if(tx.unspent) {
                    balance += tx.amount;
                    txFeed.addUnspent({
                        amount: tx.amount,
                        txid: tx.txid,
                        vout: tx.vout,
                        address: tx.to_addr,
                        to_addr_index: tx.to_addr_index,
                    });
                }
            }
        }
        txFeed.feed     = recent;
        // update balance
        txFeed.balance 	= (balance/100000000).toFixed(4);
    }

    txFeed.addUnspent = function(utxo) {
		utxo.amount = parseFloat(utxo.amount);
		if(utxo.amount < 500) {
			utxo.amount = utxo.amount*100000000;
		}
		utxo.amount = Math.round(utxo.amount);
		txFeed.unspents.push(utxo);
	}

    txFeed.markSpents = function(unspents) {
    	var txs = txFeed.transactions;
    	for(var i=0; i < unspents.length; i++) {
    		for(var j=0; j < txs.length; j++) {
    			if(txs[j].txid == unspents[i].txid) {
    				txs[j]['unspent'] = false;
    			}
    		}
    	}
    	txFeed.transactions = txs;
    }

    txFeed.addTx = function(tx) {
    	txFeed.transactions.push(tx);
    }

    txFeed.hasTx = function(tx) {
        for(var i=0; i<txFeed.transactions.length; i++) {
            if(txFeed.transactions[i].txid == tx.txid)
                return true;
        }
        return false;
    }

    txFeed.confirmTx = function(tx) {
    	for(var i=0; i < txFeed.transactions.length; i++) {
			if(txFeed.transactions[j].txid == tx.txid) {
				txFeed.transactions[j].confirmations = tx.confirmations;
			}
		}
    }

    return txFeed;
}]);