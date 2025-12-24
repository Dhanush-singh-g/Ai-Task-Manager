import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
//WHy do we sue Promise here because context.params is async in nature so we need to await it
export async function PUT(request: Request, context:{params:Promise<{id:string}>}) {
    const params = await context.params;
    if (isNaN(Number(params.id))) {
        return NextResponse.json(
            { error: "Invalid task id" },
            { status: 400 }
        );
    }   
        try {
            const { completed } = await request.json();
            const updatedTask = await prisma.task.update({
                //below completed is same as completed:completed its just a shorthand notation 
                where: { id: Number(params.id) }, data: { completed }
            });
            return NextResponse.json(updatedTask);
        } catch (error) {
            return NextResponse.json({ message: "Error updating task" }, { status: 500 });
        }
    }