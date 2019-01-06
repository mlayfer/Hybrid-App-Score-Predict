//Set The Name Of The App  
var appModel = {};
var app = angular.module('app', ['ngRoute'])

.config(function ($routeProvider) {
    // Set The Route Provider 
    $routeProvider.
	when('/mainPage', {
	    templateUrl: 'partials/mainPage.html',
	    controller: 'mainCtrl'
	}).
	otherwise({
	    redirectTo: '/mainPage'
	});


})
.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.userName = '';
    $rootScope.currentRoute = '';
    $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
        if (next.$$route) {
            $rootScope.currentRoute = next.$$route.originalPath;
            appModel.currentRoute = next.$$route.originalPath;
        }
    });

    $rootScope.goBack = function () {
        if ($rootScope.currentRoute == "/login") {
            alert("QUIT");
        } else {
            if ($rootScope.currentRoute == "/userPage/:Type/:Id")
                prevUrl = "/mainPage";
            if ($rootScope.currentRoute == "/mainPage")
                prevUrl = "/login";
            $rootScope.go(prevUrl);
        }
    }

    $rootScope.go = function (path) {
        $location.path(path);
    };

}]);