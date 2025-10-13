"use client";
import { useState, useEffect } from "react";

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/match-history");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();

        // Sort by match_date descending (latest first)
        data.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));

        setMatches(data);
      } catch (err) {
        console.error(err);
        setError("Error loading match history.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) return <p className="mt-4 text-center">Loading match history...</p>;
  if (error) return <p className="mt-4 text-center text-red-500">{error}</p>;

  const totalMatches = matches.length;

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">World Tour Match History</h2>

      <div
        className="overflow-x-auto"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        <table className="min-w-full border-collapse" style={{ borderColor: "var(--border-color)" }}>
          <thead
            style={{
              backgroundColor: "var(--card-bg)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              {[
                "Match #",
                "Character",
                "Loadout",
                "Weapon",
                "Specialization",
                "Won",
                "Points",
                "K/D",
                "Kills/Assists/Deaths",
                "Revives",
                "D/S/O",
                "Arena",
                "Date",
              ].map((header) => (
                <th
                  key={header}
                  className="px-2 py-1 text-left text-muted"
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    fontWeight: "500",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((m, index) => (
              <tr
                key={m.id}
                style={{ borderBottom: "1px solid var(--border-color)" }}
                className="hover:bg-[var(--background)]"
              >
                {/* Reverse Match #: latest match gets highest number */}
                <td className="px-2 py-1">{totalMatches - index}</td>
                <td className="px-2 py-1">{m.name}</td>
                <td className="px-2 py-1">{m.loadout_name}</td>
                <td className="px-2 py-1">{m.primary_weapon || "N/A"}</td>
                <td className="px-2 py-1">{m.specialization_name || "N/A"}</td>
                <td className="px-2 py-1">{m.won ? "✅" : "❌"}</td>
                <td className="px-2 py-1">{m.progression_points}</td>
                <td className="px-2 py-1">{m.kd_ratio}</td>
                <td className="px-2 py-1">{`${m.kills}/${m.assists}/${m.deaths}`}</td>
                <td className="px-2 py-1">{m.revives}</td>
                <td className="px-2 py-1">{`${m.damage_score}/${m.support_score}/${m.objective_score}`}</td>
                <td className="px-2 py-1">{m.arena_name || "N/A"}</td>
                <td className="px-2 py-1">{new Date(m.match_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
