"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

interface User {
  id: number;
  nome: string;
  cracha: string;
  role: string;
  ativo: boolean;
  created_at: string;
}

const roles = [
  { value: "admin", label: "Admin" },
  { value: "manutentor", label: "Manutentor" },
  { value: "operador", label: "Operador" },
];

export default function UsuariosPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("operador");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  async function fetchUsers() {
    if (!currentUser) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/usuarios", {
        headers: {
          "X-User-Id": String(currentUser.id),
          "X-User-Role": currentUser.role,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Falha ao buscar usuários");
        setLoading(false);
        return;
      }

      setUsers(data);
    } catch {
      setError("Não foi possível carregar os usuários");
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
    setUserLoaded(true);
  }, []);

  useEffect(() => {
    if (userLoaded && currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser, userLoaded]);

  const handleOpen = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    setNome("");
    setCracha("");
    setSenha("");
    setRole("operador");
    setOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setNome(user.nome);
    setCracha(user.cracha);
    setSenha("");
    setRole(user.role);
    setOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    if (!currentUser) return;
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(currentUser.id),
          "X-User-Role": currentUser.role,
        },
        body: JSON.stringify({ ativo: !user.ativo }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Falha ao atualizar status");
        return;
      }

      await fetchUsers();
    } catch {
      setError("Falha ao conectar ao servidor");
    }
  };

  const handleDelete = async (user: User) => {
    if (!currentUser) return;
    if (!window.confirm(`Deseja excluir o usuário ${user.nome}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": String(currentUser.id),
          "X-User-Role": currentUser.role,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Falha ao excluir usuário");
        return;
      }

      await fetchUsers();
    } catch {
      setError("Falha ao conectar ao servidor");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNome("");
    setCracha("");
    setSenha("");
    setRole("operador");
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    if (!currentUser || currentUser.role !== "admin") {
      setSubmitError("Somente admin pode cadastrar ou editar usuários");
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        nome,
        role,
      };

      let url = "http://localhost:3001/usuarios";
      let method = "POST";

      if (isEditMode && selectedUser) {
        url = `http://localhost:3001/usuarios/${selectedUser.id}`;
        method = "PATCH";
        if (senha) {
          payload.senha = senha;
        }
      } else {
        payload.cracha = cracha;
        payload.senha = senha;
        payload.ativo = 1;
      }

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
        setSubmitError(data.error || "Falha ao salvar usuário");
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(isEditMode ? "Usuário atualizado com sucesso" : "Usuário cadastrado com sucesso");
      setNome("");
      setCracha("");
      setSenha("");
      setRole("operador");
      setSelectedUser(null);
      setIsEditMode(false);
      await fetchUsers();
      setSubmitting(false);
      setTimeout(() => setOpen(false), 900);
    } catch {
      setSubmitError("Falha ao conectar ao servidor");
      setSubmitting(false);
    }
  }

  if (userLoaded && currentUser?.role !== "admin") {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Alert severity="error">Acesso negado. Apenas administradores podem ver esta página.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1">
              Usuários
            </Typography>
            <Typography color="text.secondary">
              Liste todos os usuários cadastrados e crie novas contas com role apropriado.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Adicionar usuário
          </Button>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Crachá</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.nome}</TableCell>
                      <TableCell>{user.cracha}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.ativo ? "Sim" : "Não"}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button size="small" variant="outlined" onClick={() => handleEdit(user)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.ativo ? "Desabilitar" : "Habilitar"}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(user)}
                          >
                            Excluir
                          </Button>
                        </Stack>
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
          Cadastrar usuário
          <IconButton
            aria-label="Fechar"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
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
                label="Crachá"
                value={cracha}
                onChange={(event) => setCracha(event.target.value)}
                required={!isEditMode}
                disabled={isEditMode}
                fullWidth
              />
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required={!isEditMode}
                helperText={isEditMode ? "Deixe em branco para manter a senha atual." : undefined}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="role-label">Tipo de usuário</InputLabel>
                <Select
                  labelId="role-label"
                  value={role}
                  label="Tipo de usuário"
                  onChange={(event) => setRole(event.target.value)}
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar usuário"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
