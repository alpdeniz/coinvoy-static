coinvoyWallet

.controller("RecoverFundsController", ["$scope", "$http", "$timeout", "$location", "$q", "angularLoad", "Auth", "appAPI", function($scope, $http, $timeout, $location, $q, angularLoad, Auth, appAPI) {
    var addresses = [];
    Auth.getLogin().then(function(user) {
        $scope.email = user.email;
        $scope.salt  = user.salt;
        addresses = user.addresses;
        $scope.wallet = browserWallet.init($scope.email, $scope.salt, addresses);
        $scope.balance = $scope.wallet.balance;
    });

    angularLoad.loadScript('/static/js/appModules.min.js').then(function() {
        console.log("App js file is loaded.");
    }).catch(function(){
        console.log("App js file couldn't be loaded.");
    });

    $scope.questions = [
        {
            label: "Question 1",
            name: "maiden",
            question: "What is your mother's maiden name?",
            value: "",
        },
        {
            index: 1,
            label: "Question 2",
            name: "idnumberdigits",
            question: "What is your ID number's last 4 digits?",
            value: "",
        }
    ];

    $scope.generate = function() {
        $scope.progress = 0;
        $scope.keysGenerated = false;
        $scope.generatingKeys = true;
        $scope.sendError = false;
        $scope.sent = false;
        $scope.showKeys = false;

        var email = $scope.email;
        var pin = $scope.walletPIN; //get wallet pin to send
        var qValues = [];
        for(var i=0; i<$scope.questions.length; i++) {
            qValues[i] = $scope.questions[i].value;
        }
        var extraBytes = appAPI.getSHA2(qValues.join(":"));
        // Generate salt
        appAPI.getPBKDF2(extraBytes, pin + $scope.email, appAPI.saltRounds).then(function(salt){
            //initialize wallet
            $scope.wallet = browserWallet.init(email, salt, addresses);
            $scope.salt = salt;
            $scope.wallet.deriveKeys(pin + extraBytes, result);
        });

        //result callback
        var result = function(){
            console.log("DONE");
            $scope.generatingKeys = false;
            //check if pin is valid
            if(!$scope.wallet.checkPIN()) {
                if($scope.wallet.addresses.length > 0) {
                    console.log("Wrong PIN");
                    $scope.sendError = "Wrong PIN";
                    $timeout(function(){
                        $scope.sendError = false;
                    },4000);
                    return;  
                }
                $scope.generatingKeys = false;
                $scope.showKeys = true;
            }

            $scope.keysGenerated = true;
            $scope.$digest();
            console.log("Valid PIN");
        };

        //progress callback
        var progress = function() {}
        
    }

    $scope.send = function() {
        $scope.sendingTx = true;
        //create the tx
        try {
            var signedTx = $scope.wallet.createTransaction($scope.sendTo, $scope.sendAmount);
        } catch(err) {
            console.log(err.message);
            $scope.sendError = "Transaction failed."
            $scope.sendingTx = false;
            return;
        }

        //$scope.wallet.clearKeys();
        
        //send tx to network
        if(signedTx) {
            $scope.broadcastTx(signedTx);
        } else {
            $scope.sendError = "Balance is insufficient";
            $scope.sendingTx = false;
            $timeout(function(){
                $scope.sendError = false;
            },4000);
        }
    }

    $scope.broadcastTx = function(txHex) {
        var broadcast = $http.post("/wallet/api/pushtx", { tx: txHex });
        broadcast.success(function(res, status){
            if(res.hasOwnProperty('success') && res.success) {
                $scope.sent = true;
            } else {
                $scope.sendError = "Broadcast failed."
            }
            $scope.sendingTx = false;
        });
        broadcast.error(function(err){
            $scope.sendError = "Broadcast request failed: " + err;
            $scope.sendingTx = false;
        });
    };

    $scope.presend = function() {
        if(!walletTools.isBitcoinAddress($scope.sendToAddress) || !walletTools.isValidAmount($scope.sendAmount)) {
            $scope.txFail = true;
            $scope.sendingTx = false;
            return;
        }
        $scope.enterPIN = true;
    };

}]);