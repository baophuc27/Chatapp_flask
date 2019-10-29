function saveName() {
  myname = document.getElementById("myname").value;
  socket.send(JSON.stringify({ username: myname }));
}

function backtoFront() {
  fp = document.getElementById("frontpage");
  ic = document.getElementById("inchat");
  if (ic.style.display !== "none") {
    ic.style.display = "none";
  }
  fp.style.display = "block";
  return true;
}
function gotoChat() {
  fp = document.getElementById("frontpage");
  ic = document.getElementById("inchat");
  if (fp.style.display !== "none") {
    fp.style.display = "none";
  }
  ic.style.display = "flex";
  return true;
}

var numConnnection = 0;
var connection = [];
var myname;

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
        "turn:ss-turn2.xirsys.com:3478?transport=udp",
        "turn:ss-turn2.xirsys.com:80?transport=tcp",
        "turn:ss-turn2.xirsys.com:3478?transport=tcp"
      ]
    }
  ]
};

serverAddr = "10.20.72.51";
serverPort = "4200";
socket = new WebSocket("ws:" + serverAddr + ":" + serverPort);
socket.onopen = function(e) {};
socket.onmessage = function(event) {
  handleMessage(JSON.parse(event.data));
};
socket.onclose = function(event) {
  if (event.wasClean) {
  } else {
    console.log("close");
  }
};
socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};
function ask(name) {
  gotoChat();
  conn = {
    id: numConnnection,
    peerConnection: peerConnection,
    dataChannel: dataChannel,
    username: name
  };
  connection.push(conn);
  peerConnection = connection[0].peerConnection = new RTCPeerConnection(
    configuration
  );
  //tạo data channel
  var dataChannelOptions = {
    reliable: true
  };
  dataChannel = connection[0].dataChannel = peerConnection.createDataChannel(
    "dataChannel" + numConnnection,
    dataChannelOptions
  );
  dataChannel.onerror = function(error) {
    console.log("Error on data channel:", error);
  };

  dataChannel.onmessage = function(event) {
    console.log("Message received:", event.data);
    chat.innerHTML +=
      `<div class="message-left message"><p>` + event.data + `</p></div>`;
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  };

  dataChannel.onopen = function() {
    console.log("Channel established.");
  };

  dataChannel.onclose = function() {
    console.log("Channel closed.");
  };
  peerConnection.createOffer(
    function(offer) {
      socket.send(
        JSON.stringify({
          type: "offer",
          from: myname,
          username: name,
          offer: offer
        })
      );
      peerConnection.setLocalDescription(offer);
    },
    function(error) {
      console.log("Error: ", error);
    }
  );
  peerConnection.ondatachannel = function(ev) {
    console.log("dac");
    dataChannel = ev.channel;
    openDataChannel(dataChannel);
  };
  peerConnection.onicecandidate = function(event) {
    console.log({
      type: "candidate",
      from: myname,
      username: name,
      candidate: event.candidate
    });
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: "candidate",
          from: myname,
          username: name,
          candidate: event.candidate
        })
      );
    }
  };
}
