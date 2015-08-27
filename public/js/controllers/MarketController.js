coinvoyWallet.controller("MarketController", ["$scope", "$http", "$timeout", "$location", "angularLoad", "TxSocket", "appAPI", "txFeed", function($scope, $http, $timeout, $location, angularLoad, TxSocket, appAPI, txFeed) {

    // common messages
    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = window.messages.market;
    // set page
    $scope.$parent.page = "market";

    // set user for top menu
    $scope.$parent.user = window.user;

    $scope.products = window.market.products;

}]);

coinvoyWallet.controller("ItemController", ["$scope", "$http", "$timeout", "$location", "angularLoad", "TxSocket", "appAPI", "txFeed", function($scope, $http, $timeout, $location, angularLoad, TxSocket, appAPI, txFeed) {

    // common messages
    var commonMsgs = window.messages.common;
    // load static messages to scope
    $scope.msg = window.messages.market;
    // set page
    $scope.$parent.page = "market";

    // set user for top menu
    $scope.$parent.user = window.user;

    $scope.item = window.market.item;

}]);