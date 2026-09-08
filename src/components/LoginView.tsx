import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginView() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/";
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signup") {
      setInfo("Cuenta creada. Revisa tu correo si se requiere confirmación, luego inicia sesión.");
      setMode("login");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="container d-flex justify-content-center align-items-center py-5">
      <form onSubmit={handleSubmit} className="card card-body w-100" style={{ maxWidth: 380 }}>
        <h1 className="h4 mb-3">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        {info && <p className="text-body-secondary">{info}</p>}
        <button type="submit" className="btn btn-primary mb-2" disabled={loading}>
          {mode === "login" ? "Entrar" : "Registrarme"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "login" ? "Crear una cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </main>
  );
}
