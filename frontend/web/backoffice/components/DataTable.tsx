type Props = {
  columns: string[];
  rows: (string | number | null)[][];
  actions?: string[];
};

export function DataTable({ columns, rows, actions }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2E] bg-[#151518]">
      <table className="min-w-full text-sm text-[#C5C5C5]">
        <thead className="bg-[#0B0B0D] text-xs uppercase tracking-wide text-white">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left">
                {col}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-left">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-[#2A2A2E]">
              {row.map((cell, cidx) => (
                <td key={cidx} className="px-4 py-2">
                  {cell ?? "—"}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <button
                        key={action}
                        className="rounded border border-[#2A2A2E] px-2 py-1 text-xs text-white hover:border-[#E10600]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
