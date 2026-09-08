import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Apunte, Proyecto } from "../lib/types";
import { useSession } from "../lib/useSession";
import NavBar from "./NavBar";
import { IconCalendar, IconChat, IconEdit, IconFolder, IconTrash } from "./icons";

const today = () => new Date().toISOString().slice(0, 10);

export default function ApuntesView() {
  const session = useSession();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [apuntes, setApuntes] = useState<Apunte[]>([]);
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<Apunte | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(today());
  const [tituloReunion, setTituloReunion] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [notas, setNotas] = useState("");

  async function loadProyectos() {
    const { data, error } = await supabase
      .from("proyecto")
      .select("*")
      .order("proyecto");
    if (error) setError(error.message);
    else {
      setProyectos(data);
      if (!proyecto && data.length) setProyecto(data[0].proyecto);
    }
  }

  async function loadApuntes() {
    let query = supabase
      .from("apuntes")
      .select("*")
      .order("fecha", { ascending: false });
    if (filtro) query = query.eq("proyecto", filtro);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setApuntes(data);
  }

  useEffect(() => {
    if (session) loadProyectos();
  }, [session]);

  useEffect(() => {
    if (session) loadApuntes();
  }, [session, filtro]);

  function resetForm() {
    setEditingId(null);
    setFecha(today());
    setTituloReunion("");
    setProyecto(proyectos[0]?.proyecto ?? "");
    setNotas("");
  }

  function startEdit(a: Apunte) {
    setEditingId(a.id);
    setFecha(a.fecha);
    setTituloReunion(a.titulo_reunion);
    setProyecto(a.proyecto);
    setNotas(a.apuntes ?? "");
  }

  function editAndScroll(a: Apunte) {
    startEdit(a);
    setDetalle(null);
    document.getElementById("apunte-form")?.scrollIntoView({ behavior: "smooth" });
  }

  const apuntesFiltrados = busqueda
    ? apuntes.filter((a) =>
        a.titulo_reunion.toLowerCase().includes(busqueda.trim().toLowerCase()),
      )
    : apuntes;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      fecha,
      titulo_reunion: tituloReunion,
      proyecto,
      apuntes: notas || null,
    };
    const { error } = editingId
      ? await supabase.from("apuntes").update(payload).eq("id", editingId)
      : await supabase.from("apuntes").insert(payload);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    loadApuntes();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este apunte?")) return;
    const { error } = await supabase.from("apuntes").delete().eq("id", id);
    if (error) setError(error.message);
    else loadApuntes();
  }

  if (!session) return null;

  return (
    <>
      <NavBar />
      <main className="container pb-5">
        <h1 className="h4 mb-3">Apuntes de reuniones</h1>
        {error && <p className="text-danger">{error}</p>}

        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Buscar por título</label>
            <input
              type="search"
              className="form-control"
              placeholder="Título de la reunión..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Filtrar por proyecto</label>
            <select
              className="form-select"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.proyecto}>
                  {p.proyecto}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <table className="table table-hover align-middle" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>
                  <span className="d-none d-md-inline">Fecha</span>
                  <span className="d-md-none" title="Fecha">
                    <IconCalendar />
                  </span>
                </th>
                <th style={{ width: "18%" }}>
                  <span className="d-none d-md-inline">Título reunión</span>
                  <span className="d-md-none" title="Título reunión">
                    <IconChat />
                  </span>
                </th>
                <th style={{ width: "15%" }}>
                  <span className="d-none d-md-inline">Proyecto</span>
                  <span className="d-md-none" title="Proyecto">
                    <IconFolder />
                  </span>
                </th>
                <th>Apuntes</th>
                <th className="d-none d-md-table-cell" style={{ width: "96px" }}></th>
              </tr>
            </thead>
            <tbody>
              {apuntesFiltrados.map((a) => (
                <tr key={a.id} role="button" style={{ cursor: "pointer" }} onClick={() => setDetalle(a)}>
                  <td className="text-nowrap">{a.fecha}</td>
                  <td className="text-truncate" title={a.titulo_reunion}>
                    {a.titulo_reunion}
                  </td>
                  <td className="text-truncate" title={a.proyecto}>
                    {a.proyecto}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {a.apuntes}
                  </td>
                  <td className="d-none d-md-table-cell">
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Editar"
                        aria-label="Editar"
                        onClick={(e) => {
                          e.stopPropagation();
                          editAndScroll(a);
                        }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                        aria-label="Eliminar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(a.id);
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form
          id="apunte-form"
          onSubmit={handleSubmit}
          className="card card-body"
          style={{ maxWidth: 480 }}
        >
          <h2 className="h6">{editingId ? "Editar apunte" : "Nuevo apunte"}</h2>
          <div className="mb-3">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Título de la reunión</label>
            <input
              className="form-control"
              required
              value={tituloReunion}
              onChange={(e) => setTituloReunion(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Proyecto</label>
            <select
              className="form-select"
              required
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
            >
              {proyectos.length === 0 && <option value="">Sin proyectos</option>}
              {proyectos.map((p) => (
                <option key={p.id} value={p.proyecto}>
                  {p.proyecto}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Apuntes</label>
            <textarea
              className="form-control"
              rows={4}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={!proyecto}>
              {editingId ? "Guardar" : "Agregar"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {detalle && (
          <>
            <div className="modal-backdrop show" onClick={() => setDetalle(null)}></div>
            <div className="modal d-block" tabIndex={-1} role="dialog">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{detalle.titulo_reunion}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      onClick={() => setDetalle(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p className="mb-1">
                      <strong>Fecha:</strong> {detalle.fecha}
                    </p>
                    <p className="mb-3">
                      <strong>Proyecto:</strong> {detalle.proyecto}
                    </p>
                    <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {detalle.apuntes}
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => editAndScroll(detalle)}
                    >
                      <IconEdit /> Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => {
                        setDetalle(null);
                        handleDelete(detalle.id);
                      }}
                    >
                      <IconTrash /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
