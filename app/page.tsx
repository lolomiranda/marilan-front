"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [cracha, setCracha] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cracha, senha }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      localStorage.setItem("marilanUser", JSON.stringify(data));
      if (data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/ordens-servico");
      }
    } catch (err) {
      setError("Falha ao conectar ao servidor");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }

        .login-card {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-brand {
          animation: slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
        }
        .login-form-area {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }

        .marilan-input .MuiOutlinedInput-root {
          border-radius: 10px;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          background: #fff;
          transition: box-shadow 0.2s;
        }
        .marilan-input .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: #F97316;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #EA6C00;
          border-width: 2px;
        }
        .marilan-input .MuiOutlinedInput-root.Mui-focused {
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .marilan-input .MuiInputLabel-root.Mui-focused {
          color: #EA6C00;
        }
        .marilan-input .MuiInputLabel-root {
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
        }
      `}</style>

      {/* Full-page background */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/fundoFront.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
          px: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(28, 10, 0, 0.45)",
            zIndex: 0,
          },
        }}
      >
        {/* Decorative background circles */}
        <Box sx={{
          position: "absolute", top: "-120px", right: "-120px", zIndex: 1,
          width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
          animation: "pulse-ring 6s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", bottom: "-80px", left: "-80px", zIndex: 1,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,108,0,0.13) 0%, transparent 70%)",
          animation: "pulse-ring 8s ease-in-out infinite 2s",
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", top: "40%", left: "10%",
          width: 12, height: 12, borderRadius: "50%",
          background: "#F97316", opacity: 0.25,
          pointerEvents: "none",
        }} />
        <Box sx={{
          position: "absolute", top: "20%", right: "15%",
          width: 8, height: 8, borderRadius: "50%",
          background: "#EA6C00", opacity: 0.2,
          pointerEvents: "none",
        }} />

        {/* Card */}
        <Paper
          className="login-card"
          elevation={0}
          sx={{
            width: "100%",
            width: "60vw",
            maxWidth: 900,
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            zIndex: 2,
            boxShadow: "0 24px 64px rgba(120, 53, 15, 0.12), 0 4px 16px rgba(120, 53, 15, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.12)",
          }}
        >
          {/* Logo header */}
          <Box
            className="login-brand"
            sx={{
              borderBottom: "1px solid rgba(249, 115, 22, 0.12)",
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src="/logoMaiorAinda.png"
              alt="Marilan"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>

          {/* Form area */}
          <Box
            className="login-form-area"
            sx={{ px: 4, py: 4, background: "#fff" }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: "#1C0A00",
                    lineHeight: 1.2,
                  }}
                >
                  Bem-vindo de volta
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    color: "#78350F",
                    mt: 0.75,
                    opacity: 0.7,
                  }}
                >
                  Use seu crachá e senha para acessar o sistema.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: "10px",
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    className="marilan-input"
                    label="Crachá"
                    value={cracha}
                    onChange={(e) => setCracha(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    className="marilan-input"
                    label="Senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    sx={{
                      mt: 0.5,
                      py: 1.5,
                      borderRadius: "10px",
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      letterSpacing: "0.01em",
                      textTransform: "none",
                      background: loading
                        ? undefined
                        : "linear-gradient(135deg, #EA6C00 0%, #F97316 100%)",
                      boxShadow: "0 4px 14px rgba(234, 108, 0, 0.35)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #C95E00 0%, #EA6C00 100%)",
                        boxShadow: "0 6px 20px rgba(234, 108, 0, 0.45)",
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                        boxShadow: "0 2px 8px rgba(234, 108, 0, 0.3)",
                      },
                    }}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  pt: 1,
                  borderTop: "1px solid rgba(249, 115, 22, 0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "0.82rem",
                    color: "#78350F",
                    opacity: 0.65,
                  }}
                >
                  Não tem cadastro?{" "}
                  <Link
                    href="/register"
                    underline="hover"
                    sx={{
                      color: "#EA6C00",
                      fontWeight: 600,
                      opacity: 1,
                      "&:hover": { color: "#C95E00" },
                    }}
                  >
                    Registre-se aqui
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </>
  );
}