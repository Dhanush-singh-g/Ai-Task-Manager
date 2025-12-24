// Why lib folder?
// Next.js uses:
// app/ → pages & UI
// lib/ → backend helpers (database, utils, services)
// models/ → MongoDB schemas
import mongoose from "mongoose";
export async function connectDB(){
    try{   
        if(mongoose.connections[0].readyState){
            console.log("Already connected to MongoDB");
            return;
        }
        
        const con = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB:", con.connection.host);
    }catch(err){
        console.log("MongoDB connection error", err);
    }

}