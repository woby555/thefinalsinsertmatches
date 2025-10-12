import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const arenas = await prisma.arenas.findMany({
      orderBy: { arena_name: "asc" },
      select: { id: true, arena_name: true },
    });
    return new Response(JSON.stringify(arenas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
