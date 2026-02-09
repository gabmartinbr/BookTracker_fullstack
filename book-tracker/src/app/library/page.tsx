/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

// Definimos el tipo de estado permitido
export type EstadoLibro = "leyendo" | "terminado" | "deseado";

interface LibroDB {
  id: number;
  book_id: string;
  titulo: string;
  autor: string;
  portada_url: string;
  user_id: string;
  estado: EstadoLibro;
}

export default function LibraryPage() {
  const [misLibros, setMisLibros] = useState<LibroDB[]>([]);
  const [cargando, setCargando] = useState(true);

  // Referencias corregidas para TypeScript
  const scrollRefs = {
    leyendo: useRef<HTMLDivElement>(null),
    terminado: useRef<HTMLDivElement>(null),
    deseado: useRef<HTMLDivElement>(null),
  };

  // 1. Declaramos la función ANTES del useEffect para evitar el error de acceso
  const cargarLibros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('libros')
        .select('*')
        .eq('user_id', user.id);

      if (!error) setMisLibros(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarLibros();
  }, []);

  // 2. Ajustamos el tipo del parámetro ref para que acepte null
  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const moveDistance = clientWidth * 0.7;
      const scrollTo = direction === 'left' ? scrollLeft - moveDistance : scrollLeft + moveDistance;
      
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // 3. Tipamos correctamente el nuevoEstado
  const cambiarEstado = async (idEnTabla: number, nuevoEstado: EstadoLibro) => {
    const { error } = await supabase
      .from('libros')
      .update({ estado: nuevoEstado })
      .eq('id', idEnTabla);

    if (error) {
      toast.error("No se pudo actualizar el estado");
    } else {
      setMisLibros(prev => prev.map(l => 
        l.id === idEnTabla ? { ...l, estado: nuevoEstado } : l
      ));
      toast.success(`Moved to ${nuevoEstado} ✨`);
    }
  };

  const eliminarLibro = async (idEnTabla: number) => {
    const { error } = await supabase.from('libros').delete().eq('id', idEnTabla);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      setMisLibros(prev => prev.filter((libro) => libro.id !== idEnTabla));
      toast.success("Eliminado de tu biblioteca");
    }
  };

  if (cargando) return <div className="p-10 text-white text-center">Connecting...</div>;

  const secciones = [
    { id: "leyendo", titulo: "📖 Currently Reading", color: "text-blue-400" },
    { id: "deseado", titulo: "✨ Whish List", color: "text-purple-400" },
    { id: "terminado", titulo: "✅ Finished", color: "text-emerald-400" }
  ] as const;

  return (
    <div className="p-4 md:p-10 space-y-16 max-w-350 mx-auto">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">My Library</h1>
        <p className="text-slate-500 mt-2">Track your books depending on its state</p>
      </header>

      {misLibros.length === 0 ? (
        <div className="bg-slate-800/30 p-20 rounded-3xl border border-slate-800 text-center">
          <p className="text-slate-400 text-xl">Your shelf is empty</p>
        </div>
      ) : (
        secciones.map((seccion) => {
          const librosFiltrados = misLibros.filter(l => l.estado === seccion.id);
          
          return (
            <section key={seccion.id} className="space-y-6 relative group/row">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className={`text-2xl font-bold ${seccion.color}`}>{seccion.titulo}</h2>
                  <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-mono">
                    {librosFiltrados.length}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => scroll(scrollRefs[seccion.id], 'left')}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-slate-900 border border-slate-700 w-10 h-10 rounded-full items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity shadow-xl hover:bg-slate-800 hidden md:flex"
                >
                  ◀
                </button>

                <div 
                  ref={scrollRefs[seccion.id]}
                  className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x scroll-smooth"
                >
                  {librosFiltrados.length === 0 ? (
                    <div className="w-full py-10 border border-dashed border-slate-800 rounded-2xl text-center text-slate-600 text-sm">
                      No books to show here
                    </div>
                  ) : (
                    librosFiltrados.map((libro) => (
                      <div 
                        key={libro.id} 
                        className="min-w-45 max-w-45 snap-start group relative"
                      >
                        <div className="relative aspect-2/3 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300 group-hover:border-slate-600">
                          <img
                            src={libro.portada_url || "https://via.placeholder.com/300x450?text=No+Cover"}
                            className="w-full h-full object-cover"
                            alt={libro.titulo}
                          />
                          
                          <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-4 gap-2 backdrop-blur-sm">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-2">Mover a</p>
                            
                            {seccion.id !== 'leyendo' && (
                              <button onClick={() => cambiarEstado(libro.id, 'leyendo')} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-2 rounded-lg font-bold transition-colors">📖 READING</button>
                            )}
                            {seccion.id !== 'terminado' && (
                              <button onClick={() => cambiarEstado(libro.id, 'terminado')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-2 rounded-lg font-bold transition-colors">✅ FINISHED</button>
                            )}
                            {seccion.id !== 'deseado' && (
                              <button onClick={() => cambiarEstado(libro.id, 'deseado')} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] py-2 rounded-lg font-bold transition-colors">✨ WANT TO READ</button>
                            )}
                            
                            <button 
                              onClick={() => eliminarLibro(libro.id)}
                              className="mt-15 text-[10px] text-red-400 hover:text-red-300 font-bold"
                            >
                              🗑️ DELETE
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-sm font-bold text-slate-100 truncate" title={libro.titulo}>{libro.titulo}</h3>
                          <p className="text-xs text-slate-500 truncate">{libro.autor}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button 
                  onClick={() => scroll(scrollRefs[seccion.id], 'right')}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-slate-900 border border-slate-700 w-10 h-10 rounded-full items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity shadow-xl hover:bg-slate-800 hidden md:flex"
                >
                  ▶
                </button>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}