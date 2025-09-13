const socket = io();

socket.on("connect", () => {
  console.log(" Connected to server:", socket.id);
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("chat message", {
        text: input.value,
        userId: socket.id,
        Date: new Date().toLocaleString()
      });
      input.value = "";
    }
  });
  

  socket.on("chat message", (msg) => {
    const item = document.createElement("li");
    item.textContent = `${msg.text}  (${msg.Date})`;
  
    if (msg.userId === socket.id) {
      item.classList.add("chat", "bubble", "right");
    } else {
      item.classList.add("chat", "bubble", "left");
    }
  
    messages.appendChild(item);
  });
  
  
socket.on('user joined', (userId) => {
    
    const item = document.createElement('li');
    item.textContent = `User ${userId } joined the Chat!`;
    item.classList.add('userJoined');
    messages.appendChild(item);
})

socket.on('user left', (userId) => {
    const item = document.createElement('li');
    item.textContent = `User ${userId} left the Chat!`;
    item.classList.add('userLeft');
    item.style.backgroundColor = 'gray';
    messages.appendChild(item);
});
