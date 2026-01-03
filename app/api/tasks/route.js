import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all tasks from postgresql
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      //fetch only incomplete tasks
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: error.message },
      { status: 500 }
    );
  }
}

// POST create a new task
export async function POST(req) {
  try {
    const body = await req.json();

    const task = await prisma.task.create({
      data: {
        type: body.type,
        description: body.description,
        deadline: new Date(body.deadline),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task", details: error.message },
      { status: 500 }
    );
  }
}
