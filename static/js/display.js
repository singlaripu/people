

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

function DispCtrl($scope, myService, $http, $compile, $timeout, $chatboxManager) {

    $scope.users = [];
    $scope.page = 0;
    $scope.incr = 30;
//    $scope.light_url = "/static/images/white.jpg";
    $scope.subset = [];
    $scope.handler = $('#tiles li');
    $scope.scrollflag = true;
    $scope.isCollapsed = false;
    $scope.chatCollapsed = false;
    $scope.browser_incompatible = false;
    $scope.chat_method = "p2p";
    $scope.jabber_url = "http://ec2-54-218-10-57.us-west-2.compute.amazonaws.com:5280/http-bind";
    $scope.fb_uid = '';
    $scope.protocol_dict  = {};
    $scope.peer_connections = {};
    $scope.message_queue = new Queue();
    $scope.peer_delivery_dict = {};
//    $scope.message_queue_temp = new Queue();
    $scope.sort_messages_flag = "free";
    $scope.status_message = 'Status6387';
    $scope.peer_reconnect_flag = false;
    $scope.check_return_flag = false;
    $scope.status_waiting_list = new Queue();
//    $scope.msg_send_promise = undefined;
//    $scope.msg_array = [];

    $(document).bind('scroll', onScroll);



    myService.async().then(function(d) {

        $scope.fb_uid = d.fb_uid;
        $scope.peer = new Peer(d.fb_uid, {host: 'ec2-54-218-10-57.us-west-2.compute.amazonaws.com', port: 9000});
//        console.log($scope.peer);
        $.xmpp.connect({url:$scope.jabber_url, jid: $scope.fb_uid + "@jabber.fbpeople.com", password: $scope.fb_uid,

            onConnect: function(){
//                logContainer.html("Connected");
                $.xmpp.setPresence(null);
            },

            onError:function(error){
//                alert(error.error);
                console.log('there was some error in xmpp plugin jabber');
            },

            onMessage: function(message){
//                console.log('i recieved a message , this is jabber');
                var jid = message.from.split("@");
                var id = MD5.hexdigest(message.from);
//                var conversation = $("#"+id);
//                if(conversation.length == 0){
//                    openChat({to:message.from});
//                }
//                conversation = $("#"+id);
                //conversation.find(".conversation").append("<div>"+ jid[0] +": "+ message.body +"</div>");

                if (message.body == null) {
                    return;
                }
//                console.log(jid[0], message.body);
//                $scope.protocol_dict[jid[0]] = 'jabber';
                $scope.msg_recieved_fn(jid[0], message.body)
            }
        });

        $scope.xmpp_send_message = function(id, msg) {
            var promise = $timeout(function () {
                console.log('xmpp send message sending through jabber:', msg) ;
                $.xmpp.sendMessage({to:id + "@jabber.fbpeople.com", body: msg});
            },200);
            return promise;

        }

//        peer.on('open', function(id, opts) {
//            console.log(id);
//            console.log(opts.browser);
//        })
//
//
        $scope.peer.on('error', function(e) {
//            if (e.type=='browser-incompatible') {
//                $scope.browser_incompatible = true;
//            }

            console.log('error in connecting to peer, trying jabber');
//            console.log(e);
//            $scope.protocol_dict

//            $scope.chat_method = "bosh";
//            $xmpp_plugin.connect($scope.jabber_url, $scope.fb_uid, $scope.fb_uid);

        })



        $scope.peer.on('connection', function(connection) {

            connection.on('data', function(data) {
                $scope.protocol_dict[connection.peer] = 'peer';

                if (data.message == null) {
                    return;
                }

                if (data.message.indexOf($scope.status_message) >= 0) {
                    var timestamp =  data.message.split(':')[0];
//                    console.log(timestamp);
                    delete $scope.peer_delivery_dict[timestamp];
//                    console.log($scope.peer_delivery_dict);
                }
                else {
                    var statusreply = data.timestamp + ':' + $scope.status_message;
                    $scope.peer_send_msg(connection.peer, statusreply);
                    $scope.msg_recieved_fn(connection.peer, data.message);
                }


            })
        })

        $scope.peer_send_api_call = function(c, msg, timestamp, peerid) {
//            console.log('sending now:', msg);
            msg_obj = {}
            msg_obj['timestamp']  =  timestamp;
            msg_obj['message'] = msg;
            console.log('sending through peer:', msg);
            c.send(msg_obj);


        }

        $scope.peer_send_msg = function(peerid, msg) {

            if (!(peerid in $scope.peer_connections)) {
                $scope.peer_connections[peerid] = $scope.peer.connect(peerid);

            }
            var c = $scope.peer_connections[peerid];
//            console.log(c);
            var timestamp = new Date().getTime();

            if (msg.indexOf($scope.status_message) < 0) {
                $scope.peer_delivery_dict[timestamp] = [peerid, msg];
                console.log($scope.peer_delivery_dict);

                $timeout(function () {
                    $scope.peer_check_return(timestamp, peerid);
                }, 5000);
            }

//            console.log(new Date().getTime());
            if (!c.open) {
                $scope.peer_connections[peerid] = $scope.peer.connect(peerid);
                var conn = $scope.peer_connections[peerid];
                var promise = $timeout(function() {
//                    console.log(c);
//                    var c = $scope.peer.connect(peerid);
//                    console.log('waiting for connection to open');
                    conn.on('open', function() {
//                        console.log('it opened');
//                        console.log('sending now:', msg);
//                        c.send(msg);
                        $scope.peer_send_api_call(conn, msg, timestamp, peerid);
                    }) ;
                },200);
            }
            else {
                var promise = $timeout(function() {
//                    console.log(c);
//                    var c = $scope.peer.connect(peerid);
//                    c.on('open', function() {
//                    console.log('sending now:', msg);
//                    c.send(msg);
                    $scope.peer_send_api_call(c, msg, timestamp, peerid);

//                    }) ;
                },200);
            }

            c.on('error', function (e) {
                console.log('error on connection', e) ;
            });

            c.on('close', function(e) {
//                console.log('close on connection', e);
                if (!$scope.peer_reconnect_flag) {
                    $scope.peer_reconnect_flag = true;
                    $timeout(function () {
                        if (!$scope.peer_connections[peerid].open) {
//                            console.log('trying to reconnect to peer');
                            $scope.peer_connections[peerid] = $scope.peer.connect(peerid);


                            $scope.peer_connections[peerid].on('open', function() {
//                                console.log('reconnect successful');
                                $scope.protocol_dict[peerid] = 'peer';
                                $scope.peer_reconnect_flag = false;
                            })
                        };

                    }, 20000);
                }

            });

            c.on('open', function(e){
//               console.log('open on connection', e);
            });



                return promise;



//            c.on('error', function(e) {
//                console.log('peer is facing some difficulties in sending the msg, trying jabber');
//                $scope.protocol_dict[id] = 'jabber';
//                $scope.xmpp_send_message(peerid, msg);
//            });
        }

        console.log($scope.fb_uid);


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


//    $scope.$watch('peer_delivery_dict', function(v) {
//       if (v) {
//           console.log('detected change in peer delivery dict');
//       }
//    });

    $scope.peer_check_return = function(t1, id1) {

        console.log($scope.check_return_flag);
        if ($scope.check_return_flag) {
            console.log('check return enqueue');
            $scope.status_waiting_list.enqueue([t1, id1]);
            return ;
        }

        if (!$scope.check_return_flag)  {
            $scope.check_return_flag = true;

            var repeat = (function () {
                return function repeat(cbWhileNotTrue, period) {
                    /// <summary>Continuously repeats callback after a period has passed, until the callback triggers a stop by returning true.  Note each repetition only fires after the callback has completed.  Identifier returned is an object, prematurely stop like `timer = repeat(...); clearTimeout(timer.t);`</summary>
//                console.log('loop iteration');
                    var timer = {};
                    var fn = function () {
                        if (true === cbWhileNotTrue()) {
                            return clearTimeout(timer.t); // no more repeat
                        }
                        timer.t = setTimeout(fn, period || 1000);
                        var item = $scope.status_waiting_list.dequeue();
                        var timestamp = item[0];
                        var peerid = item[1];
                        fn1(timestamp, peerid);
                        if ($scope.status_waiting_list.getLength() == 0) {
                            $scope.check_return_flag = false;
                            return ;
                        }
                    };
                    fn(); // engage
                    return timer; // and expose stopper object
                };
            })();

            var fn1 = function (t, id) {
                if (t in $scope.peer_delivery_dict) {
                    console.log('status message was not returned, trying jabber');

                    var msg = '';
                    for (key in $scope.peer_delivery_dict) {
//                        console.log(key);
                        if ($scope.peer_delivery_dict[key][0] == id) {
                            if (!(msg == '')){
                                msg +=  ',' + $scope.peer_delivery_dict[key][1];
                            }
                            else {
                                msg = $scope.peer_delivery_dict[key][1];
                            }

                            delete $scope.peer_delivery_dict[key];
                        }
                    }
                    console.log('AGGREGATED MESSAGE:', msg);

//                item = $scope.peer_delivery_dict[t];
//                id = item[0];
//                msg = item[1];
                    $scope.protocol_dict[id] = 'jabber';
//                delete $scope.peer_delivery_dict[t];
                    $scope.sort_messages_flag = 'free';
                    $scope.sort_message_protocol(id, msg);
                    $scope.sort_messages();
                }
            }

            fn1(t1, id1);

            if ($scope.status_waiting_list.getLength() == 0) {
                console.log('turning flag on, returning from check return');
                $scope.check_return_flag = false;
                return ;
            }
            else {
                console.log('there was backlog');
                var interval = repeat(function() {
                    return ($scope.status_waiting_list.getLength() == 0);
                }, 100);
            }

        }

    }

    $scope.newhtml = function(){
        if ($scope.page*$scope.incr >= $scope.subset.length) {
            $('#loaderCircle').hide();
            return ;
        }
        $scope.page += 1;
        return;
    }

    $scope.msg_recieved_fn = function(sender, msg){
        $scope.addmybox (sender, sender);
        $("#" + sender).chatbox("option", "boxManager").addMsg(sender, msg);
//            $('#msgs').append('<p>'+data+'</p>');
    }


    $scope.loadimages = function(){
//        console.log('executing loadimages');
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
//                console.log("executing onscroll event");
                $('#loaderCircle').show();
                $scope.scrollflag = false;
                $scope.nextPage();
            }
        }
    };


    $scope.loadlightbox = function(){
//        console.log('executing load light box');
        var options = {
            backdrop: true,
            keyboard: true,
            show: true
//            resizeToFit: true
        };
        $('#myModal').modal(options);
    }

    $scope.ShowLightBox = function(ind) {
//        console.log('executing show light box');
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
//        console.log('executing filter intersection');
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
//                console.log('firing load images event myself');
                $scope.loadimages();
            }
        }, 100)
        return;
    };

    $scope.mysearchfilter = function(array, expression, comperator, arg1) {
//        console.log('executing mysearch filter') ;
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
//        console.log('executing fn gender filter');
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

//    $socketio.on('my_mess', function(data){
////        console.log('hey my mess control got it now', sender, jid, data);
//        console.log(data);
////        console.log("here is your message : ", data);
//        $scope.addmybox (data.sender, data.sender);
//        $("#" + data.sender).chatbox("option", "boxManager").addMsg(data.sender,data.message);
////        console.log(sender, jid)
////        var divid = '#' + data.sender ;
////        $(divid).append('<p>'+data.message+'</p>')  ;
//    });

    $scope.sort_message_protocol = function (id, msg){
        console.log('sort_message protocol:', msg);
        if  (id in $scope.protocol_dict)    {
            if ( $scope.protocol_dict[id] == 'jabber') {
                console.log('sort message protocol : sending through jabber');
                var promise = $scope.xmpp_send_message(id, msg);
            }
            else {
//                if (!(id in $scope.peer_connections)) {
//                    $scope.peer_connections[id] = $scope.peer.connect(id);
////                    $scope.peer_connections[id].on('open', function(){
////                        console.log('connection is open now');
////                    })
//                }
                console.log('sort message protocol: sending through peer');
                var promise = $scope.peer_send_msg(id, msg);
            }
        }
        else {
            $scope.protocol_dict[id] == 'peer';
//            if (!(id in $scope.peer_connections)) {
//                $scope.peer_connections[id] = $scope.peer.connect(id);
//            }
            console.log('sort message protocol : sending through peer');
            var promise = $scope.peer_send_msg(id, msg);
        }
        return promise;
    }

    $scope.counter = 0;
    $scope.idList = new Array();


    $scope.repeat = (function () {
        return function repeat(cbWhileNotTrue, period, message_dict, current, target, keys) {
            /// <summary>Continuously repeats callback after a period has passed, until the callback triggers a stop by returning true.  Note each repetition only fires after the callback has completed.  Identifier returned is an object, prematurely stop like `timer = repeat(...); clearTimeout(timer.t);`</summary>
//                console.log('loop iteration');
            var timer = {};
            var k = 0;
            var fn = function () {
                if (true === cbWhileNotTrue()) {
                    return clearTimeout(timer.t); // no more repeat
                }

                timer.t = setTimeout(fn, period || 1000);
//                console.log('loop iteration');
//                console.log(k);
                var key = keys[k];
//                console.log(key, message_dict[key]);
                $scope.sort_message_protocol(key, message_dict[key]).then(function() {
                    $timeout(function () {
                        console.log('repeat function then clause');
                        current += 1;
                        if (current == target) {
                            console.log('repeat function current equal target clause')
                            $scope.sort_messages_flag = 'free';
                            $scope.$apply();
//                            console.log($scope.sort_messages_flag)  ;
                            $timeout(function() {
                                if ($scope.sort_messages_flag == 'free') {
//                                    console.log('manually firing last message');
                                    $scope.sort_messages();
                                }
                            },5000);
                        }
                    }, 1000) ;
                })
                k ++;
            };
            fn(); // engage
            return timer; // and expose stopper object
        };
    })();


    $scope.sort_messages = function() {


        console.log($scope.sort_messages_flag);
        if ($scope.sort_messages_flag == 'busy') return ;
        else {
            if ($scope.message_queue.getLength() == 0)    {
                console.log('returning from 0 length clause');
                $scope.sort_messages_flag = 'free';
                return ;
            }
            $scope.sort_messages_flag = 'busy';
            var message_dict = {};
            console.log('before while loop');
            while ($scope.message_queue.getLength() != 0) {
                console.log('in while loop');
                item = $scope.message_queue.dequeue();
                id = item[0];
                msg = item[1];
                if (id in message_dict) {
                    message_dict[id] = message_dict[id] +  ',' + msg;
                }
                else {
                    message_dict[id] = msg;
                }

            }
            console.log('sort_message_dict:', message_dict);
            var current = 0;
            var target =  Object.keys(message_dict).length;
            var keys = Object.keys(message_dict);
//            console.log("lenght of target is ",target);

            var j = 0;
            var interval = $scope.repeat(function() {
                j++;
                return (j > target);
            }, 2000, message_dict, current, target, keys);


//            for (var key in message_dict) {
//
//            }
        }


//        var loop = true;
//        var item = $scope.message_queue.dequeue();
//        var id = item[0] ;
//        var msg = item[1]
//        var i = 1;
//        var target = $scope.message_queue.getLength();
//
////        while (i<5) {
//            i ++;
////            if (promise) {
////                item = $scope.message_queue.dequeue();
////                id = item[0] ;
////                msg = item[1] ;
////                promise = $scope.peer_send_msg(id, msg);
////            }
//            console.log('loop is runing');
////            $scope.peer_send_msg(id, msg).then(function(){
////                item = $scope.message_queue.dequeue();
////                if (item == undefined) {
////                    $scope.sort_messages_flag = 'free';
////                    loop = false;
////                }
////                id = item[0] ;
////                msg = item[1] ;
//
////            });
//        $scope.peer_send_msg(id, msg);
//        $scope.sort_messages_flag = 'free';
////        };
//        return ;


//
//        if ($scope.sort_messages_flag == 'abrakadabra') return ;
//
//
//
//        else {
//            console.log('executing sort_messages');
//
////            var item = $scope.message_queue.dequeue();
////            var i = 1;
//
//            console.log($scope.message_queue.getLength());
////            var target = $scope.message_queue.getLength();
////            var current = 1;
//            for(var j=0; j<$scope.message_queue.getLength(); j++) {
////
////                    i = i+1;
////                $scope.sort_messages_flag = 'busy';
//
////                console.log(item);
////                if (item != undefined) {
////                    $timeout(function() {
////
////                        console.log(j, item);
////                    },2000);
//////                }
//
//
//
////                if (item!=undefined) {
////                $timeout(function(){
//                if ($scope.msg_send_promise == undefined)  {
//                    item =  $scope.message_queue.dequeue();
//                    var id = item[0];
//                    var msg = item[1];
//                    $scope.peer_send_msg(id, msg);
//                }
//                console.log($scope.msg_send_promise);
//                $scope.msg_send_promise.then(function() {
//
//                    item =  $scope.message_queue.dequeue();
//                    if (item == undefined) {
//                        $scope.sort_messages_flag = "free";
//                        return ;
//                    }
//                    var id = item[0];
//                    var msg = item[1];
//                    if  (id in $scope.protocol_dict)    {
//                        if ( $scope.protocol_dict[id] = 'jabber') {
//                            console.log('sending through jabber');
//                            $scope.xmpp_send_message(id, msg);
//                        }
//                        else {
//                            if (!(id in $scope.peer_connections)) {
//                                $scope.peer_connections[id] = $scope.peer.connect(id);
//                            }
//                            console.log('sending through peer');
//                            $scope.peer_send_msg(id, msg);
//                            current += 1;
//                            console.log('current is equal to', current);
//
//                        }
//                    }
//                    else {
//                        if (!(id in $scope.peer_connections)) {
//                            $scope.peer_connections[id] = $scope.peer.connect(id);
//                        }
//                        console.log('sending through peer');
//                        $scope.peer_send_msg(id, msg);
//                        current += 1;
//                        console.log('current is equal to', current);
//                    }
//
////                    console.log(j);
//
////                    item = $scope.message_queue.dequeue();
////                },5000);
//
//                if ($scope.message_queue.peek() == undefined){
//                    $scope.sort_messages_flag = "free";
////                    $scope.message_queue = new Queue();
//                }
//                })
//
////                }
//            }



//        }


    }

    $scope.broadcastMessageCallback = function(id, from, msg) {
//        console.log('sending msg ', msg, 'to ', id);
        console.log(JSON.stringify(msg));
        $("#" + id).chatbox("option", "boxManager").addMsg(from, msg);
//        $scope.peer_send_msg(id, msg);
        console.log('broadcast message:', msg);
        $scope.message_queue.enqueue([id,msg]);
        $scope.sort_messages();
//        $scope.msg_array.push([id, msg]);
//        console.log($scope.sort_messages_flag);
//
////        if ($scope.sort_messages_flag == 'free') {
////            $scope.sort_messages_flag = 'busy';
////            $timeout(function () {
////                $scope.message_queue = $scope.message_queue_temp;
////                $scope.message_queue_temp = new Queue();
////                console.log($scope.message_queue.getLength());
////                console.log($scope.message_queue_temp.getLength());
//
////                $scope.sort_messages();
//
//        if ($scope.sort_messages_flag == "busy") return ;
//
//        else if ($scope.sort_messages_flag == 'free') {
//            $scope.sort_messages_flag = 'busy';
//              $scope.sort_messages();
//        }

//        return ;

//        var promise = $timeout(function() {
//            console.log('it has been 1 second');
//            item = $scope.message_queue.dequeue();
//            console.log('calling send msg function');
//            $scope.peer_send_msg(item[0], item[1]);
//        },5000)   ;
//
//        promise.then(function() {
////            item = $scope.message_queue.dequeue();
////            console.log('calling send msg function');
////            $scope.peer_send_msg(item[0], item[1]);
//        })
//        console.log(prom);


//            },2000)
//        }


    }

    $chatboxManager.init({messageSent : $scope.broadcastMessageCallback});

    $scope.addmybox = function (recipient, name, event, ui) {
//        console.log(recipient, name);
        $scope.counter ++;
        var id = recipient;
        $scope.idList.push(id);
        $chatboxManager.addBox(id,{dest:"dest" + $scope.counter, title: name,first_name: 'me'});

        $timeout(function() {
            $scope.$apply();
        },1000)

    }

}


