import { Button, Card, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) return;

    const storedState = localStorage.getItem("oauth_state");
    const codeVerifier = localStorage.getItem("oauth_code_verifier");

    if (state !== storedState || !codeVerifier) {
      console.error("OAuth state mismatch");
      return;
    }

    axios
      .get(`${apiUrl}/auth/callback`, {
        params: {
          code,
          state,
          stored_state: storedState,
          code_verifier: codeVerifier,
        },
      })
      .then((res) => {
        localStorage.setItem("userId", res.data.userId);
        localStorage.removeItem("oauth_state");
        localStorage.removeItem("oauth_code_verifier");
        navigate("/");
      })
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
            <Button onClick={handleLogin} w="full" size="lg">
              Login with Yahoo
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
