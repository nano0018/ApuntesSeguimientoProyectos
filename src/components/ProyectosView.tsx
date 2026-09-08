import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Proyecto } from "../lib/types";
import { useSession } from "../lib/useSession";
import NavBar from "./NavBar";
import { IconEdit, IconTrash } from "./icons";

export default function ProyectosView() {
  const session = useSession();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [contratista, setContratista] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("proyecto")
      .select("*")
      .order("proyecto");
    if (error) setError(error.message);
    else setProyectos(data);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  function startEdit(p: Proyecto) {
    setEditingId(p.id);
    setNombre(p.proyecto);
    setContratista(p.contratista ?? "");
  }

  function resetForm() {
    setEditingId(null);
    setNombre("");
    setContratista("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = { proyecto: nombre, contratista: contratista || null };
    const { error } = editingId
      ? await supabase.from("proyecto").update(payload).eq("id", editingId)
      : await supabase.from("proyecto").insert(payload);

    if (error) {
      setError(error.message);
      return;
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const { error } = await supabase.from("proyecto").delete().eq("id", id);
    if (error) setError(error.message);
    else load();
  }

  if (!session) return null;

  return (
    <>
      <NavBar />
      <main className="container pb-5">
        <h1 className="h4 mb-3">Proyectos</h1>
        {error && <p className="text-danger">{error}</p>}

        <div className="table-responsive mb-4">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Contratista</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>{p.proyecto}</td>
                  <td>{p.contratista}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Editar"
                        aria-label="Editar"
                        onClick={() => startEdit(p)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                        aria-label="Eliminar"
                        onClick={() => handleDelete(p.id)}
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

        <form onSubmit={handleSubmit} className="card card-body" style={{ maxWidth: 420 }}>
          <h2 className="h6">{editingId ? "Editar proyecto" : "Nuevo proyecto"}</h2>
          <div className="mb-3">
            <label className="form-label">Proyecto</label>
            <input
              className="form-control"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contratista</label>
            <input
              className="form-control"
              value={contratista}
              onChange={(e) => setContratista(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editingId ? "Guardar" : "Agregar"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </main>
    </>
  );
}
