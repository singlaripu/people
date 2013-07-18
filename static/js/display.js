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

function DispCtrl($scope, myService, $http, $compile, $timeout) {

    $scope.users = [];
//    $scope.page = 0;
    $scope.incr = 30;
    $scope.light_url = "/static/images/white.jpg";
    $scope.subset = [];
    $scope.handler = $('#tiles li');

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



            $scope.users[j].classfilter = "active";

        }


        $scope.users.sort($scope.sortfunction);



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
            itemWidth: 230
        };
        var handler = $('#tiles li');
        $scope.handler = handler;
        $scope.handler.wookmark(options);

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

    $scope.sortfunction = function(a,b){
        return b.score - a.score;
    }


    $scope.layoutchange = function(){
//        var handler = $('#tiles li');
        console.log("aaha i came here atleast");
        $scope.handler.addClass('inactive');
        $scope.columns = null;
        $scope.handler.wookmark();
    }

//    $scope.keylog = [];
////    $scope.keyCount= 0;
//
    $scope.filter_intersection = function(array) {
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

                array[j].classfilter = "active";
            }
            else{
                array[j].classfilter = "inactive";
            }
        }
        $scope.$apply();
    };

    $scope.mysearchfilter = function(array, expression, comperator, arg1) {
        console.log('i was called atleast');
//        return function() {

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
//                $scope.$apply();
            }
//            return filtered;
            return;
//        }
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
//
//    $scope.fn_gender_filter = function(array, expression, arg1){
//
////        if (!expression) return;
//
//        for (var j= 0; j<array.length; j++){
//            if (array[j].gender == expression || expression==''){
//                array[j][arg1 + "filter"] = 1;
//            }
//            else {
//                array[j][arg1 + "filter"] = 0;
//            }
//        }
//
//    }


    $scope.fn_gender_filter = function(array, arg1){

//        console.log(arg1);
//
//        return ;

//        console.log("i came to fn gender filter");

//        if (!expression) return;

        if ($scope.checkModel.male && !$scope.checkModel.female){

            console.log('i think only male is clicked');

            for (var j= 0; j<array.length; j++){

                if (array[j].gender=="male"){
                    array[j]["genderfilter"] = 1;
//                    console.log('do something then');
                }
                else {
                    array[j]["genderfilter"] = 0;
                }
            }

        }

        else if (!$scope.checkModel.male && $scope.checkModel.female){

            console.log('i think only female is clicked');

            for (var j= 0; j<array.length; j++){

                if (array[j].gender=="female"){
                    array[j]["genderfilter"] = 1;
                }
                else {
                    array[j]["genderfilter"] = 0;
                }
            }

        }

        else {

            console.log('i think either both are clicked or both are unclicked');

            for (var j= 0; j<array.length; j++){
                    array[j]["genderfilter"] = 1;
            }

        }

        $scope.$apply();

        return ;



    }

//    $scope.wookmarkfilter = function(){
//        console.log("i am in wookmarkfilter function");
//        $scope.handler.wookmarkInstance.filter(["singlaripu", "ripusingla"]);
//    }

    $scope.checkModel = {
        male: false,
        female: false,
        online: false


    };

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
                    scope.handler = $('#tiles li');
                    scope.loadimages();
                }, 1000);

            }

        });

    };
})


app.directive("enter", function($timeout){
    return function (scope, element, attrs) {

        element.bind("keyup", function(evt) {

//            if (evt.which != "13") {
                searchterm = evt.srcElement.value;
                console.log(searchterm);
//                scope.subset = $filter('filter')(scope.users, {name:searchterm});
//                var keyname = JSON.stringify(attrs.fieldname);
//                var keyname = attrs.fieldname;
//                console.log(keyname);
//                var exp = {};
//                exp[attrs.fieldname] = searchterm;
                if (attrs.fieldname == "gender") {
                    console.log('i am in if condition for gender');
//                    exp[attrs.fieldname] = JSON.stringify(searchterm);
                    scope.fn_gender_filter(scope.subset);
                }
                else {
                    var exp = {};
                    exp[attrs.dataname] = searchterm;

                    scope.mysearchfilter(scope.subset, exp, "somecomparator", attrs.fieldname);
                }
                console.log(exp);

                scope.filter_intersection(scope.subset);

                scope.handler.wookmarkInstance.layout();
//                scope.subset = res;
//                scope.$apply();
//                var options = {
//                    autoResize: true,
//                    container: $('#main'),
//                    offset: 2,
//                    itemWidth: 230
//                };
//                console.log(res.length);
//                var activeFilters = ["paris"];
//                var handler = $('#tiles li');
//
//                scope.handler.wookmark(options);
//                scope.loadimages();
//                $timeout(function(){
//                    scope.handler.wookmarkInstance.filter(["searched"]);
//                },2000);


//            }

        });


    }
})


app.directive('genderclick', function($timeout){

    return function (scope, element, attrs) {

//        console.log('i am in genderclick directive');
        element.bind('mouseup', function(evt){

            scope.$apply();
//            console.log('i am in if condition for gender');

//            if (attrs.fieldname == "gender") {

//                    exp[attrs.fieldname] = JSON.stringify(searchterm);
            $timeout(function() {
                scope.fn_gender_filter(scope.subset, attrs.genderclick);
            }, 10) ;

//            scope.$apply();

            $timeout(function() {

                scope.filter_intersection(scope.subset);

                scope.handler.wookmarkInstance.layout();

            },100) ;

//            }
        });
    }


})





