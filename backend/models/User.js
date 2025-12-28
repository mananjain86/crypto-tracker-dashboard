const {Schema,model} = require("mongoose");

const UserSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password:{
        type:String,
        required:true
    },
    watchlist: [{ 
        type: String 
    }]
});

const UserModel = model("User", UserSchema)
  
module.exports = UserModel;