import { Button, Card, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) return;
    if (handledRef.current) return;
    handledRef.current = true;

    const storedState = localStorage.getItem("oauth_state");

    if (state !== storedState) {
      console.error("OAuth state mismatch");
      return;
    }

    axios
      .get(`${apiUrl}/auth/callback`, {
        params: { code, state, stored_state: storedState },
      })
      .then((res) => {
        localStorage.setItem("userId", res.data.userId);
        localStorage.removeItem("oauth_state");
        const userId = res.data.userId;
        return axios
          .get(`${apiUrl}/api/leagues`, { headers: { "x-user-id": userId } })
          .then(() =>
            axios.post(`${apiUrl}/api/teams/sync-all`, null, {
              headers: { "x-user-id": userId },
            })
          );
      })
      .then(() => navigate("/"))
      .catch(console.error);
  }, [searchParams, apiUrl, navigate]);

  async function handleLogin() {
    const res = await axios.get<{
      url: string;
      state: string;
      codeVerifier: string;
    }>(`${apiUrl}/auth/login`);

    localStorage.setItem("oauth_state", res.data.state);
    localStorage.setItem("oauth_code_verifier", res.data.codeVerifier);
    window.location.href = res.data.url;
  }

  return (
    <Stack align="center" justify="center" minH="60vh">
      <Card.Root maxW="sm" w="full">
        <Card.Body>
          <Stack gap={6} align="center" p={4}>
            <Heading size="xl">Fantasy Hoops 🏀</Heading>
            <Text color="fg.muted">
              Connect your Yahoo Fantasy account to get started.
            </Text>
            <Button onClick={handleLogin} w="full" size="lg" colorPalette="blue">
              Login with Yahoo
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
