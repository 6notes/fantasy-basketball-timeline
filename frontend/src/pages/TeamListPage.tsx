import { Button, Card, Heading, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTeams, useSyncTeam } from "../hooks/useTeams";
import type { League } from "../types";

function TeamCard({ team }: { team: League & { teamKey?: string; name?: string } }) {
  const teamKey = (team as unknown as { teamKey: string }).teamKey ?? team.leagueKey;
  const sync = useSyncTeam(teamKey);

  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={3}>
          <Heading size="sm">{(team as unknown as { name: string }).name ?? team.name}</Heading>
          <Text fontSize="sm" color="fg.muted">
            {team.name} — {team.season}
          </Text>
          <Stack direction="row" gap={2}>
            <Link to={`/team/${teamKey}`}>
              <Button size="sm" variant="outline">
                View Roster
              </Button>
            </Link>
            <Button size="sm" loading={sync.isPending} onClick={() => sync.mutate()}>
              Sync
            </Button>
          </Stack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

export function TeamListPage() {
  const { data: teams, isLoading } = useTeams();

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} h="120px" borderRadius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (!teams?.length) {
    return <Text>No teams found. Try syncing your leagues.</Text>;
  }

  return (
    <Stack gap={6}>
      <Heading>My Teams</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {teams.map((team) => (
          <TeamCard key={team.leagueKey} team={team} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
