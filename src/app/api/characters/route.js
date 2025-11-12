import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET all characters (with class + loadouts)
export async function GET() {
  try {
    const characters = await prisma.characters.findMany({
      include: {
        classes: true, // brings in class_name via relation
        loadouts: {
          include: {
            loadout_equipments: {
              include: { equipments: true },
            },
          },
        },
      },
    });

    // 🔧 Transform for cleaner frontend consumption
    const formatted = characters.map((c) => ({
      id: c.id,
      name: c.name,
      class_name: c.classes?.class_name || null,
      loadouts: c.loadouts.map((l) => ({
        id: l.id,
        loadout_name: l.loadout_name,
        equipments: l.loadout_equipments.map((le) => ({
          id: le.equipments?.id,
          name: le.equipments?.name,
          type: le.equipments?.equipment_type,
        })),
      })),
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST create a new character
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, class_name } = body;

    if (!name || !class_name)
      throw new Error("Both 'name' and 'class_name' are required");

    // Find the class
    const foundClass = await prisma.classes.findFirst({
      where: { class_name },
    });
    if (!foundClass)
      throw new Error(`Class "${class_name}" not found`);

    // Create new character
    const newCharacter = await prisma.characters.create({
      data: {
        name,
        class_id: foundClass.id,
      },
    });

    return new Response(JSON.stringify(newCharacter), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating character:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
