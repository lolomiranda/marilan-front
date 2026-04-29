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

interface Ordem {
  id: number;
  maquina_id: number;
  descricao_problema: string;
  operador_id: number;
  prioridade: string;
  motivo: string;
  status: string;
  maquina_nome: string;
  operador_nome: string;
  manutentor_id: number | null;
  manutentor_nome: string | null;
  data_abertura: string;
}

interface Maquina {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
  role: string;
}

const prioridades = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

const motivos = [
  { value: "Quebra", label: "Quebra" },
  { value: "Set-up", label: "Set-up" },
  { value: "Troca fer.", label: "Troca fer." },
  { value: "Produção", label: "Produção" },
  { value: "Pequenas paradas", label: "Pequenas paradas" },
  { value: "Velocidade", label: "Velocidade" },
  { value: "Defeito", label: "Defeito" },
  { value: "Programada", label: "Programada" },
  { value: "Gestão", label: "Gestão" },
  { value: "Movimento operacionais", label: "Movimento operacionais" },
  { value: "Organização", label: "Organização" },
  { value: "Logística", label: "Logística" },
  { value: "Medições e ajuste", label: "Medições e ajuste" },
];

const statusLiberacaoOptions = [
  { value: "liberada", label: "Liberada para produção" },
  { value: "nao_liberada", label: "Não liberada" },
];

const formatStatus = (status: string) => {
  switch (status) {
    case 'aberta': return 'Aberta';
    case 'atribuida': return 'Atribuída';
    case 'em_andamento': return 'Em Andamento';
    case 'concluida': return 'Concluída';
    default: return status;
  }
};

const formatPrioridade = (prioridade: string) => prioridade.charAt(0).toUpperCase() + prioridade.slice(1);

