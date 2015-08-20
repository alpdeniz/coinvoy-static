coinvoyWallet.controller("AccountController", ["$scope", "$http", "$timeout", "$location", "Auth", 'FileUploader',"appAPI", function($scope, $http, $timeout, $location, Auth, FileUploader, appAPI) {
	// set user
	$scope.user = Auth.getUser();
	$scope.$parent.user = $scope.user;
    // set page
    $scope.$parent.page = "account";
    // page messages
    $scope.msgs = window.messages['account'];

    // page functions
    $scope.toPage = function(link) {
        $location.path(link);
    };
    $scope.updateSettings = function() {
        $http.post('/wallet/api/update_settings', {
            name: $scope.user.name,
            sirname: $scope.user.sirname,
        }).success(function(){
            $scope.updateMessage = "Settings successfully updated";
            $timeout(function() {
                $scope.updateMessage = "";
            },2000);
        }).error(function(e){
            $scope.updateMessage = "Error, but we are working on it.";
            $timeout(function() {
                $scope.updateMessage = "";
            },2000)
            console.log("Error: "+e)
        });
    };
    $scope.changePass = function() {

        if($scope.pin.length < 4) {
            $scope.changeError = true;
            $scope.changeMsg = "PIN should have 4 characters minimum.".translate();
            return false;
        }
	    if($scope.oldPass.length < 7) {
    		$scope.changeError = true;
    		$scope.changeMsg = "Current password should be longer than 6 characters.".translate();
    		return false;
    	} else if($scope.newPass.length < 7){
    		$scope.changeError = true;
    		$scope.changeMsg = "New password should be longer than 6 characters.".translate();
    		return false;
    	}

        // generate password hashes
        var oldPass,oldUserHash,newPass;
        appAPI.getPBKDF2($scope.oldPass, user.email, appAPI.loginRounds).then(function(mainHash) {
            oldPass = appAPI.getSHA2(mainHash);
            oldUserHash = appAPI.getSHA2(user.email + mainHash);
            appAPI.getPBKDF2($scope.newPass, user.email, appAPI.loginRounds).then(function(mainHash) {
                newUserHash = appAPI.getSHA2(user.email + mainHash);
                newPass = appAPI.getSHA2(mainHash);

                appAPI.getDecBytes(oldUserHash + $scope.pin, user.salt).then(function(decBytes){
                    // Encrypt Bytes
                    appAPI.encryptAES(decBytes, newUserHash + $scope.pin, user.salt, true).then(function(enc_seed) {
                        console.log('Bytes re-encrypted : ' + enc_seed);
                        postObj = {
                            oldpass: oldPass,
                            newpass: newPass,
                            enc_seed: enc_seed
                        };

                        var changeReq = $http.post("/wallet/api/change_password", postObj);
                        changeReq.success(function(data, status){
                            if(data.success) {
                                // apply new user hash
                                createCookie('userHash',newUserHash,1);
                                $scope.changeSuccess = true;
                                $scope.changeMsg = "Password successfully changed.".translate();
                            } else {
                                $scope.changeError = true;
                                $scope.changeMsg = "Please enter a correct password.".translate();
                            }
                        }).error(function(){
                            $scope.changeError = true;
                            $scope.changeMsg = "An error occurred. Sorry.".translate();
                        });

                        $timeout(function(){
                            $scope.changeSuccess = false;
                            $scope.changeError = false;
                            $scope.changeMsg = false;
                            $scope.changePassBox = false;
                        },5000);
                    });

                }).catch(function(error) {
                    if(error == 101) {
                        $this.error = "Couldn't get the bytes.";
                    } else if(error == 102) {
                        $this.error = "Error decrypting bytes.";
                    } else {
                        $this.error = "Error getting extra bytes.";
                    }
                });
            });
        });
    };

    // UPLOADER
    var uploader = $scope.uploader = new FileUploader({
        url: '/wallet/api/set_avatar'
    });
    // FILTERS
    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });
    uploader.onAfterAddingFile = function(item) {
        var reader = new FileReader();
        // put into fn scope
        var item = item;
        //check extension type
        var ext = item.file.type.split("/")[1];
        if (['jpg', 'jpeg', 'gif', 'png'].indexOf(ext) < 0) {
            $scope.logoUploadWarning = "Invalid extension.";
            return;
        }
        reader.onload = function (event) {
            // pixels allowed
            var max_size = 150;
            // tolerance
            var allowance = 50;
            // image object
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function () {
                var avatar;
                if(this.width>max_size+allowance || this.height>max_size+allowance) {
                    var canvas = document.createElement('canvas');
                    //make invisible
                    canvas.style.visibility="hidden";
                    canvas.width = max_size;
                    canvas.height = max_size;
                    var dimRatio = this.width / this.height;
                    var padLeft = 0;
                    var padTop = 0;
                    if(dimRatio >= 1) {
                        cropHeight = this.height;
                        cropWidth  = this.height;
                        padLeft = (this.width - this.height)/2;
                    } else if(dimRatio < 1) {
                        cropHeight = this.width;
                        cropWidth  = this.width;
                        padLeft = (this.height - this.width)/2;
                    }
                    
                    document.body.appendChild(canvas);
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, padLeft, padTop, cropWidth, cropHeight, 0, 0, max_size, max_size);

                    var dataURL = canvas.toDataURL("image/png", 1);
                    //remove canvas
                    canvas.parentNode.removeChild(canvas);
                    //extract data from urlString
                    var n = dataURL.indexOf(",");
                    var data = dataURL.toString().substring(n+1); //we skip the ',' symbol used by navigator to detect canvas text
                    function b64toBlob(b64Data, contentType, sliceSize) {
                        contentType = contentType || '';
                        sliceSize = sliceSize || 512;

                        var byteCharacters = atob(b64Data);
                        var byteArrays = [];

                        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                            var slice = byteCharacters.slice(offset, offset + sliceSize);

                            var byteNumbers = new Array(slice.length);
                            for (var i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }

                            var byteArray = new Uint8Array(byteNumbers);

                            byteArrays.push(byteArray);
                        }

                        var blob = new Blob(byteArrays, {type: contentType});
                        return blob;
                    }
                    // here is b64 image for display
                    avatar = dataURL;
                    // insert file to uploader
                    var imgFile = b64toBlob(data,'image/png')
                    item._file = imgFile;  
                } else {
                    // file is accepted, update current view only
                    avatar = this.src;
                }
                // update and start uploading
                $scope.$apply(function () {
                    $scope.user.avatar = avatar;
                    item.upload();
                });
            };
            
        };
        reader.readAsDataURL(item._file);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        // update user avatar
        var user = Auth.getUser();
        user.avatar = response.filename;
        Auth.setUser(user);
        $scope.avatarMessage = "Avatar successfully updated";
        $timeout(function() {
            $scope.avatarMessage = "";
        },2000)
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
        $scope.avatarMessage = "Avatara update failed";
        $timeout(function() {
            $scope.avatarMessage = "";
        },2000);
    };
    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        $scope.avatarMessage = "Avatara update failed: Invalid file";
        $timeout(function() {
            $scope.avatarMessage = "";
        },2000);
    };
    $scope.fileSelect = function() {
        document.getElementById("avatarSelect").click();
    }
}]);