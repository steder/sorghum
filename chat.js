
var MESSAGE_TYPE_CHAT = 1;
var MESSAGE_TYPE_JOIN = 2;

var webSocket = undefined;

function handle_chat(response) {
	 /*
	   Message is a dictionary for each message:

	 */
    messages = document.getElementById("messages");
    message = document.createElement("p");
    message.textContent = response.nickname + ": " + response.message;
    messages.appendChild(message);
};

function handle_join(response) {
	 /* 
	 */
	 console.log("User joined: " + response.nickname);
	 userlist = document.getElementById("userlist");
	 user = document.createElement("li");
	 user.textContent = response.nickname;
	 userlist.appendChild(user);
};

function send_message(event) {
    msg = document.getElementById("msg_box").value;
	 name = document.getElementById("name_box").value;
	 json_msg = JSON.stringify({
		"nickname":name,
		"message":msg
	 })
    console.log(json_msg);
    webSocket.send(json_msg);
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
        console.log("Websocket Open!")
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
        console.log("Websocket error: " + e);
    }
    webSocket.onclose = function() {
        console.log("Websocket closed...");
    }
 };