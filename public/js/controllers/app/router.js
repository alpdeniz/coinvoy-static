coinvoyWallet.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {

    var checkLogin = {"data": ['Auth', function(Auth) {
        return Auth.checkLogin()
    }]};
    var checkMarket = {"data": ['Auth', function(Auth) {
        return Auth.checkMarket()
    }]};
    var checkItem = {"data": ['Auth', '$route', function(Auth, $route) {
        return Auth.checkItem($route.current.params.item_id)
    }]};
    var checkAdminLogin = {"data": ['Auth', function(Auth) {
        return Auth.checkAdminLogin()
    }]};

    $routeProvider
    /** set route for the index page and it load uirouter.html
    *in ng-view and activate RouteCtrl
    **/
    .when('/', {
        controller: 'LandingController',
        templateUrl: '/static/html/app/landing.html',
        resolve: checkLogin
    })
    .when('/wallet', {
        controller: 'WalletController',
        templateUrl: '/static/html/app/wallet.html',
        resolve: checkLogin
    })
    .when('/market', {
        controller: 'MarketController',
        templateUrl: '/static/html/app/market.html',
        resolve: checkMarket
    })
    .when('/item/:item_id', {
        controller: 'ItemController',
        templateUrl: '/static/html/app/item.html',
        resolve: checkItem
    })
    .when('/newWallet/:code', {
        controller: 'NewWalletController',
        templateUrl: '/static/html/app/newWallet.html',
        resolve: {
            user: ['$http','$route', function($http, $route) {
                var post = {
                    code: $route.current.params.code,
                }
                return $http.post('/wallet/api/get_user', post).then(function(data) { 
                    window.user = data.data;
                    return data.data;
                });
            }]
        }
    })
    .when('/recoverPIN', {
        controller: 'RecoverPINController',
        templateUrl: '/static/html/app/recoverPIN.html',
        resolve: checkLogin
    })
    .when('/recoverFunds', {
        controller: 'RecoverFundsController',
        templateUrl: '/static/html/app/recoverFunds.html',
    })
    .when('/registerKYC', {
        controller: 'RegisterKYCController',
        templateUrl: '/static/html/app/registerKYC.html',
        resolve: checkLogin
    })
    .when('/forgetPassword/:code', {
       controller: 'ForgetPasswordController',
       templateUrl: '/static/html/app/forgetPassword.html',
       resolve: {
            user: ['$http','$route', function($http, $route) {
                var post = {
                    code: $route.current.params.code,
                }
                return $http.post('/wallet/api/get_user', post).then(function(data) {
                    if(!data.data.success) {
                        window.location.href = "https://coinvoy.net";
                        return;
                    }
                    window.user = data.data;
                    return data.data;
                });
            }]
        }
    })
    .when('/about', {
        controller: 'AboutController',
        templateUrl: '/static/html/app/about.html'
    })
    .when('/account', {
        controller: 'AccountController',
        templateUrl: '/static/html/app/account.html',
        resolve: checkLogin
    })
    .when('/panel', {
        controller: 'PanelController',
        templateUrl: '/static/html/app/panel.html',
        resolve: checkAdminLogin
    })
    // if not match with any route config then send to home page
    .otherwise({
        redirectTo: '/'
    });

    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
}])