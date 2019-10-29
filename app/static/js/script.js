var username = document.getElementById("myname");
//   btn_login = document.getElementById("login"),
// friend = document.getElementById("friendName"),
var message = document.getElementById("message"),
  btn_send = document.getElementById("send"),
  chat = document.getElementById("chat");
//   feedback = document.getElementById("feedback");

var numConnnection = 0;
var connection = [];
myname = "myna" + (Math.floor(Math.random() * 10) % 4);
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

serverAddr = "192.168.40.127";
serverPort = "4200";
socket = new WebSocket("ws:" + serverAddr + ":" + serverPort);
socket.onopen = function(e) {
  socket.send(JSON.stringify({ username: myname }));
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

function handleMessage(data) {
  switch (data.type) {
    case "message":
      console.log(data.content);
      break;
    case "connect":
      username.innerText = data.from;
      break;
    case "offer":
      console.log(data);
      numConnnection++;
      gotoChat();
      var peerConnection, dataChannel;
      conn = {
        id: numConnnection,
        peerConnection: peerConnection,
        dataChannel: dataChannel,
        username: data.from
      };
      connection.push(conn);
      peerConnection = connection[
        numConnnection - 1
      ].peerConnection = new RTCPeerConnection(configuration);
      //tạo data channel
      var dataChannelOptions = {
        reliable: true
      };
      dataChannel = connection[
        numConnnection - 1
      ].dataChannel = peerConnection.createDataChannel(
        "dataChannel" + numConnnection,
        dataChannelOptions
      );

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
      pc = findPC(data.from);
      console.log(pc);
      if (pc) pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      break;
    case "candidate":
      console.log(connection, data);
      pc = findPC(data.from);
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e =>
          console.error(e)
        );
        console.log("ICE Candidate added.");
      } else {
        console.log("not found user");
      }
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
      `<div class="message-left message"><p>` + event.data + `</p></div>`;
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  };

  dc.onopen = function() {
    console.log("Channel established.");
  };

  dc.onclose = function() {
    console.log("Channel closed.");
  };
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
  peerConnection = connection[
    numConnnection - 1
  ].peerConnection = new RTCPeerConnection(configuration);
  //tạo data channel
  var dataChannelOptions = {
    reliable: true
  };
  dataChannel = connection[
    numConnnection - 1
  ].dataChannel = peerConnection.createDataChannel(
    "dataChannel" + numConnnection,
    dataChannelOptions
  );

  openDataChannel(dataChannel);
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
    dataChannel = ev.channel;
    openDataChannel(dataChannel);
  };
  peerConnection.onicecandidate = function(event) {
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

// chat
btn_send.addEventListener("click", function(event) {
  var val = message.value;
  if (val) {
    chat.innerHTML +=
      `<div class="message-right message"><p>` + val + `</p></div>`;
    message.value = "";
    currentDC = connection[0].dataChannel;
    currentDC.send(val);
  }
  chat.scrollTop = chat.scrollHeight - chat.clientHeight;
});
// giao diện
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

function findPC(name) {
  for (let i = 0; i < connection.length; i++) {
    if (connection[i].username == name) {
      return connection[i].peerConnection;
    }
    return null;
  }
}
