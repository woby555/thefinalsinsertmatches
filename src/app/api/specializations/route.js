import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");

  if (!characterId) return new Response(JSON.stringify([]), { status: 200 });

  // First, get the character including its class
  const character = await prisma.characters.findUnique({
    where: { id: parseInt(characterId) },
    include: { classes: true }, // adjust based on your schema
  });

  if (!character || !character.classes) return new Response(JSON.stringify([]), { status: 200 });

  // Fetch specializations for that class
  const specs = await prisma.specializations.findMany({
    where: { class_id: character.classes.id },
  });

  return new Response(JSON.stringify(specs), { status: 200 });
}