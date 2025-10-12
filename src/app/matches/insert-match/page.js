"use client";
import { useState, useEffect } from "react";

export default function InsertMatchPage() {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedLoadout, setSelectedLoadout] = useState(null);

  const [formData, setFormData] = useState({
    primary_weapon_name: "",
    sub_gamemode_name: "",
    specialization_name: "",
    won: false,
    progression_points: 0,
    kills: 0,
    assists: 0,
    deaths: 0,
    arena_name: "",
  });

  const [message, setMessage] = useState("");

  // Fetch characters
  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then(setCharacters)
      .catch(() => setMessage("Failed to load characters"));
  }, []);

  const handleCharacterChange = (e) => {
    const char = characters.find((c) => c.name === e.target.value);
    setSelectedCharacter(char);
    setSelectedLoadout(null);
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

    console.log("Submitting payload:", {
  ...formData,
  character_name: selectedCharacter.name,
  loadout_name: selectedLoadout.loadout_name,
});

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
      if (res.ok) setMessage(`✅ Match inserted! ID: ${data.id}`);
      else setMessage(`❌ Error: ${data.error}`);
    } catch {
      setMessage("⚠️ Network or server error");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Insert Match (World Tour)</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Character */}
        <select
          onChange={handleCharacterChange}
          className="select select-bordered w-full"
          defaultValue=""
          required
        >
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
            required
          >
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

        {/* Primary Weapon as text input */}
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
        <input
          name="specialization_name"
          placeholder="Specialization (optional)"
          value={formData.specialization_name}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="won"
            checked={formData.won}
            onChange={handleChange}
          />
          Won Match?
        </label>

        <label className="font-semibold">Progression Points</label>
        <input
          type="number"
          name="progression_points"
          placeholder="Progression Points"
          value={formData.progression_points}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        <div className="grid grid-cols-3 gap-2">
          <label className="col-span-3 font-semibold">Stats</label>
          {["kills", "assists", "deaths"].map((field) => (
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

        <input
          name="arena_name"
          placeholder="Arena Name"
          value={formData.arena_name}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        <button type="submit" className="btn btn-primary w-full">
          Insert Match
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
