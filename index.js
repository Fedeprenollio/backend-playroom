const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const cors = require('cors');
const PORT = process.env.PORT || 3000; // Obtener el puerto de la variable de entorno o usar el puerto 3000 como valor predeterminado
console.log(process.env.PORT)
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// Habilitar CORS
app.use(cors());  

// Ruta para unirse a una sala de chat privada

// Manejar conexiones de sockets
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Obtener el código de sala de la URL
  const code = socket.handshake.query.code;

  // Unirse a la sala correspondiente
  socket.join(code);
  console.log(`El usuario se ha unido a la sala: ${code}`);

  // Manejar evento de chat
  socket.on('chat message', (message) => {
    // Enviar el mensaje a todos los usuarios en la sala
    io.to(code).emit('chat message', message);
  });

  // Manejar desconexión del socket
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log('Servidor en ejecución en el puerto',PORT);
});
