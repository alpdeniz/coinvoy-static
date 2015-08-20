
coinvoyWallet.factory('appAPI',["$q", "$timeout", "$http", function($q,$timeout,$http){

    var appAPI = {};
    appAPI.working  = "";
    appAPI.progress = 0;
    appAPI.loginRounds = 60000;
    appAPI.encRounds = 30000;

    appAPI.getWork = function() {
        return appAPI.working;
    }
    appAPI.getProgress = function() {
        return appAPI.progress;
    }

    appAPI.confirm = function(email, password, code) {
        appAPI.working = "Generating login keys...";
        var deferred = $q.defer();
        appAPI.getPBKDF2(password, email, appAPI.loginRounds).then(function(mainHash) {
            var passHash = appAPI.getSHA2(mainHash);
            var postObj = {
                email: email,
                password: passHash,
                code: code,
            }
            appAPI.working = "Confirming token...";
            $http.post("/wallet/api/confirm", postObj).success(function(data){
                appAPI.working = "";
                if(data.success != true) {
                    deferred.reject();
                } else {
                    // set cookie - required for byte decryption
                    var secret = appAPI.getSHA2(data.email + mainHash);
                    createCookie('user_secret', secret, 1);
                    // return user
                    var user = {email : data.email};
                    deferred.resolve(user);
                }
            }).error(function(data,status,headers){
                appAPI.working = "";
                deferred.reject();
            });
        }).catch(function() {
            appAPI.working = "";
            deferred.reject();
        });
        return deferred.promise;
    }

    appAPI.newAddress = function(email) {
        appAPI.working = "Getting new address..."
        var deferred = $q.defer();

        data = {};
        if(email)
            data['email'] = email;
        
        $http.post("/wallet/api/new_address", data).success(function(data, status, headers, config) {
            appAPI.working = "";
            if(data.success) {
                deferred.resolve(data.address);
            } else {
                deferred.reject(101);
            }
            //console.log(data);
            //$scope.myData.fromServer = data.title;
        }).error(function(data, status, headers, config) {
            appAPI.working = "";
            deferred.reject(102);  
        });
        return deferred.promise;
    }

    appAPI.register = function(user, pass) {
        appAPI.working = "Generating login keys..."
        var deferred = $q.defer();

        appAPI.getPBKDF2(pass, user, appAPI.loginRounds).then(function(mainHash) {
            appAPI.working = "Registering...";
            postObj = {
                email: user,
                password: appAPI.getSHA2(mainHash)
            };

            $http.post("/wallet/api/register", postObj).success(function(data, status, headers, config) {
                appAPI.working = "";
                if(data.success) {
                    deferred.resolve(data);
                } else {
                    deferred.reject(101);
                }
                //console.log(data);
                //$scope.myData.fromServer = data.title;
            }).error(function(data, status, headers, config) {
                appAPI.working = "";
                deferred.reject(102);  
            });
        });
        return deferred.promise;
    }

    appAPI.login = function(user, pass) {
        var deferred = $q.defer();
        if(user && pass) {
            appAPI.working = "Generating login keys...";
            appAPI.getPBKDF2(pass, user, appAPI.loginRounds).then(function(mainHash) {
                appAPI.working = "Logging in...";
                var passHash = appAPI.getSHA2(mainHash);
                postObj = {
                    email: user,
                    password: passHash
                };
                var responsePromise = $http.post("/wallet/api/login", postObj);
                responsePromise.success(function(data, status, headers, config) {
                    appAPI.working = "";
                    if(data.success == true) {
                        var secret = appAPI.getSHA2(data.email + mainHash);
                        createCookie('user_secret',secret, 1);
                        deferred.resolve(data);
                    } else {
                        deferred.reject();
                    }
                }).error(function(error) {
                    appAPI.working = "";
                    deferred.reject(error);
                });
            });
        } else if(readCookie('user_secret')) {
            appAPI.working = "Logging in...";
            $http.get("/wallet/api/login").success(function(data){
                appAPI.working = "";
                if(data.success != true) {
                    deferred.reject();
                } else {
                    deferred.resolve(data);
                }
            }).error(function(){
                appAPI.working = "";
                deferred.reject();
            });
        } else {
            appAPI.working = "";
            deferred.reject();
        }    
        return deferred.promise;
    };

    appAPI.finalizeConfirm = function(postObj) {
        appAPI.working = "Finalizing registration...";
        var deferred = $q.defer();

        $http.post("/wallet/api/finalize_confirm", postObj).success(function(data, status, headers, config) {
            appAPI.working = "";
            if(data.success)
                deferred.resolve(data);
            else
                deferred.reject();
        }).error(function(data, status, headers, config) {
            appAPI.working = "";
            deferred.reject();
        });
        return deferred.promise;
    };

    appAPI.logout = function() {
        appAPI.working = "Logging out...";
        eraseCookie('user_secret');
        var deferred = $q.defer();
        $http.get("/wallet/api/logout").success(function(data, status, headers, config) {
            appAPI.working = "";
            if(data.success == true) {
                deferred.resolve(data);
            } else {
                deferred.reject();
            }
        }).error(function(error) {
            appAPI.working = "";
            deferred.reject();
        });
        return deferred.promise;
    };

    appAPI.registerEscrow = function(toUser) {
        var deferred = $q.defer();
        $http.post("/wallet/api/register_escrow", toUser).success(function(escrowData){
            deferred.resolve(escrowData);
        }).error(function(){
           deferred.reject(); 
        })
        return deferred.promise;
    };

    appAPI.getSeed = function(key, salt) {
        var deferred = $q.defer();
        $http.get("/wallet/api/get_enc_seed").success(function(data){
            if(data.success) {
                console.log("You got your encrypted seed.");
                var seed = appAPI.decryptAES(data.bytes, key, salt, true); // hex result
                if(!seed)
                    deferred.reject(102);
                else
                    deferred.resolve(seed);
            } else {
                deferred.reject(101);
            }
        }).error(function(data,status,headers) {
            console.log("Error while getting bytes.");
            deferred.reject(103);
        });
        return deferred.promise;
    }

    appAPI.getPBKDF2 = function(rawString, salt, rounds) {
        var deferred = $q.defer();
        var starttime=(new Date()).getTime();
        var callback = function(hash) {
            //timing
            endtime=(new Date()).getTime();
            console.log("PBKDF2("+rounds+") took :" + (endtime-starttime) + " ms");
            appAPI.progress = 0;
            deferred.resolve(hash);
        }
        var progress = function(p) {
            console.log(p);
        }

        asmCrypto.PBKDF2_HMAC_SHA512.hex(rawString.toString(), salt, rounds, 64, progress, callback);
        
        return deferred.promise;
    };

    appAPI.encryptAES = function(data, key, salt, hex) {
        var deferred = $q.defer();
        appAPI.getPBKDF2(key, salt, appAPI.encRounds).then(function(keyHash) {
            keyHash = asmCrypto.hex_to_bytes(keyHash);
            if(hex)
                data = asmCrypto.hex_to_bytes(data);
            else
                data = asmCrypto.string_to_bytes(data);

            var cipherText = asmCrypto.bytes_to_hex(asmCrypto.AES_CBC.encrypt(data, keyHash.subarray(0,32)));
            appAPI.working = "";
            deferred.resolve(cipherText);
        });
        return deferred.promise;
    }

    appAPI.decryptAES = function(cipherText, key, salt, hex) {
        appAPI.working = "Decrypting seed...";
        var deferred = $q.defer();
        appAPI.getPBKDF2(key, salt, appAPI.encRounds).then(function(keyHash) {
            keyHash       = asmCrypto.hex_to_bytes(keyHash);
            cipherText    = asmCrypto.hex_to_bytes(cipherText);
            try {
                var plainText = asmCrypto.AES_CBC.decrypt(cipherText, keyHash.subarray(0,32));
                if(hex)
                    plainText = asmCrypto.bytes_to_hex(plainText);
                else
                    plainText = asmCrypto.bytes_to_string(plainText);
            } catch (err) {
                console.log(err.message);
                plainText = false;
            }
            appAPI.working = "";
            deferred.resolve(plainText);
        });
        return deferred.promise;
    }

    appAPI.getSHA2 = function(rawString) {
        return asmCrypto.SHA512.hex(rawString);
    }

    return appAPI;
}])