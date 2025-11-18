import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const class_name = searchParams.get("class_name");

    if (!class_name) {
      return new Response(
        JSON.stringify({ error: "Missing class_name parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch class-specific equipment
    const cls = await prisma.classes.findUnique({
      where: { class_name },
      include: {
        class_equipments: {
          include: {
            equipments: {
              select: { id: true, name: true, equipment_type: true },
            },
          },
        },
      },
    });

    if (!cls) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const classSpecific = await prisma.class_equipments.findMany({
      where: { class_id: cls.id },
      include: {
        equipments: true,
      },
    });

    // Global equipment = equipment that has no entries in class_equipments at all
    const globalEquipments = await prisma.equipments.findMany({
      where: {
        class_equipments: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        equipment_type: true,
      },
    });

    const allowedEquipments = [
      ...classSpecific.map((ce) => ce.equipments),
      ...globalEquipments,
    ];

    return new Response(JSON.stringify(allowedEquipments), { status: 200 });
  } catch (error) {
    console.error("Error fetching class equipments:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
