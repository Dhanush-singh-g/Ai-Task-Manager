import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})
const User= mongoose.model("User",userSchema) || mongoose.models.User;
export default User;
//here dont do module.exports = User; use export default because that is ES6 syntax which is used in Next.js if we do 
//module.exports = User; it will give error like "SyntaxError: Unexpected token 'export'" that is commonJS syntax