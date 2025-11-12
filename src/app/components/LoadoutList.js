"use client";
import { useEffect, useState } from "react";

export default function LoadoutList() {
  const [loadouts, setLoadouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoadouts() {
      try {
        const res = await fetch("/api/loadouts");
        const data = await res.json();
        setLoadouts(data);
      } catch (error) {
        console.error("Error fetching loadouts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLoadouts();
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading loadouts...</p>;

  if (!loadouts.length)
    return <p className="text-sm text-gray-400 italic">No loadouts found.</p>;

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {loadouts.map((loadout) => (
        <div
          key={loadout.id}
          className="bg-base-200 p-4 rounded-2xl shadow-md w-72 hover:shadow-lg transition"
        >
          <h2 className="font-semibold text-lg mb-1">
            {loadout.loadout_name || "Unnamed Loadout"}
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Character: <span className="font-medium">{loadout.characters?.name}</span>
          </p>

          <div className="border-t border-gray-300 mt-2 pt-2">
            <p className="text-sm text-gray-600 mb-1">Equipments:</p>
            {loadout.loadout_equipments.length ? (
              <ul className="text-sm list-disc list-inside">
                {loadout.loadout_equipments.map((le) => (
                  <li key={le.equipments.id}>{le.equipments.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs italic text-gray-400">No equipments linked</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
