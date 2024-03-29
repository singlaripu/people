

var app =  angular.module('myApp', ['ui.bootstrap', 'ui.utils']);

//app.config(function($httpProvider){
//    delete $httpProvider.defaults.headers.common['X-Requested-With'];
//});


app.factory('myService', function($http) {
    var myService = {
        async: function(isShowAll, age, distance) {
            var sampledata = {};
            sampledata['isShowAll'] = isShowAll;
            sampledata['age'] = age;
            sampledata['distance'] = distance;
            var jsonobj = angular.toJson(sampledata);
//            console.log(jsonobj);
            var promise = $http.post('/getlist', jsonobj).then(function (response) {
//            var promise = $http.get('/getlist/' + isShowAll + '/' + age[0] + '/' + age[1] + '/' + distance).then(function (response) {
                return response.data;
            });
            return promise;
        }
    };
    return myService;
});

app.factory('mySearchService', function($http) {
    var myService = {
        async: function(q, isShowAll, age, distance) {
            var sampledata = {};
            sampledata['query'] = q;
            sampledata['isShowAll'] = isShowAll;
            sampledata['age'] = age;
            sampledata['distance'] = distance;
            var jsonobj = angular.toJson(sampledata);
//            console.log(jsonobj);
            var promise = $http.post('/search', jsonobj).then(function (response) {
//            var promise = $http.get('/search/' + q + '/' + isShowAll + '/' + age[0] + '/' + age[1] + '/' + distance).then(function (response) {
                return response.data;
            });
            return promise;
        }
    };
    return myService;
});


app.factory('myStatusService', function($http) {
//        $http.defaults.useXDomain = true;

    var myService = {
        async: function(ids, fb_uid, status) {
            var sampledata = {};
            sampledata['ids'] = ids;
//            sampledata['fb_uid'] = fb_uid;
            sampledata['status'] = status;
            var jsonobj = angular.toJson(sampledata);
//            console.log(jsonobj);
            var promise = $http.post('/getstatus', jsonobj).then(function (response) {
                return response.data;
            });
            return promise;
        }
    };
    return myService;
});



