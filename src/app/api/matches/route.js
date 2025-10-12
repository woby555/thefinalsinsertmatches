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
      arena_name,
      sub_gamemode_name,
      specialization_name,
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

    // 3️⃣ Primary weapon validation (optional)
    if (primary_weapon_name) {
      // find the weapon by name and type
      const weapon = await prisma.equipments.findFirst({
        where: { name: primary_weapon_name, equipment_type: "weapon" },
      });
      if (!weapon)
        throw new Error(`Weapon "${primary_weapon_name}" not found`);

      // check if the weapon exists in the loadout
      const weaponExists = await prisma.loadout_equipments.findFirst({
        where: {
          loadout_id: loadout.id,
          equipment_id: weapon.id,
        },
      });
      if (!weaponExists)
        throw new Error(
          `Weapon "${primary_weapon_name}" not found in loadout "${loadout_name}" for character "${character_name}"`
        );
    }

    // 4️⃣ Insert match
    const match = await prisma.matches.create({
      data: {
        character_id: character.id,
        loadout_id: loadout.id,
        gamemode_id: 2, // World Tour
        sub_gamemode_id: null, // optional, adjust if you implement sub-gamemode
        specialization_id: null, // optional
        won,
        progression_points: parseInt(progression_points) || 0,
        kills: parseInt(kills) || 0,
        assists: parseInt(assists) || 0,
        deaths: parseInt(deaths) || 0,
        arena_id: null, // optional, you can resolve arena_name here if needed
        primary_weapon_id: primary_weapon_name
          ? (await prisma.equipments.findFirst({ where: { name: primary_weapon_name } })).id
          : null,
      },
    });

    return new Response(JSON.stringify(match), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}