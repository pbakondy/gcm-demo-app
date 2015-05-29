/*global console*/

angular.module('starter')
  .constant('GOOGLE_SENDER_ID', '0000000000000')
  .constant('AIRBOP_APP_KEY', '00000000-0000-0000-0000-000000000000')
  .constant('AIRBOP_APP_SECRET', '0000000000000000000000000000000000000000000000000000000000000000');


angular.module('starter')
  .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$timeout',
      '$cordovaPush', '$airbopClient',
      'GOOGLE_SENDER_ID', 'AIRBOP_APP_KEY', 'AIRBOP_APP_SECRET',
    function($scope, $rootScope, $window, $timeout, $cordovaPush, $airbopClient,
      GOOGLE_SENDER_ID, AIRBOP_APP_KEY, AIRBOP_APP_SECRET) {

    'use strict';

    var googleSenderId = GOOGLE_SENDER_ID;

    var airbopClientParams = {
      'regid': '', // arrives from Google server
      'airbopAppKey': AIRBOP_APP_KEY,
      'airbopAppSecret': AIRBOP_APP_SECRET
    };

    $scope.app = {};
    $scope.app.title = 'GCM Demo App';
    $scope.app.log = '';

    var androidConfig = {
      'senderID': googleSenderId
    };

    function isBrowser() {
      return (!$window.cordova && !$window.PhoneGap && !$window.phonegap);
    }


    function log(level, message) {
      if (isBrowser()) {
        console[level].call(console, message);
      } else {
        if (typeof message === 'object') {
          message = JSON.stringify(message);
        }
        $timeout(function () {
          $scope.app.log += level.toUpperCase() + ' ' + message + '\n';
        });
      }
    }


    function successHandler(result) {
      log('info', result);
    }

    function errorHandler(error) {
      log('error', error);
    }


    $scope.app.register = function() {
      if (typeof device === 'undefined') {
        log('warn', 'No device plugin found. Install `cordova-plugin-device`.');
        return;
      }

      if ( $window.device.platform === 'Android' ){
        log('info', 'Register android device');
        $cordovaPush.register(androidConfig).then(successHandler, errorHandler);
      }
    };


    function notificationHandler(event, notification) {

      /*
        Example notification:
        {
          "regid":"APA91b....",
          "event":"registered"
        }
      */
      if (notification.event === 'registered') {
        log('debug', 'GCM REGISTRATION ID: ' + notification.regid);
        airbopClientParams.regid = notification.regid;
        $airbopClient.register(airbopClientParams).then(successHandler, errorHandler);
      }

      /*
        Example notification:
        {
          "message":"DEMOMESSAGE",
          "payload":{"message":"DEMOMESSAGE","title":"DEMOTITLE","url":""},
          "collapse_key":"do_not_collapse",
          "from":"1000000000000",
          "foreground":true,
          "event":"message"
        }
        'from' field equals GOOGLE_SENDER_ID
      */
      if (notification.event === 'message') {
        log('info', 'INCOMING MESSAGE');
        log('info', notification);
      }
    }

    // You have to use $rootScope when the current controller has bound to a different HTML node as 'ng-app'
    // $rootScope.$on('$cordovaPush:notificationReceived', notificationHandler);

    $scope.$on('$cordovaPush:notificationReceived', notificationHandler);


  }]);
