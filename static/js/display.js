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
    $scope.light_url = "/static/images/white.jpg";
    $scope.subset = [];

    myService.async().then(function(d) {
        $scope.users = d.data;

        $scope.newhtml = function(){
            if ($scope.subset.length >= $scope.users.length) {
                $('#loaderCircle').hide();
                return '';
            }
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

        $scope.newhtml();

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
        console.log("deactivated loader circle");

        $scope.scrollflag = true;
        console.log($scope.scrollflag);

    }

    $scope.nextPage = function() {

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
                console.log("activating loader circle");
                $('#loaderCircle').show();
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
            show: true
//            resizeToFit: true
        };
//        $('#demoLightbox').lightbox(options);
//        $('#myModal').modal(options).css(
//            {
//
//                'margin-left': function () {
//                    return -($(this).width() / 2);
//                }
//            }) ;
        $('#myModal').modal(options);
    }

    $scope.ShowLightBox = function(ind) {
//        console.log('you clicked..i dont konw which one');
////        var elem = angular.element(e.srcElement);
////        var id = elem.id;
//        console.log(e.target.id);
//        console.log(e.target.id);
//        var id = e.target.id;
        var user = $scope.users[ind];
        $scope.light_profile_pic_url = user.profile_pic_url;
        $scope.light_caption = user.name;
        $scope.light_work_name = user.work_name;
        $scope.light_education_name = user.education_name;
        $scope.light_current_location_name = user.current_location_name;
        $scope.light_hometown_location_name = user.hometown_location_name;
        $scope.light_relationship_status = user.relationship_status;
        $scope.light_birthday = user.birthday;
        $scope.light_interested_in = user.interested_in;
        $scope.light_likes_name = user.likes_name;
        $scope.light_username = user.username;
        $scope.light_thumbnails = user.profile_album;

        console.log($scope.light_current_location_name);
        console.log('i am taking timeout');

        $timeout(function(){
            $scope.loadlightbox();
        }, 50);
    }


    $(document).bind('scroll', onScroll);

    $scope.change_light_pic = function(ind){
//        var thumb = $scope.light_thumbnails[ind];
        $scope.light_profile_pic_url = $scope.light_thumbnails[ind].src_big;
//        $('#myModal').scrollTop();
    }
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
