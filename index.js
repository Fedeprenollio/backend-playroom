const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

const cors = require("cors");
const PORT = process.env.PORT || 3000; // Obtener el puerto de la variable de entorno o usar el puerto 3000 como valor predeterminado
console.log(process.env.PORT);
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

// Habilitar CORS
app.use(cors());

// Ruta para unirse a una sala de chat privada

app.get("/hola", (req, res) => {
  res.send("hola si si");
});

function getMemberNames(code) {
  // Obtener todos los sockets en la sala
  const roomSockets = io.sockets.adapter.rooms.get(code);
  const memberNames = [];

  // Iterar sobre los sockets en la sala y obtener los nombres de los miembros
  roomSockets?.forEach((_, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    const memberName = socket.data.name; // Suponiendo que el nombre esté almacenado en la propiedad "name" del socket
    const memberStatus = socket.data.status;
    const memberSymbol = socket.data.symbol;
    const gameSetting = socket.data.setting;
    const ready = socket.data.ready;

    memberNames.push({
      id: socket.id,
      name: memberName,
      status: memberStatus,
      symbol: memberSymbol,
      gameSetting,
      ready
    });
  });

  return memberNames;
}

function getMemberStatus(code, puesto) {
  // Obtener todos los sockets en la sala
  const roomSockets = io.sockets.adapter.rooms.get(code);
  const memberStatus = [];

  // Iterar sobre los sockets en la sala y obtener los nombres de los miembros
  roomSockets?.forEach((_, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    console.log("DATA", socket.data);
    const memberStatus = socket.data.status; // Suponiendo que el nombre esté almacenado en la propiedad "name" del socket
    memberStatus?.push({ id: socket.id, status: status });
  });

  return memberStatus;
}

// Manejar conexiones de sockets
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Obtener el código de sala de la URL
  const code = socket.handshake.query.code;

  // Unirse a la sala correspondiente
  socket.join(code);

  // Manejar evento de chat (OPCIONES DE SELECCION DE FICHA) TODO: CAMBIAR EL NOMBRE POR UNO MAS ACORDE
  socket.on("chat message", (message) => {
    // Enviar el mensaje a todos los usuarios en la sala
    io.to(code).emit("chat message", message);
  });
  // Manejar evento de chat :
  socket.on("only chat", (mnjs) => {
    io.to(code).emit("only chat", mnjs);
  });

  // ------ VER EL TAMAÑO DEL socket para ver si ingresó el compañero
  io.to(code).emit("roomSize", io.sockets.adapter.rooms.get(code).size);

  //obtengo los nombres de los de la sala::::
  // Manejar evento de unirse al chat y ver los nombres
  socket.on("joinChat", (memberName) => {
    // Asociar el nombre del miembro al socket
    socket.data.name = memberName;

    // Obtener el código de sala de la URL
    const code = socket.handshake.query.code;

    // Unirse a la sala correspondiente
    socket.join(code);
    const roomSize = io.sockets.adapter.rooms.get(code).size; // Obtener el tamaño de la sala

    // Obtener la lista de nombres de los miembros en la sala
    // const memberNames = getMemberNames(code);

    // Emitir la lista de nombres de los miembros a todos los sockets en la sala
    // io.to(code).emit('memberNames', memberNames);
    // Emitir el tamaño de la sala a todos los sockets en la sala
    io.to(code).emit("join", roomSize);

    //Manejar estatus de jugador-espectador

    // Cuando un espectador ocupa el lugar de un jugador
    // socket.on("ocuparLugar", (  puesto) => {
    //   console.log("PUESTO", puesto);
    //   memberNames.map(player => {
    //     if(player.id === socket.id){
    //       player.puesto = puesto
    //     }
    //   })
    //   console.log("CAMBIO DE PUESTO", memberNames)
    //   io.to(code).emit("ocuparLugar",memberNames )
    // });

    socket.on("ocuparLugar", (status) => {
      socket.data.status = status;
    });

    socket.on("selectSymbol", (symbol) => {
      socket.data.symbol = symbol;
    });

    socket.on("gameSetting", (setting) => {
      socket.data.setting = setting;
      io.to(code).emit("gameSetting", setting);
    });

    socket.on("areYouReady", (ready) => {
      socket.data.ready = ready;
    });

    socket.on("timerSetting", (timer) => {
      io.to(code).emit("timerSetting", timer);
    });

    const memberNames = getMemberNames(code);
    io.to(code).emit("memberNames", memberNames);

    console.log("LISTA", memberNames);
  });

  //------ envio de se la seleccion de la ficha
  // En el evento de selección del símbolo del jugador 1
  // Evento de selección de símbolo del jugador 1
  socket.on("player1SymbolSelected", (selectedSymbol) => {
    player1Symbol = selectedSymbol;
    // Emite el símbolo seleccionado al jugador 2
    io.emit("player1SymbolSelected", selectedSymbol);
  });

  // Evento de selección de símbolo del jugador 2
  socket.on("player2SymbolSelected", (selectedSymbol) => {
    // Realiza cualquier acción necesaria con el símbolo seleccionado por el jugador 2
  });

  // Manejar desconexión del socket
  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado!!!!");

    //     // Eliminar el nombre del integrante cuando se desconecta

    //     // Emitir el evento "memberNames" a todos los sockets en la sala con la lista actualizada de nombres
    //     // io.to(code).emit("memberNames", Object.values(memberNames));
    //  // Verificar si la sala existe
    // //  const room = io.sockets.adapter.rooms.get(code);
    // //  if(room){

    // //    const connectedSockets = Array.from(io.sockets.adapter.rooms.get(code));
    // //   console.log("CON:", connectedSockets)
    // //     // Emitir el evento "memberNames" solo a los sockets conectados en la sala
    // //             connectedSockets.forEach((connectedSocketId) => {
    // //               const connectedSocket = io.sockets.sockets.get(connectedSocketId);
    // //               connectedSocket.emit("memberNames", Object.values(memberNames));
    // //             });
    // //  }

    //   // Obtener el nombre del integrante que se desconecta
    //   console.log("DISCONEFT",memberNames,"---" ,socket.id)
    //   const disconnectedMemberName = memberNames[socket.id];
    //   // Eliminar el nombre del integrante cuando se desconecta
    //   delete memberNames[socket.id];

    //   // Emitir el evento "memberNames" a todos los sockets en la sala con la lista actualizada de nombres
    //   io.to(code).emit("memberNames", Object.values(memberNames));

    //   // Si deseas también notificar al socket desconectado sobre su propio nombre
    //   socket.emit("memberName", disconnectedMemberName);
    // Obtener el nombre del integrante que se desconecta
    // Obtener el nombre del integrante que se desconecta
    // Obtener el nombre del integrante que se desconecta
    // Obtener el código de sala de la URL
    const code = socket.handshake.query.code;

    // Obtener la lista de nombres de los miembros en la sala
    const memberNames = getMemberNames(code);

    // Emitir el evento "memberNames" a todos los sockets en la sala con la lista actualizada de nombres
    io.to(code).emit("memberNames", memberNames);
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log("Servidor en ejecución en el puerto", PORT);
});
