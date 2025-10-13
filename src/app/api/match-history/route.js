import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const matches = await prisma.matches.findMany({
      orderBy: { id: "desc" },

      include: {
        characters: { select: { name: true } },
        loadouts: { select: { loadout_name: true } },
        specializations: { select: { specialization_name: true } },
        arenas: { select: { arena_name: true } },
        equipments: { select: { name: true } },
      },
    });

    const formatted = matches.map((m) => ({
      id: m.id,
      name: m.characters.name,
      loadout_name: m.loadouts.loadout_name,
      primary_weapon: m.equipments?.name || null,
      specialization_name: m.specializations?.specialization_name || null,
      won: m.won,
      progression_points: m.progression_points,
      kills: m.kills,
      assists: m.assists,
      deaths: m.deaths,
      revives: m.revives,
      damage_score: m.damage_score,
      support_score: m.support_score,
      objective_score: m.objective_score,
      arena_name: m.arenas?.arena_name || null,
      match_date: m.match_date,
      kd_ratio: m.deaths === 0 ? m.kills : +(m.kills / m.deaths).toFixed(3),
    }));

    return new Response(JSON.stringify(formatted), {
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
