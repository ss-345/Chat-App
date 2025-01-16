import socket from "socket.io-client";

let socketInstances = null;

export const initializeSocket = (projectId) => {
  socketInstances = socket(import.meta.env.VITE_BACKEND_API, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });
  return socketInstances;
};

export const reciveMessage = (eventName, cb) => {
  socketInstances.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  socketInstances.emit(eventName, data);
};
