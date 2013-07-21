
#!/usr/bin/env python
import sys
from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from werkzeug.exceptions import NotFound
from gevent import monkey

monkey.patch_all()

import sleekxmpp

# Python versions before 3.0 do not use UTF-8 encoding
# by default. To ensure that Unicode is handled properly
# throughout SleekXMPP, we will set the default encoding
# ourselves to UTF-8.
if sys.version_info < (3, 0):
    reload(sys)
    sys.setdefaultencoding('utf8')
else:
    raw_input = input



class EchoBot(sleekxmpp.ClientXMPP):

    def __init__(self, jid, password):
        sleekxmpp.ClientXMPP.__init__(self, jid, password)
        self.add_event_handler("session_start", self.start)


    def start(self, event):
        self.send_presence()
        self.get_roster()




class ChatNamespace(BaseNamespace):

    def __init__(self, *args, **kwargs):
        BaseNamespace.__init__(self, *args, **kwargs)
        self.xmpp_connect()
        

    def initialize(self):
        # self.logger = app.logger
        # self.log("Socketio session started")
        pass

    def on_join(self, room):
        return True


    # def log(self, message):
    #     self.logger.info("[{0}] {1}".format(self.socket.sessid, message))


    def on_user_message(self, data):
        print data
        msg = data['message']
        recipient = data['recipient']
        # self.log('User message: {0}'.format(msg))
        print 'msg recieved'
        recipient = recipient + '@jabber.fbpeople.com'
        self.xmpp.send_message(mto=recipient, mbody=msg, mtype='chat')
        # return True

    def my_message(self, msg):
        print 'hello i recieved something', msg['body']
        if msg['type'] in ('chat', 'normal'):
            print msg
            #print msg['from'], msg['body']
            try:
                sender = str(msg['from'])
                sender_name = sender.split('@')[0]
                jid = sender.split('/')[0]
            except Exception, e:
                print e
                sender = 'Monika'
                jid = "monika"
            data = msg['body']
            print sender, jid, data
            #text = msg['to'].split('@')[0] 
            #print text
            #self.emit('boo')
            self.emit('my_mess', {'sender':sender_name, 'jid':jid, 'message':data})


    def xmpp_connect(self):
        self.xmpp = EchoBot(self.request['jid'], self.request['jidpass'])
        self.xmpp.register_plugin('xep_0030') # Service Discovery
        self.xmpp.register_plugin('xep_0004') # Data Forms
        self.xmpp.register_plugin('xep_0060') # PubSub
        self.xmpp.register_plugin('xep_0199') # XMPP Ping
        if self.xmpp.connect(('ec2-54-218-10-57.us-west-2.compute.amazonaws.com', 5222)):
            # If you do not have the dnspython library installed, you will need
            # to manually specify the name of the server if it does not match
            # the one in the JID. For example, to use Google Talk you would
            # need to use:
            #
            # if xmpp.connect(('talk.google.com', 5222)):
            #     ...
            self.xmpp.process(block=False)
            print "xmpp connection successfull"
            self.xmpp.add_event_handler("message", self.my_message)
            print "added a message hander"




  