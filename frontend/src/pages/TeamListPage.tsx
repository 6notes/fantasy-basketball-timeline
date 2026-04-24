import { Button, Card, Heading, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTeams, useSyncTeam, useSyncAllTeams } from "../hooks/useTeams";
import type { Team } from "../types";

function TeamCard({ team }: { team: Team }) {
  const sync = useSyncTeam(team.teamKey);

  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={3}>
          <Heading size="sm">{team.name}</Heading>
          <Text fontSize="sm" color="fg.muted">
            {team.league?.name} — {team.league?.season}
          </Text>
          <Stack direction="row" gap={2}>
            <Link to={`/team/${team.teamKey}`}>
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

function NoTeamsState({ message }: { message: string }) {
  return (
    <Stack gap={2}>
      <Text>{message}</Text>
      <Link to="/login">Login with Yahoo to sync your teams</Link>
    </Stack>
  );
}

export function TeamListPage() {
  const { data: teams, isLoading } = useTeams();
  const syncAll = useSyncAllTeams();

  if (!localStorage.getItem("userId")) return <NoTeamsState message="No teams found." />;

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
    return (
      <Stack gap={4}>
        <NoTeamsState message="No teams yet." />
        <Button loading={syncAll.isPending} onClick={() => syncAll.mutate()} w="fit-content">
          Sync Teams from Yahoo
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={6}>
      <Heading>My Teams</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {teams.map((team) => (
          <TeamCard key={team.teamKey} team={team} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
