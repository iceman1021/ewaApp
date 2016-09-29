//-- AngularJS --//
(function(){
    'use strict';

    var module = angular.module('app', ['onsen', 'googlechart', 'ngSanitize']);
    
    // form file directive (Assist with file uploads)
    module.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

    module.directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            )};
    }]);
    

    // mark html as trusted and load css data
    module.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

    module.controller('AppController', function ($scope, $http, $window, $timeout) {
        
        //API URL path
        var apiPath = 'http://www.dyncode.co.za/ewaApis/';
        
        $scope.data = [];
        
        //User details
        $scope.accnum = '';
        $scope.accfor = '';
        $scope.address = '';
        $scope.name = '';
        $scope.surname = '';
        $scope.cell = '';
        $scope.userID = '';
        $scope.firstTime = false;
        $scope.notifications = '';
        
        $scope.waterData = '';
        $scope.preWaterData = '';
        $scope.historyWreading = false;
        
        $scope.elecData = '';
        $scope.preElecData = '';
        $scope.historyEreading = false;
        
        $scope.wusage = [];
        $scope.eusage = [];
        
        // upload function script
        $scope.uploadedFile = function(element) {
            $scope.$apply(function($scope) {
                $scope.files = element.files;         
            });
        }
        
        // process login
        $scope.logMeIn = function() {
            var useremail = $scope.data.useremail;
            var password = $scope.data.password;
            
            if (useremail && password) {
                modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                
                console.log('Request:', 'apiPath + login.php, {"reqType" : "login", "user" : '+useremail+', "pass" : '+password+'}');
                
                $http.post(apiPath + 'login.php', {"reqType" : "login", "user" : useremail, "pass" : password})
                .success(function(data, status){
                    console.log('DATA:', data);
                    if (data['loginValid'] === 'Yes') {
                        modal.hide();
                        
                        $scope.accnum = data['accnum'];
                        $scope.accfor = data['accfor'];
                        $scope.address = data['address'];
                        $scope.name = data['name'];
                        $scope.surname = data['surname'];
                        $scope.cell = data['cell'];
                        $scope.userID = data['userID'];
                        $scope.firstTime = data['firstTime'];
                        
                        if ($scope.firstTime) {
                            $scope.notifications = '\
                                <p>We see that this is your first time accessing EWA and therefore we require you to enter historic data. Please continue below.</p>\n\
                                <p><button class="button button--large" ng-click="myNavigator.pushPage(\'waterHisReading.html\', { animation : \'fade\' } );">Historic Water</button></p>\n\
                                <p><button class="button button--large" ng-click="myNavigator.pushPage(\'elecHisReading.html\', { animation : \'fade\' } );">Historic Electricity</button></p>';
                        } else {
                            $scope.notifications = '<p><button class="button button--large" ng-click="getWaterStats();">Water Reading</button></p>\n\
                                <p><button class="button button--large" ng-click="getElecStats();">Electricity Reading</button></p>\n\
                                <p><button class="button button--large" ng-click="getUsage();">My Usage</button></p>';
                        }
                        
                        myNavigator.pushPage('home.html', { animation : 'fade' });
                        
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = 'There was a problem logging you in, please try again';
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'There was a problem logging you in, please try again';
                modal.show();
            }
        };
        
        // process registration
        $scope.registerMe = function() {
            var accnum = $scope.data.accnum;
            var accountfor = $scope.data.accountfor;
            var address = $scope.data.address;
            var name = $scope.data.name;
            var surname = $scope.data.surname;
            var cell = $scope.data.cell;
            var email = $scope.data.email;
            var password = $scope.data.password;
            
            if (accnum && accountfor && address && name && surname && cell && email && password) {
                 modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                $http.post(apiPath + 'register.php', {"reqType" : "register", "accnum" : accnum, "accountfor" : accountfor, "address" : address, "name" : name, "surname" : surname, "cell" : cell, "email" : email, "password" : password})
                .success(function(data, status){
                    console.log('DATA:', data);
                    if (data['error'] === 0) {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-thumbs-up';
                        $scope.data.errorCode = 'Thank you, your registration was successful.';
                        modal.show();
                        $timeout(function(){
                            modal.hide();
                            myNavigator.pushPage('index.html', { animation : 'fade' });
                        },'2000');
                        
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = data['html'];
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Please complete the whole form';
                modal.show();
            }
        };
        
        // process lost password lookup
        $scope.forgotMe = function() {
            
        };
        
        // process water reading
        $scope.submitWater = function() {
            var waterReading = $scope.data.waterReading;
            
            var files = $scope.files;
            var fd = new FormData();
            var url = apiPath + 'readings.php'
            angular.forEach(files,function(file){
                fd.append('fileToUpload',file);
            });

            fd.append("user_id", $scope.userID);
            fd.append("reqType", "waterNew");
            fd.append("waterReading", waterReading);
            
            if (waterReading) {
                modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                
                $http.post(url, fd, {
                    withCredentials : false,
                    headers : {
                        'Content-Type' : undefined
                    },
                    transformRequest : angular.identity
                })
                .success(function(data) {
                    if (data['error'] === 0) {
                        modal.hide();
                        $scope.data.waterReading = '';
                        ons.notification.alert({
                            messageHTML: data['html'],
                            title: 'Success',
                            buttonLabel: 'OK',
                            animation: 'default', 
                            callback: function() {
                                myNavigator.pushPage('home.html', { animation : 'fade' });
                            }
                        });
                        
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = 'There was a problem while entering your reading, please try again.';
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
                
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Please enter your water reading';
                modal.show();
            }
        };
        
        // process water reading
        $scope.submitElec = function() {
            var elecReading = $scope.data.elecReading;
            
            var files = $scope.files;
            var fd = new FormData();
            var url = apiPath + 'readings.php'
            angular.forEach(files,function(file){
                fd.append('fileToUpload',file);
            });

            fd.append("user_id", $scope.userID);
            fd.append("reqType", "elecNew");
            fd.append("elecReading", elecReading);
            
            if (elecReading) {
                modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                
                $http.post(url, fd, {
                    withCredentials : false,
                    headers : {
                        'Content-Type' : undefined
                    },
                    transformRequest : angular.identity
                })
                .success(function(data, status){
                    if (data['error'] === 0) {
                        modal.hide();
                        $scope.data.elecReading = '';
                        ons.notification.alert({
                            messageHTML: data['html'],
                            title: 'Success',
                            buttonLabel: 'OK',
                            animation: 'default', 
                            callback: function() {
                                myNavigator.pushPage('home.html', { animation : 'fade' });
                            }
                        });
                
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = 'There was a problem while entering your reading, please try again.';
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
                
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Please enter your electricity reading';
                modal.show();
            }
        };
        
        // add historic water readings
        $scope.submitHisWater = function() {
            var reading1 = $scope.data.waterHR1;
            var reading2 = $scope.data.waterHR2;
            var reading3 = $scope.data.waterHR3;
            
            if (reading1 && reading2 && reading3) {
                modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                
                $http.post(apiPath + 'readingHis.php', {"reqType" : "waterHis", "wReading1" : reading1, "wReading2" : reading2, "wReading3" : reading3, "user_id" : $scope.userID})
                .success(function(data, status){
                    if (data['error'] === 0) {
                        modal.hide();
                        $scope.data.elecReading = '';
                        $scope.historyWreading = true;
                        ons.notification.alert({
                            messageHTML: data['html'],
                            title: 'Success',
                            buttonLabel: 'OK',
                            animation: 'default', 
                            callback: function() {
                                if ($scope.historyEreading && $scope.historyWreading) {
                                    $scope.notifications = '<p><button class="button button--large" ng-click="getWaterStats();">Water Reading</button></p>\n\
                                    <p><button class="button button--large" ng-click="getElecStats();">Electricity Reading</button></p>\n\
                                    <p><button class="button button--large" ng-click="getUsage();">My Usage</button></p>';
                                } else {
                                    $scope.notifications = '\
                                    <p>We only require your historic electricity reading.</p>\n\
                                    <p><button class="button button--large" ng-click="myNavigator.pushPage(\'elecHisReading.html\', { animation : \'fade\' } );">Historic Electricity</button></p>';
                                }
                                myNavigator.pushPage('home.html', { animation : 'fade' });
                            }
                        });
                
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = 'There was a problem while entering your readings, please try again.';
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Please complete all fields.';
                modal.show();
            }
        };
        
        // add historic electricity readings
        $scope.submitHisElec = function() {
            var reading1 = $scope.data.waterHE1;
            var reading2 = $scope.data.waterHE2;
            var reading3 = $scope.data.waterHE3;
            
            if (reading1 && reading2 && reading3) {
                modal.show();
                $scope.data.errorIcon = 'refresh';
                $scope.data.errorIconSpin = 'true';
                $scope.data.errorCode = '';
                
                $http.post(apiPath + 'readingHis.php', {"reqType" : "elecHis", "eReading1" : reading1, "eReading2" : reading2, "eReading3" : reading3, "user_id" : $scope.userID})
                .success(function(data, status){
                    if (data['error'] === 0) {
                        modal.hide();
                        $scope.data.elecReading = '';
                        $scope.historyEreading = true;
                        ons.notification.alert({
                            messageHTML: data['html'],
                            title: 'Success',
                            buttonLabel: 'OK',
                            animation: 'default', 
                            callback: function() {
                                if ($scope.historyEreading && $scope.historyWreading) {
                                    $scope.notifications = '<p><button class="button button--large" ng-click="getWaterStats();">Water Reading</button></p>\n\
                                    <p><button class="button button--large" ng-click="getElecStats();">Electricity Reading</button></p>\n\
                                    <p><button class="button button--large" ng-click="getUsage();">My Usage</button></p>';
                                } else {
                                    $scope.notifications = '\
                                    <p>We only require your historic water reading.</p>\n\
                                    <p><button class="button button--large" ng-click="myNavigator.pushPage(\'waterHisReading.html\', { animation : \'fade\' } );">Historic Water</button></p>';
                                }
                                myNavigator.pushPage('home.html', { animation : 'fade' });
                            }
                        });
                
                    } else {
                        $scope.data.errorIconSpin = 'false';
                        $scope.data.errorIcon = 'fa-exclamation-triangle';
                        $scope.data.errorCode = 'There was a problem while entering your readings, please try again.';
                        modal.show();
                    }
                })
                .error(function(data, status) {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                    modal.show();
                });
            } else {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Please complete all fields.';
                modal.show();
            }
        };
        
        // get water stats from server 
        $scope.getWaterStats = function() {
            modal.show();
            $scope.data.errorIcon = 'refresh';
            $scope.data.errorIconSpin = 'true';
            $scope.data.errorCode = '';

            $http.post(apiPath + 'getStats.php', {"reqType" : "water", "user_id" : $scope.userID})
            .success(function(data, status){
                console.log("Status:", status);
                console.log("DATA:", data);

                if (status === 200) {

                    $scope.waterData = data['waterData'];
                    $scope.preWaterData = data['lastReading'];

                    $scope.myChartWater = {};
                    $scope.myChartWater.type = "AreaChart";
                    $scope.myChartWater.data = {
                        "cols": [
                            {
                                "id": "month",
                                "label": "Month",
                                "type": "string",
                                "p": {}
                            },
                            {
                                "id": "water-id",
                                "label": "Water",
                                "type": "number",
                                "p": {}
                            },
                            {
                                "id": "avg-id",
                                "label": "Avarage",
                                "type": "number",
                                "p": {}
                            }
                        ],
                        "rows": $scope.waterData
                    };

                    $scope.myChartWater.options = {
                        "title": "Usage",
                        "isStacked": "false",
                        "fill": 20,
                        "displayExactValues": true,
                        "chartArea" : {
                            width:'100%',
                            height:'100%'
                        },
                        "backgroundColor" : '#eeeeee',
                        "axisTitlesPosition" : 'in',
                        "vAxis": {
                            "title": "Consumption",
                            "textStyle": {
                                "bold": false
                            },
                            "gridlines": {
                                "count": 5
                            },
                            "textPosition" : 'in'
                        },
                        "hAxis": {
                            "title": "Date",
                            "textStyle": {
                                "bold": false
                            },
                            "textPosition" : 'in'
                        },
                        "legend": {
                            "position": 'in'
                        },
                        "width": '100%'
                    };
                    $timeout(function(){
                        modal.hide();
                        myNavigator.pushPage('waterReading.html', { animation : 'fade' } );
                    },'2000');

                } else {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'There was a problem while processing your data, please try again.';
                    modal.show();
                }
            })
            .error(function(data, status) {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                modal.show();
            });
        };
        
        // get electricity stats from server
        $scope.getElecStats = function() {
            modal.show();
            $scope.data.errorIcon = 'refresh';
            $scope.data.errorIconSpin = 'true';
            $scope.data.errorCode = '';

            $http.post(apiPath + 'getStats.php', {"reqType" : "elec", "user_id" : $scope.userID})
            .success(function(data, status){
                console.log("Status:", status);
                console.log("DATA:", data);

                if (status === 200) {
                    $scope.elecData = data['elecData'];
                    $scope.preElecData = data['lastReading'];

                    $scope.myChartElec = {};
                    $scope.myChartElec.type = "AreaChart";
                    $scope.myChartElec.data = {
                        "cols": [
                            {
                                "id": "month",
                                "label": "Month",
                                "type": "string",
                                "p": {}
                            },
                            {
                                "id": "water-id",
                                "label": "Water",
                                "type": "number",
                                "p": {}
                            },
                            {
                                "id": "avg-id",
                                "label": "Avarage",
                                "type": "number",
                                "p": {}
                            }
                        ],
                        "rows": $scope.elecData
                    };

                    $scope.myChartElec.options = {
                        "title": "Usage",
                        "isStacked": "false",
                        "fill": 20,
                        "displayExactValues": true,
                        "chartArea" : {
                            width:'100%',
                            height:'100%'
                        },
                        "backgroundColor" : '#eeeeee',
                        "axisTitlesPosition" : 'in',
                        "vAxis": {
                            "title": "Consumption",
                            "textStyle": {
                                "bold": false
                            },
                            "gridlines": {
                                "count": 5
                            },
                            "textPosition" : 'in'
                        },
                        "hAxis": {
                            "title": "Date",
                            "textStyle": {
                                "bold": false
                            },
                            "textPosition" : 'in'
                        },
                        "legend": {
                            "position": 'in'
                        },
                        "width": '100%'
                    };
                    $timeout(function(){
                        modal.hide();
                        myNavigator.pushPage('elecReading.html', { animation : 'fade' } );
                    },'2000');

                } else {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'There was a problem while processing your data, please try again.';
                    modal.show();
                }
            })
            .error(function(data, status) {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                modal.show();
            });
        };
        
        // get usage stats
        $scope.getUsage = function() {
            modal.show();
            $scope.data.errorIcon = 'refresh';
            $scope.data.errorIconSpin = 'true';
            $scope.data.errorCode = '';

            $http.post(apiPath + 'getStats.php', {"reqType" : "allUsage", "user_id" : $scope.userID})
            .success(function(data, status){
                console.log("Status:", status);
                console.log("DATA:", data);

                if (status === 200) {
                    $scope.wusage = data['wusage'];
                    $scope.eusage = data['eusage'];

                    $timeout(function(){
                        modal.hide();
                        myNavigator.pushPage('useage.html', { animation : 'fade' } );
                    },'2000');

                } else {
                    $scope.data.errorIconSpin = 'false';
                    $scope.data.errorIcon = 'fa-exclamation-triangle';
                    $scope.data.errorCode = 'There was a problem while processing your data, please try again.';
                    modal.show();
                }
            })
            .error(function(data, status) {
                $scope.data.errorIconSpin = 'false';
                $scope.data.errorIcon = 'fa-exclamation-triangle';
                $scope.data.errorCode = 'Request failed ' + data + ' ' + status;
                modal.show();
            });
        };
        
        // account for pop over
        ons.createPopover('accForPopover.html').then(function(popover) {
            $scope.popover = popover;
        });
        
        $scope.show = function(e) {
            $scope.popover.show(e);
        };
    });
    
    window.analytics.startTrackerWithId('UA-84898542-2');
    window.analytics.setUserId(device.uuid);
    window.analytics.trackView('index');
    window.analytics.trackView('login');
    window.analytics.trackView('register');
    window.analytics.trackView('How It Works');
    window.analytics.debugMode();
})();