import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/** GET — Fetch all loadouts with their related data */
export async function GET() {
  try {
    const loadouts = await prisma.loadouts.findMany({
      include: {
        characters: {
          select: {
            name: true,
            classes: { select: { class_name: true } },
          },
        },
        loadout_equipments: {
          include: {
            equipments: {
              select: { name: true, equipment_type: true },
            },
          },
          orderBy: { slot_number: "asc" },
        },
      },
      orderBy: { id: "desc" },
    });

    const formatted = loadouts.map((l) => ({
      id: l.id,
      loadout_name: l.loadout_name,
      character_name: l.characters?.name || "Unknown",
      class_name: l.characters?.classes?.class_name || "Unknown",
      equipments: l.loadout_equipments.map((le) => ({
        slot_number: le.slot_number,
        equipment_name: le.equipments?.name || "Unknown",
        equipment_type: le.equipments?.equipment_type || "",
      })),
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching loadouts:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch loadouts" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/** POST — Create a new loadout with linked equipments */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      p_character_name,
      p_class_name,
      p_loadout_name,
      p_equipments,
    } = body;

    // Validate inputs
    if (!p_character_name || !p_class_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1️⃣ Find character and validate class consistency
    const character = await prisma.characters.findFirst({
      where: {
        name: p_character_name,
        classes: { class_name: p_class_name },
      },
    });
    if (!character)
      throw new Error(
        `Character "${p_character_name}" with class "${p_class_name}" not found`
      );

    // 2️⃣ Create the new loadout
    const newLoadout = await prisma.loadouts.create({
      data: {
        character_id: character.id,
        loadout_name: p_loadout_name,
      },
    });

    // 3️⃣ Add equipment slots
    if (Array.isArray(p_equipments) && p_equipments.length > 0) {
      for (const eq of p_equipments) {
        const equipment = await prisma.equipments.findFirst({
          where: { name: eq.equipment_name },
        });
        if (!equipment)
          throw new Error(`Equipment "${eq.equipment_name}" not found`);

        await prisma.loadout_equipments.create({
          data: {
            loadout_id: newLoadout.id,
            equipment_id: equipment.id,
            slot_number: eq.slot_number,
          },
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "Loadout created successfully", loadout: newLoadout }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating loadout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
