
var coinvoyAPIGuide = angular.module("coinvoyAPIGuide", ['ngRoute']);

coinvoyAPIGuide.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {

    $routeProvider
    /** set route for the index page and it load uirouter.html
    *in ng-view and activate RouteCtrl
    **/
    .when('/', {
        controller: 'LandingController',
        templateUrl: '/static/html/wallet/landing.html',
    })
    .when('/intro', {
        controller: 'IntroController',
        templateUrl: '/static/html/wallet/intro.html',
    })
    .when('/faq', {
        controller: 'FaqController',
        templateUrl: '/static/html/wallet/faq.html',
    })
    .when('/tech', {
        controller: 'GuideController',
        templateUrl: '/static/html/wallet/tech.html',
    })
    // if not match with any route config then send to home page
    .otherwise({
        redirectTo: '/'
    });
}])

.controller("MainController", ["$scope", "$http", "$timeout", "$location", function($scope, $http, $timeout, $location) {

    $scope.menuitems = [{name: "HOME", link: ""},{name: "Dashboard", link: ""},{name: "About", link: ""}];

    $scope.language = "EN";
    // page messages
    var msgs = window.messages.main;
    // common messages
    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = {
        banner: msgs.banner.translate(),
        register: msgs.register.translate(),
        about: msgs.about.translate(),
        account: msgs.account.translate(),
        wallet: msgs.wallet.translate(),
        password: msgs.password.translate(),
        passPlaceholder: msgs.passPlaceholder.translate(),
        mailPlaceholder: msgs.mailPlaceholder.translate(),
        logout: msgs.logout.translate(),
    };
    // register view
    $scope.registerV = {
        success: false,
        msg: false,
    };

    $scope.toPage = function(link) {
        $location.path(link);
    }

    $scope.changeLanguage = function(code) {
        $scope.language = code;
    }
}])

.controller("LandingController", ["$scope", "$http", "$timeout", "$location", function($scope, $http, $timeout, $location) {

}])

.controller("GuideController", ["$scope", "$http", "$timeout", "$location", function($scope, $http, $timeout, $location) {

    $scope.features = ["Multisignature HD Structure", "On-the-fly key generation", "Password reset", "PIN recovery", "Heavy encryption", "On your browser"];
}])

.controller("FaqController", ["$scope", "$http", "$timeout", "$location", function($scope, $http, $timeout, $location) {

}])

.controller("IntroController", ["$scope", "$http", "$timeout", "$location", function($scope, $http, $timeout, $location) {

}])