import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const characters = await prisma.characters.findMany({
      include: {
        loadouts: true, // include loadouts only
      },
    });

    return new Response(JSON.stringify(characters), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(req) {

  const localDate = new Date();
const offsetMs = localDate.getTimezoneOffset() * 60000; // convert min → ms
const localISOTime = new Date(localDate.getTime() - offsetMs).toISOString().slice(0, 19).replace('T', ' ');

  try {
    const body = await req.json();
    const {
      character_name,
      loadout_name,
      primary_weapon_name,
      won,
      progression_points,
      kills,
      assists,
      deaths,
      revives,
      arena_id, // <-- frontend now sends arena_id
      sub_gamemode_name,
      specialization_name,
      damage,
      support,
      objective,
    } = body;

    // 1️⃣ Character lookup
    const character = await prisma.characters.findFirst({
      where: { name: character_name },
    });
    if (!character)
      throw new Error(`Character "${character_name}" not found`);

    // 2️⃣ Loadout lookup
    const loadout = await prisma.loadouts.findFirst({
      where: {
        character_id: character.id,
        loadout_name: loadout_name || undefined,
      },
    });
    if (!loadout)
      throw new Error(
        `Loadout "${loadout_name}" not found for character "${character_name}"`
      );

    // 3️⃣ Arena lookup (optional) — simplified
    let arenaId = null;
    if (arena_id) {
      const arena = await prisma.arenas.findUnique({
        where: { id: parseInt(arena_id) },
      });
      if (!arena)
        throw new Error(`Arena with ID "${arena_id}" not found`);
      arenaId = arena.id;
    }

    // 4️⃣ Specialization lookup (optional)
    let specializationId = null;
    if (specialization_name && specialization_name.trim() !== "") {
      const specialization = await prisma.specializations.findFirst({
        where: { specialization_name },
      });
      if (!specialization)
        throw new Error(`Specialization "${specialization_name}" not found`);
      specializationId = specialization.id;
    }

    // 5️⃣ Primary weapon validation (optional)
    let primaryWeaponId = null;
    if (primary_weapon_name) {
      const weapon = await prisma.equipments.findFirst({
        where: { name: primary_weapon_name, equipment_type: "weapon" },
      });
      if (!weapon)
        throw new Error(`Weapon "${primary_weapon_name}" not found`);

      const weaponExists = await prisma.loadout_equipments.findFirst({
        where: {
          loadout_id: loadout.id,
          equipment_id: weapon.id,
        },
      });
      if (!weaponExists)
        throw new Error(
          `Weapon "${primary_weapon_name}" not found in loadout "${loadout_name}" for "${character_name}"`
        );

      primaryWeaponId = weapon.id;
    }

    // 6️⃣ Create the match record
    const match = await prisma.matches.create({
      data: {
        character_id: character.id,
        loadout_id: loadout.id,
        gamemode_id: 2, // World Tour, static
        sub_gamemode_id: null, // implement later if needed
        specialization_id: specializationId,
        won,
        progression_points: parseInt(progression_points) || 0,
        kills: parseInt(kills) || 0,
        assists: parseInt(assists) || 0,
        deaths: parseInt(deaths) || 0,
        revives: parseInt(revives) || 0,
        damage_score: parseInt(damage) || 0,
        support_score: parseInt(support) || 0,
        objective_score: parseInt(objective) || 0,
        arena_id: arenaId, // <-- now comes from dropdown
        primary_weapon_id: primaryWeaponId,
      },
    });

    return new Response(JSON.stringify(match), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
