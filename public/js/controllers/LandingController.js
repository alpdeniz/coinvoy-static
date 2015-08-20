coinvoyWallet.controller("LandingController", ["$scope", "$http", "$location", "$timeout", "Auth", "appAPI", "angularLoad", function($scope, $http, $location, $timeout, Auth, appAPI, angularLoad) {
    
    // set user from initial auth (in router: Auth.checkLogin)
    $scope.$parent.user = window.user;
    // set page
    $scope.$parent.page = "home";

    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = window.messages.landing;
    
    // page functions
    $scope.resetRegister = function() {
        // register box
        $scope.registerBox = false;
        // register view
        $scope.registerV = {
            success: false,
            msg: false,
        };
        // password strength
        $scope.pass = {
            color : "red",
            strength: 0,
            text: "",
        };
        // fields
        $scope.registerMail = "";
        $scope.registerPass = "";
    }
    $scope.calcPassword = function() {
        var result = zxcvbn($scope.registerPass || "");
        var score  = (result.score + 1)*20;
        if(score < 41)
            $scope.pass = {strength : score, color : "red", text: "Weak"};
        else if(score < 61)
            $scope.pass = {strength : score, color : "orange", text: "Medium"};
        else
            $scope.pass = {strength : score, color : "green", text: "Strong"};
    }
    $scope.openRegisterBox = function() {
        $scope.registerBox = "Loading password libraries...";
        angularLoad.loadScript('/static/js/modules/zxcvbn.js').then(function() {
            $scope.registerBox = true;
        });
    }
    $scope.register = function() {

        var user = $scope.registerMail || "";
        var pass = $scope.registerPass;

        if(!isEmail(user)) {
            $scope.registerV = {
                success: false,
                msg: commonMsgs.invalidEmail.translate(),
            };
            return;
        } else if($scope.pass.strength < 60) {
            $scope.registerV = {
                success: false,
                msg: $scope.msg.passwordComplexity.translate(),
            };
            return;
        }

        appAPI.register(user, pass).then(function() {
            $scope.registerV = {
                success: true,
                msg: commonMsgs.emailSent.translate(),
            };
        }).catch(function(error) {
            if(error == 101)
                $scope.registerV = {
                    success: false,
                    msg: $scope.msg.alreadyRegistered.translate(),
                };
            else if(error == 102)
                $scope.registerV = {
                    success: false,
                    msg: commonMsgs.error.translate(),
                };
        });
        // back to start
        $timeout(function(){
            $scope.resetRegister();
        },10000);
    }

    // init page
    $scope.resetRegister();
}]);