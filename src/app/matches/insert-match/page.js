"use client";
import { useState, useEffect } from "react";
import MatchHistory from "../../components/MatchHistory";
import Link from "next/link";

export default function InsertMatchPage() {
  const [characters, setCharacters] = useState([]);
  const [arenas, setArenas] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedLoadout, setSelectedLoadout] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    primary_weapon_name: "",
    sub_gamemode_name: "",
    specialization_name: "",
    won: false,
    progression_points: 0,
    kills: 0,
    assists: 0,
    deaths: 0,
    revives: 0,
    damage: 0,
    support: 0,
    objective: 0,
    arena_id: "",
  });

  // 🆕 Match history state
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Fetch match history (shared function)
  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const res = await fetch("/api/match-history");
      if (!res.ok) throw new Error("Failed to fetch matches");
      const data = await res.json();
      data.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
      setMatches(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to load match history");
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Fetch characters and arenas
  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then(setCharacters)
      .catch(() => setMessage("Failed to load characters"));
    fetch("/api/arenas")
      .then((res) => res.json())
      .then(setArenas)
      .catch(() => setMessage("Failed to load arenas"));
  }, []);

  const handleCharacterChange = async (e) => {
    const char = characters.find((c) => c.name === e.target.value);
    setSelectedCharacter(char);
    setSelectedLoadout(null);
    setSelectedSpecialization(null);

    try {
      const res = await fetch(`/api/specializations?characterId=${char.id}`);
      const data = await res.json();
      setSpecializations(data);
    } catch {
      setSpecializations([]);
      setMessage("Failed to load specializations");
    }
  };

  const handleLoadoutChange = (e) => {
    const loadout = selectedCharacter.loadouts.find(
      (l) => l.loadout_name === e.target.value
    );
    setSelectedLoadout(loadout);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCharacter || !selectedLoadout) {
      setMessage("Please select a character and a loadout.");
      return;
    }
    if (
      formData.progression_points === null ||
      formData.progression_points === undefined
    ) {
      setMessage("Please select a tournament placement.");
      return;
    }

    setMessage("Submitting...");
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          character_name: selectedCharacter.name,
          loadout_name: selectedLoadout.loadout_name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Match inserted! ID: ${data.id}`);

        // 🧠 Refresh match history dynamically
        await fetchMatches();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage("⚠️ Network or server error");
    }
  };

  const handleClearAll = () => {
  setSelectedCharacter(null);
  setSelectedLoadout(null);
  setSelectedSpecialization(null);

  setFormData({
    primary_weapon_name: "",
    sub_gamemode_name: "",
    specialization_name: "",
    won: false,
    progression_points: 0,
    kills: 0,
    assists: 0,
    deaths: 0,
    revives: 0,
    damage: 0,
    support: 0,
    objective: 0,
    arena_id: "",
  });
};

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        World Tour Matches
      </h1>

      <Link href="/create-loadout" className="btn block btn-secondary mb-6">
        Create New Loadout
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Insert Match Form */}
        <div className="w-full lg:w-1/3 p-6 border rounded-lg shadow bg-[var(--card-bg)]">

                    <button
              type="button"
              onClick={handleClearAll}
              className="btn btn-primary btn-outline w-full"
            >
              Clear All Selections
            </button>
          <h2 className="text-xl font-semibold mb-4">Insert Match</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Character */}
            <select
              onChange={handleCharacterChange}
              className="select select-bordered w-full"
              defaultValue=""
              required>
              <option value="" disabled>
                Select Character
              </option>
              {characters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Loadout */}
            {selectedCharacter && (
              <select
                onChange={handleLoadoutChange}
                className="select select-bordered w-full"
                defaultValue=""
                required>
                <option value="" disabled>
                  Select Loadout
                </option>
                {selectedCharacter.loadouts.map((l) => (
                  <option key={l.id} value={l.loadout_name}>
                    {l.loadout_name}
                  </option>
                ))}
              </select>
            )}

            {/* Specializations */}
            {selectedCharacter && specializations.length > 0 && (
              <select
                onChange={(e) => {
                  const spec = specializations.find(
                    (s) => s.specialization_name === e.target.value
                  );
                  setSelectedSpecialization(spec);
                  setFormData({
                    ...formData,
                    specialization_name: e.target.value,
                  });
                }}
                className="select select-bordered w-full"
                defaultValue=""
                required>
                <option value="" disabled>
                  Select Specialization
                </option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.specialization_name}>
                    {s.specialization_name}
                  </option>
                ))}
              </select>
            )}

            {/* Primary Weapon */}
            {selectedLoadout && (
              <input
                name="primary_weapon_name"
                placeholder="Primary Weapon Name"
                value={formData.primary_weapon_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            )}

            {/* Other fields */}
            <input
              name="sub_gamemode_name"
              placeholder="Sub-Gamemode (optional)"
              value={formData.sub_gamemode_name}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
            {/* <input
          name="specialization_name"
          placeholder="Specialization"
          value={formData.specialization_name}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        /> */}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="won"
                checked={formData.won}
                onChange={handleChange}
              />
              Won Match?
            </label>

            {/* Tournament Placement */}
            <div className="mt-6">
              <label className="font-semibold mb-3 block text-lg">
                Tournament Placement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Knocked out of round 1",
                    points: 2,
                    color:
                      "bg-red-100 border-red-300 text-red-700 hover:bg-red-200",
                    selectedColor: "bg-red-500 text-white hover:bg-red-600",
                  },
                  {
                    label: "Knocked out of round 2",
                    points: 6,
                    color:
                      "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200",
                    selectedColor: "bg-amber-500 text-white hover:bg-amber-600",
                  },
                  {
                    label: "Lose final round",
                    points: 14,
                    color:
                      "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
                    selectedColor: "bg-gray-500 text-white hover:bg-gray-600",
                  },
                  {
                    label: "Win final round",
                    points: 25,
                    color:
                      "bg-green-100 border-green-300 text-green-700 hover:bg-green-200",
                    selectedColor:
                      "bg-green-500 text-white hover:bg-green-600",
                  },
                ].map((option) => {
                  const isSelected =
                    formData.progression_points === option.points;
                  return (
                    <button
                      key={option.points}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          progression_points: option.points,
                        })
                      }
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium border transition-all duration-150 ${
                        isSelected ? option.selectedColor : option.color
                      }`}>
                      {option.label}{" "}
                      <span className="text-muted">({option.points} pts)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <label className="col-span-4 font-semibold">Stats</label>
              <label className="text-center">Kills</label>
              <label className="text-center">Assists</label>
              <label className="text-center">Deaths</label>
              <label className="text-center">Revives</label>
              {["kills", "assists", "deaths", "revives"].map((field) => (
                <input
                  key={field}
                  type="number"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              ))}
            </div>

            {/* Damage/Support/Objective */}
            <div className="grid grid-cols-3 gap-2">
              <label className="text-center">Damage</label>
              <label className="text-center">Support</label>
              <label className="text-center">Objective</label>
              {["damage", "support", "objective"].map((field) => (
                <input
                  key={field}
                  type="number"
                  name={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              ))}
            </div>

            {/* Arena / Map dropdown */}
            <label className="font-semibold">Arena / Map</label>
            <select
              name="arena_id"
              value={formData.arena_id}
              onChange={handleChange}
              className="input input-bordered w-full"
              required>
              <option value="">Select an arena</option>
              {arenas.map((arena) => (
                <option key={arena.id} value={arena.id}>
                  {arena.arena_name}
                </option>
              ))}
            </select>




            <button type="submit" className="btn btn-primary w-full">
              Insert Match
            </button>
          </form>
          {message && <p className="mt-4 text-center">{message}</p>}
        </div>

        {/* Right column: Match History */}
        <div className="flex-1 w-full lg:w-2/3">
          <MatchHistory
            matches={matches}
            loading={loadingMatches}
            refreshMatches={fetchMatches}
          />
        </div>


      </div>
         <div className="text-black mb-6 p-4 rounded-lg shadow bg-yellow-100 border-l-4 border-yellow-500 mx-auto mt-10 max-w-md text-center">
          <h3 className="text-lg font-semibold">Total Progression Points</h3>
          <p className="text-xl font-bold mt-2">
            {matches.reduce((sum, match) => sum + (match.progression_points || 0), 0)} / 2400
          </p>
        </div>
    </div>
  );
}
