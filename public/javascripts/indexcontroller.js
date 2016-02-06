
var app = angular.module('picpop', ["chart.js"]);

app.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#FF5252', '#FF8A80'],
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
    });
}])
app.controller('MainCtrl', function($scope, $window, $http) {
    $scope.firstName = "Eshan";

    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Series A', 'Series B'];

    $scope.info = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    $scope.authenticate = function() {

        $scope.id = $scope.generateKey();

        $http({
            method: 'POST',
            url: 'http://localhost:3000/saveID',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},

            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },

            data:  {
                userID: $scope.id
            }
          }).then( function (body) {
              /*NO ERROR CHECKING BUILT IN YET */
              console.log("savedID in backend");
          });



    	loginWindow = $window.open("https://api.instagram.com/oauth/authorize/?client_id=d020ad35b9014622b589d19a6d1130eb&redirect_uri=http://localhost:3000/igcallback&response_type=code&scope=likes+comments+public_content");
        
        setTimeout(function () {
            $scope.analyze();
            loginWindow.close();
        }, 5000);
        /*
        setTimeout(function () {
            loginWindow.close();
        }, 10000);
        */  
    }

    $scope.analyze = function() {

        $scope.pictures = [];

        http({
            method: 'GET',
            url: 'http://localhost:3000/getColorData',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},

            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },

            data:  {
                userID: $scope.id
            }
          }).then( function (resp) {
              /*NO ERROR CHECKING BUILT IN YET */
              console.log("got color data from database");
              $scope.pictures = resp.data;
          });


        // Must Run the following the code for every single picture
        var colorFreq = {}; //keeping weight
        var colorCount = {}; //keeping occurrences
        var finalColorWeight = {}; //final value will be colorFreq[x]/colorCount[x]

        $scope.pictures.forEach (function(picture) {
            //for (i = 0; i < $scope.pictures.length; i++){

            var likes = picture[0];
            var colors = picture[1]; //list of colors in picture

            colors.forEach(function(color){
                if (colorFreq[color[0]] != undefined){
                        colorFreq[color[0]] += color[1]*likes/100.0;
                        colorCount[color[0]] +=1;
                } else{
                    colorFreq[color[0]] = color[1]*likes/100.0;
                    colorCount[color[0]] = 1;
                }
            });

        });

        colorFreq.forEach(function(color){
            finalColorWeight[color] = colorFreq[color]/colorCount[color];
        });

        console.log("finalColorWeight: " + finalColorWeight);
        return finalColorWeight;
    };


    $scope.generateKey = function() {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var result = '';
        for (var i = 10; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

}


