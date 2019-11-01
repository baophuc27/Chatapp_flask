// Make connection
var socket = io.connect("localhost:5000");

//DOM

var username = document.getElementById("userName"),
  btn_login = document.getElementById("login"),
  friend = document.getElementById("friendName"),
  btn_req = document.getElementById("request"),
  message = document.getElementById("message"),
  btn_send = document.getElementById("send"),
  chat = document.getElementById("chat-window"),
  feedback = document.getElementById("feedback");

var peerConnection, dataChannel;

// set RTCPeerConnection

window.RTCPeerConnection =
  window.RTCPeerConnection ||
  window.mozRTCPeerConnection ||
  window.webkitRTCPeerConnection;
window.RTCIceCandidate =
  window.RTCIceCandidate ||
  window.mozRTCIceCandidate ||
  window.webkitRTCIceCandidate;
window.RTCSessionDescription =
  window.RTCSessionDescription ||
  window.mozRTCSessionDescription ||
  window.webkitRTCSessionDescription;

var configuration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302"] },
    {
      username:
        "BSXzU69-R3AtqxzAeZQ8bS5eh3e3eFKG5hpSFVt-yZg4XiyT2VFeLnciyzLrdy8LAAAAAF2y9LB0dWxpNDY=",
      credential: "10e15110-f729-11e9-816b-322c48b34491",
      urls: [
        "turn:ss-turn2.xirsys.com:80?transport=udp",
        "turn:ss-turn2.xirsys.com:80?transport=tcp"
      ]
    }
  ]
};

peerConnection = new RTCPeerConnection(configuration);

//Definition of the data channel
peerConnection.ondatachannel = function(ev) {
  dataChannel = ev.channel;
  openDataChannel();
};

//When we get our own ICE Candidate, we provide it to the other Peer.
peerConnection.onicecandidate = function(event) {
  if (event.candidate) {
    socket.emit("candidate", {
      to: friend.value,
      candidate: event.candidate
    });
  }
};

//Messages received from the Signaling Server
socket.on("loginsuccess", function(data) {
  username.innerText = data.id;
});

//
socket.on("offer", function(data) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
  peerConnection.createAnswer(
    function(answer) {
      peerConnection.setLocalDescription(answer);
      socket.emit("answer", {
        to: data.id,
        answer: answer
      });
    },
    function(error) {
      console.log("Error on receiving the offer: ", error);
    }
  );
});

socket.on("connect", function(data) {
  console.log(data);
  socket.emit("my event", {
    user_name: "user_name",
    message: "user_input"
  });
});
//
socket.on("answer", function(data) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});

//
socket.on("candidate", function(data) {
  peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  console.log("ICE Candidate added.");
});

//Establishing a connection with an other peer and creating an offer.
btn_req.addEventListener("click", function() {
  var dataChannelOptions = {
    reliable: true
  };
  dataChannel = peerConnection.createDataChannel(
    "dataChannel1",
    dataChannelOptions
  );
  openDataChannel();
  peerConnection.createOffer(
    function(offer) {
      socket.emit("offer", {
        to: friend.value,
        offer: offer
      });

      peerConnection.setLocalDescription(offer);
    },
    function(error) {
      console.log("Error: ", error);
    }
  );
});

//Sending message to remote peer
btn_send.addEventListener("click", function(event) {
  var val = message.value;
  chat.innerHTML +=
    `<div class="output"><p> <strong>` +
    message.value +
    `</strong> </p> </div>`;
  dataChannel.send(val);
  message.value = "";
  chat.scrollTop = chat.scrollHeight - chat.clientHeight;
});

//When we are receiving an offer from a remote peer

//Changes the remote description associated with the connection
function onAnswer(answer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

//Adding new ICE candidate
function onCandidate(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  console.log("ICE Candidate added.");
}

//DataChannel callbacks definitions
function openDataChannel() {
  dataChannel.onerror = function(error) {
    console.log("Error on data channel:", error);
  };

  dataChannel.onmessage = function(event) {
    console.log("Message received:", event.data);
    chat.innerHTML +=
      `<div class="feedback"><p> <strong>` +
      event.data +
      `</strong> </p> </div>`;
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  };

  dataChannel.onopen = function() {
    console.log("Channel established.");
  };

  dataChannel.onclose = function() {
    console.log("Channel closed.");
  };
}
function enterEV(event) {
  if (event.which == 13 || event.keyCode == 13) {
    btn_send.click();
    return false;
  }
  return true;
}
