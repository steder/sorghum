import json
import random
import sys
import time

from autobahn.websocket import WebSocketServerFactory
from autobahn.websocket import WebSocketServerProtocol
from autobahn.websocket import listenWS
from twisted.internet import reactor
from twisted.python import log

from words import wordlib


MESSAGE_TYPE_CHAT = 1
MESSAGE_TYPE_JOIN = 2
MESSAGE_TYPE_PART = 3
MESSAGE_TYPE_USERLIST = 4


WORD_PATH = "words/words.txt"
dictionary = None


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
                self.nickname = data["nickname"]
                self.factory.broadcast(response)
            elif msg_type == MESSAGE_TYPE_USERLIST:
                # TODO: cache this userlist on the factory, build on demand,
                # invalidate the cache when users join or leave.
                userList = {"type":MESSAGE_TYPE_USERLIST,
                            "users":[]}
                for client in self.factory.clients:
                    userList["users"].append({"nickname":client.nickname,
                                              "userid":client.peerstr,
                                              })
                self.sendMessage(json.dumps(userList))
            else:
                message = data["message"]
                if message.startswith("/d6"):
                    response = json.dumps({"nickname":"DM",
                                           "ip":self.peerstr,
                                           "message":"%s rolled a d6 and got %s"%(data["nickname"], random.randint(1, 6))})
                    self.factory.broadcast(response)
                elif message.startswith("/scrabble"):
                    # cleanup and grab (arbitrary max) 10 letters [a-zA-Z]
                    # and no more than 3 '*' characters.
                    message = message.strip()
                    if message.endswith("/scrabble"):
                        response = json.dumps({"nickname":"Computer",
                                               "ip":self.peerstr,
                                               "message":"The letters in your name '%s' make the following words: %s"%(data["nickname"], dictionary.getScrabbleWords(data["nickname"]))}
                                              )
                        self.sendMessage(response)
                    else:
                        # split with (None, 1) removes runs of consecutive whitespace
                        # it also splits only once so the
                        message = message.lower()
                        parts = message.split(None, 1)
                        command, letters = parts
                        letters = letters[:10]
                        nWildcards = letters.count("*")
                        replaceCount = nWildcards - 3
                        if replaceCount > 0:
                            letters = letters.replace("*", "", replaceCount)
                        letters = "".join(sorted(letters))
                        response = json.dumps({"nickname":"Computer",
                                               "ip":self.peerstr,
                                               "message":"The letters '%s' can make the following words: %s"%(letters, dictionary.getScrabbleWordsWithWildcards(letters))}
                                              )
                        self.sendMessage(response)
                elif message.startswith("/"):
                    response = json.dumps({"nickname":"Computer",
                                           "ip":self.peerstr,
                                           "message":"I don't understand your command: %s"%(message,),
                                           })
                    self.sendMessage(response)
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

    print "Constructing new dictionary..."
    start = time.time()
    dictionary = wordlib.Dictionary()
    with open(WORD_PATH, "r") as wordsFile:
        for word in wordsFile:
            dictionary.insertWord(word)
    end = time.time()
    elapsed = end - start
    print "\rConstructed new dictionary in %s seconds"%(elapsed,)

    reactor.run()
