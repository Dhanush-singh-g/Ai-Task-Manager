"use client"
import { useState } from "react";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");


  function Reset(e: React.FormEvent){
    e.preventDefault();
    setEmail("");
    setPassword("");
  }

  async function Register(e: React.FormEvent){
    e.preventDefault()
    console.log("Email:",email);
    console.log("Password:",password);
    //use only relative path while fetching api in nextjs
    //why? because nextjs automatically adds the base url
    const res = await fetch("/api/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({email,password})
    })
    const data = await res.json();
    if(res.ok){
      
      console.log("User registered successfully",data);
    }else{
      
      alert(data.message);
    }
    console.log("DB:", process.env.DATABASE_URL);
  }

  async function Login(e: React.FormEvent){
    e.preventDefault();
    console.log("email",email);
    console.log("password",password);
    const res = await fetch("/api/Login",{
      method:"POST",
      headers:{
        "Content-type":"application/json",
      },
      body:JSON.stringify({email,password})
    })

    const data = await res.json();
    if(res.ok){
      console.log("Login successful",data);
      router.push("/home");
    }else{
      alert(data.message);
    } 
  }

  return (  
    <>
      <div>

        <h1 className="text-3xl font-extrabold mb-6 text-center text-black bg-yellow-100 p-5">AI Task Manager</h1>
        <div className="text-black flex flex-col items-center justify-center">

          <div className="p-6 rounded-lg shadow-md bg-gray-100 w-96 h-70">
            <h3 className="font-bold text-center text-2xl">Register/Login</h3>
            <form onSubmit={Register} className="flex flex-col space-y-4" action="">
              <span>Email:</span>
              <input type="text"  value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter your email" className=""/>
              <span>Password:</span>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" />
              <div className="flex gap-1">
                <button type="button" onClick={(e)=>Login(e)} className="bg-red-300 w-2xl rounded">Login</button>
                <button type="submit" onClick={(e)=>Register(e)} className="bg-green-300 w-2xl rounded">Register</button>
                <button type="button" onClick={(e)=>Reset(e)} className="bg-red-300 w-2xl rounded">Reset</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
