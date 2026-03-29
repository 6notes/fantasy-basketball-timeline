import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StatLine } from "../../types";

interface Props {
  statLines: StatLine[];
  statKey: keyof StatLine;
}

export function StatChart({ statLines, statKey }: Props) {
  const data = statLines.map((s) => ({
    date: new Date(s.date).toLocaleDateString(),
    value: s[statKey] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3182ce"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
