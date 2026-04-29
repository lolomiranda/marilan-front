"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface ResumoStatus {
  status: string;
  total: number;
}

interface TopMaquina {
  id: number;
  nome: string;
  total_paradas: number;
}

interface TopManutentor {
  id: number;
  nome: string;
  total_reparos: number;
}

interface TopMotivo {
  motivo: string;
  total: number;
}

interface SetorProblema {
  setor: string;
  total_problemas: number;
}

interface DashboardResumo {
  status: ResumoStatus[];
  topMaquinas: TopMaquina[];
  topManutentores: TopManutentor[];
  topMotivos: TopMotivo[];
  setoresProblema: SetorProblema[];
  tempoMedioConsertoMinutos: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [maquinasCount, setMaquinasCount] = useState(0);
  const [usuariosCount, setUsuariosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const instabilidadeData = [55, 62, 50, 68, 72, 65, 80];

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("marilanUser");
      if (!storedUser) {
        router.push("/");
        return;
      }

      const user = JSON.parse(storedUser) as { id: number; role: string };
      if (user.role !== "admin") {
        router.push("/");
        return;
      }

      const headers = {
        "X-User-Id": String(user.id),
        "X-User-Role": user.role,
      };

      const [resumoRes, maquinasRes, usuariosRes] = await Promise.all([
        fetch("http://localhost:3001/dashboard/resumo", { headers }),
        fetch("http://localhost:3001/maquinas", { headers }),
        fetch("http://localhost:3001/usuarios", { headers }),
      ]);

      const resumoData = await resumoRes.json();
      const maquinasData = await maquinasRes.json();
      const usuariosData = await usuariosRes.json();

      if (!resumoRes.ok) throw new Error(resumoData.error || "Falha ao carregar resumo");
      if (!maquinasRes.ok) throw new Error(maquinasData.error || "Falha ao carregar máquinas");
      if (!usuariosRes.ok) throw new Error(usuariosData.error || "Falha ao carregar usuários");

      setResumo(resumoData);
      setMaquinasCount(Array.isArray(maquinasData) ? maquinasData.length : 0);
      setUsuariosCount(Array.isArray(usuariosData) ? usuariosData.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("marilanUser");
    if (!storedUser) {
      router.push("/");
      return;
    }

    const user = JSON.parse(storedUser) as { role: string };
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);
    loadDashboard();
  }, [router]);

  const totalOrdens = resumo?.status.reduce((sum, item) => sum + item.total, 0) ?? 0;
  const maxTopMaquinas = Math.max(...(resumo?.topMaquinas.map((item) => item.total_paradas) || [0]), 1);
  const maxTopMotivos = Math.max(...(resumo?.topMotivos.map((item) => item.total) || [0]), 1);
  const maxSetores = Math.max(...(resumo?.setoresProblema.map((item) => item.total_problemas) || [0]), 1);

  if (!authorized) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography color="text.secondary">
              Visão geral do sistema com ordens, máquinas e usuários.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} href="/register">
            Novo usuário
          </Button>
        </Box>

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ordens de serviço
                    </Typography>
                    <Typography variant="h4">{loading ? "..." : totalOrdens}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Máquinas
                    </Typography>
                    <Typography variant="h4">{loading ? "..." : maquinasCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Usuários
                    </Typography>
                    <Typography variant="h4">{loading ? "..." : usuariosCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tempo médio de conserto
                    </Typography>
                    <Typography variant="h4">
                      {loading ? "..." : resumo ? `${Math.round(resumo.tempoMedioConsertoMinutos)} min` : "-"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ordens por status
                  </Typography>
                  <Stack spacing={1}>
                    {resumo?.status.map((item) => (
                      <Box key={item.status} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ textTransform: 'capitalize' }}>{item.status.replace(/_/g, ' ')}</Typography>
                        <Chip label={item.total} color="primary" size="small" />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top motivos das quebras
                  </Typography>
                  <Stack spacing={2}>
                    {resumo?.topMotivos.map((item) => (
                      <Box key={item.motivo}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">{item.motivo}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.total}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box
                            sx={{
                              width: `${(item.total / maxTopMotivos) * 100}%`,
                              height: '100%',
                              bgcolor: 'warning.main',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Máquinas com mais paradas
                  </Typography>
                  <Stack spacing={2}>
                    {resumo?.topMaquinas.map((maquina) => (
                      <Box key={maquina.id}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">{maquina.nome}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {maquina.total_paradas}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box
                            sx={{
                              width: `${(maquina.total_paradas / maxTopMaquinas) * 100}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Setores com mais problemas
                  </Typography>
                  <Stack spacing={2}>
                    {resumo?.setoresProblema.map((item) => (
                      <Box key={item.setor}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">{item.setor || 'Sem setor'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.total_problemas}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 10, bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box
                            sx={{
                              width: `${(item.total_problemas / maxSetores) * 100}%`,
                              height: '100%',
                              bgcolor: 'success.main',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top manutentores
                  </Typography>
                  <List disablePadding>
                    {resumo?.topManutentores.map((user) => (
                      <ListItem key={user.id} sx={{ px: 0 }}>
                        <ListItemText primary={user.nome} secondary={`Reparos: ${user.total_reparos}`} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Instabilidade operacional (valor fictício)
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-end" height={160} mt={2}>
                    {instabilidadeData.map((value, index) => (
                      <Box key={index} textAlign="center" width="12%">
                        <Box
                          sx={{
                            height: `${value}%`,
                            minHeight: 24,
                            bgcolor: 'error.main',
                            borderRadius: 2,
                          }}
                        />
                        <Typography variant="caption" display="block" mt={1}>
                          {value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => (
                      <Typography key={day} variant="caption">
                        {day}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </Container>
  );
}
