
coinvoyWallet.factory('Auth', ['$q','$http','$location','appAPI',function($q, $http, $location, appAPI){
    var user = false;
    var loggingIn = false;

    return {
        setUser : function(aUser){
            if(aUser) {
                contacts = aUser.contacts;
                // key by id
                contactsById = {};
                for (var i=0; i < contacts.length; i++) {
                    if(!contacts[i] || !contacts[i].avatar)
                        contacts[i].avatar = defaultAvatar;
                    contactsById[contacts[i].id] = contacts[i];
                }
                aUser.contacts = contactsById;
                aUser.avatar   = aUser.avatar || defaultAvatar;
            }
            window.user = aUser;
        },
        isLoggedIn : function(){
            return(user)? user : false;
        },
        getUser: function() {
            return window.user;
        },
        getWork: function() {
            return loggingIn;
        },
        getLogin: function() {
            var deferred = $q.defer();
            appAPI.login().then(function(user){
                deferred.resolve(user);
            });
            return deferred.promise;
        },
        checkLogin: function(path) {
            if(window.user)
                return true;
            var deferred = $q.defer();
            if(!user) {
                loggingIn = "Logging in...";
                $this = this;
                appAPI.login().then(function(user) {
                    loggingIn = false;
                    // LOGIN
                    $this.setUser(user);
                    deferred.resolve(user);
                }).catch(function(){
                    loggingIn = false;
                    $location.path('/');
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        },
        checkAdminLogin: function(path) {
            var deferred = $q.defer();
            loggingIn = "Logging in as admin...";
            $this = this;
            $http.get("/wallet/api/get_panel_data").success(function(data) {
                loggingIn = false;
                // LOGIN
                window.users = data.users;
                window.wallet_data = data.wallet;
                deferred.resolve();
            }).error(function(){
                loggingIn = false;
                $location.path('/');
                deferred.resolve();
            });
            return deferred.promise;
        }
      }
}]);