app.directive('lastdirective', function($timeout) {
    return function(scope, element, attrs) {
        scope.$watch('$last',function(v){
            if (v) {
//                console.log('executing last directive');
                $timeout(function(){
                    scope.loadimages();
                }, 20);
            }
        });

    };
});


app.directive('chatboxmsgentered', function($timeout) {
    return function(scope, element, attrs) {

//        if (scope.m.isEmpty()) {
//            console.log('hey i am calling from chatboxmsgentered')   ;
//        }
//        $timeout(function() {
//            scope.$watch(function() {
//                var len = scope.message_queue.getLength();
//                console.log(len);
//                return len;
//            },function(v){
//                if (v) {
//                    console.log('change in message queue detected');
////                $timeout(function(){
////                    scope.loadimages();
////                }, 20);
//                }
//            });
//        }, 200)


//        element.bind('keyup', function(evt) {
//           console.log('key press detected in chatbox');
//        });

        element.bind('keyup', function(evt) {
            if (evt.which == "13") {
                if (evt.target.className.indexOf('ui-chatbox-input-box') >= 0) {
                    console.log("chatbox message entered directive:", evt.target.value);
                    evt.target.value = '';

////                    console.log(scope.sort_messages_flag);
//                    if (scope.sort_messages_flag == 'busy') return ;
//                    else {
//                        scope.sort_messages_flag = 'busy';
//                        var message_dict = {};
//                        while (scope.message_queue.getLength() != 0) {
//                            item = scope.message_queue.dequeue();
//                            id = item[0];
//                            msg = item[1];
//                            if (id in message_dict) {
//                                message_dict[id] = message_dict[id] +  ',' + msg;
//                            }
//                            else {
//                                message_dict[id] = msg;
//                            }
//
//                        }
////                        console.log(message_dict);
//                        var current = 0;
//                        var target =  Object.keys(message_dict).length;
////                        console.log("lenght of target is ",target);
//                        for (var key in message_dict) {
////                            console.log(key, message_dict[key]);
//                            scope.peer_send_msg(key, message_dict[key]).then(function() {
//                                $timeout(function () {
////                                    console.log('taking timeout of 200ms');
//                                    current += 1;
//                                    if (current == target) {
//                                        scope.sort_messages_flag = 'free';
//                                        scope.$apply();
////                                        console.log(scope.sort_messages_flag)  ;
//                                    }
//                                }, 1000) ;
//                            })
//                        }
//                    }
////                    scope.$watch('msg_send_promise', function(v) {
////
////                    })
//
//
////                    console.log('click detected');
////                    console.log(scope.message_queue.isEmpty());
//////                    console.log(evt);
//////                    console.log(evt.target.className);
//////                    if (scope.)
                }

            }

        });

    };
});


