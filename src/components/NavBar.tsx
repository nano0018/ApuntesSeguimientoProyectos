import { useState } from "react";
import { supabase } from "../lib/supabase";
import { IconMoon, IconSun } from "./icons";

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-bs-theme") || "light",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
      aria-label="Cambiar tema"
      onClick={toggle}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary border-bottom mb-4">
      <div className="container">
        <a className="navbar-brand" href="/">
          Seguimiento de proyectos
        </a>
        <button
          type="button"
          className="navbar-toggler"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            <li className="nav-item">
              <a className="nav-link" href="/">
                Apuntes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/proyectos">
                Proyectos
              </a>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
            <ThemeToggle />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
