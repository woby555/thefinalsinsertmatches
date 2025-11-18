"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CreateLoadoutPage() {
  const [characters, setCharacters] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loadouts, setLoadouts] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [message, setMessage] = useState("");
  const [editingLoadout, setEditingLoadout] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  

  const [formData, setFormData] = useState({
    loadout_name: "",
    equipments: Array.from({ length: 8 }, (_, i) => ({ slot_number: i, equipment_name: "" })),
  });

  // Fetch characters, equipments, and loadouts
  useEffect(() => {
    fetch("/api/characters")
      .then((res) => res.json())
      .then(setCharacters)
      .catch(() => setMessage("⚠️ Failed to load characters"));

    fetch("/api/equipments")
      .then((res) => res.json())
      .then(setEquipments)
      .catch(() => setMessage("⚠️ Failed to load equipments"));

    fetchLoadouts();
  }, []);

  const fetchLoadouts = async () => {
    try {
      const res = await fetch("/api/loadouts");
      const data = await res.json();
      setLoadouts(data);
    } catch {
      setMessage("⚠️ Failed to load loadouts");
    }
  };

  // Dynamically fetch class-specific equipment
  const fetchEquipmentsForClass = async (className) => {
    try {
      const res = await fetch(`/api/class-equipments?class_name=${className}`);
      const data = await res.json();

      if (res.ok) {
        // Flatten if nested structure exists
        const flattened = data.map((item) =>
          item.equipments ? item.equipments : item
        );
        setEquipments(flattened);
      } else {
        setMessage(`⚠️ ${data.error || "Failed to load equipments"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Network error fetching equipments");
    }
  };

  useEffect(() => {
    if (!selectedClass) return;

    console.log("🔍 Fetching equipments for class:", selectedClass);

    const fetchClassEquipments = async () => {
      try {
        const res = await fetch(
          `/api/class-equipments?class_name=${encodeURIComponent(
            selectedClass
          )}`
        );
        const data = await res.json();

        if (res.ok) {
          console.log("✅ Equipments fetched:", data);
          setEquipments(data);
        } else {
          setMessage(`⚠️ ${data.error || "Failed to load class equipments"}`);
        }
      } catch (err) {
        console.error("⚠️ Network error while fetching class equipments", err);
        setMessage("⚠️ Network error while fetching class equipments");
      }
    };

    fetchClassEquipments();
  }, [selectedClass]);

  // Filtered equipment lists
  const weaponList = equipments.filter((e) => e.equipment_type === "weapon");
  const gadgetList = equipments.filter((e) => e.equipment_type === "gadget");

  // Handlers
  const handleCharacterChange = async (e) => {
    const selectedName = e.target.value;
    const selectedChar = characters.find((c) => c.name === selectedName);

    if (!selectedChar) {
      setSelectedCharacter(null);
      setSelectedClass(null);
      return;
    }

    // Get the character’s associated class name directly
    setSelectedCharacter(selectedChar);
    const className = selectedChar.class_name;
    setSelectedClass(className);

    // Fetch equipment for that class
    if (className) {
      console.log(`Fetching equipments for class: ${className}`);
      await fetchEquipmentsForClass(className);
    }
  };

  const handleLoadoutNameChange = (e) =>
    setFormData({ ...formData, loadout_name: e.target.value });

  const handleEquipmentChange = (index, value) => {
    const updated = [...formData.equipments];
    updated[index].equipment_name = value;
    setFormData({ ...formData, equipments: updated });
  };

  const copyLoadoutToForm = async (loadout) => {
    // 1. Find and set character
    const selectedChar = characters.find(
      (c) => c.name === loadout.character_name
    );

    if (selectedChar) {
      setSelectedCharacter(selectedChar);
      setSelectedClass(selectedChar.class_name);

      // Trigger equipment fetch for that class
      await fetchEquipmentsForClass(selectedChar.class_name);
    }

    // 2. Populate form fields
    setFormData({
      loadout_name: loadout.loadout_name + " Copy",
      equipments: Array.from({ length: 8 }, (_, i) => ({
        slot_number: i,
        equipment_name: loadout.equipments?.[i]?.equipment_name || "",
      })),
    });

    setMessage(`📋 Copied "${loadout.loadout_name}" to editor.`);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCharacter || !selectedClass) {
      setMessage("⚠️ Please select a character and class.");
      return;
    }

    let loadoutName = formData.loadout_name.trim();

    // AUTO-GENERATE A NAME IF BLANK
    if (!loadoutName) {
      // Get existing loadouts for this character
      const characterLoadouts = loadouts.filter(
        (l) => l.character_name === selectedCharacter.name
      );

      // Find numbers already used: "Ghost 1", "Ghost 2", ...
      const usedNumbers = characterLoadouts
        .map((l) => {
          const parts = l.loadout_name.split(" ");
          const n = parseInt(parts[parts.length - 1], 10);
          return isNaN(n) ? null : n;
        })
        .filter((n) => n !== null);

      const nextNumber =
        usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;

      loadoutName = `${selectedCharacter.name} ${nextNumber}`;
    }

    setMessage("Submitting...");

    try {
      const res = await fetch("/api/loadouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p_character_name: selectedCharacter.name,
          p_class_name: selectedClass,
          p_loadout_name: loadoutName,
          p_equipments: formData.equipments,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Loadout "${loadoutName}" created successfully!`);
        setFormData({
          loadout_name: "",
          equipments: [{ slot_number: 0, equipment_name: "" }],
        });
        fetchLoadouts(); // refresh list
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage("⚠️ Network or server error");
    }
  };


  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create & View Loadouts
      </h1>

      <Link href="/matches/insert-match" className="btn btn-secondary mb-6">
        ← Back to Matches
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- LEFT: Loadout Creation Form --- */}
        <div className="flex-1 p-6 border rounded-lg shadow bg-[var(--card-bg)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={selectedCharacter?.name || ""}
              onChange={handleCharacterChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>
                Select Character
              </option>

              {characters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.class_name})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="loadout_name"
              placeholder="Loadout Name (e.g., Sniper Build)"
              value={formData.loadout_name}
              onChange={handleLoadoutNameChange}
              className="input input-bordered w-full"
              
            />

            <div>
              <label className="font-semibold block mb-3">Equipments</label>

              {!selectedCharacter ? (
                <p className="text-sm text-gray-500 italic mb-2">
                  Select a character first to see available equipment.
                </p>
              ) : null}

              {formData.equipments.map((eq, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 items-center mb-3 border-b pb-2"
                >
                  <span className="text-sm text-gray-500 w-20">Slot {i + 1}</span>

                  <select
                    value={eq.equipment_name}
                    onChange={(e) => handleEquipmentChange(i, e.target.value)}
                    className="select select-bordered flex-1"
                    required
                    disabled={!selectedCharacter}
                  >
                    <option value="">Select Equipment</option>

                    {weaponList.length > 0 && (
                      <optgroup label="Weapons">
                        {weaponList.map((w) => (
                          <option key={w.id} value={w.name}>
                            {w.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {gadgetList.length > 0 && (
                      <optgroup label="Gadgets">
                        {gadgetList.map((g) => (
                          <option key={g.id} value={g.name}>
                            {g.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {weaponList.length === 0 && gadgetList.length === 0 && (
                      <option disabled>No equipment available for this class</option>
                    )}
                  </select>
                </div>
              ))}


            </div>

            <button type="submit" className="btn btn-primary w-full mt-6">
              Create Loadout
            </button>
          </form>

          {message && <p className="mt-4 text-center">{message}</p>}
        </div>

        {/* --- RIGHT: Loadouts List --- */}
        <div className="flex-1 p-6 border rounded-lg shadow bg-[var(--card-bg)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Existing Loadouts</h2>

          {loadouts.length === 0 ? (
            <p className="text-gray-500">No loadouts created yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {loadouts.map((loadout) => (
                <div
                  key={loadout.id}
                  className="p-3 border rounded-lg bg-base-100 hover:bg-base-200 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">
                        {loadout.loadout_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Character: {loadout.character_name} | Class:{" "}
                        {loadout.class_name}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingLoadout({
                          ...loadout,
                          equipments: loadout.equipments || [],
                        });
                        setIsEditing(true);
                        document
                          .getElementById("edit_loadout_modal")
                          .showModal();
                      }}
                      className="btn btn-sm btn-outline">
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => copyLoadoutToForm(loadout)}
                      className="btn btn-sm btn-outline ml-2"
                    >
                      📋 Copy
                    </button>

                  </div>

                  {loadout.equipments?.length > 0 && (
                    <ul className="list-disc ml-5 mt-2 text-sm">
                      {loadout.equipments.map((eq, i) => (
                        <li key={i}>{eq.equipment_name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

{/* DaisyUI Modal for Editing Loadout */}
<dialog
  id="edit_loadout_modal"
  className="modal modal-middle"
>
  <div className="modal-box text-white max-w-4xl p-6 bg-[var(--card-bg)] border rounded-lg shadow">
    <h3 className="text-xl font-bold mb-4 text-center">
      Edit Loadout: {editingLoadout?.loadout_name}
    </h3>

    {editingLoadout && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const payload = {
            loadout_name: editingLoadout.loadout_name,
            equipments: editingLoadout.equipments.map((eq, index) => {
              const matched =
                weaponList.find((w) => w.name === eq.equipment_name) ||
                gadgetList.find((g) => g.name === eq.equipment_name);

              return {
                slot_number: index,
                equipment_id: matched?.id,
              };
            }),
          };

          const res = await fetch(`/api/loadouts/${editingLoadout.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            setMessage("✅ Loadout updated successfully!");
            document.getElementById("edit_loadout_modal").close();
            setIsEditing(false);
            fetchLoadouts();
          } else {
            const data = await res.json();
            setMessage(`❌ Error: ${data.error}`);
          }
        }}
        className="space-y-4"
      >
        {/* Loadout Name */}
        <label className="form-control w-full">
          <span className="label-text font-semibold">Loadout Name</span>
          <input
            type="text"
            value={editingLoadout.loadout_name}
            onChange={(e) =>
              setEditingLoadout({
                ...editingLoadout,
                loadout_name: e.target.value,
              })
            }
            className="input input-bordered w-full"
            required
          />
        </label>

        {/* Equipment Editing Section */}
        <div>
          <label className="font-semibold block mb-3">Equipments</label>
          {editingLoadout.equipments?.map((eq, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-2 items-center mb-3 border-b pb-2"
            >
              <span className="text-sm text-gray-500 w-20">
                Slot {i + 1}
              </span>

              <select
                value={eq.equipment_name}
                onChange={(e) => {
                  const updatedEquipments = [...editingLoadout.equipments];
                  updatedEquipments[i].equipment_name = e.target.value;
                  setEditingLoadout({
                    ...editingLoadout,
                    equipments: updatedEquipments,
                  });
                }}
                className="select select-bordered flex-1"
                required
              >
                <option value="">Select Equipment</option>

                <optgroup label="Weapons">
                  {weaponList.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Gadgets">
                  {gadgetList.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </optgroup>
              </select>

              {editingLoadout.equipments.length > 1 && (
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => {
                    const updatedEquipments = editingLoadout.equipments.filter(
                      (_, idx) => idx !== i
                    );
                    setEditingLoadout({
                      ...editingLoadout,
                      equipments: updatedEquipments,
                    });
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {editingLoadout.equipments.length < 8 && (
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={() => {
                setEditingLoadout({
                  ...editingLoadout,
                  equipments: [
                    ...editingLoadout.equipments,
                    { equipment_name: "" },
                  ],
                });
              }}
            >
              ➕ Add Slot
            </button>
          )}
        </div>

        {/* Save / Cancel */}
        <div className="modal-action justify-between mt-6">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              document.getElementById("edit_loadout_modal").close();
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary ml-4 ">
            Save Changes
          </button>
        </div>
      </form>
    )}
  </div>
</dialog>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
