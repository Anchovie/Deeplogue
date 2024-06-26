const captions = window.document.getElementById("captions");

async function getMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
  } catch (error) {
      alert("Error accessing microphone");
    console.error("Error accessing microphone:", error);
    throw error;
  }
}

async function openMicrophone(microphone, socket) {
    alert("Oopening microphone");
  return new Promise((resolve) => {
    microphone.onstart = () => {
      console.log("WebSocket connection opened");
      document.body.classList.add("recording");
      resolve();
    };

    microphone.onstop = () => {
      console.log("WebSocket connection closed");
      document.body.classList.remove("recording");
    };

    microphone.ondataavailable = (event) => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    microphone.start(1000);
  });
}

async function closeMicrophone(microphone) {
  microphone.stop();
}

async function start(socket) {
  alert("waiting for click"); // EI TOIMI MOBIILIS
  const listenButton = document.querySelector("#record");
  let microphone;

  console.log("client: waiting to open microphone");


  listenButton.addEventListener("click", async () => {
      alert("click!");
    if (!microphone) {
      try {
        microphone = await getMicrophone();
        await openMicrophone(microphone, socket);
      } catch (error) {
        console.error("Error opening microphone:", error);
      }
    } else {
      await closeMicrophone(microphone);
      microphone = undefined;
    }
  });
}

window.addEventListener("load", () => {
  const socket = new WebSocket("ws://localhost:3000");
  alert("load");
  socket.addEventListener("open", async () => {
      alert("socket opened");
    console.log("WebSocket connection opened");
    await start(socket);
  });

  socket.addEventListener("message", (event) => {
      alert("message");
    const data = JSON.parse(event.data);
    if (data.channel.alternatives[0].transcript !== "") {
      navigator.vibrate([100, 30, 100]);
      captions.innerHTML = data
        ? `<span>${data.channel.alternatives[0].transcript}</span>`
        : "";
    }
  });

  socket.addEventListener("close", () => {
    console.log("WebSocket connection closed");
  });
});
