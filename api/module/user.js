const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required:true,
    },
    ip_address:{
        type:String,
        required:true,
    },
    system:{
        type:String,
        default : "Windows"
    },
    release:{
        type:String,
        default : "empty"
    },
    version: {
        type:String,
        default : "empty"
    },
    machine : {
        type : String,
        default : "empty"
    },
    online : {
        type : Boolean,
        default : false
    },
    session : {
        type : Number,
        default : 0
    },
    lat : {
        type : Number,
        default : 21.0292
    },
    lng : {
        type : Number,
        default: 105.8526
    },
});

//Export the model
module.exports = mongoose.model('User', userSchema);