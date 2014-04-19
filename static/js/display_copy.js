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

//    $http.get('/getlist').success(function(d) {
//        $scope.users = d.data;
//        $scope.$apply();
//    });
//    $('#loaderCircle').show();
    $scope.users = [];
//    $scope.showvar = true;
    $scope.page = 0;
    $scope.incr = 40;
    $scope.light_url = "/static/images/loader.gif";
    $scope.light_caption = "something";
//    $scope.html = 'welcome';

    myService.async().then(function(d) {
        $scope.users = d.data;
        $scope.testname = 'ripusingla'
        $scope.newhtml = function(){
            if ($scope.page >= $scope.users.length) return '';
            var length = ($scope.users.length - $scope.page > $scope.incr) ? $scope.incr : ($scope.users.length - $scope.page);
            length +=  $scope.page;
            var html = '';
            console.log($scope.page);
            console.log(length);
            var i=$scope.page, image;
            for(; i<length; i++) {
                image = $scope.users[i];
//                html += '<div id="mytile"><li><img src="' + image.profile_pic_url +'" width="200" height="' + image.height + '"><p>'+image.name+'</p></li></div>'
//                html += '<li>';
//                html += '<img src="' + image.profile_pic_url +'" width="200" height="' + image.height + '">';
//                html += '<p>'+image.name+'</p>';
//                html += '</li>';
                html += '<li><div class="polaroid">'+
                            '<div class="options">' +
                                '<div class="comment" title="Pin"> '+
                                    '<a href="#"><em><i class=" icon-tag"></i></em><span>Pin</span></a>'+
                                '</div>'+
                                '<div class="like"  title="Like">'+
                                    '<a href="#"><em><i class="icon-thumbs-up"></i></em><span>Like</span></a>'+
                                '</div>'+
                                '<div class="save" title="Facebook Profile">'+
                                    '<a href="#"><em><i class="icon-user"></i></em><span>Profile</span></a>'+
                                '</div>'+
                                '<div class="magnify"  title="Chat">'+
                                    '<a  href="#"><em><i class=" icon-comment"></i></em><span>Chat</span></a>'+
                                '</div>'+
                            '</div>'+
//                            '<a href="#" class="imageLink"><img src="'+image.profile_pic_url+'" alt="Something" width="200" height="'+image.height+'"/></a>'+
//                            '<div class="stats"><p>'+image.name+'</p></div>'+
                            '<a ng-click="ShowLightBox($event)""><img id="'+ i +'" src="' + image.profile_pic_url +'" width="200" height="' + image.height + '"></a><p>'+image.name+'</p>'+
//                            '<img src="' + image.profile_pic_url +'" width="200" height="' + image.height + '"><p>{{$scope.testname}}</p>'+
                        '</div></li>';
            }
            var element = $compile(html)($scope);
            $scope.page = length;
            return element;
        }
        $scope.nextPage();
//        $scope.html = $scope.newhtml();


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

    }

    $scope.nextPage = function() {
        $('#loaderCircle').show();
        $('#tiles').append($scope.newhtml());
        console.log('i am taking timeout for loading images');
        $timeout(function(){
            $scope.loadimages();
        }, 1000);

    };


    function onScroll(event) {
        var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 50);
        if(closeToBottom) {
            $scope.nextPage();
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

    $scope.ShowLightBox = function(e) {
//        console.log('you clicked..i dont konw which one');
////        var elem = angular.element(e.srcElement);
////        var id = elem.id;
//        console.log(e.target.id);
        console.log(e.target.id);
        var id = e.target.id;
        $scope.light_url = $scope.users[id].profile_pic_url;
        $scope.light_caption = $scope.users[id].name;
        console.log('i am taking timeout');

        $timeout(function(){
            $scope.loadlightbox();
        }, 10);
//        var html = ''
//        html += '<img src="'+$scope.users[id].profile_pic_url+'">' + '<div class="lightbox-caption"><p>' + $scope.users[id].name + '</p></div>';
//        var element = $compile(html)($scope);
//        $('div.light_content_unique').replaceWith(element);




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

