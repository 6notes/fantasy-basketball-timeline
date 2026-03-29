import { Badge, Card, Stack, Text } from "@chakra-ui/react";
import type { Player } from "../../types";

interface Props {
  player: Player;
}

function injuryBadge(status?: string | null) {
  if (!status || status === "Active") return <Badge colorPalette="green">Active</Badge>;
  if (status === "Questionable") return <Badge colorPalette="yellow">Questionable</Badge>;
  return <Badge colorPalette="red">{status}</Badge>;
}

export function PlayerCard({ player }: Props) {
  return (
    <Card.Root size="sm">
      <Card.Body>
        <Stack direction="row" align="center" justify="space-between">
          <Stack gap={0}>
            <Text fontWeight="semibold">{player.name}</Text>
            <Text fontSize="xs" color="fg.muted">
              {player.position} · {player.nbaTeam}
            </Text>
          </Stack>
          {injuryBadge(player.injuryStatus)}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
