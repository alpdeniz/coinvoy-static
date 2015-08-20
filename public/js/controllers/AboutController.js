coinvoyWallet.controller("AboutController", ["$scope", "$http", function($scope, $http) {
    // set page
    $scope.$parent.page = "about";
    // load static messages to scope
    $scope.msgs = window.messages.about;
}]);