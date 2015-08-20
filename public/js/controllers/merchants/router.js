coinvoyWallet.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {

    var checkLogin = {"data": ['Auth', function(Auth) {
        return Auth.checkLogin()
    }]};
    var landingCheck = {"data": ['Auth', function(Auth) {
        return Auth.landingCheck("/wallet")
    }]};

    $routeProvider
    /** set route for the index page and it load uirouter.html
    *in ng-view and activate RouteCtrl
    **/
    .when('/', {
        controller: 'LandingController',
        templateUrl: '/static/html/merchants/landing.html',
        resolve: checkLogin
    })
    .when('/wallet', {
        controller: 'WalletController',
        templateUrl: '/static/html/merchants/wallet.html',
        resolve: checkLogin
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
    // if not match with any route config then send to home page
    .otherwise({
        redirectTo: '/'
    });

    //$locationProvider.html5Mode({
    //    enabled: true,
    //    requireBase: false
    //});
}])