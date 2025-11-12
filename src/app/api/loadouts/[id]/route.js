import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(req, context) {
  const resolvedContext = await context;
  const id = Number(resolvedContext.params.id);

  try {
    const body = await req.json();
    const { loadout_name, equipments } = body;

    if (!equipments || !Array.isArray(equipments)) {
      return new Response(JSON.stringify({ error: "Invalid equipment data" }), { status: 400 });
    }

    const updatedLoadout = await prisma.loadouts.update({
      where: { id },
      data: {
        loadout_name,
        loadout_equipments: {
          deleteMany: {},
          create: equipments.map((eq, index) => ({
            slot_number: index,
            equipments: {
              connect: { id: eq.equipment_id }, // ✅ must be numeric ID
            },
          })),
        },
      },
      include: {
        loadout_equipments: { include: { equipments: true } },
      },
    });

    return new Response(JSON.stringify(updatedLoadout), { status: 200 });
  } catch (error) {
    console.error("Error updating loadout:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
