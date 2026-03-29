import {
  Badge,
  Button,
  Heading,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { useTeam } from "../hooks/useTeam";
import { useSyncTeam } from "../hooks/useTeams";
import type { RosterEntry } from "../types";

function injuryBadge(status?: string | null) {
  if (!status || status === "Active") return <Badge colorPalette="green">Active</Badge>;
  if (status === "Questionable") return <Badge colorPalette="yellow">Questionable</Badge>;
  return <Badge colorPalette="red">{status}</Badge>;
}

export function TeamPage() {
  const { teamKey } = useParams<{ teamKey: string }>();
  const { data: team, isLoading } = useTeam(teamKey!);
  const sync = useSyncTeam(teamKey!);

  if (isLoading) return <Skeleton h="400px" />;
  if (!team) return <Text>Team not found.</Text>;

  const latestSnapshot = team.rosterSnapshots?.[0];

  return (
    <Stack gap={6}>
      <Stack direction="row" align="center" justify="space-between">
        <Stack gap={1}>
          <Heading>{team.name}</Heading>
          <Text color="fg.muted">{team.league?.name}</Text>
        </Stack>
        <Button loading={sync.isPending} onClick={() => sync.mutate()}>
          Sync Roster
        </Button>
      </Stack>

      {latestSnapshot ? (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Player</Table.ColumnHeader>
              <Table.ColumnHeader>Position</Table.ColumnHeader>
              <Table.ColumnHeader>NBA Team</Table.ColumnHeader>
              <Table.ColumnHeader>Injury Status</Table.ColumnHeader>
              <Table.ColumnHeader>Slot</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {latestSnapshot.entries.map((entry: RosterEntry) => (
              <Table.Row key={entry.id}>
                <Table.Cell>
                  <Link to={`/player/${entry.player.playerKey}`}>
                    {entry.player.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{entry.player.position}</Table.Cell>
                <Table.Cell>{entry.player.nbaTeam}</Table.Cell>
                <Table.Cell>{injuryBadge(entry.player.injuryStatus)}</Table.Cell>
                <Table.Cell>{entry.rosterSlot}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <Text color="fg.muted">No roster data. Click "Sync Roster" to load.</Text>
      )}
    </Stack>
  );
}
