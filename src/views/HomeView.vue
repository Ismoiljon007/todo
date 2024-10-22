<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect } from "vue";
import { WebSocketService } from "../services/websocketService";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwNDc4NzM4LCJpYXQiOjE3Mjk2MTQ3MzgsImp0aSI6ImVlNWZhODRjMDkyOTQwYTA5ZDAzNjg4ZTYyYjQ1ZmQ2IiwidXNlcl9pZCI6MX0.Q8bG8_GGCbhP-5uWZ62bQbMmRaiRwDj3aao-xmFgA4c"
const socketUrl: string = `wss://a84a-84-54-120-199.ngrok-free.app/ws/schedule/?token=${token}`;
let wsService: WebSocketService;

const users = ref([]);  // Store user data received from WebSocket
const isConnected = ref(false);

onMounted(() => {
  wsService = new WebSocketService(socketUrl);
  wsService.connect();

  // Update connection status
  wsService.socket.onopen = () => {
    isConnected.value = true;
    console.log("WebSocket connection opened");
  };

  // Handle incoming messages and update user data
  wsService.socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'user_info') {
        users.value = data.users;  // Update users list with received data
      }
    } catch (error) {
      console.error("Error parsing incoming WebSocket message:", error);
    }
  };

  wsService.socket.onclose = () => {
    isConnected.value = false;
    console.log("WebSocket connection closed");
  };
  

  // Send initial message after connection
  setTimeout(() => {
    if (isConnected.value) {
      wsService.sendMessage("Hello, server!");
    } else {
      console.log("WebSocket not connected, unable to send message.");
    }
  }, 2000);
});

onBeforeUnmount(() => {
  wsService.close();  // Properly close the WebSocket connection when the component unmounts
});

const allowPermission = (userId) => {
  // Logic to grant permission to the user
  console.log(`Permission granted for user ID: ${userId}`);
  // Optionally, send this information back to the server via WebSocket
  wsService.sendMessage(JSON.stringify({ action: 'approve', prisoner_id: userId, user_id: 1 }));
};
</script>

<template>
  <div
    class="relative overflow-x-auto py-10 bg-white dark:bg-gray-900 shadow-md grow"
  >
    <div class="container mx-auto">
      <div
        class="flex items-center justify-end flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 py-4 bg-white dark:bg-gray-900"
      >
        <div v-if="!isConnected" class="text-red-500">Disconnected</div>
        <div v-if="isConnected" class="text-green-500">Connected</div>
        <label for="table-search" class="sr-only">Search</label>
        <div class="relative">
          <div
            class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="table-search-users"
            class="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for users"
          />
        </div>
      </div>
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="p-4">Name</th>
            <th scope="col" class="px-6 py-3">Data</th>
            <th scope="col" class="px-6 py-3">Status</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
          >

            <td class="px-6 py-4">{{ user.full_name }}</td>
            <td class="px-6 py-4">{{ user.previous_available_date }} - {{ user.next_available_date }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div>
                Active
              </div>
            </td>
            <td class="px-6 py-4">
                <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                @click="allowPermission(user.id)"
              >
                Ruxsat berish
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
