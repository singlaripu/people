
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

function DispCtrl($scope, myService, $http) {

//    $http.get('/getlist').success(function(d) {
//        $scope.users = d.data;
//        $scope.$apply();
//    });
    $scope.users = [];
    $scope.page = 0;
    $scope.incr = 40;

    myService.async().then(function(d) {
        $scope.users = d.data;
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
                            '<img src="' + image.profile_pic_url +'" width="200" height="' + image.height + '"><p>'+image.name+'</p>'+
                        '</div></li>';
            }
            $scope.page = length;
            return html;
        }
        $scope.nextPage();
    });


    $scope.nextPage = function() {

        $('#tiles').append($scope.newhtml());
        var options = {
            autoResize: true,
            container: $('#main'),
            offset: 2,
            itemWidth: 240
        };
        var handler = $('#tiles li');
        handler.wookmark(options);

    };


    function onScroll(event) {
        var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 50);
        if(closeToBottom) {
            $('#loaderCircle').show();
            $scope.nextPage();
            $('#loaderCircle').hide();
        }
    };

    $(document).bind('scroll', onScroll);

}



