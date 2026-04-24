import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { Outlet, Link as RouterLink } from "react-router-dom";

export function Layout() {
  return (
    <Box minH="100vh">
      <Flex as="nav" px={6} py={4} borderBottomWidth="1px" align="center" justify="space-between">
        <Heading size="md">Fantasy Hoops 🏀</Heading>
        <RouterLink to="/">My Teams</RouterLink>
      </Flex>
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}
