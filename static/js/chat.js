

    var WEB_SOCKET_SWF_LOCATION = '/static/js/socketio/WebSocketMain.swf',
        socket = io.connect('/chat');

    socket.on('my_mess', function(sender, jid, data){
        console.log("here is your message : ", data);
        // console.log("before: ", $('#recipient').val())
        // $('#lines').append($('<p>').append($('<b>').append(sender), data));
        // var elem = document.getElementById("recipient");
        // elem.value = jid;
        // console.log("after", $('#recipient').val())
        addmybox (sender, sender);
        $("#" + sender).chatbox("option", "boxManager").addMsg(sender, data);
    });


    socket.on('boo', function(){
        console.log("got some message");
    });

    function message (from, msg) {
        console.log(from, msg);
        $('#lines').append($('<p>').append($('<b>').text(from), msg));
    }

    // // DOM manipulation
    // $(function () {


    //     $('#send-message').submit(function () {
    //         message('me', $('#message').val());
    //         socket.emit('user message', $('#message').val(), $('#recipient').val());
    //         clear();
    //         $('#lines').get(0).scrollTop = 10000000;
    //         return false;
    //     });

    //     function clear () {
    //         $('#message').val('').focus();
    //     }
    // });


      var counter = 0;
      var idList = new Array();

      var broadcastMessageCallback = function(id, from, msg) {
        $("#" + id).chatbox("option", "boxManager").addMsg(from, msg);
        
      }

      chatboxManager.init({messageSent : broadcastMessageCallback});

      function addmybox (recipient, name, event, ui) {
          counter ++;
          var id = recipient;
          idList.push(id);
          chatboxManager.addBox(id, 
                                  {dest:"dest" + counter, // not used in demo
                                   title: name,
                                   first_name: 'me'
                                  });
          // event.preventDefault();
      }

