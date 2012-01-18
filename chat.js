
var MESSAGE_TYPE_CHAT = 1;
var MESSAGE_TYPE_JOIN = 2;
var MESSAGE_TYPE_PART = 3;
var MESSAGE_TYPE_USERLIST = 4;


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
	// check if user already exists:
	user = document.getElementById(response.userid);
	if (user === null) {
	    userlist = document.getElementById("userlist");
	    user = document.createElement("li");
	    user.className = "username";
	    user.id = response.userid;
	    user.textContent = response.nickname;
	    userlist.appendChild(user);
	}
    else {
        user.textContent = response.nickname;
    }
    // remove disconnected users:
    // removing is unnecessary if we just get the current list
    // when we initialize chat and then handle join and part messages.
    var users = $("li.username");
    //for (var i = 0; i < users.length; i++) {
    //}

    // Let's sort the user list:
    console.log("TODO: sort user list!");
};


function handle_userlist(response) {
    // receive the entire current userlist from the server:
    var users = response["users"];
    var user;
    var userNode;
    for (var i = 0; i < users.length; i++) {
        user = users[i];
        userNode = document.getElementById(user.userid);
        if (userNode === null) {
            // insert new user node
	        usersNode = document.getElementById("userlist");
	        userNode = document.createElement("li");
	        userNode.className = "username";
	        userNode.id = user.userid;
	        userNode.textContent = user.nickname;
	        usersNode.appendChild(userNode);
        }
        else {
            // update existing user node:
            user.textContent = user.nickname;
        }
    }
};

function handle_part(response) {
    // remove a user from the user list
    console.log("TODO handle_part");
    user = document.getElementById(response.userid);
    if (user !== null) {
        // only remove the user node if it exists:
        // TODO: is it necessary to guard against this?
        userlist = document.getElementById("userlist");
        userlist.removeChild(user);
    }
};


function change_nick() {
    // changing nick could just be joining with the same name?
  	name = document.getElementById("name_box").value;
    json_msg = JSON.stringify({
        "nickname":name,
        "type":MESSAGE_TYPE_JOIN
    })
    webSocket.send(json_msg);
};


function hide_reconnect_button() {
    reconnect_div = jQuery("#reconnect_box");
    reconnect_div.hide();
};


function show_reconnect_button() {
    reconnect_div = jQuery("#reconnect_box");
    reconnect_div.show();
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
    hide_reconnect_button();
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
        hide_reconnect_button();
        webSocketReady = true;
        console.log("Sending join message...");
        name = document.getElementById("name_box").value;
	    join_msg = JSON.stringify({"nickname":name,
	                            "type":MESSAGE_TYPE_JOIN});
	    webSocket.send(join_msg);
        console.log("Requesting userlist from server...");
        userlist_msg = JSON.stringify({"nickname":name,
                                           "type":MESSAGE_TYPE_USERLIST});
        webSocket.send(userlist_msg);
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
		else if (type == MESSAGE_TYPE_PART) {
		    handle_part(response);
		}
        else if (type == MESSAGE_TYPE_USERLIST) {
            handle_userlist(response);
        }
    }
    webSocket.onerror = function(e) {
        // Maybe toggle webSocketReady here?
        console.log("Websocket error: " + e);
    }
    webSocket.onclose = function() {
        // Maybe toggle webSocketReady here?
        console.log("Websocket closed...");
        show_reconnect_button();
    }
 };