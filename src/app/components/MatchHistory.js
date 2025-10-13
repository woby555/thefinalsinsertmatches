"use client";

export default function MatchHistory({ matches = [], loading, refreshMatches }) {
  if (loading) return <p className="mt-4 text-center">Loading match history...</p>;

  const totalMatches = matches.length;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">World Tour Match History</h2>
        <button onClick={refreshMatches} className="btn btn-sm btn-outline">
          Refresh
        </button>
      </div>

      <div
        className="overflow-x-auto"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        <table
          className="min-w-full border-collapse"
          style={{ borderColor: "var(--border-color)" }}
        >
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
                "DB ID",
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
                {/* Custom visible match number */}
                <td className="px-2 py-1 text-center font-semibold">
                  {totalMatches - index}
                </td>

                {/* Actual database ID */}
                <td className="px-2 py-1 text-center text-muted">{m.id}</td>

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
                <td className="px-2 py-1">
                  {new Date(m.match_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
