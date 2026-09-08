export interface Proyecto {
  id: number;
  proyecto: string;
  contratista: string | null;
}

export interface Apunte {
  id: number;
  fecha: string;
  titulo_reunion: string;
  apuntes: string | null;
  proyecto: string;
}
