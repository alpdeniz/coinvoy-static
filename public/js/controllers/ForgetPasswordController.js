coinvoyWallet.controller("ForgetPasswordController", ["$scope", "$http", "$timeout", "$routeParams", "$location", "$q", "angularLoad", "appAPI", function($scope, $http, $timeout, $routeParams, $location, $q, angularLoad, appAPI) {
	
    $scope.username  = window.user.email;
    $scope.questions = window.messages['questions'];

	$scope.newPassword = function () {
		
        newpass = $scope.nPass;
        pin     = $scope.pin;

        var qValues = [];
        for(var i=0; i<$scope.questions.length; i++) {
            qValues[i] = $scope.questions[i].value;
            $scope.questions[i].value = "";
        }
        var extraBytes = appAPI.getSHA2(qValues.join(":"));

        // load bitcoinjs library for wallet core
        angularLoad.loadScript('/static/js/crypto/bitcoindev.js').then(function() {
            // update message
            appAPI.working = "Generating private keys...";
            // init wallet
            window.wallet = browserWallet.init(user.mpk);
            wallet.deriveKey(pin + extraBytes, function() {
                //check if pin is valid
                if(!wallet.checkPIN()) {
                    appAPI.working = "";
                    console.log("Wrong PIN");
                    $scope.error = "Please correct your answers or PIN";
                    $scope.$apply();
                    $timeout(function(){
                        $scope.error = "";
                    },8000);
                    return;
                }
                console.log("Correct Info and PIN");
                // update message
                appAPI.working = "Generating login keys";
                appAPI.getPBKDF2(newpass, user.email, appAPI.loginRounds).then(function(mainHash) {
                    var nPassHash = appAPI.getSHA2(mainHash);
                    var secret = appAPI.getSHA2(user.email + mainHash);
                    appAPI.working = "Encrypting answers...";
                    appAPI.encryptAES(extraBytes, secret, pin + "" + user.id, true).then(function(enc_seed) {
                        appAPI.working = "Changing password...";
                        postObj = {
                            password : nPassHash,
                            code     : $routeParams.code,
                            enc_seed : enc_seed,

                        };

                        $http.post('/wallet/api/new_password', postObj).success(function(data){
                            appAPI.working = ""
                            if (!data.success) {
                                console.log("Error while changing password");
                                return;
                            }
                            Auth.setUser(data);
                            $location.path("/wallet");
                            
                        }).error(function(){
                            console.log("Error while requesting new password");
                            
                        });
                    });
                });
            });
        });  
	};
}]);