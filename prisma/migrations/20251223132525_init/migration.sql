-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('personal', 'academics', 'self_improvement');

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "type" "TaskType" NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
