coinvoyWallet.controller("WalletController", ["$scope", "$http", "$timeout", "$location", "angularLoad", "TxSocket", "appAPI", "txFeed", function($scope, $http, $timeout, $location, angularLoad, TxSocket, appAPI, txFeed) {

    // page messages
    var msgs = window.messages.wallet;
    // common messages
    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = window.messages.wallet;
    // set page
    $scope.$parent.page = "wallet";
    // init ui object for wallet data
    $scope.ui = {balance: 0.0000, feed: []};
    // build user view data
    try {
        if(window.user)
            $scope.user = {
                id: user.id,
                name: user.name,
                sirname: user.sirname,
                username: user.username,
                email: user.email,
                avatar: user.avatar || defaultAvatar,
                balance: 0,
            };
    } catch (e) {
        user = false;
        console.log(e.message);
        $location.path('/');
    }
    // new transaction array for notification box
    $scope.newTransaction = [];
    // set user for top menu
    $scope.$parent.user = $scope.user;

    $scope.contactsExist = Object.keys(user.contacts).length > 0? true : false;
    $scope.contacts = user.contacts;

    $scope.invalid = {};
    $scope.modals = false;
    $scope.defaultAvatar = window.defaultAvatar;

    // page functions
    $scope.toPage = function(link) {
        $location.path(link);
    }
    $scope.showDim = function() {
        if(!$scope.modals) return false;
        return Object.keys($scope.modals).length > 0;
    }
    $scope.closeModals = function() {
        $scope.invalid = {};
        $scope.modals = false;
        $scope.send = null;
    }
    $scope.showTransaction = function(tx) {
        $scope.modals = {};
        $scope.txDetails = {
            amount: parseFloat(tx.amount/100000000).toFixed(4),
            txid: tx.txid,
            sent: tx.sent,
            label: tx.sent? msgs.tx.outgoing.translate() : msgs.tx.incoming.translate(),
            fee: parseFloat(tx.fee/100000000).toFixed(4),
            date: tx.date,
            message: tx.message,
            confirmed: tx.confirmed
        };
        if(tx.sent) {
            $scope.txDetails.receiver = tx.to.name || tx.to.email;
        } else {
            $scope.txDetails.sender = tx.from.name || tx.from.email;
        }
        // reset modal content through ng-if
        $scope.modals['transaction'] = true;
    };
    $scope.openReceive = function() {
        $scope.newAddress = true;
        if(window.debug) {
            $scope.newAddress = "sampleAddress";
        } else {
            appAPI.newAddress().then(function(addr){
                $scope.newAddress = addr;
                $timeout(function(){
                    $scope.newAddress = false;
                },10000);
            });
        }
    }
    $scope.showQR = function() {
        $scope.modals = {'qr' : "loading"};
        angularLoad.loadScript('/static/js/modules/qrcode.min.js').then(function() {
            if(!window['qrCode']) {
                window.qrCode = new QRCode(document.getElementById("qrcode"), $scope.newAddress);
            } else {
                qrCode.clear();
                qrCode.makeCode($scope.newAddress);
            }

            $scope.modals = {'qr' : true};
        }).catch(function(){
            console.log("QR js file couldn't be loaded.");
        });
    }

    // SEND OBJECT
    $scope.send = null
    $scope.openSend = function(toUser) {
        $scope.send = new sendPrototype();
        $scope.modals = {'send' : true}
        if(toUser) {
            $scope.send.selectEmail(toUser);
        }
        //init send
        $scope.send.step=1;
    };
    // send prototype
    var sendPrototype = function() {
        $this = this;
        this.tx = {};
        this.amount = "";
        this.toUser = {
            name: "",
            email: "",
            address: "",
            isUser: false,
        };
        this.changeAddress = "";
        this.message = "";
        this.success = false;
        this.sending = false;
        this.progress = appAPI.getProgress;
        this.error = false;
        this.typeResult = false;
        this.typing = function() {
            this.typeResult = false;
            var email = this.toUser.email;
            this.toUser.address = email; //Default for direct bitcoin address input
            this.toUser.isUser = false;
            if(email.length > 2 && email.length < 6) {
                console.log("Typing: " + email + "...");
                var count = 0;
                var resArr = [];

                this.typeResult = this.findInContacts(email);
            }
        };
        this.selectTypeResult = function(e) {
            $this = this;
            var list = this.typeResult;
            var commands = {
                up: function() {
                    for(var i=0; i < list.length; i++) {
                        if(list[i].selected) {
                            list[i].selected = false;
                            if(i > 0) {
                                list[i-1].selected = true;
                            }
                        }
                    }
                },
                down: function() {
                    for(var i=0; i < list.length; i++) {
                        if(list[i].selected) {
                            list[i].selected = false;
                            if(i < list.length-1)
                                list[i+1].selected = true;
                            return;
                        }
                    }
                    if(list.length > 0)
                        list[0].selected = true;
                },
                right: function() {
                    for(var i=0; i < list.length; i++) {
                        if(list[i].selected)
                            $this.selectEmail(list[i]);
                    }
                },
                enter: function() {
                    for(var i=0; i < list.length; i++) {
                        if(list[i].selected)
                            $this.selectEmail(list[i]);
                    }
                }
            }
            
            if(e.keyCode == 40) {
                commands.down();
            } else if(e.keyCode == 39) {
                commands.right();
            } else if(e.keyCode == 38) {
                commands.up();
            } else if(e.keyCode == 13) {
                commands.enter();
            }
        };
        this.findInContacts = function(typed, isId) {
            var contacts = user.contacts;
            // check if id
            if(isId)
                return contacts.hasOwnProperty(typed)? contacts[typed] : false;

            var ct;
            typeArray = [];
            for (var id in contacts) {
                ct = contacts[id];
                if(ct.email.indexOf(typed) > -1) {
                    typeArray[typeArray.length] = ct;
                    continue;
                }
                if(ct.name) {
                    if(ct.name.indexOf(typed) > -1) {
                        typeArray[typeArray.length] = ct;
                        continue;
                    }
                }  
            }
            if(typeArray.length == 0) return false;
            return typeArray;
        };
        this.selectEmail = function(res) {
            this.toUser.id  = res.id;
            this.toUser.name  = res.name;
            this.toUser.email = res.email;
            this.toUser.address = res.address;
            this.toUser.avatar = res.avatar;
            this.toUser.isUser = true;
            this.typeResult = false;
        };
        this.check = function() {
            var toUser = this.toUser;
            var toAddress = this.toUser.address;
            var amount = this.amount;
            if(!walletTools.isValidAmount(amount)) {
                $scope.invalid['sendAmount'] = true;
                return false;
            }
            if(!this.presend()) {
                return false;
            }
            if(!walletTools.isBitcoinAddress(toAddress)) {
                if(toUser.isUser == false) {
                    if(isEmail(toUser.email)) {
                        // get new address to user if user exists
                        appAPI.newAddress(toUser.email).then(function(addr){
                            $this.toUser.address = addr;
                            $this.step = 2;
                        }).catch(function(){
                            console.log("An invite will be sent!");
                            // might need time to construct invite if sending to a non-member
                            appAPI.registerEscrow(toUser).then(function(escrowData) {
                                $this.escrowData = escrowData;
                                $this.toUser.address = escrowData.address;
                                $this.step = 2;                            
                            });
                        });
                        return true;
                    }

                }
                $scope.invalid['sendToAddress'] = true;
                return false;
            } else {
                if(toAddress[0]=="1") { // TODO: Add user check
                    // classic address - other wallet: skip message
                    this.step = 3;
                    return true;
                }
            }
            
            this.step = 2;
            return true;
        };
        this.presend = function() {
            // build transaction
            var sendArray = [{ address: this.toUser.address, amount: this.amount}];
            var err = this.error;
            this.tx = wallet.buildTransaction(sendArray);
            if(!this.tx) {
                $scope.invalid['sendAmount'] = true;
                err = "Insufficient funds";
                this.step = 1;
                $timeout(function(){
                    $scope.invalid['sendAmount'] = false;
                    err = "";
                },5000);
                return false;
            }
            // satoshis to bitcoins - conversions are not at the right place :(
            this.tx.fee = parseFloat(this.tx.fee/100000000);
            if(this.tx.change >= 10000 && !this.tx.changeAddress) {
                var $this = this;
                appAPI.newAddress().then(function(addr){
                    $this.tx.changeAddress = addr;
                });
            }
            return true;
        };
        this.checkMessage = function(msg) {
            var msg = msg || "";
            if(msg.length > 150) {
                $scope.invalid['sendMessage'] = true;
                return false;
            }
            this.step = 3;
            return true;
        };
        this.send = function() {
            
            $this = this;
            $this.progress = 0;
            $scope.keysGenerated = 0;

            if(!this.walletPIN) {
                $scope.invalid['pin'] = true;
                $timeout(function(){
                    $scope.invalid['pin'] = false;
                },1000);
                return;
            }

            var pin = this.walletPIN; //get wallet pin to send
            var secret = readCookie('user_secret');
            user.id = undefined;
            appAPI.getSeed(secret, pin + "" + user.id).then(function(seed) {
                console.log(seed);

                $this.walletPIN = "";

                if(!seed) {
                    $this.error = "Decryption error...";
                    $timeout(function(){
                        $this.error = "";
                    },5000);
                    return;
                }
                wallet.deriveKeyFromSeed(seed);
                //check if pin is valid
                if(!wallet.checkPIN()) {
                    console.log("Wrong PIN");
                    $this.error = "Please correct your PIN";
                    $scope.invalid['pin'] = true;
                    $timeout(function(){
                        $scope.invalid['pin'] = false;
                        this.error = "";
                    },5000);
                    return;
                }
                console.log("Valid PIN");
                // create the tx
                try {
                    var signedTx = wallet.completeTransaction($this.tx);
                } catch(err) {
                    console.log(err.message);
                    $this.error = "An error occurred while sending bitcoins: "+err.message;
                    return;
                }
                // we are done with the master node - remove
                wallet.clearKeys();
                // send tx to network
                if(signedTx) {
                    var successFn = function(to) {
                        if(to.change == true) {
                            tx = {
                                from_user_id: window.user.id,
                                to_user_id: window.user.id,
                                to_addr: to.address,
                                message: "",
                                amount: to.amount,
                                fee: 0,
                                txid: signedTx.getId(),
                                confirmed: false,
                                time: parseInt((new Date).getTime()/1000),
                                unspent: true,
                            };
                            // add it to the feed (and reorganize unspents)
                            txFeed.addTx(tx)
                        } else {
                            to_user_id = $this.toUser.id? $this.toUser.id : null;
                            tx = {
                                from_user_id: window.user.id,
                                to_user_id: to_user_id,
                                to_addr: to.address,
                                message: $this.message,
                                amount: to.amount,
                                txid: signedTx.getId(),
                                confirmed: false,
                                fee: signedTx.fee,
                                time: parseInt((new Date).getTime()/1000),
                            };

                            txFeed.addTx(tx);
                            //build sent notification
                            var msg = "Sent " + parseFloat(to.amount/100000000).toFixed(4) + " BTC.";
                            $scope.newTransaction.push(msg);
                            $timeout(function(){
                                $scope.newTransaction.pop();
                            },10000);
                            // make a sound
                            var snd = new Audio("/static/audio/high_rise.wav");
                            snd.play();
                        }
                    }

                    // its gone now :)
                    $this.broadcastTx(signedTx, $this.message, successFn);

                } else {
                    $scope.invalid['sendAmount'] = true;
                    $this.error = "Insufficient funds";
                    $scope.send = null;
                    $scope.$digest();
                    $timeout(function(){
                        $this.walletPIN = "";
                        $scope.invalid['sendAmount'] = false;
                        $this.error = ""
                    },4000);
                }
                pin = "";
            }).catch(function(error) {
                if(error == 101) {
                    $this.error = "Couldn't get the bytes.";
                } else if(error == 102) {
                    $this.error = "Error decrypting bytes.";
                } else {
                    $this.error = "Error getting extra bytes.";
                }
                $timeout(function(){
                    $this.error = "";
                    $this.progress = 0;
                },5000);
            })
        };
        this.broadcastTx = function(tx, message, successFn) { //amount, fromAddress, toAddress, spentSet, vout, message) {
            var broadcast = $http.post("/wallet/api/pushtx", {
                tx: tx.toHex(),
                tx_fee: tx.fee,
                txHash: tx.getId(),
                addresses: tx.addresses,
                message: message,
                spentSet: tx.spentSet,
            });
            broadcast.success(function(res, status){
                if(!res.hasOwnProperty('success') || !res.success) {
                    $this.error = "Broadcast failed. Please try again.";
                    return;
                }
                //build sent notification
                for (var i = 0; i < tx.addresses.length; i++) {
                    if(successFn) {
                        successFn(tx.addresses[i]);
                    }
                };
                // mark spent txs
                txFeed.markSpents(tx.spentSet);
                //prepare coin feed
                txFeed.prepareUI();
                //set UI
                $scope.ui.balance = txFeed.balance;
                $scope.ui.feed = txFeed.feed;
                //reload wallet
                wallet.unspents = txFeed.unspents;
                
            }).error(function(err){
                $this.error = "Broadcast request failed. Please try again.";
            }).finally(function(){
                $this.sending = false;
                //successfully sent!
                $scope.send.success = true;
            });
        }
    };

// -- LOAD JS

    angularLoad.loadScript('/static/js/crypto/bitcoinjs.min.js').then(function() {
        // initialize wallet
        window.wallet = browserWallet.init(user.mpk);
        //prepare coin feed
        //merge UI layer data + insert unspents into wallet
        txFeed.init(user.transactions, user.contacts);
        //set UI
        $scope.ui.balance = txFeed.balance;
        $scope.ui.feed = txFeed.feed;
        //reload wallet
        wallet.unspents = txFeed.unspents;
    }).catch(function() {
        console.log("App js file couldn't be loaded.");
    });

// -- WEBSOCKET HANDLING
    // Apply Websocket callbacks
    socketConnection = TxSocket.open(user.id);
    socketConnection.addTxCallback(function(tx){

        // update transaction if confirmed
        if(tx.confirmed) {
            if(txFeed.confirmTx(tx))
                return;
        }
        // exit if transaction already exists
        if(txFeed.hasTx(tx))
            return;

        tx.unspent = true;
        // process tx and insert
        txFeed.addTx(tx);

        if(tx.from_user && !user.contacts.hasOwnProperty(tx.from_user.id)) {
            $scope.contactsExist = false;
            user.contacts[tx.from_user.id] = tx.from_user;
            $scope.contactsExist = true;
        }
        // from satoshis to bitcoins
        var txAmount = (parseFloat(tx.amount)/100000000).toFixed(4);
        // Prepare new transaction messages
        if(tx.to_user_id == window.user.id) {
            //load incoming sound
            var snd = new Audio("/static/audio/coin.wav");
            snd.play();
            $scope.newTransaction.push(txAmount + " BTC received.");
            $timeout(function(){
                $scope.newTransaction.pop();
            },10000);
        }

        // include in the feed
        txFeed.prepareUI();
        //set UI
        $scope.ui.balance = txFeed.balance;
        $scope.ui.feed = txFeed.feed;
        //reload wallet
        wallet.unspents = txFeed.unspents;
    });
}]);
