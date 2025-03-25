const WebSocket = require("ws");

const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/chat";

console.log("Testing WebSocket connection to:", wsUrl);

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("WebSocket connection established");

  // Send a test message
  const testMessage = {
    type: "chat",
    message: "Test message from client",
  };

  console.log("Sending test message:", testMessage);
  ws.send(JSON.stringify(testMessage));
});

ws.on("message", (data) => {
  console.log("Received message:", data.toString());
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", (code, reason) => {
  console.log("WebSocket closed:", code, reason);
});

// Close connection after 5 seconds
setTimeout(() => {
  console.log("Closing WebSocket connection...");
  ws.close();
}, 5000);
