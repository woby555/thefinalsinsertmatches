import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET all equipments with type associations
export async function GET() {
  try {
    const equipments = await prisma.equipments.findMany({
      include: {
        weapons: true,
        gadgets: true,
        class_equipments: {
          include: { classes: true },
        },
      },
    });

    return new Response(JSON.stringify(equipments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching equipments:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST create new equipment
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, equipment_type, description, class_names, weapon_type } = body;

    if (!name || !equipment_type)
      throw new Error("Fields 'name' and 'equipment_type' are required");

    // Create base equipment
    const newEquipment = await prisma.equipments.create({
      data: {
        name,
        equipment_type,
        description: description || null,
      },
    });

    // If it's a weapon, register its subtype
    if (equipment_type.toLowerCase() === "weapon" && weapon_type) {
      await prisma.weapons.create({
        data: {
          equipment_id: newEquipment.id,
          weapon_type,
        },
      });
    }

    // If associated classes were provided
    if (Array.isArray(class_names) && class_names.length > 0) {
      for (const className of class_names) {
        const foundClass = await prisma.classes.findFirst({
          where: { class_name: className },
        });

        if (foundClass) {
          await prisma.class_equipments.create({
            data: {
              class_id: foundClass.id,
              equipment_id: newEquipment.id,
            },
          });
        } else {
          console.warn(`⚠️ Class "${className}" not found, skipping association.`);
        }
      }
    }

    const created = await prisma.equipments.findUnique({
      where: { id: newEquipment.id },
      include: {
        weapons: true,
        class_equipments: { include: { classes: true } },
      },
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
