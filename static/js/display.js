

var app =  angular.module('myApp', ['ui.bootstrap']);

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

function DispCtrl($scope, myService, $http, $compile, $timeout, $socketio) {

    $scope.users = [];
    $scope.page = 0;
    $scope.incr = 30;
//    $scope.light_url = "/static/images/white.jpg";
    $scope.subset = [];
    $scope.handler = $('#tiles li');
    $scope.scrollflag = true;
    $scope.isCollapsed = false;
    $scope.chatCollapsed = false;

    $(document).bind('scroll', onScroll);

    myService.async().then(function(d) {
        $scope.users = d.data;

        for(var j=0; j<$scope.users.length; j++){
            $scope.users[j].namefilter = 1;
            $scope.users[j].genderfilter = 1;
            $scope.users[j].locationfilter = 1;
            $scope.users[j].hometownfilter = 1;
            $scope.users[j].workfilter = 1;
            $scope.users[j].educationfilter = 1;
            $scope.users[j].likesfilter = 1;
//            $scope.users[j].dummyurl = '/static/images/placeholder1.gif';
        }
        $scope.subset = $scope.users;
        $scope.newhtml();
    });

    $scope.newhtml = function(){
        if ($scope.page*$scope.incr >= $scope.subset.length) {
            $('#loaderCircle').hide();
            return ;
        }
        $scope.page += 1;
        return;
    }


    $scope.loadimages = function(){
        console.log('executing loadimages');
        var options = {
            autoResize: true,
            container: $('#ulcontainer'),
            offset: 2,
            itemWidth: 230
        };
        $scope.handler = $('#tiles li');
        $scope.handler.wookmark(options);
        $('#loaderCircle').hide();
        $scope.scrollflag = true;
        $scope.loadimages_flag = true;
        return;
    }



    $scope.nextPage = function() {
        $scope.newhtml();
        $scope.$apply();
    };



    function onScroll(event) {
        if($scope.scrollflag) {
            var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
            if(closeToBottom) {
                console.log("executing onscroll event");
                $('#loaderCircle').show();
                $scope.scrollflag = false;
                $scope.nextPage();
            }
        }
    };


    $scope.loadlightbox = function(){
        console.log('executing load light box');
        var options = {
            backdrop: true,
            keyboard: true,
            show: true
//            resizeToFit: true
        };
        $('#myModal').modal(options);
    }

    $scope.ShowLightBox = function(ind) {
        console.log('executing show light box');
        var user = ind;
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
        $timeout(function(){
            $scope.loadlightbox();
        }, 50);
    }




    $scope.change_light_pic = function(ind){
        $scope.light_profile_pic_url = $scope.light_thumbnails[ind].src_big;
//        $('#myModal').scrollTop();
    }




    $scope.filter_intersection = function(array) {
        console.log('executing filter intersection');
        var temp = []
        $scope.page = 1 ;
        $scope.loadimages_flag = false;
        for ( var j = 0; j < array.length; j++) {
            if (
                array[j].namefilter &&
                array[j].genderfilter &&
                array[j].locationfilter &&
                array[j].hometownfilter &&
                array[j].workfilter &&
                array[j].educationfilter &&
                array[j].likesfilter
                ) {
                temp.push(array[j]);
            }
        }
        $scope.subset = temp;
        $timeout(function () {
            if (!$scope.loadimages_flag) {
                console.log('firing load images event myself');
                $scope.loadimages();
            }
        }, 100)
        return;
    };

    $scope.mysearchfilter = function(array, expression, comperator, arg1) {
        console.log('executing mysearch filter') ;
        if (!angular.isArray(array)) return array;
        var predicates = [];
        predicates.check = function(value) {
            for (var j = 0; j < predicates.length; j++) {
                if(!predicates[j](value)) {
                    return false;
                }
            }
            return true;
        };
        switch(typeof comperator) {
            case "function":
                break;
            case "boolean":
                if(comperator == true) {
                    comperator = function(obj, text) {
                        return angular.equals(obj, text);
                    }
                    break;
                }
            default:
                comperator = function(obj, text) {
                    text = (''+text).toLowerCase();
                    return (''+obj).toLowerCase().indexOf(text) > -1
                };
        }
        var search = function(obj, text){
            if (typeof text == 'string' && text.charAt(0) === '!') {
                return !search(obj, text.substr(1));
            }
            switch (typeof obj) {
                case "boolean":
                case "number":
                case "string":
                    return comperator(obj, text);
                case "object":
                    switch (typeof text) {
                        case "object":
                            return comperator(obj, text);
                            break;
                        default:
                            for ( var objKey in obj) {
                                if (objKey.charAt(0) !== '$' && search(obj[objKey], text)) {
                                    return true;
                                }
                            }
                            break;
                    }
                    return false;
                case "array":
                    for ( var i = 0; i < obj.length; i++) {
                        if (search(obj[i], text)) {
                            return true;
                        }
                    }
                    return false;
                default:
                    return false;
            }
        };
        switch (typeof expression) {
            case "boolean":
            case "number":
            case "string":
                expression = {$:expression};
            case "object":
                for (var key in expression) {
                    if (key == '$') {
                        (function() {
                            if (!expression[key]) return;
                            var path = key
                            predicates.push(function(value) {
                                return search(value, expression[path]);
                            });
                        })();
                    } else {
                        (function() {
                            if (!expression[key]) return;
                            var path = key;
                            predicates.push(function(value) {
                                return search($scope.mygetter(value,path), expression[path]);
                            });
                        })();
                    }
                }
                break;
            case 'function':
                predicates.push(expression);
                break;
            default:
                return array;
        }
//            var filtered = [];
        for ( var j = 0; j < array.length; j++) {
            var value = array[j];
            if (predicates.check(value)) {
//                    filtered.push(value);
                array[j][arg1 + "filter"] = 1;
            }
            else {
                array[j][arg1 + "filter"] = 0;
            }
        }
        return;
    }


    $scope.mygetter = function(obj, path, bindFnToScope) {
        if (!path) return obj;
        var keys = path.split('.');
        var key;
        var lastInstance = obj;
        var len = keys.length;

        for (var i = 0; i < len; i++) {
            key = keys[i];
            if (obj) {
                obj = (lastInstance = obj)[key];
            }
        }
        if (!bindFnToScope && angular.isFunction(obj)) {
            return bind(lastInstance, obj);
        }
        return obj;
    }



    $scope.fn_gender_filter = function(array, arg1){
        console.log('executing fn gender filter');
        if ($scope.checkModel.male && !$scope.checkModel.female){
            for (var j= 0; j<array.length; j++){
                if (array[j].gender.toLowerCase()=="male"){
                    array[j]["genderfilter"] = 1;
                }
                else {
                    array[j]["genderfilter"] = 0;
                }
            }
        }
        else if (!$scope.checkModel.male && $scope.checkModel.female){
            for (var j= 0; j<array.length; j++){
                if (array[j].gender.toLowerCase()=="female"){
                    array[j]["genderfilter"] = 1;
                }
                else {
                    array[j]["genderfilter"] = 0;
                }
            }
        }
        else {
            for (var j= 0; j<array.length; j++){
                array[j]["genderfilter"] = 1;
            }
        }
        return ;
    }


    $scope.checkModel = {
        male: false,
        female: false,
        online: false
    };

    $socketio.on('my_mess', function(data){
//        console.log('hey my mess control got it now', sender, jid, data);
//        console.log("here is your message : ", data);
//        addmybox (sender, sender);
//        $("#" + sender).chatbox("option", "boxManager").addMsg(sender, data);
//        console.log(sender, jid)
        var divid = '#' + data.sender ;
        $(divid).append('<p>'+data.message+'</p>')  ;
    });


}


