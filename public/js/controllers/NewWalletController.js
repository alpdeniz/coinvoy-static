coinvoyWallet
.controller("NewWalletController", ["$scope", "$http", "$timeout", "$routeParams", "$location", "$q", "angularLoad", "appAPI", "Auth", function($scope, $http, $timeout, $routeParams, $location, $q, angularLoad, appAPI, Auth) {

    // get email from code request
    $scope.username = window.user.email;
    // set secret questions
    $scope.questions = window.messages['questions'];

    // page functions
    $scope.generateWallet = function() {
        $scope.progress = 0;
        $scope.keysGenerated = 0;

        var pin = $scope.walletPin; //get wallet pin to send
        var percent = 0;

        $scope.wallet = browserWallet.init();
        $scope.wallet.deriveKeyFromMnemonic($scope.mnemonic, function(seed){
            console.log("Seed: Generated");
            // get user secret
            var secret = readCookie('user_secret');
            // show indicator - sync scope
            appAPI.working = "Encrypting seed...";
            $scope.$apply();
            // Encrypt mnemonic with user hash and pin + email
            appAPI.encryptAES(seed, secret, pin + "" + $scope.user.id, true).then(function(enc_seed) {
                console.log('Encrypted seed : ' + enc_seed);
                $scope.sendingToServer = 1;

                var mPubKey = $scope.wallet.masterNode.neutered().toBase58();
                postObj = {
                    enc_seed  : enc_seed,
                    code      : $routeParams.code,
                    mPubKey   : mPubKey,
                };

                appAPI.finalizeConfirm(postObj).then(function(user) {
                    Auth.setUser(user);
                    console.log("Server: Wallet generation is successful");
                    $location.path("#/wallet")
                }).catch(function() {
                    console.log("Server: Wallet generation failed");
                });
            }).catch(function(){
                console.log("Wallet generation failed");
            })
        }, function(p){
            console.log("Generating wallet : "+p+" %")
        });
    }

    $scope.confirm = function() {
        appAPI.confirm(window.user.email, $scope.password, $routeParams.code).then(function(user){
            // set user - in case of new data
            $scope.user = user;
            // load bitcoinjs
            angularLoad.loadScript('/static/js/crypto/bitcoinjs.min.js').then(function() {
                // show next step
                $scope.confirmed = true
                $scope.mnemonic = bip39.generateMnemonic();
            });
        }).catch(function() {
            $scope.confirmError = "Code/Password combination is not valid. Please check your password.";
        });
    }
}]);