function DispCtrl($scope, myService, $http, $compile, $timeout, $chatboxManager, myStatusService, mySearchService) {

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
    $scope.status_message = 'DeliveryConfirmation';
    $scope.peer_reconnect_flag = false;
    $scope.check_return_flag = false;
    $scope.status_waiting_list = new Queue();
    $scope.name = undefined;
    $scope.delim = '|:|:|' ;
    $scope.msgs_recieved = {};
    $scope.peerids = {};
    $scope.peerids_bool = {};
    $scope.mypeerid = undefined;
    $scope.peer_primary = {};
//    $scope.peer_possible = [];
    $scope.browser_status = undefined;
    $scope.presence_ids = [];
    $scope.presence_json = undefined;
    $scope.online_status = new Date().getTime();
//    $scope.searchvalue = undefined;
    $scope.backupdata = undefined;
    $scope.passwd = undefined;
    $scope.flag_to_display_default = false;
    $scope.latitude = undefined;
    $scope.longitude = undefined;
    $scope.ahead_name = undefined;
    $scope.ahead_current_city = undefined;
    $scope.ahead_work_place = undefined;
    $scope.ahead_school = undefined;
    $scope.ahead_hometown = undefined;
    $scope.ahead_like = undefined;
    $scope.end_refresh_loop = 0;
    $scope.isShowAll = false;
    $scope.search_distance = "5000";
    $scope.search_age = ["18","70"];
    $scope.dropdown_menu1_open = false;
    $scope.isShowAll_minus1 = false;
    $scope.search_distance_minus1 = "5000";
    $scope.search_age_minus1 = ["18","70"];

//    $scope.showall = "All";
//    $scope.msg_send_promise = undefined;
//    $scope.msg_array = [];

    $(document).bind('scroll', onScroll);

    $scope.connect_to_chat_protocols = function() {
//        console.log('connect to chat protocols');
        $scope.peer = new Peer({host: 'ec2-54-218-10-57.us-west-2.compute.amazonaws.com', port: 9000});

        $scope.peer.on('open', function(id){
//            console.log('peerid :', id);
//            console.log(Peer.browser);
            $scope.mypeerid = id;
        })
//        console.log($scope.peer);
        $.xmpp.connect({url:$scope.jabber_url, jid: $scope.fb_uid + "@jabber.fbpeople.com", password: $scope.passwd,

            onConnect: function(){
//                logContainer.html("Connected");
                $.xmpp.setPresence(null);
            },

            onError:function(error){
//                alert(error.error);
                console.log('there was some error in xmpp plugin jabber', error);
            },

//            onPresence: function(presence){
//                var curId = presence.from.split('@')[0];
//                console.log('new presence', presence);
//            },

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





                var data = eval('(' + message.body + ')');
//                console.log(jid[0], message.body);
//                $scope.protocol_dict[jid[0]] = 'jabber';

//                console.log(data);

                if ($scope.protocol_dict[jid[0]] = 'peer' && data.browser != Peer.browser) {
                    $scope.protocol_dict[jid[0]] = 'jabber';
                }

//                if (data == 'Status5683:EstablishConnection')  {
//                    console.log('replying with peer ids');
//                    $scope.
//
//                }
//                else {
//
//                }

                if (!(data instanceof Array)) {
//                   console.log('array not detected, creating array');
                    var dataarray = [];
                    dataarray.push(data);
                }
                else {
//                    console.log('array detected');
                    var dataarray = data;
                }


//                console.log(dataarray);

                for (var j=0; j<dataarray.length; j++) {
//                    var data = eval('(' + dataarray[j] + ')');
                    var data = dataarray[j]

                    if (data.status == 100) {
//                        $scope.protocol_dict[jid[0]] = 'jabber';
                        data.timestamp = parseInt(data.timestamp, 10);
//                    console.log(data);
                        var t_exists = $scope.fn_manage_timestamp_array(jid[0], data.timestamp);
//                    console.log(t_exists);
                        if (!t_exists) {
                            $scope.msg_recieved_fn(jid[0], data);
                        }
                    }

                    else if (data.status == 101) {
//                        console.log('replying with peer ids');
                        $scope.xmpp_send_message(jid[0], $scope.mypeerid, 102);
                    }
                    else if (data.status == 102) {
//                        console.log('got the peerid of chatter');
//                        console.log(data.message);
                        if (!(jid[0] in $scope.peerids)) {
                            $scope.peerids[jid[0]] = [];
                        }
                        $scope.peerids[jid[0]].push(data.message);
//                        console.log($scope.peerids);
                        $scope.sort_messages();
                    }


                }



            }
        })

        $scope.xmpp_send_api_call = function(id, m) {
//            console.log('calling xmpp api');
            console.log('sending through jabber:', m) ;
            $.xmpp.sendMessage({to:id + "@jabber.fbpeople.com", body:m });
        }

        $scope.xmpp_send_message = function(id, msg, status) {
            var promise = $timeout(function () {
                if (status == undefined) {
                    status = 100;
                }

                if ($scope.browser_status != "incompatible") {
                    $scope.browser_status = Peer.browser;
                }
//                else {
//                    var bs = $scope.browser_status;
//                }

                var m = $scope.prepare_message(msg, new Date().getTime(), status);

//                $.xmpp.sendMessage({to:id + "@jabber.fbpeople.com", body:m });
                $scope.xmpp_send_api_call(id, m);

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
            if (e.type=='browser-incompatible') {
                $scope.browser_status = "incompatible";
            }

//            console.log('error in connecting to peer, trying jabber');
//            console.log(e);
//            $scope.protocol_dict

//            $scope.chat_method = "bosh";
//            $xmpp_plugin.connect($scope.jabber_url, $scope.fb_uid, $scope.fb_uid);
            console.log('error in peer:', e);
//            $scope.

        })



        $scope.peer.on('connection', function(connection) {

            connection.on('data', function(data) {


                data = eval('(' + data + ')');
                $scope.protocol_dict[data.fb_uid] = 'peer';

//                if ($scope.timestamp_recieved_fn.call($scope.peer_possible, data.fb_uid) == -1) {
//                   $scope.peer_possible.push(data.fb_uid);
//                }

                if (!(data.fb_uid in $scope.peerids)) {
                    $scope.peerids[data.fb_uid] = [];
                }

                if (!(data.fb_uid in $scope.peer_connections)) {
                    $scope.peer_connections[data.fb_uid] = [];
                }

                if ($scope.timestamp_recieved_fn.call($scope.peerids[data.fb_uid], connection.peer) == -1) {
//                    console.log('adding new peer connection');
                    $scope.peerids[data.fb_uid].push(connection.peer);
                    var conn = $scope.peer.connect(connection.peer);
                    $scope.peer_connections[data.fb_uid].push(conn);

                }

//                if (data.status == 100) {
//
//                }


//                console.log(data);


                if (data.message == null) {
                    return;
                }

//                console.log('status message status', data.status);
                if (data.status == 103) {
//                    var timestamp =  data.message.split(':')[0];
//                    var timestamp =  data.timestamp;
//                    console.log(timestamp);
//                    console.log('i am status 103');
                    if (!(data.fb_uid in $scope.peer_primary) || $scope.peer_primary[data.fb_uid] == connection.peer){
                        delete $scope.peer_delivery_dict[data.timestamp];
//                        console.log('got answer from primary id');
                    }

//                    console.log($scope.peer_delivery_dict);
                }
                else {
//                    console.log('got a normal message through peer, will try to reply', data.message);
                    $scope.peer_primary[data.fb_uid] = connection.peer;
//                    var statusreply = data.timestamp + ':' + $scope.status_message;
                    $scope.peer_send_msg(data.fb_uid, $scope.status_message, data.timestamp, 103);
                    var t_exists = $scope.fn_manage_timestamp_array(data.fb_uid, data.timestamp);
//                    console.log(t_exists);
                    if (!t_exists) {
                        $scope.msg_recieved_fn(data.fb_uid, data);
                    }

                }


            })
        })

        $scope.peer_send_api_call = function(c, msg, timestamp, status) {
//            console.log('creating msg object for peer');
            var msg_obj = {};
            msg_obj['timestamp']  =  timestamp;
            msg_obj['message'] = msg;
            msg_obj['name'] = $scope.name;
            msg_obj['fb_uid'] = $scope.fb_uid;
            msg_obj['status'] = status;

            var m = JSON.stringify(msg_obj);
            console.log('sending through peer:', m);

            c.send(m);


        }

//        $scope.connect_to_peers = function(fb_uid, key) {
////            $scope.peer_connections[id] = [];
//
////            for (var j=0; j<$scope.peerids[id].length; j++) {
////                var key =  $scope.peerids[id][j];
//                var conn = $scope.peer.connect(key);
//                $scope.peer_connections[id].push(conn);
////            }
//        }

        $scope.peer_send_msg = function(peerid, msg, recvd_t, status) {

//            var pro = undefined;
            if (recvd_t == undefined) {
//                console.log('timestamp was not recieved, this is a general msg.');
                var timestamp = new Date().getTime();
            }
            else {
//                console.log('timestamp was recieved, status msg');
                var timestamp = recvd_t;
            }

            if (status == undefined) {
                status = 100;
            }


            if (status == 100) {
                $scope.peer_delivery_dict[timestamp] = [peerid, msg];
//                console.log('status msg not found, saving timestamp for check return')  ;
//                console.log($scope.peer_delivery_dict);

                $timeout(function () {
//                    console.log('ready for check return call');
                    $scope.peer_check_return(timestamp, peerid);
                }, 7000);
            }

            var proceed_with_sending = function() {
//                console.log('landed in peer send msg');


//                console.log('after the if condition, tyring to send');

//                console.log($scope.peer_connections[peerid]);

//                for (var j=0; j<$scope.peer_connections[peerid].length; j++) {

                var peer_exec_fn = function (j) {

                    var c = $scope.peer_connections[peerid][j];
                    //            console.log(c);

//                    console.log('just before if');
                    //            console.log(new Date().getTime());
                    if (!c.open) {
//                        console.log('connection was not open, creating new one..might be old connection');
//                    $scope.peer_connections[peerid] = $scope.peer.connect(peerid);
//                    var conn = $scope.peer_connections[peerid];
                        var promise = $timeout(function() {
                            //                    console.log(c);
                            //                    var c = $scope.peer.connect(peerid);
                            //                    console.log('waiting for connection to open');
                            c.on('open', function() {
                                //                        console.log('connection is now open');
                                //                        console.log('it opened');
                                //                        console.log('sending now:', msg);
                                //                        c.send(msg);
                                $scope.peer_send_api_call(c, msg, timestamp, status);
                            }) ;
                        },200);

                    }
                    else {
//                        console.log('connection is open and working already.');
                        var promise = $timeout(function() {
                            //                    console.log(c);
                            //                    var c = $scope.peer.connect(peerid);
                            //                    c.on('open', function() {
                            //                    console.log('sending now:', msg);
                            //                    c.send(msg);
                            $scope.peer_send_api_call(c, msg, timestamp, status);

                            //                    }) ;
                        },200);
                    }
//                    console.log(promise);
//                    return promise;

                    c.on('error', function (e) {
                        console.log('error on peer connection object', e) ;
                    });

                    c.on('close', function(e) {
                        console.log('close on connection', e);
//                        var index =  $scope.timestamp_recieved_fn.call($scope.peerids[peerid], timestamp)
//                        $scope.peerids[peerid].splice(j,1);
//                        $scope.peer_connections[peerid].splice(j,1);



//                    if (!$scope.peer_reconnect_flag) {
//                        $scope.peer_reconnect_flag = true;
//                        $timeout(function () {
//                            if (!$scope.peer_connections[peerid].open) {
//    //                            console.log('trying to reconnect to peer');
//                                $scope.peer_connections[peerid] = $scope.peer.connect(peerid);
//
//
//                                $scope.peer_connections[peerid].on('open', function() {
//    //                                console.log('reconnect successful');
//                                    $scope.protocol_dict[peerid] = 'peer';
//                                    $scope.peer_reconnect_flag = false;
//                                })
//                            };
//
//                        }, 20000);
//                    }

                    });

                    c.on('open', function(e){
                        console.log('open on connection', e);
                    });


                }

                var j = 0;
                var k = 0;
                var p = undefined;

                $scope.genric_repeat(
                    function () {
                        j++ ;
                        return (j>$scope.peer_connections[peerid].length) ;
                    },
                    100,
                    function() {
                        p = peer_exec_fn(k);

//                        console.log(p);
                        k++;
//                        return p;
                    },
                    function () {

//                        console.log('finished sending');
//                        console.log(p);
//                        return p;
                    }

                );
//                console.log(p);
//                return p;

            }




            var check_connections = function() {
                if (!(peerid in $scope.peer_connections)) {
//                console.log('peerid was not in peer connections, creating one.')
//                $scope.peer_connections[peerid] = $scope.peer.connect(peerid);
//                $scope.peer_connections[peerid] = [];
//                    $scope.connect_to_peers(peerid);
                    $scope.peer_connections[peerid] = [];
                    var j = 0;
                    var k = 0;
                    var tic1 = undefined;
                    $scope.genric_repeat(
                        function() {
                            j++;
//                            console.log('checking while condition');
//                            var bool =   j>=$scope.peerids[peerid].length;
//                            console.log(bool);
//                            console.log($scope.peerids[peerid].length);
                            return (j>$scope.peerids[peerid].length) ;

                        },
                        100,
                        function () {
                            var key =  $scope.peerids[peerid][k];
                            var conn = $scope.peer.connect(key);
//                            console.log(conn);
//                            console.log($scope.peer_connections[peerid]);
                            $scope.peer_connections[peerid].push(conn);
//                            console.log($scope.peer_connections[peerid]);
                            k++;
                        },
                        function () {
                            tic1 = proceed_with_sending();
//                          return tic1
                        }

                    )
//                    console.log('calling1', tic1);
//                    return tic1;

                }
                else {
//                    console.log('procedd with sending was called');
                    var rt = proceed_with_sending();
//                    console.log(rt);
//                    return rt;
                }
            }

            if (!(peerid in $scope.peerids)) {
                $scope.get_peerids(peerid);
                $scope.genric_repeat(
                    function() {
                        if (peerid in $scope.peerids) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    } ,
                    1000    ,
                    function () {
//                        console.log('still running');
                    },
                    check_connections
                );
//                return return2;
            }
            else {
                check_connections();
            }

//            c.on('error', function(e) {
//                console.log('peer is facing some difficulties in sending the msg, trying jabber');
//                $scope.protocol_dict[id] = 'jabber';
//                $scope.xmpp_send_message(peerid, msg);
//            });
        }

        console.log($scope.fb_uid, $scope.name);
    }


    $scope.calculate_distance = function(lat1, lng1, lat2, lng2) {
//        var distance = 2;

        if (lat1==9999) {
            return [0.0, 0.0];
        }
//        console.log('calculating distance');
//        dist =
        var from = new google.maps.LatLng(lat1, lng1);
        var to   = new google.maps.LatLng(lat2, lng2);
        var dist = google.maps.geometry.spherical.computeDistanceBetween(from, to)/1000.0;
        var score = (Math.log(1 + (100.0/Math.max(10, dist))));
        return [dist, score];
//        console.log(dist, score);
//        return true;
    }

//    console.log($scope.calculate_distance(29.166700, 75.716698, 20, 10));
//    var a = $scope.calculate_distance(-79.687184, 42.484131, 0, 0);
//    console.log(a[0], a[1]);
//
//    $scope.get_work_back = function(s) {
//        if (s) {
//            var a = s.split(" at ");
//            if (a.length > 1) s = a[1];
//            var a = s.split(" (");
//            if (a.length > 1) return a[0];
//            var a = s.split(", ");
//            if (a.length > 1) return a[0];
//            var a = s.split(" - ");
//            if (a.length > 1) return a[0];
//        }
//        return s;
//    }
//
//    $scope.get_desig_back = function(s) {
//        if (s) {
//            var a = s.split(" at ");
//            if (a.length > 1) return a[0];
//            else return undefined;
//        }
//        return s;
//    }
//
//    $scope.get_school_back = function(s) {
//        if (s) {
//            var a = s.split(" from ");
//            if (a.length > 1) s = a[1];
//            var a = s.split(" (");
//            if (a.length > 1) return a[0];
//            var a = s.split(", ");
//            if (a.length > 1) return a[0];
//        }
//        return s;
//    }
//
//    $scope.get_degree_back = function(s) {
//        if (s) {
//            var a = s.split(" in ");
//            if (a.length > 1) return a[0];
//            else return undefined;
//        }
//        return s;
//    }
//
//    $scope.get_e_back = function(s) {
//        if (s) {
//            var a = s.split(" in ");
//            if (a.length > 1) return a[0];
//            else return undefined;
//        }
//        return s;
//    }

    $scope.on_arrival_of_data = function (d) {

        console.log('on arrival of data, preparing views');
        $scope.users = d.data;
        $scope.presence_ids = [];


        for(var j=0; j<$scope.users.length; j++){
            $scope.users[j].namefilter = 1;
            $scope.users[j].genderfilter = 1;
            $scope.users[j].locationfilter = 1;
            $scope.users[j].hometownfilter = 1;
            $scope.users[j].workfilter = 1;
            $scope.users[j].educationfilter = 1;
            $scope.users[j].likesfilter = 1;
            $scope.users[j].onlinefilter = 1;
            $scope.users[j].online_flag = 'None';
            $scope.presence_ids.push($scope.users[j][1]);


            if (!$scope.users.score_added_flag) {
//                console.log('defining distance');
                var distelt = [1000.0, 0.0];
                if (16 in $scope.users[j]) {
//                    console.log($scope.latitude, $scope.longitude);
                    distelt = $scope.calculate_distance($scope.latitude, $scope.longitude, $scope.users[j][16][0], $scope.users[j][16][1]);
                }

//                console.log($scope.users[j]['0'], distelt[0], distelt[1]);
                $scope.users[j]['scr'] += distelt[1];
                $scope.users[j].distance = distelt[0];
            }



//            $scope.users[j].dummyurl = '/static/images/placeholder1.gif';
        }


//        console.log($scope.presence_json);
//        $http.defaults.useXDomain = true;
//        $http.post('/getstatus', $scope.presence_json).success(function (d){
//            console.log('json data posted successfully');
//            console.log(d);
//        });

//        var mydata1 = ['101', '102'];

        $scope.timediff  = new Date().getTime() - 300000;
        $scope.refresh_online_status();
//        console.log('blah blah blah blah blah');
//        makeCorsRequest();
//        myStatusService.async(mydata1);
//        $timeout(function() {
//
//        },3000);

//        $scope.names = [];
//        $scope.current_cities = [];
//        $scope.work_places = [];

        $scope.names = _.pluck($scope.users, '0');
        $scope.names = _.unique($scope.names) ;

        $scope.current_cities = _.pluck($scope.users, '13');
        $scope.current_cities = _.unique($scope.current_cities) ;

        var work_places =  _.pluck($scope.users, '4');
        work_places = _.flatten(work_places);
        work_places = _.reject(work_places, function(num){ return num == undefined; });
        var positions = _.pluck(work_places, "position");
        var employers = _.pluck(work_places, "employer");
//        var descriptions = _.pluck(work_places, "description");
//        positions = _.unique(positions) ;
//        employers = _.unique(employers) ;
//        descriptions = _.unique(descriptions) ;
//        console.log(positions);
//        console.log(employers);
//        console.log(descriptions);
//        $scope.work_places = positions.concat(employers).concat(descriptions);
        $scope.work_places = positions.concat(employers);
        $scope.work_places = _.unique($scope.work_places);



//        var desigs = _.map(work_places, $scope.get_desig_back);
//        desigs = _.unique(desigs);
//        console.log(desigs);

//        console.log(work_places[0]["position"]);

//        work_places = _.map(work_places, $scope.get_work_back);
//        work_places = _.unique(work_places);

//        var desigs = _.map($scope.work_places, $scope.get_desig_back);
//        desigs = _.unique(desigs);
//        console.log(work_places.length, desigs.length);
//        $scope.work_places = work_places.concat(desigs);
//        $scope.work_places = [];
//        console.log($scope.work_places);
//        console.log($scope.work_places.length, desigs.length);


        var education =  _.pluck($scope.users, '5');
        education = _.flatten(education);
        education = _.reject(education, function(num){ return num == undefined; });
        var schools = _.pluck(education, "school");
        var degrees = _.pluck(education, "degree");
        var concentrations = _.pluck(education, "concentration");
        $scope.schools = schools.concat(degrees).concat(concentrations);
//        $scope.schools = $scope.schools.concat(concentrations);

        $scope.schools = _.unique($scope.schools);

//        console.log(schools, degrees, concentrations)  ;
//        console.log($scope.schools);


//        $scope.schools = _.map($scope.schools, $scope.get_school_back);
//        $scope.schools = _.unique($scope.schools);

        $scope.hometowns = _.pluck($scope.users, '15');
        $scope.hometowns = _.unique($scope.hometowns) ;

//        console.log('starting likes sequence');
        $scope.likes =  _.pluck($scope.users, '10');
        $scope.likes = _.flatten($scope.likes);
//        $scope.likes = _.unique($scope.likes);
//        $scope.likes = [];
//        console.log('likes sequence complete');


        $scope.subset = $scope.users;
        $scope.newhtml();
        console.log('finished loading');
        $scope.users.score_added_flag = true;



    }



    myService.async(!$scope.isShowAll, $scope.search_age, $scope.search_distance).then(function(d) {

//        console.log('i am in my service then');
        console.log('initial data has come');
        $scope.fb_uid = d.username;
        $scope.passwd = d.userid;
        $scope.name = d.name;
//        console.log('before if condition.. setting up latlongs');
        if (d.latlong.length > 0) {
//            console.log('latlong found');
            $scope.latitude = d.latlong[0];
            $scope.longitude = d.latlong[1];
        }
        else {
//            console.log('latlong not found.. setting up default values');
            $scope.latitude = 9999;
            $scope.longitude = 9999;
        }
        $scope.backupdata = d;
        $scope.connect_to_chat_protocols();
        $scope.on_arrival_of_data(d);
//        $scope.change_status_to_idle();

    });


    $scope.change_status_to_idle = function() {
        var promise = $timeout(function() {
//            console.log('changing status to idle');
//            console.log($scope.online_status);
            $scope.online_status = 0;
        }, 600000);
        promise.then(function() {
            $scope.change_status_to_idle();
        });
    }

//    $scope.timediff1 = new Date().getTime();

    $scope.refresh_online_status = function (){

        if (new Date().getTime() - $scope.timediff > 250000)  {
            $scope.timediff = new Date().getTime();


            myStatusService.async($scope.presence_ids, $scope.fb_uid, $scope.online_status).then(function(d) {
            console.log('Refreshing online status');
//            console.log(d.data);
                for (var j=0; j < $scope.users.length; j++) {
                    if (new Date().getTime() - d.data[j] < 400000){
                        $scope.users[j].online_flag = 1;
                    }
                    else if (d.data[j] > 0) {
                        $scope.users[j].online_flag = 0;
                    }
//                    if (d.data[j] > 0) {
//                        console.log("statustime", (new Date().getTime() - parseInt(d.data[j]))/1000);
//                    }
                }
//                if ($scope.end_refresh_loop == 0) {
                $timeout(function() {
//                        $scope.timediff = new Date().getTime();
//                    console.log("calltime", (new Date().getTime() - $scope.timediff1)/1000);
                    $scope.refresh_online_status();

                },300000);
//                }
            });
        }


    }





    $scope.genric_repeat = (function () {
        return function repeat(cbWhileNotTrue, period, exec_fn, on_finish) {
            var timer = {};
            var fn = function () {
                if (true === cbWhileNotTrue()) {
                    on_finish();
                    return clearTimeout(timer.t);
                }
                timer.t = setTimeout(fn, period || 1000);
                exec_fn();
            };
            fn();
            return timer;
        };
    })();


    $scope.prepare_message = function(msg, timestamp, status) {
        var msg_obj = {};
        msg_obj['timestamp']  =  timestamp;
        msg_obj['message'] = msg;
        msg_obj['name'] = $scope.name;
        msg_obj['status'] = status;
        msg_obj['browser'] = $scope.browser_status;


        var m = JSON.stringify(msg_obj);
        return m;
    }


//    $scope.$watch('peer_delivery_dict', function(v) {
//       if (v) {
//           console.log('detected change in peer delivery dict');
//       }
//    });

    $scope.timestamp_recieved_fn = function(needle) {
        if(typeof Array.prototype.indexOf === 'function') {
            indexOf = Array.prototype.indexOf;
        }
        else {
            indexOf = function(needle) {
                var i = -1, index;

                for(i = 0; i < this.length; i++) {
                    if(this[i] === needle) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(this, needle);
    };


    $scope.fn_manage_timestamp_array = function(id, timestamp) {
        if (!(id in $scope.msgs_recieved)) {
//            console.log('creating id:', id);
            $scope.msgs_recieved[id] = [];
        }

//        console.log($scope.msgs_recieved);

        var t_exists = true;

        var remove_timestamp = function(i) {
//            console.log('removing timestamp');
            $timeout(function() {
                $scope.msgs_recieved[i].splice(0,1);
            }, 120000);
        }


//        console.log($scope.msgs_recieved[id], timestamp);
//        var bool = $scope.timestamp_recieved_fn.call($scope.msgs_recieved[id], timestamp);
//        console.log(bool);

        if ($scope.timestamp_recieved_fn.call($scope.msgs_recieved[id], timestamp) == -1) {
//            console.log('pushing id');
            $scope.msgs_recieved[id].push(timestamp);
            remove_timestamp(id);
//            console.log($scope.msgs_recieved);
            var t_exists = false;
        }
        else {
//            console.log('saved you from showing duplicate msg');
        }

        return t_exists;



    }

    $scope.peer_check_return = function(t1, id1) {

//        console.log('checking return');

//        console.log($scope.check_return_flag);
        if ($scope.check_return_flag) {
//            console.log('check return enqueue');
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
//                    console.log('status message was not returned, trying jabber');

//                    var msg = '';
                    var myobj = [];
                    for (key in $scope.peer_delivery_dict) {
//                        console.log(key);
                        if ($scope.peer_delivery_dict[key][0] == id) {
//                            if (!(msg == '')){
//                                msg +=  $scope.delim + $scope.peer_delivery_dict[key][1];
//                            }
//                            else {
//                                msg = $scope.peer_delivery_dict[key][1];
//                            }
//                            var msg_obj = $scope.prepare_message($scope.peer_delivery_dict[key][1], key) ;
//                            var msg_obj = $scope.prepare_message(msg, new Date().getTime(), status);
                            var msg_obj = {};

                            msg_obj['timestamp']  =  key;
                            msg_obj['message'] = $scope.peer_delivery_dict[key][1];
                            msg_obj['name'] = $scope.name;
                            msg_obj['status'] = 100;
                            myobj.push(msg_obj);

                            delete $scope.peer_delivery_dict[key];
                        }
                    }
//                    console.log('AGGREGATED MESSAGE:', msg);

//                item = $scope.peer_delivery_dict[t];
//                id = item[0];
//                msg = item[1];
                    $scope.protocol_dict[id] = 'jabber';
//                delete $scope.peer_delivery_dict[t];
//                    $.xmpp.sendMessage({to:id + "@jabber.fbpeople.com", body:JSON().stringify(myobj) });
//                    console.log('sending jabber object:', myobj);
                    $scope.xmpp_send_api_call(id, JSON.stringify(myobj));
//                    $scope.sort_message_protocol(id, msg);
                    $scope.sort_messages_flag = 'free';
                    $scope.sort_messages();
                }
            }

            fn1(t1, id1);

            if ($scope.status_waiting_list.getLength() == 0) {
//                console.log('turning flag on, returning from check return');
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

    $scope.msg_recieved_fn = function(sender, data){
//        console.log('msg has been recieved');
        var name = data.name;
        var msg = data.message;
//        console.log(name, msg);
        $scope.addmybox (sender, name);
        var msg_array = msg.split($scope.delim);
//        console.log(msg_array);
        for (i in msg_array) {
//            console.log(msg_array[i]);
            $("#" + sender).chatbox("option", "boxManager").addMsg(name, msg_array[i]);
        }

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

    $scope.likes_sub_match =  function (s, l) {
        for (i in l) {
            if (s == l[i]) {
                return true;
            }
        }
        if (i == l.length - 1) {
            return false;
        }
    }

    $scope.get_first_three = function(l) {
        var d = [];
        for (var i = 0; i < 3; i++) {
           if (l[i]) {
               d.push(l[i]);
           }
        }
        return d;
    }

    $scope.parse_education = function(obj) {
        var line = '';
//        console.log('parse education function was called');
        if (obj['degree']) {
            line += obj['degree'];
        }
        if (obj['concentration']) {
            if (line) {
                line += ' in ';
            }
            line += obj['concentration'];
        }
        if (obj['school']) {
            if (line) {
                line += ' from ';
            }
            line += obj['school'];
        }
        if (obj['year']) {
            if (line) {
                line += ' (' + obj['year'] + ')';
            }
        }
        if (obj['classes']) {
            if (line) {
                line += ', ' + obj['classes'];
            }
        }
        return line ;
    }

    $scope.parse_work = function(obj) {
        var line = '';
//        console.log('parse education function was called');
        if (obj['position']) {
            line += obj['position'];
        }
        if (obj['employer']) {
            if (line) {
                line += ' at ';
            }
            line += obj['employer'];
        }
        if (obj['description']) {
            if (line) {
                line += '  (' + obj['description'] + ')';
            }
            else {
                line += obj['description'];
            }
        }
        if (obj['location']) {
            if (line) {
                line += ', ';
            }
            line += obj['location'];
        }
        if (obj['start_date']) {
            if (obj['end_date']) {
                line += ' - ';
            }
            else {
                line += ' - Since ';
            }
            line += obj['start_date'] ;
            if (obj['end_date']) {
                line += ' to ' + obj['end_date'];
            }
        }
        return line ;
    }



    $scope.ShowLightBox = function(ind) {

//        console.log('executing show light box');
        var user = ind;
        if (3 in user) {
            $scope.light_profile_pic_url = user[3];
        }
        else {
            $scope.light_profile_pic_url = undefined;
        }
        if (0 in user) {
            $scope.light_caption = user[0];
        }
        else {
            $scope.light_caption = undefined;
        }
        if (4 in user) {
            $scope.light_work_name = $scope.parse_work(user[4][0]);
        }
        else {
            $scope.light_work_name = undefined;
        }
        if (5 in user) {
            $scope.light_education_name = $scope.parse_education(user[5][0]);
        }
        else {
            $scope.light_education_name = undefined;
        }
        if (6 in user) {
            $scope.light_current_location_name = user[6];
        }
        else {
            $scope.light_current_location_name = undefined;
        }
        if (7 in user) {
            $scope.light_hometown_location_name = user[7];
        }
        else {
            $scope.light_hometown_location_name = undefined;
        }
        if (8 in user) {
            $scope.light_relationship_status = user[8];
        }
        else {
            $scope.light_relationship_status = undefined;
        }
        if (14 in user) {
            $scope.light_birthday = user[14];
        }
        else {
            $scope.light_birthday = undefined;
        }
        if (9 in user) {
            $scope.light_interested_in = user[9];
        }
        else {
            $scope.light_interested_in = undefined;
        }
//        console.log(user[10], user[20]);
        if (10 in user) {
//            var likes = user[20];
            if (20 in user) {
//                var likes = user[20].splice(0,3);
//                for (var likes_i = 0; likes_i < 3; likes_i++) {
//                    if (user[20][likes_i]) {
//
//                    }
//                }
                var likes = user[20];

                if (likes.length < 3) {
//                    console.log('length less than 3');
//                var rem_len = 3 - likes.length;
//                    var rem_likes =  user[10].split(',');
//                    var rem_likes =  user[10];
                    var lc = 0;
                    while (likes.length < 3) {
                        if (!($scope.likes_sub_match(user[10][lc], likes))) {
                            likes.push(user[10][lc].trim());
                        }
                        ++lc;
                    }
                }
//            $scope.light_likes_name = user[10].split(',').splice(0,3).join();
                $scope.light_likes_name = $scope.get_first_three(likes).join(', ');
            }
            else {
                $scope.light_likes_name = $scope.get_first_three(user[10]).join(', ');
//                $scope.light_likes_name = user[10].split(',').splice(0,3).join();
            }
        }
        else {
            $scope.light_likes_name = undefined;
        }
        if (12 in user) {
            $scope.light_username = user[12];
        }
        else {
            $scope.light_username = undefined;
        }
        if (11 in user) {
            $scope.light_thumbnails = user[11];
        }
        else {
            $scope.light_thumbnails = undefined;
        }
        if (18 in user)  {
            $scope.light_age = user[18];
        }
        else {
            $scope.light_age = undefined;
        }
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
                array[j].likesfilter &&
                array[j].onlinefilter
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
                if (array[j][2].toLowerCase()=="male"){
                    array[j]["genderfilter"] = 1;
                }
                else {
                    array[j]["genderfilter"] = 0;
                }
            }
        }
        else if (!$scope.checkModel.male && $scope.checkModel.female){
            for (var j= 0; j<array.length; j++){
                if (array[j][2].toLowerCase()=="female"){
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

        if ($scope.checkModel.online) {
//            console.log('checking online model');
            for (var j= 0; j<array.length; j++){
                if (array[j].online_flag=='0' || array[j].online_flag=='1'){
                    array[j]["onlinefilter"] = 1;
                }
                else {
                    array[j]["onlinefilter"] = 0;
                }
            }
        }
        else {
//            console.log('unclick online model');
            for (var j= 0; j<array.length; j++){
                array[j]["onlinefilter"] = 1;
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
//        console.log('sort_message protocol:', msg);
        if  (id in $scope.protocol_dict)    {
            if ( $scope.protocol_dict[id] == 'jabber') {
//                console.log('sort message protocol : sending through jabber');
                var promise = $scope.xmpp_send_message(id, msg);
            }
            else {
//                if (!(id in $scope.peer_connections)) {
//                    $scope.peer_connections[id] = $scope.peer.connect(id);
////                    $scope.peer_connections[id].on('open', function(){
////                        console.log('connection is open now');
////                    })
//                }
//                console.log('sort message protocol: sending through peer');
                var promise = $scope.peer_send_msg(id, msg);
            }
        }
        else {
            $scope.protocol_dict[id] == 'peer';
//            if (!(id in $scope.peer_connections)) {
//                $scope.peer_connections[id] = $scope.peer.connect(id);
//            }
//            console.log('sort message protocol : sending through peer');
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
                $scope.sort_message_protocol(key, message_dict[key]);

                var promise = $timeout(function () {

                }, 1000);

                promise.then(function() {
                    $timeout(function () {
//                        console.log('repeat function then clause');
                        current += 1;
                        if (current == target) {
//                            console.log('repeat function current equal target clause')
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


//        console.log($scope.sort_messages_flag);
        if ($scope.sort_messages_flag == 'busy') return ;
        else {
            if ($scope.message_queue.getLength() == 0)    {
//                console.log('returning from 0 length clause');
                $scope.sort_messages_flag = 'free';
                return ;
            }
            $scope.sort_messages_flag = 'busy';
            var message_dict = {};
//            console.log('before while loop');
            while ($scope.message_queue.getLength() != 0) {
//                console.log('in while loop');
                item = $scope.message_queue.dequeue();
                id = item[0];
                msg = item[1];
                if (id in message_dict) {
                    message_dict[id] = message_dict[id] +  $scope.delim + msg;
                }
                else {
                    message_dict[id] = msg;
                }

            }
//            console.log('sort_message_dict:', message_dict);
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

    $scope.get_peerids = function(id) {
        var m = "EstablishConnection";
//        var jsonm = JSON.stringify(m);
        $scope.xmpp_send_message(id, m, 101);
    }

//    $scope.recheck_peer_connections = function() {
//        var j = 0;
//        var k = 0;
//        console.log('rebuilding peer connections');
//
//        $scope.genric_repeat(
//            function() {
//               j++;
//               return (j>$scope.peer_possible.length);
//            },
//            2000,
//            function(){
//                var fb_uid = $scope.peer_possible[k];
//                var bool = $scope.protocol_dict[fb_uid];
//
//                if (bool == 'jabber'){
//                    $scope.get_peerids($scope.peer_possible[k]);
//                }
//
//                k++;
//            },
//            function (){
//                $timeout(function(){
//                  $scope.recheck_peer_connections();
//                },60000) ;
//            }
//        );
//    }

    $scope.broadcastMessageCallback = function(id, from, msg) {
//        console.log('sending msg ', msg, 'to ', id);
//        console.log(JSON.stringify(msg));
        $("#" + id).chatbox("option", "boxManager").addMsg(from, msg);
//        $scope.peer_send_msg(id, msg);
//        console.log('broadcast message:', msg);
        $scope.message_queue.enqueue([id,msg]);

        if (id in $scope.peerids)   {
            $scope.sort_messages();
        }
        else {
            if (!(id in $scope.peerids_bool && $scope.peerids_bool[id]))  {
                $scope.peerids_bool[id] = true;
                $scope.get_peerids(id);
                $timeout(function() {
                    if  (!(id in $scope.peerids)) {
                        $scope.peerids[id] = [];
//                        console.log('shifting to jabber manually');
                        $scope.protocol_dict[id] = 'jabber';
                        $scope.sort_messages();
                    }

                }, 5000);
            }

        }

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

    $scope.update_default_results = function() {
        var changed = false;
//        console.log($scope.isShowAll, $scope.isShowAll_minus1, $scope.search_age, $scope.search_age_minus1,  $scope.search_distance, $scope.search_distance_minus1);
        if ($scope.isShowAll != $scope.isShowAll_minus1) {
            changed = true;
            $scope.isShowAll_minus1 = $scope.isShowAll;
//            console.log('due to checkbox');
        }
        else if($scope.search_age[0] != $scope.search_age_minus1[0] || $scope.search_age[1] != $scope.search_age_minus1[1]) {
            changed = true;
            $scope.search_age_minus1 = $scope.search_age;
//            console.log('due to age');
        }
        else if ($scope.search_distance != $scope.search_distance_minus1) {
            changed = true;
            $scope.search_distance_minus1 = $scope.search_distance;
//            console.log('due to distance');
        }

        if (changed) {
            $scope.subset = [];
            $scope.$apply();
            $('#loaderCircle').show();
            var searchterm = document.getElementById("global_search_input").value;
            if (searchterm) {
                mySearchService.async(searchterm, !$scope.isShowAll, $scope.search_age, $scope.search_distance).then(function(d) {
                    $scope.on_arrival_of_data(d);
                });
                myService.async(!$scope.isShowAll, $scope.search_age, $scope.search_distance).then(function(d) {
                    $scope.backupdata = d;
                });
            }
            else {
                myService.async(!$scope.isShowAll, $scope.search_age, $scope.search_distance).then(function(d) {
                    $scope.on_arrival_of_data(d);
                    $scope.backupdata = d;
                });
            }
//            console.log('send the fresh request');
        }
//        else {
//            console.log('do not send fresh request, nothing happened');
//        }
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
//                    console.log("chatbox message entered directive:", evt.target.value);
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

app.directive("searchenter", function($timeout, mySearchService, myService){
    return function (scope, element, attrs) {

        var search_fn = function() {
            $("#global_search_input").data("autocomplete").close();
            scope.subset = [];
            scope.$apply();
            $('#loaderCircle').show();
            var searchterm = document.getElementById("global_search_input").value;
            console.log('search term: ', searchterm, scope.isShowAll);


            mySearchService.async(searchterm, !scope.isShowAll, scope.search_age, scope.search_distance).then(function(d) {
//            console.log('i am in my service then');

                scope.on_arrival_of_data(d);
            });
        }

        var search_default = function (){
            scope.subset = [];
            scope.$apply();
            $('#loaderCircle').show();
//            myService.async().then(function(d) {
//            console.log('i am in my service then');
                scope.on_arrival_of_data(scope.backupdata);
//            });


        }

        element.bind("keyup", function(evt) {
//            scope.searchvalue = evt.target.value;
//            scope.$apply();

            if (evt.target.value) {
                if (evt.which == 13){
//                    $('.dropdown-menu').click(function(event){
//                        evt.stopPropagation();
//                    });
//                    $("#global_search_input").data("autocomplete").close();
//                    $('.dropdown.open .dropdown-toggle').dropdown('toggle');
//                    $('[data-toggle="dropdown"]').parent().removeClass('open');
//                    console.log('bydocid', document.getElementById("global_search_input").value);
//                    scope.searchvalue = document.getElementById("global_search_input");
//                    scope.$apply();
//                    console.log('search term: ', evt.target.value);
//                    console.log('search term: ', scope.searchvalue);
                    search_fn();
                    scope.flag_to_display_default = true;

                }
            }
            else {
//                console.log('default search');
//                $timeout(function () {
//                    if (!evt.target.value) {
//                        search_default();
//                    }
//
//                },100);
                if (scope.flag_to_display_default) {
                    search_default();
                    scope.flag_to_display_default = false;
                }

            }

        });

        element.on("click", function(evt) {
//            console.log(evt.target.className) ;
            if (evt.target.className == "icon-search") {
//                scope.searchvalue = document.getElementById("global_search_input").value;
//                scope.$apply();
//                console.log('bydocid', document.getElementById("global_search_input").value);
                if (document.getElementById("global_search_input").value) {
//                    console.log('search term: ', scope.searchvalue)   ;
                    search_fn();
                }
//                else {
//                    search_default();
//                }

            }
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

app.directive('onlinestatus', function(){


    return function (scope, element, attrs) {

        element.bind("keydown keypress keyup mousedown mouseup mouseover mousemove mouseenter mouseleave", function(evt) {
//            if (scope.online_status == 0) {
////                console.log('global directive activated');
//                scope.online_status = 1;
//                scope.$apply();
//            }
            scope.online_status = new Date().getTime();
            scope.$apply();
        });

        element.on('click', function(evt) {
            if(scope.dropdown_menu1_open) {
                scope.dropdown_menu1_open = false;
                scope.$apply();
                console.log('dropdown closed');
                scope.update_default_results();
            }
        });


    }
}) ;


app.directive('ageslider', function($timeout){
    return function (scope, element, attrs) {
        element.on("slide", function(evt){
//            console.log("i entered the directive");
            var age = $('#sl2').slider('getValue');
            age = age[0].value;
            scope.search_age = age.split(",");
//            var age_min = parseInt(age[0]);
//            var age_max = parseInt(age[1]);
//            console.log(age_min, age_max);
//            scope.search_age = [age_min, age_max];
            scope.$apply();
//            console.log(scope.search_age_minus1, scope.search_age);
        });
    }
}) ;

app.directive('distslider', function(){
    return function (scope, element, attrs) {
        element.on('slide', function(evt){
            var distance = $('#sl1').slider('getValue');
            scope.search_distance = distance[0].value;
//            distance = parseInt(distance[0].value);
//            console.log(distance);
            scope.$apply();
        });
    }
}) ;


app.directive('dropdownadvanced', function(){
    return function (scope, element, attrs) {
        element.on('click', function(evt){
            if (scope.dropdown_menu1_open) {
                scope.dropdown_menu1_open = false;
                scope.$apply();
                console.log('dropdown closed');
                scope.update_default_results();
            }
            else {
                scope.dropdown_menu1_open = true;
                scope.$apply();
                console.log('dropdown opened');
            }
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


