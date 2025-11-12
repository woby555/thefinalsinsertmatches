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

    if (!cls)
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    const allowedEquipments = cls.class_equipments.map((ce) => ce.equipments);

    return new Response(JSON.stringify(allowedEquipments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching class equipments:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