export default function OrdensServicoPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [operadores, setOperadores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [maquinaId, setMaquinaId] = useState<number | string>("");
  const [operadorId, setOperadorId] = useState<number | string>("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("normal");
  const [motivo, setMotivo] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // --- NOVOS ESTADOS PARA CONCLUSÃO ---
  const [openConclude, setOpenConclude] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<Ordem | null>(null);
  const [acaoRealizada, setAcaoRealizada] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [statusLiberacao, setStatusLiberacao] = useState("liberada");

  async function fetchData() {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    const authHeaders = {
      "X-User-Id": String(currentUser.id),
      "X-User-Role": currentUser.role,
    };
    try {
      const requests = [
        fetch("http://localhost:3001/ordens-servico", { headers: authHeaders }),
        fetch("http://localhost:3001/maquinas", { headers: authHeaders }),
      ];
      if (currentUser.role === "admin") {
        requests.push(fetch("http://localhost:3001/usuarios", { headers: authHeaders }));
      }
      const [ordensRes, maquinasRes, usuariosRes] = await Promise.all(requests);
      const ordensData = await ordensRes.json();
      const maquinasData = await maquinasRes.json();
      if (!ordensRes.ok) throw new Error(ordensData.error || "Falha ao carregar ordens");
      if (!maquinasRes.ok) throw new Error(maquinasData.error || "Falha ao carregar máquinas");
      setOrdens(ordensData);
      setMaquinas(maquinasData);
      if (currentUser.role === "admin") {
        const usuariosData: Usuario[] = await usuariosRes.json();
        setOperadores(usuariosData.filter((user) => user.role === "operador"));
      } else if (currentUser.role === "operador") {
        setOperadorId(currentUser.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("marilanUser");
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch { setCurrentUser(null); }
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleAccept = async (orderId: number) => {
    if (!currentUser) return;
    setActionLoadingId(orderId);
    try {
      const response = await fetch(`http://localhost:3001/ordens-servico/${orderId}/atribuir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify({ manutentor_id: currentUser.id }),
      });
      if (response.ok) await fetchData();
    } finally { setActionLoadingId(null); }
  };

  const handleStart = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      await fetch(`http://localhost:3001/ordens-servico/${orderId}/iniciar`, {
        method: "PATCH",
        headers: { "X-User-Id": String(currentUser?.id), "X-User-Role": currentUser?.role || "" },
      });
      await fetchData();
    } finally { setActionLoadingId(null); }
  };

  // --- NOVA FUNÇÃO: FINALIZAR ---
  const handleOpenConclude = (ordem: Ordem) => {
    setSelectedOrdem(ordem);
    setAcaoRealizada("");
    setObservacoes("");
    setStatusLiberacao("liberada");
    setOpenConclude(true);
  };

  const handleFinishOrder = async () => {
    if (!selectedOrdem || !currentUser) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/ordens-servico/${selectedOrdem.id}/concluir`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser.id), "X-User-Role": currentUser.role },
        body: JSON.stringify({ acao_realizada: acaoRealizada, observacoes: `${observacoes} | Status: ${statusLiberacaoOptions.find(o => o.value === statusLiberacao)?.label}` }),
      });
      if (response.ok) {
        setActionMessage("Ordem concluída com sucesso!");
        setOpenConclude(false);
        await fetchData();
      }
    } finally { setSubmitting(false); }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setDescricao(""); setMaquinaId(""); setPrioridade("normal"); setMotivo(""); };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await fetch("http://localhost:3001/ordens-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": String(currentUser?.id), "X-User-Role": currentUser?.role || "" },
        body: JSON.stringify({ maquina_id: Number(maquinaId), descricao_problema: descricao, operador_id: Number(operadorId), prioridade, motivo }),
      });
      handleClose();
      await fetchData();
    } finally { setSubmitting(false); }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">Ordens de Serviço</Typography>
            <Typography color="text.secondary">Gestão de intervenções corretivas.</Typography>
          </Box>
          {(currentUser?.role === "admin" || currentUser?.role === "operador") && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Abrir nova ordem</Button>
          )}
        </Box>

        {actionMessage && <Alert severity="success">{actionMessage}</Alert>}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Máquina</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Prioridade</TableCell>
                  <TableCell>Problema</TableCell>
                  <TableCell>Manutentor</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordens.map((ordem) => (
                  <TableRow key={ordem.id}>
                    <TableCell>{ordem.id}</TableCell>
                    <TableCell>{ordem.maquina_nome}</TableCell>
                    <TableCell>{ordem.motivo}</TableCell>
                    <TableCell>{formatStatus(ordem.status)}</TableCell>
                    <TableCell>{formatPrioridade(ordem.prioridade)}</TableCell>
                    <TableCell>{ordem.descricao_problema}</TableCell>
                    <TableCell>{ordem.manutentor_nome || "-"}</TableCell>
                    <TableCell align="center">
                      {currentUser?.role === "manutentor" && ordem.status === "aberta" ? (
                        <Button variant="contained" size="small" onClick={() => handleAccept(ordem.id)}>Aceitar</Button>
                      ) : currentUser?.role === "manutentor" && ordem.status === "atribuida" && ordem.manutentor_id === currentUser.id ? (
                        <Button variant="contained" color="secondary" size="small" onClick={() => handleStart(ordem.id)}>Iniciar</Button>
                      ) : currentUser?.role === "manutentor" && ordem.status === "em_andamento" && ordem.manutentor_id === currentUser.id ? (
                        <Button variant="contained" color="success" size="small" onClick={() => handleOpenConclude(ordem)}>Finalizar</Button>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>

      {/* MODAL DE CRIAÇÃO (SEU ORIGINAL) */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Abrir nova ordem</DialogTitle>
          <Box component="form" onSubmit={handleSubmit}>
              <DialogContent dividers>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel>Máquina</InputLabel>
                        <Select value={maquinaId} label="Máquina" onChange={(e) => setMaquinaId(e.target.value as string)} required>
                            {maquinas.map((m) => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Prioridade</InputLabel>
                        <Select value={prioridade} label="Prioridade" onChange={(e) => setPrioridade(e.target.value as string)} required>
                            {prioridades.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Motivo</InputLabel>
                        <Select value={motivo} label="Motivo" onChange={(e) => setMotivo(e.target.value as string)} required>
                            {motivos.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Descrição" multiline rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} required fullWidth />
                </Stack>
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleClose}>Cancelar</Button>
                  <Button type="submit" variant="contained">Abrir ordem</Button>
              </DialogActions>
          </Box>
      </Dialog>

      {/* NOVO MODAL DE CONCLUSÃO (REQUISITO MANUTENTOR) */}
      <Dialog open={openConclude} onClose={() => setOpenConclude(false)} fullWidth maxWidth="sm">
        <DialogTitle>Finalizar OS #{selectedOrdem?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold">VISUALIZAÇÃO DO PROBLEMA:</Typography>
              <Typography variant="body2">{selectedOrdem?.descricao_problema}</Typography>
            </Box>
            <TextField label="Diagnóstico Técnico" multiline rows={3} required value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} fullWidth />
            <TextField label="Peças Utilizadas" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} fullWidth placeholder="Ex: 1x Correia, 1L Óleo" />
            <FormControl fullWidth>
              <InputLabel>Status de Liberação (Ação Final)</InputLabel>
              <Select value={statusLiberacao} label="Status de Liberação (Ação Final)" onChange={(e) => setStatusLiberacao(e.target.value as string)} required>
                {statusLiberacaoOptions.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConclude(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleFinishOrder} disabled={!acaoRealizada || submitting}>
            CONCLUIR E LIBERAR MÁQUINA
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}