//
//var app =  angular.module('myApp', [], function($compileProvider){
//    // configure new 'compile' directive by passing a directive
//    // factory function. The factory function injects the '$compile'
//    $compileProvider.directive('compile', function($compile) {
//        // directive factory creates a link function
//        return function(scope, element, attrs) {
//            scope.$watch(
//                function(scope) {
//                    // watch the 'compile' expression for changes
//                    return scope.$eval(attrs.compile);
//                },
//                function(value) {
//                    // when the 'compile' expression changes
//                    // assign it into the current DOM
//                    element.html(value);
//
//                    // compile the new DOM and link it to the current
//                    // scope.
//                    // NOTE: we only compile .childNodes so that
//                    // we don't get into infinite loop compiling ourselves
//                    $compile(element.contents())(scope);
//                }
//            );
//        };
//    })
//});

var app =  angular.module('myApp', []);

app.factory('myService', function($http) {
    var myService = {
        async: function() {
            var promise = $http.get('/getlist').then(function (response) {
                return response.data;
            });
            return promise;
        }
    };
    return myService;
});

function DispCtrl($scope, myService, $http, $compile, $timeout) {

    $scope.users = [];
//    $scope.page = 0;
    $scope.incr = 30;
    $scope.light_url = "/static/images/loader.gif";
    $scope.light_caption = "something";
    $scope.subset = [];

    myService.async().then(function(d) {
        $scope.users = d.data;

        $scope.newhtml = function(){
            if ($scope.subset.length >= $scope.users.length) return '';
            var temp = $scope.subset;
            var length = ($scope.users.length - temp.length > $scope.incr) ? $scope.incr : ($scope.users.length - temp.length);
            length +=  temp.length;
            console.log(temp.length);
            console.log(length);
            var i=temp.length, image;
            for(; i<length; i++) {
                image = $scope.users[i];
                temp.push(image);
            }
            $scope.subset = temp;
//            $scope.page = length;
        }

        $scope.nextPage();

    });


    $scope.loadimages = function(){
        console.log('timeout over');
        var options = {
            autoResize: true,
            container: $('#main'),
            offset: 2,
            itemWidth: 240
        };
        var handler = $('#tiles li');
        handler.wookmark(options);
        $('#loaderCircle').hide();
        $scope.scrollflag = true;
        console.log($scope.scrollflag);

    }

    $scope.nextPage = function() {
        $('#loaderCircle').show();
        $scope.newhtml();
        $scope.$apply();

//        $('#tiles').append($scope.newhtml());
//        console.log('i am taking timeout for loading images');
//        $timeout(function(){
//            $scope.loadimages();
//        }, 1000);

    };

    $scope.scrollflag = true;

    function onScroll(event) {
        if($scope.scrollflag) {

            var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
            if(closeToBottom) {
                $scope.scrollflag = false;
                $scope.nextPage();
//                $scope.scrollflag = true;
            }

        }

    };


    $scope.loadlightbox = function(){
        console.log('i got here');
        var options = {
            backdrop: true,
            keyboard: true,
            show: true,
            resizeToFit: true
        };
        $('#demoLightbox').lightbox(options);
    }

    $scope.ShowLightBox = function(ind) {
//        console.log('you clicked..i dont konw which one');
////        var elem = angular.element(e.srcElement);
////        var id = elem.id;
//        console.log(e.target.id);
//        console.log(e.target.id);
//        var id = e.target.id;
        $scope.light_url = $scope.users[ind].profile_pic_url;
        $scope.light_caption = $scope.users[ind].name;
        console.log('i am taking timeout');

        $timeout(function(){
            $scope.loadlightbox();
        }, 10);
    }


    $(document).bind('scroll', onScroll);


}

//app.directive('lightdirective', function(){
//    return{
//        restrict:"A",
//        link:function(scope, element, attrs){
//            element.bind('mouseenter', function(){
//                console.log('i am in the lightbox directive');
//            })
//
//        }
//    }
//})


app.directive('lastdirective', function($timeout) {
    return function(scope, element, attrs) {
//        console.log('ROW: index = ', scope.$index);
        scope.$watch('$last',function(v){
            if (v) {
                console.log('last');
                console.log('i am taking timeout for loading images');
                $timeout(function(){
                    scope.loadimages();
                }, 1000);
            }

        });

    };
})
