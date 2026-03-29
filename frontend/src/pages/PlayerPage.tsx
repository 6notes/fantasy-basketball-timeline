import {
  Badge,
  Button,
  Heading,
  Image,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { usePlayer, usePlayerStats, useSyncPlayerStats } from "../hooks/usePlayer";
import { StatChart } from "../components/players/StatChart";

function injuryBadge(status?: string | null) {
  if (!status || status === "Active") return <Badge colorPalette="green">Active</Badge>;
  if (status === "Questionable") return <Badge colorPalette="yellow">Questionable</Badge>;
  return <Badge colorPalette="red">{status}</Badge>;
}

export function PlayerPage() {
  const { playerKey } = useParams<{ playerKey: string }>();
  const { data: player, isLoading: playerLoading } = usePlayer(playerKey!);
  const { data: stats, isLoading: statsLoading } = usePlayerStats(playerKey!);
  const sync = useSyncPlayerStats(playerKey!);

  if (playerLoading) return <Skeleton h="400px" />;
  if (!player) return <Text>Player not found.</Text>;

  return (
    <Stack gap={6}>
      <Stack direction="row" align="flex-start" gap={6}>
        {player.imageUrl && (
          <Image src={player.imageUrl} alt={player.name} boxSize="80px" borderRadius="md" />
        )}
        <Stack gap={1} flex={1}>
          <Stack direction="row" align="center" gap={3}>
            <Heading>{player.name}</Heading>
            {injuryBadge(player.injuryStatus)}
          </Stack>
          <Text color="fg.muted">
            {player.position} · {player.nbaTeam}
          </Text>
        </Stack>
        <Button loading={sync.isPending} onClick={() => sync.mutate()}>
          Sync Stats
        </Button>
      </Stack>

      {statsLoading ? (
        <Skeleton h="200px" />
      ) : stats && stats.length > 0 ? (
        <>
          <StatChart statLines={stats} statKey="pts" />
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Date</Table.ColumnHeader>
                <Table.ColumnHeader>PTS</Table.ColumnHeader>
                <Table.ColumnHeader>REB</Table.ColumnHeader>
                <Table.ColumnHeader>AST</Table.ColumnHeader>
                <Table.ColumnHeader>STL</Table.ColumnHeader>
                <Table.ColumnHeader>BLK</Table.ColumnHeader>
                <Table.ColumnHeader>TOV</Table.ColumnHeader>
                <Table.ColumnHeader>3PM</Table.ColumnHeader>
                <Table.ColumnHeader>FG%</Table.ColumnHeader>
                <Table.ColumnHeader>FT%</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {stats.map((s) => (
                <Table.Row key={s.id}>
                  <Table.Cell>{new Date(s.date).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>{s.pts ?? "—"}</Table.Cell>
                  <Table.Cell>{s.reb ?? "—"}</Table.Cell>
                  <Table.Cell>{s.ast ?? "—"}</Table.Cell>
                  <Table.Cell>{s.stl ?? "—"}</Table.Cell>
                  <Table.Cell>{s.blk ?? "—"}</Table.Cell>
                  <Table.Cell>{s.tov ?? "—"}</Table.Cell>
                  <Table.Cell>{s.threepm ?? "—"}</Table.Cell>
                  <Table.Cell>{s.fgPct != null ? `${(s.fgPct * 100).toFixed(1)}%` : "—"}</Table.Cell>
                  <Table.Cell>{s.ftPct != null ? `${(s.ftPct * 100).toFixed(1)}%` : "—"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      ) : (
        <Text color="fg.muted">No stats yet. Click "Sync Stats" to load.</Text>
      )}
    </Stack>
  );
}
