window.createCookie = function(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

window.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

window.eraseCookie = function(name) {
    createCookie(name,"",-1);
}

window.isEmail = function(value) {
    if(value.length > 0 && /^[^\W]*(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*\.[a-zA-Z]{2,4}$/.test(value))
        return true;
    return false;
}

window.defaultAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABjFBMVEV1uwObzkjc7sDC4Y+BwRmu12vS6a2OxzB4vAik0lm33HzM5qGTyjmGwyK02nbX7LfH45if0FB8vhC83oWr1WWXzEDV6rKKxSl2uwTA4Iux2HCo1GB6vQyDwhzQ6KnI5Jva7bt+wBSRyTXW67Wi0VXD4pK63YGez02Vyz6IxSeZzUTL5Z/O56W+34eLxiy223qv2G52vQSy2XKPyDKm01yCwRuEwh6h0VPZ7LnR6KuUyjus1miczkp7vg7B4Y5+vxN/wBbb7b643H673YKSyTeazUbX67fH5JnV6rPJ5Z15vQrF4pWz2XSn1F+/34fN5qR3vAaj0lfR6amNxy6JxSiLxyrT6a+HxCSYzEKBwRax2W6t12ap1WLZ7buh0VTH5Zmf0U6z23SRyTKXyz7D4ZGi0Vbb7b2FwyCu12y12ni/34nP56d8vxKPyTB6vwyNxyyRyTbF45PB4Y+h0VDB4Yu73YG734OTyjrL5aGUyjzN5qOr1maKxSqdz0yt12qv2Wy53Xyl0lqez06SyTgsIRrYAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH3wIYAw0D7jC55AAAAbNJREFUeNrtmT1Lw1AUhk8P3YQuwUEHKWSxKFascdFQcShNHHRy6pgs6i9w01+uQislmo9zuee+0pxnDrxP3pvcXE6IDMMwDMMwDFf2x/zDZejwGf/mLVw813GNjf/mQD3+mFt4Bd7+GnS+pgEz1oAZa8CMNRgw2ECUzxNwvkIFUoEYnO+9ArnAwmv+mMEVOOTzDC3A6Hy8wCNa4Akt4G8NntECbAKO5GiBAVrgAi0QoQWK3jcwQgvcoAVubSs2AV/cowXmbvmHvT8V75LACroRu1ZAOyXwIs8/6/uEZAmdEv6HKZl3gRNwvrQCBYE99LBaUsGdisAH+n8BofM7GzyoCUzRP60Ind/JICeswbtuPuUt+RlpcxVqOlvLsCH/lIKgPxVzNJhTMJbB3//2EkYUmCHy9tcsNunnZBjaZNLnfOLxzSjF71rkc2Bf3W/SlutTr4OSv8+A09rrY7+HtKbv/lFSubhoPqek4vSEPSPbLQvWQH023U6K6F62EhHrA+m+y0okHJAV7u43lNj4yrOQMoRy+2MLIcbVv70MzFiDDCuQgQv4qsAETMAETMAETKD3Ap/LEEkZTALPpAAAAABJRU5ErkJggg==';

window.unknownContact = {
    id    : 0,
    username: "S0m3oNe",
    name  : "unknown",
    sirname: "",
    email : "some@one.com",
    salt: "salt",
    avatar: defaultAvatar,
    contacts: [],
    transactions: [{"unspent": true, "message": "", "vout": 1, "from_user_id": null, "to_addr_index": 5, "confirmed": true, "txid": "8e796671adfc7bfa400a7f71e4ac853db3dde6d2d577b6d83c4dea673fe83992", "time": 1427187885.0, "amount": "100000.0", "to_user_id": 1, "to_addr": "36u56DYJjwdGxPWrpSK8djaPWvedhDDxLP"}, {"unspent": true, "message": "", "vout": 0, "from_user_id": null, "to_addr_index": 6, "confirmed": true, "txid": "9562516371212c556a8421694f20a78079d87ec2492a2aedd69fe329487e6785", "time": 1427190957.0, "amount": "100000.0", "to_user_id": 1, "to_addr": "3MDEgA3LwQZdJLDVCoqpftMdhEXroA2Ms5"}, {"unspent": true, "message": "", "vout": 1, "from_user_id": null, "to_addr_index": 6, "confirmed": true, "txid": "2551b5d1b7ffd39c5f05e861d4b79a2449bf62214568606c2d81eefc73e07654", "time": 1429170808.0, "amount": "100000.0", "to_user_id": 1, "to_addr": "3MDEgA3LwQZdJLDVCoqpftMdhEXroA2Ms5"}, {"unspent": true, "message": "", "vout": 1, "from_user_id": null, "to_addr_index": 6, "confirmed": false, "txid": "2551b5d1b7ffd39c5f05e861d4b79a2449bf62214568606c2d81eefc73e07654", "time": 1429170808.0, "amount": "100000.0", "to_user_id": 1, "to_addr": "3MDEgA3LwQZdJLDVCoqpftMdhEXroA2Ms5"}],
}
// window.debug = {user: window.unknownContact};

var coinvoyWallet = angular.module("coinvoy", ['ngRoute', 'angularLoad','ngWebSocket','angularFileUpload',"ngClipboard"]);

coinvoyWallet.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");
}]);


