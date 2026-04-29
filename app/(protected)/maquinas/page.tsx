"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface Maquina {
  id: number;
  nome: string;
  localizacao: string;
  descricao: string;
  created_at: string;
}

export default function MaquinasPage() {
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(null);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Maquina | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  async function fetchMaquinas() {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (currentUser) {
        headers["X-User-Id"] = String(currentUser.id);
        headers["X-User-Role"] = currentUser.role;
      }

      const response = await fetch("http://localhost:3001/maquinas", { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar máquinas");
      }

      setMaquinas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("marilanUser");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("marilanUser");
      }
    }
  }, []);

  useEffect(() => {
    fetchMaquinas();
  }, [currentUser]);

  const handleOpen = () => {
    setSelectedMachine(null);
    setIsEditMode(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    setNome("");
    setLocalizacao("");
    setDescricao("");
    setOpen(true);
  };

  const handleEdit = (machine: Maquina) => {
    setSelectedMachine(machine);
    setIsEditMode(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setNome(machine.nome);
    setLocalizacao(machine.localizacao);
    setDescricao(machine.descricao || "");
    setOpen(true);
  };

  const handleDelete = async (machine: Maquina) => {
    if (!currentUser) return;
    if (!window.confirm(`Deseja excluir a máquina ${machine.nome}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/maquinas/${machine.id}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": String(currentUser.id),
          "X-User-Role": currentUser.role,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Falha ao excluir máquina");
        return;
      }

      await fetchMaquinas();
    } catch {
      setError("Falha ao conectar ao servidor");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNome("");
    setLocalizacao("");
    setDescricao("");
    setSelectedMachine(null);
    setIsEditMode(false);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    if (!currentUser || currentUser.role !== "admin") {
      setSubmitError("Somente admin pode cadastrar ou editar máquinas");
      setSubmitting(false);
      return;
    }

    const payload = { nome, localizacao, descricao };
    const isUpdate = isEditMode && selectedMachine !== null;
    const url = isUpdate
      ? `http://localhost:3001/maquinas/${selectedMachine?.id}`
      : "http://localhost:3001/maquinas";
    const method = isUpdate ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(currentUser.id),
          "X-User-Role": currentUser.role,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.error || "Falha ao salvar máquina");
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(isUpdate ? "Máquina atualizada com sucesso" : "Máquina cadastrada com sucesso");
      setNome("");
      setLocalizacao("");
      setDescricao("");
      setSelectedMachine(null);
      setIsEditMode(false);
      await fetchMaquinas();
      setSubmitting(false);
      setTimeout(() => setOpen(false), 900);
    } catch {
      setSubmitError("Falha ao conectar ao servidor");
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1">
              Máquinas
            </Typography>
            <Typography color="text.secondary">
              Veja a lista de máquinas cadastradas e adicione novas máquinas ao sistema.
            </Typography>
          </Box>
          {currentUser?.role === "admin" ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
              Adicionar máquina
            </Button>
          ) : (
            <Typography color="text.secondary" variant="body2">
              Apenas administradores podem cadastrar máquinas.
            </Typography>
          )}
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Localização</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Cadastro</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Carregando máquinas...
                    </TableCell>
                  </TableRow>
                ) : maquinas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhuma máquina cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  maquinas.map((maquina) => (
                    <TableRow key={maquina.id}>
                      <TableCell>{maquina.id}</TableCell>
                      <TableCell>{maquina.nome}</TableCell>
                      <TableCell>{maquina.localizacao}</TableCell>
                      <TableCell>{maquina.descricao || "-"}</TableCell>
                      <TableCell>{new Date(maquina.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        {currentUser?.role === "admin" ? (
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button size="small" variant="outlined" onClick={() => handleEdit(maquina)}>
                              Editar
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleDelete(maquina)}
                            >
                              Excluir
                            </Button>
                          </Stack>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ position: "relative" }}>
          {isEditMode ? "Editar máquina" : "Cadastrar máquina"}
          <IconButton aria-label="Fechar" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2}>
              {submitError ? <Alert severity="error">{submitError}</Alert> : null}
              {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}
              <TextField
                label="Nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Localização"
                value={localizacao}
                onChange={(event) => setLocalizacao(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Descrição"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? (isEditMode ? "Atualizando..." : "Salvando...") : isEditMode ? "Atualizar máquina" : "Salvar máquina"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