app.directive('lastdirective', function($timeout) {
    return function(scope, element, attrs) {
        scope.$watch('$last',function(v){
            if (v) {
                console.log('executing last directive');
                $timeout(function(){
                    scope.loadimages();
                }, 20);
            }
        });

    };
});


app.directive("enter", function($timeout){
    return function (scope, element, attrs) {
        element.bind("keyup", function(evt) {
            scope.EnterDirecFlag = false;
            console.log("executing enter directive");
            searchterm = evt.target.value;
            var exp = {};
            exp[attrs.dataname] = searchterm;
            scope.mysearchfilter(scope.users, exp, "somecomparator", attrs.fieldname);
            $timeout(function() {
                scope.filter_intersection(scope.users);
            }, 20);

        });
    }
});


app.directive('genderclick', function($timeout){
    return function (scope, element, attrs) {
        element.on('click', function(evt){
            console.log('executing genderclick directive');
            $timeout(function() {
                scope.fn_gender_filter(scope.users, attrs.genderclick);
            }, 10);
            $timeout(function() {
                scope.filter_intersection(scope.users);
            },20) ;
        });
    }
}) ;


app.directive('messageenter', function($socketio){
    return function(scope, element, attrs) {
        element.bind('keyup', function(evt) {
            if (evt.which == 13){
                var message = evt.target.value;
                var divid = '#'+attrs.messageenter;
                $(divid).append('<p>'+message+'</p>');
                $socketio.emit('user message', {message:message, recipient:attrs.messageenter}) ;
                evt.target.value = '';
            }
        })
    }
})

app.factory("$socketio", function($rootScope) {
//    var WEB_SOCKET_SWF_LOCATION = '/static/js/socketio/WebSocketMain.swf';
    var socket = io.connect('/chat') ;
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, data);
                    }
                });
            })
        }
    } ;
}) ;























