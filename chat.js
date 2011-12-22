
var MESSAGE_TYPE_CHAT = 1;
var MESSAGE_TYPE_JOIN = 2;

var webSocket = undefined;
var webSocketReady = undefined;

function handle_chat(response) {
	// response is a dictionary for each message:
    messages = document.getElementById("messages");
    message = document.createElement("p");
    message.textContent = response.nickname + ": " + response.message;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
};

function handle_join(response) {
	 //
	 console.log("User joined: " + response.nickname);
	 userlist = document.getElementById("userlist");
	 user = document.createElement("li");
	 user.textContent = response.nickname;
	 userlist.appendChild(user);
};

function send_message(event) {
     msg_box = document.getElementById("msg_box");
     msg = msg_box.value;
     if (msg.length > 0) {
       	 name = document.getElementById("name_box").value;
     	 json_msg = JSON.stringify({
     		"nickname":name,
     		"message":msg
     	 })
         console.log(json_msg);
         webSocket.send(json_msg);

         msg_box.value = "";  
     }
};

function initialize_chat() {
    var ws_uri = "ws://localhost:9000";
    if ("WebSocket" in window) {
        webSocket = new WebSocket(ws_uri);
    }
    else {
        // Firefox 7/8 currently prefixes the WebSocket object
        webSocket = new MozWebSocket(ws_uri);
    }
    webSocket.onopen = function() {
        //TODO: something better than a global webSocketReady?
        //
        // Maybe make this into a class?
        //
        // The important thing is we need a way to check
        //   for the socket being open before we try to or
        //   receive any data on it.

        console.log("Websocket Open!")
        webSocketReady = true;
        console.log("Sending join message...");
        name = document.getElementById("name_box").value;
	    join_msg = JSON.stringify({"nickname":name,
	                            "type":MESSAGE_TYPE_JOIN});
	    webSocket.send(join_msg);
	    console.log("Sent join message!");
    }
    webSocket.onmessage = function(e) {
    	 console.log(e.data);

		 response = JSON.parse(e.data);
		 type = response["type"];
		 if (type === undefined) {
		     type = MESSAGE_TYPE_CHAT;
		 }
		 
		 if (type == MESSAGE_TYPE_CHAT) {
		 	 handle_chat(response);					
		 }
		 else if (type == MESSAGE_TYPE_JOIN) {
			 handle_join(response);
		 }
    }
    webSocket.onerror = function(e) {
        // Maybe toggle webSocketReady here? 
        console.log("Websocket error: " + e);
    }
    webSocket.onclose = function() {
        // Maybe toggle webSocketReady here? 
        console.log("Websocket closed...");
    }
 };