coinvoyWallet
.controller("RecoverPINController", ["$scope", "$http", "$timeout", "Auth", "appAPI", function($scope, $http, $timeout, Auth, appAPI) {
    // set user
	$scope.user = Auth.getUser();
    $scope.$parent.user = $scope.user;
	// vars
	$scope.walletPIN = "";
    // set messages
	$scope.msgs = window.messages.recoverPIN;
    // set secret questions
	$scope.questions = window.messages['questions'];

	$scope.recoverPIN = function() {
        // reset input
		$scope.walletPIN = "";
		$scope.pinError = "";
        // prepare extra bytes
		var qValues = [];
        for(var i=0; i<$scope.questions.length; i++) {
            qValues[i] = $scope.questions[i].value;
            $scope.questions[i].value = "";
        }
        var extraBytes = appAPI.getSHA2(qValues.join(":"));
        // decrypt pin and show it to user for 5 secs
		appAPI.getDecPIN(extraBytes, $scope.user.salt).then(function(decPIN){
			if(!decPIN) {
				$scope.pinError = $scope.msgs.pinIsNotBack;
			} else {
				$scope.walletPIN = decPIN;
			}
		}).catch(function() {
			$scope.pinError = $scope.msgs.pinIsNotBack;
		})
        $timeout(function(){
            // reset input
            $scope.walletPIN = "";
            $scope.pinError = "";
        },5000);
	}
}]);