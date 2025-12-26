import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const taskId = Number(id);
  if (isNaN(taskId)) {
    return NextResponse.json(
      { error: "Invalid task id" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const {
      description,
      deadline,
      type,
      completed
    } = body;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(description !== undefined && { description }),
        ...(deadline !== undefined && { deadline: new Date(deadline) }),
        ...(type !== undefined && { type }),
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating task" },
      { status: 500 }
    );
  }
}