app.directive("enter", function($timeout){
    return function (scope, element, attrs) {
        element.bind("keyup", function(evt) {
            scope.EnterDirecFlag = false;
//            console.log("executing enter directive");
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
//            console.log('executing genderclick directive');
            $timeout(function() {
                scope.fn_gender_filter(scope.users, attrs.genderclick);
            }, 10);
            $timeout(function() {
                scope.filter_intersection(scope.users);
            },20) ;
        });
    }
}) ;


//app.directive('messageenter', function($socketio){
//    return function(scope, element, attrs) {
//        element.bind('keyup', function(evt) {
//            if (evt.which == 13){
//                var message = evt.target.value;
//                var divid = '#'+attrs.messageenter;
//                $(divid).append('<p>'+message+'</p>');
//                $socketio.emit('user message', {message:message, recipient:attrs.messageenter}) ;
//                evt.target.value = '';
//            }
//        })
//    }
//})

//app.factory("$socketio", function($rootScope) {
////    var WEB_SOCKET_SWF_LOCATION = '/static/js/socketio/WebSocketMain.swf';
//    var socket = io.connect('/chat') ;
//    return {
//        on: function(eventName, callback) {
//            socket.on(eventName, function() {
//                var args = arguments;
//                console.log("on:", arguments)   ;
//                $rootScope.$apply(function() {
//                    callback.apply(socket, args);
//                });
//            });
//        },
//
//        emit: function (eventName, data, callback) {
//            socket.emit(eventName, data, function() {
//                var args = arguments;
//                console.log("emit:", data)   ;
//                $rootScope.$apply(function() {
//                    if (callback) {
//                        callback.apply(socket, data);
//                    }
//                });
//            })
//        }
//    } ;
//}) ;


