import json
import sys

from autobahn.websocket import (WebSocketServerFactory, WebSocketServerProtocol,
                                listenWS)
from twisted.internet import reactor
from twisted.python import log


MESSAGE_TYPE_CHAT = 1
MESSAGE_TYPE_JOIN = 2
MESSAGE_TYPE_PART = 3


class BroadcastServerProtocol(WebSocketServerProtocol):
 
   def onOpen(self):
       self.factory.register(self)
 
   def onMessage(self, msg, binary):
       if not binary:                    
           data = json.loads(msg)
           msg_type = data.get("type", MESSAGE_TYPE_CHAT)
           if msg_type == MESSAGE_TYPE_JOIN:
               response = json.dumps({"nickname":data["nickname"],
                                      "userid":self.peerstr,
                                      "type":MESSAGE_TYPE_JOIN})
               self.factory.broadcast(response)
           else:
               print "%s (%s): %s" % (data["nickname"], self.peerstr, data["message"])
               response = json.dumps({"nickname":data["nickname"],
                                    "ip":self.peerstr,
                                    "message":data["message"]})
               self.factory.broadcast(response)
               
   def connectionLost(self, reason):
       WebSocketServerProtocol.connectionLost(self, reason)
       self.factory.unregister(self)
 
 
class BroadcastServerFactory(WebSocketServerFactory):
 
   protocol = BroadcastServerProtocol
 
   def __init__(self, url):
       WebSocketServerFactory.__init__(self, url)
       self.clients = []
       self.tickcount = 0
       self.tick()
 
   def tick(self):
       self.tickcount += 1
       #self.broadcast("tick %d" % self.tickcount)
       reactor.callLater(60, self.tick)
 
   def register(self, client):
       if not client in self.clients:
           print "registered client " + client.peerstr
           self.clients.append(client)
 
   def unregister(self, client):
       if client in self.clients:
           print "unregistered client " + client.peerstr
           self.clients.remove(client)
           partMessage = json.dumps({"userid":client.peerstr,
                                      "type":MESSAGE_TYPE_PART})
           self.broadcast(partMessage)
 
   def broadcast(self, msg):
       print "broadcasting message '%s' .." % (msg,)
       for c in self.clients:
           print "sending to %s... " % (c.peerstr,)
           c.sendMessage(msg.encode("utf-8"))
 
if __name__ == '__main__':
    log.startLogging(sys.stdout)
    factory = BroadcastServerFactory("ws://localhost:9000")
    listenWS(factory)
    reactor.run()
