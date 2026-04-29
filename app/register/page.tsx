"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

export default function RegisterPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("operador");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cracha,
          senha,
          role, // 👈 agora vai pro backend
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao registrar usuário");
        setLoading(false);
        return;
      }

      setSuccess("Cadastro realizado com sucesso.");
      setNome("");
      setCracha("");
      setSenha("");
      setRole("operador");

      setLoading(false);
      setTimeout(() => router.push("/"), 1200);

    } catch (err) {
      setError("Falha ao conectar ao servidor");
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Cadastro</Typography>
            <Typography color="text.secondary">
              Crie um usuário com perfil.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Crachá"
                value={cracha}
                onChange={(e) => setCracha(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                fullWidth
              />

              {/* 🔥 DROPDOWN */}
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  value={role}
                  label="Tipo de Usuário"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="operador">Operador</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="manutentor">Manutentor</MenuItem>
                </Select>
              </FormControl>

              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}