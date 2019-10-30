var username = document.getElementById("myname"),
  save = document.getElementById("save");
//   btn_login = document.getElementById("login"),
// friend = document.getElementById("friendName"),
var message = document.getElementById("message"),
  btn_send = document.getElementById("send"),
  chat = document.getElementById("chat"),
  btn_req = document.getElementById("request"),
  friend = document.getElementById("friendName");
//   feedback = document.getElementById("feedback");
// var username = document.getElementById("userName"),
//   btn_login = document.getElementById("login"),
//
//   message = document.getElementById("message"),
var btn_send = document.getElementById("send"),
  chat = document.getElementById("chat-window"),
  feedback = document.getElementById("feedback");

var peerConnection, dataChannel;
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

peerConnection = new RTCPeerConnection(configuration);

//Definition of the data channel
peerConnection.ondatachannel = function(ev) {
  dataChannel = ev.channel;
  openDataChannel();
};
serverAddr = "10.228.190.104";
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
    socket.send("ssss");
  }
};
socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};

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
      socket.send(
        JSON.stringify({
          type: "offer",
          username: friend.value,
          offer: offer
        })
      );

      peerConnection.setLocalDescription(offer);
    },
    function(error) {
      console.log("Error: ", error);
    }
  );
});
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
peerConnection.onicecandidate = function(event) {
  if (event.candidate) {
    socket.send(
      JSON.stringify({
        type: "candidate",
        username: friend.value,
        candidate: event.candidate
      })
    );
  }
};
function handleMessage(data) {
  switch (data.type) {
    case "message":
      console.log(data.content);
      break;
    case "connect":
      username.innerText = data.id;
      break;
    case "offer":
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      peerConnection.createAnswer(
        function(answer) {
          peerConnection.setLocalDescription(answer);
          socket.send(
            JSON.stringify({
              type: "answer",
              from: myname,
              username: friend.value,
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
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      break;
    case "candidate":
      peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log("ICE Candidate added.");
      break;
    default:
      break;
  }
}

function openDataChannel() {
  dataChannel.onerror = function(error) {
    console.log("Error on data channel:", error);
  };

  dataChannel.onmessage = function(event) {
    var link;
    console.log("Message received:", event.data);
    if (typeof event.data !== "string") {
      var blob = event.data;
      link = URL.createObjectURL(blob);
      chat.innerHTML +=
        `<div class="feedback"><p> <strong> <a href=" ` +
        link +
        ` " >received a file</a></strong> </p> </div>`;
    } else {
      chat.innerHTML +=
        `<div class="feedback"><p> <strong>` +
        event.data.name +
        `</strong> </p> </div>`;
    }
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  };

  dataChannel.onopen = function() {
    console.log("Channel established.");
  };

  dataChannel.onclose = function() {
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
function saveName() {
  myname = document.getElementById("myname").value;
  socket.send(JSON.stringify({ username: myname }));
}

document.querySelector("input[type=file]").onchange = function() {
  var file = this.files[0];
  dataChannel.send(file);
};