//app.factory("$xmpp_plugin", function($rootScope) {
//
//    return {
//        connect: function(url, jid, password) {
//            $.xmpp.connect({url:url, jid: jid, password: password,
//
//
//
//                onMessage: function(message){
//                   console.log('i recieved a message , this is jabber');
//
//
//                }
//
//            });
//        }
//    } ;
//}) ;


//app.factory("$peer", function($rootScope) {
//
//    return {
//        connect: function(id) {
//            $.xmpp.connect({url:url, jid: jid, password: password,
//
//
//
//                onMessage: function(message){
//                    console.log('i recieved a message , this is jabber');
//
//
//                }
//
//            });
//        }
//    } ;
//}) ;


app.factory("$chatboxManager", function($rootScope) {

    if(!Array.indexOf){
        Array.prototype.indexOf = function(obj){
            for(var i=0; i<this.length; i++){
                if(this[i]==obj){
                    return i;
                }
            }
            return -1;
        }
    }


    // list of all opened boxes
    var boxList = new Array();
    // list of boxes shown on the page
    var showList = new Array();
    // list of first names, for in-page demo
    var nameList = new Array();

    var config = {
        width : 220, //px
        gap : 20,
        maxBoxes : 5,
        messageSent : function(id, dest, msg) {
            // override this
            $("#" + dest).chatbox("option", "boxManager").addMsg(dest, msg);

        }
    };


    var init = function(options) {
        $.extend(config, options)
    };


    var delBox = function(id) {
        // TODO
    };

    var getNextOffset = function() {
        return (config.width + config.gap) * showList.length;
    };

    var boxClosedCallback = function(id) {
        // close button in the titlebar is clicked
        var idx = showList.indexOf(id);
        if(idx != -1) {
            showList.splice(idx, 1);
            diff = config.width + config.gap;
            for(var i = idx; i < showList.length; i++) {
                offset = $("#" + showList[i]).chatbox("option", "offset");
                $("#" + showList[i]).chatbox("option", "offset", offset - diff);
            }
        }
        else {
            alert("should not happen: " + id);
        }
    };

    // caller should guarantee the uniqueness of id
    var addBox = function(id, user, name) {
        var idx1 = showList.indexOf(id);
        var idx2 = boxList.indexOf(id);
        if(idx1 != -1) {
            // found one in show box, do nothing
        }
        else if(idx2 != -1) {
            // exists, but hidden
            // show it and put it back to showList
            $("#"+id).chatbox("option", "offset", getNextOffset());
            var manager = $("#"+id).chatbox("option", "boxManager");
            manager.toggleBox();
            showList.push(id);
        }
        else{
            var el = document.createElement('div');
            el.setAttribute('id', id);
//            el.setAttribute('chatboxmsgentered');
            $(el).chatbox({id : id,
                user : user,
                title : user.title,
                hidden : false,
                width : config.width,
                offset : getNextOffset(),
                messageSent : messageSentCallback,
                boxClosed : boxClosedCallback
            });
//            console.log('successfully called chatbox');
            boxList.push(id);
            showList.push(id);
            nameList.push(user.first_name);
        }
    };

    var messageSentCallback = function(id, user, msg) {
        var idx = boxList.indexOf(id);
        config.messageSent(id, nameList[idx], msg);
//        console.log(scope.peer);

    };

    // not used in demo
    var dispatch = function(id, user, msg) {
        $("#" + id).chatbox("option", "boxManager").addMsg(user.first_name, msg);
    }

    return {
        init : init,
        addBox : addBox,
        delBox : delBox,
        dispatch : dispatch
    };



});


