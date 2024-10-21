// src/services/websocketService.js
export class WebSocketService {
  constructor(url) {
    this.url = url;  // WebSocket server URL
    this.socket = null;  // WebSocket object
    this.reconnectInterval = 5000;  // Time in milliseconds to wait before attempting to reconnect
    this.isConnected = false;  // Connection status flag
    this.shouldReconnect = true;  // Control flag for reconnection attempts
  }

  // Method to initiate the WebSocket connection
  connect() {
    this.socket = new WebSocket(this.url);

    // Event handler when the WebSocket connection opens
    this.socket.onopen = () => {
      console.log("WebSocket connection opened");
      this.isConnected = true;  // Set the connection status flag to true
    };

    // Event handler for receiving messages through the WebSocket
    this.socket.onmessage = (event) => {
      console.log("Message received:", event.data);
      // Here, you might want to handle incoming data or pass it to a handler function
    };

    // Event handler for any errors that occur on the WebSocket
    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Event handler for when the WebSocket connection is closed
    this.socket.onclose = () => {
      console.log("WebSocket connection closed");
      this.isConnected = false;  // Update connection status
      // Check if automatic reconnection should be attempted
      if (this.shouldReconnect) {
        console.log("Attempting to reconnect...");
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval);
      }
    };
  }

  // Method to send a message through the WebSocket
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);  // Send the message if the socket is open
    } else {
      console.log("WebSocket is not open");
    }
  }

  // Method to close the WebSocket connection
  close() {
    this.shouldReconnect = false;  // Update flag to prevent reconnection
    if (this.socket) {
      this.socket.close();
    }
  }
}