coinvoyWallet

.controller("MainController", ["$scope", "$http", "$timeout", "$location", "Auth", "appAPI", function($scope, $http, $timeout, $location, Auth, appAPI) {

    // init appAPI to listen when working
    $scope.working = appAPI.getWork;
    // page display/reset variable
    $scope.pageReset = true;
    // language
    $scope.language = "EN";
    // common messages
    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = window.messages.main;
    // set page
    $scope.page = "home";
    // login view
    $scope.loginV = {
        success: false,
        msg: false,
    };

    // page functions
    $scope.toPage = function(link) {
        $location.path(link);
    }
    $scope.openLoginBox = function() {
        $scope.loginBox = true;    
    }
    $scope.login = function() {
        var user = ($scope.loginMail || "").trim();
        var pass = $scope.loginPass;

        if(!isEmail(user)) {
            $scope.loginV = {
                success: false,
                msg: commonMsgs.invalidEmail.translate(),
            };
            Auth.setUser(false);
            return;
        }

        appAPI.login(user, pass).then(function(data) {
            $scope.loginV = {
                success: true,
                msg: $scope.msg.loginSuccess.translate(),
            };
            //login User
            Auth.setUser(data);

            $timeout(function(){
                $scope.loginV = {
                    success: false,
                    msg: false,
                };
                $scope.loginBox = false;
                $location.path( "/wallet" );
            },500);
        }).catch(function(error) {
            $scope.loginV = {
                success: false,
                msg: $scope.msg.loginFail.translate(),
            };
            Auth.setUser(false);

            $timeout(function(){
                $scope.loginV = {
                    success: false,
                    msg: false,
                };
            },3000);  
        });      
    };
    $scope.logout = function() {
        appAPI.logout().then(function() {
             //logout User
            Auth.setUser(false);
            window.user = false;
            $scope.user = false;
            //redirect
            $timeout(function(){
                $location.path("/");
            },300);
        }).catch(function() {
            console.log("Error in logout");
            $location.path("/");
        });
    }
    $scope.forgotPassword = function() {

        var user = ($scope.loginMail || "").trim();

        if(isEmail(user)) {
            // send password reset email
            postObj = {
               email: user
            };

            $http.post('/wallet/api/forgot_password', postObj).success(function(data) {

                if (!data.success) {
                    $scope.loginV = {
                        success: false,
                        msg: commonMsgs.error.translate(),
                    };
                    console.log("Error: " + data.message);
                    return;
                }

                $scope.loginV = {
                    success: true,
                    msg: commonMsgs.emailSent.translate(),
                };

           }).error(function (data) {
                $scope.loginV = {
                    success: false,
                    msg: commonMsgs.error.translate(),
                };
                console.log("Error: " + data.message)
           });
       } else {
            $scope.loginV = {
                success: false,
                msg: commonMsgs.invalidEmail.translate(),
            };
       }
    }
    $scope.changeLanguage = function(code) {
        $scope.pageReset = false;
        $scope.language = code;
        window.language = code;
        window.setTimeout(function(){
            $scope.pageReset = true;
            $scope.$digest();
        });
    }
}]);
