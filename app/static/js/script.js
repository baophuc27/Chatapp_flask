// var username = document.getElementById("userName"),
//   btn_login = document.getElementById("login"),
//   friend = document.getElementById("friendName"),
//   btn_req = document.getElementById("request"),
//   message = document.getElementById("message"),
//   btn_send = document.getElementById("send"),
//   chat = document.getElementById("chat-window"),
//   feedback = document.getElementById("feedback");

var numConnnection = 0;
var connection = [];
myname = "";
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
        "turn:ss-turn2.xirsys.com:3478?transport=tcp"
      ]
    }
  ]
};

serverAddr = "10.20.72.51";
serverPort = "";
socket = new WebSocket("ws:" + serverAddr + ":" + serverPort);
socket.onopen = function(e) {
  console.log(e.data);
};
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

btn_req.addEventListener("click", function() {});
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

function handleMessage(pc, data) {
  switch (data.type) {
    case "message":
      console.log(data.content);
      break;
    case "connect":
      username.innerText = data.id;
      break;
    case "offer":
      pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      pc.createAnswer(
        function(answer) {
          pc.setLocalDescription(answer);
          socket.send(
            JSON.stringify({
              type: "answer",
              username: data.from,
              answer: answer
            })
          );
        },
        function(error) {
          console.log("Error on receiving the offer: ", error);
        }
      );
      break;
    case "answer":
      pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      break;
    case "candidate":
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log("ICE Candidate added.");
      break;
    default:
      break;
  }
}

function openDataChannel(dc) {
  dc.onerror = function(error) {
    console.log("Error on data channel:", error);
  };

  dc.onmessage = function(event) {
    console.log("Message received:", event.data);
    chat.innerHTML +=
      `<div class="feedback"><p> <strong>` +
      event.data +
      `</strong> </p> </div>`;
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  };

  dc.onopen = function() {
    console.log("Channel established.");
  };

  dc.onclose = function() {
    console.log("Channel closed.");
  };
}
function enterEV() {
  if (event.which == 13 || event.keyCode == 13) {
    btn_send.click();
    return false;
  }
  return true;
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
function ask(name) {
  numConnnection++;
  gotoChat();
  var peerConnection, dataChannel;
  conn = {
    id: numConnnection,
    peerConnection: peerConnection,
    dataChannel: dataChannel,
    username: name
  };
  connection.push(conn);
  connection[numConnnection - 1].peerConnection = new RTCPeerConnection(
    configuration
  );
  //Definition of the data channel
  var dataChannelOptions = {
    reliable: true
  };
  connection[numConnnection - 1].dataChannel = connection[
    numConnnection - 1
  ].peerConnection.createDataChannel(
    "dataChannel" + numConnnection,
    dataChannelOptions
  );
  openDataChannel(dataChannel);
  peerConnection.createOffer(
    function(offer) {
      socket.send(
        JSON.stringify({
          type: "offer",
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
    dataChannel = ev.channel;
    openDataChannel();
  };
  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      socket.send(
        JSON.stringify({
          type: "candidate",
          username: name,
          candidate: event.candidate
        })
      );
    }
  };
}
