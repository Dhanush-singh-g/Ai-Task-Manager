import prisma from "@/lib/prisma";
import { NextResponse,NextRequest } from "next/server";;


export async function POST(){
    try{
        const tasks = await prisma.task.findMany({
            where:{completed:false},
            orderBy:{deadline:'asc'},
        });

        //prepare for AI
        const  formattedTasks = tasks.map(task=>({
            id:task.id,
            type:task.type,
            description:task.description,
            deadline:task.deadline,
        }))

        const response = await fetch('https://ai-microservice-zkb9.onrender.com/ai/plan',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({tasks:formattedTasks})
        })

        if(!response.ok){
            throw new Error('Failed to get AI plan');
        }
        const roadmap = await response.json();

        //return roadmap to frontend 
        return NextResponse.json(roadmap);
    }catch(error){
        return NextResponse.json(
            {message:'Error generating AI plan'},
            {status:500}
        );
    }
}