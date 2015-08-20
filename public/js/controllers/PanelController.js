
coinvoyWallet.controller("PanelController", ["$scope", "$http", "$timeout", "$location", "angularLoad", function($scope, $http, $timeout, $location, angularLoad) {
	// set page
    $scope.$parent.page = "wallet";
    // check data
   	if(!window.users)
   		$location.path("/");
    // set panel data
    $scope.users = window.users;
    $scope.wallet_data = window.wallet_data;
    $scope.wallet_data.total = window.wallet_data.total.toFixed(8);

    $scope.selectedUser = {"unspents": []};

    $scope.filter = {hasBitcoins: false, unconfirmedUser: false};

    $scope.selectUser = function(user, e) {
    	$scope.sUser = user;
    	if(!e.ctrlKey) {
    		for(var i=0; i < $scope.users.length; i++) {
    			$scope.users[i].selected = false;
    		}
    	}
    	user.selected = true;
    }
    $scope.filterUsers = function() {
        $scope.users = [];
    	if($scope.filter.hasBitcoins) {
	    	for(var i=0; i<window.users.length; i++) {
	    		var u = window.users[i];
	    		if(parseFloat(u.account.total) > 0)
	    			$scope.users.push(u);
	    	}
        } else if($scope.filter.unconfirmedUser) {
            for(var i=0; i<window.users.length; i++) {
                var u = window.users[i];
                if(parseFloat(u.account.total) > 0)
                    $scope.users.push(u);
            }
	    } else {
	    	$scope.users = window.users;
	    }
    }

    var emailPrototype = function() {
    	this.users = [];
    	this.open  = true;
    	this.content = "";
		this.send = function() {
	    	var postObj = {
	    		type: this.type,
	    		users: this.users,
	    		content: this.content.replace(/\n/g,"<br/>"),
	    		subject: this.subject,
	    	}
	    	$http.post("/wallet/api/send_email", postObj).success(function(data){
	    		$scope.email.response = data;
	    		$scope.email.success = "Emails sent"
	    		$scope.email.error = false;
	    	}).error(function(data){
	    		$scope.email.response = data;
	    		$scope.email.error = true;
	    	})
	    }
    }
   	$scope.open_email = function(users) {
   		$scope.email = new emailPrototype();
   		$scope.email.users = users;
    },
    $scope.close_email = function() {
    	$scope.email = false
    }
}]);