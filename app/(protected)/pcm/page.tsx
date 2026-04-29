"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";

interface RelatorioParada {
  id: number;
  data_abertura: string;
  linha_lote: string;
  motivo: string;
  descricao_problema: string;
  data_inicio: string;
  data_conclusao: string;
  nome_equipamento: string;
  manutentor_nome: string | null;
}

interface MTTRManutentor {
  id: number;
  nome: string;
  mttr_minutos: number;
  total_reparos: number;
}

interface MTBFMaquina {
  id: number;
  nome: string;
  localizacao: string;
  mtbf_horas: number;
  total_paradas: number;
}

interface Metricas {
  mttrPorManutentor: MTTRManutentor[];
  mtbfPorMaquina: MTBFMaquina[];
  disponibilidadePercent: number;
  indisponibilidadePercent: number;
  mtbfVsMttr: {
    mtbfPercent: number;
    mttrPercent: number;
  };
}

export default function PCMPage() {
  const [relatorio, setRelatorio] = useState<RelatorioParada[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const storedUser = localStorage.getItem("marilanUser");
      if (!storedUser) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      const authHeaders = {
        "X-User-Id": String(user.id),
        "X-User-Role": user.role,
      };

      const [relatorioRes, metricasRes] = await Promise.all([
        fetch("http://localhost:3001/dashboard/pcm/relatorio", { headers: authHeaders }),
        fetch("http://localhost:3001/dashboard/pcm/metricas", { headers: authHeaders }),
      ]);

      if (!relatorioRes.ok || !metricasRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const relatorioData = await relatorioRes.json();
      const metricasData = await metricasRes.json();

      setRelatorio(relatorioData);
      setMetricas(metricasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const formatData = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
  };

  const formatMinutos = (minutos: number) => {
    if (!minutos) return "-";
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4">PCM - Planejamento e Controle de Manutenção</Typography>
          <Typography color="text.secondary">Análise de paradas e indicadores de performance</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Cards de Indicadores Principais */}
        {metricas && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Disponibilidade
                  </Typography>
                  <Typography variant="h5">{metricas.disponibilidadePercent}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Indisponibilidade
                  </Typography>
                  <Typography variant="h5">{metricas.indisponibilidadePercent}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    MTBF %
                  </Typography>
                  <Typography variant="h5">{metricas.mtbfVsMttr.mtbfPercent}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    MTTR %
                  </Typography>
                  <Typography variant="h5">{metricas.mtbfVsMttr.mttrPercent}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Relatório de Paradas - Quebra */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Relatório de Paradas (Quebra)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Nº Relatório</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Linha</strong></TableCell>
                  <TableCell><strong>Equipamento</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell><strong>Início</strong></TableCell>
                  <TableCell><strong>Fim</strong></TableCell>
                  <TableCell><strong>Manutentor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatorio.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Nenhuma parada encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  relatorio.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>#{item.id}</TableCell>
                      <TableCell>{formatData(item.data_abertura).split(" ")[0]}</TableCell>
                      <TableCell>{item.linha_lote || "-"}</TableCell>
                      <TableCell>{item.nome_equipamento}</TableCell>
                      <TableCell>{item.descricao_problema}</TableCell>
                      <TableCell>{formatData(item.data_inicio)}</TableCell>
                      <TableCell>{formatData(item.data_conclusao)}</TableCell>
                      <TableCell>{item.manutentor_nome || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* MTTR por Manutentor */}
        {metricas && metricas.mttrPorManutentor.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              MTTR (Tempo Médio de Reparo) por Manutentor
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><strong>Manutentor</strong></TableCell>
                    <TableCell align="right"><strong>MTTR</strong></TableCell>
                    <TableCell align="right"><strong>Total de Reparos</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metricas.mttrPorManutentor.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell align="right">{formatMinutos(item.mttr_minutos)}</TableCell>
                      <TableCell align="right">{item.total_reparos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* MTBF por Máquina */}
        {metricas && metricas.mtbfPorMaquina.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              MTBF (Tempo Médio Entre Falhas) por Máquina
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell><strong>Máquina</strong></TableCell>
                    <TableCell><strong>Localização</strong></TableCell>
                    <TableCell align="right"><strong>MTBF (horas)</strong></TableCell>
                    <TableCell align="right"><strong>Total de Paradas</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metricas.mtbfPorMaquina.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell>{item.localizacao}</TableCell>
                      <TableCell align="right">{item.mtbf_horas ? Math.round(item.mtbf_horas * 100) / 100 : "-"}h</TableCell>
                      <TableCell align="right">{item.total_paradas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
