"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Sparkles, BookPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Tipos
type EstadoLibro = "leyendo" | "terminado" | "deseado";

interface LibroOpenLibrary {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<LibroOpenLibrary[]>([]);
  const [wishlist, setWishlist] = useState<LibroOpenLibrary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // 1. Cargar Wishlist inicial (solo si no hay búsqueda)
  useEffect(() => {
    const cargarWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .eq('user_id', user.id)
          .eq('estado', 'deseado')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (!error) setWishlist(data || []);
      }
      setLoadingWishlist(false);
    };
    cargarWishlist();
  }, []);

  // 2. Función de búsqueda
  const ejecutarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=12`);
      const data = await res.json();
      setResultados(data.docs);
    } catch (error) {
      toast.error("Error connecting to Open Library");
    } finally {
      setLoading(false);
    }
  };

  // 3. Guardar libro en Supabase
  const guardarLibro = async (libro: LibroOpenLibrary, estadoBoton: string) => {
    const toastId = toast.loading(`Adding ${libro.title}...`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in first", { id: toastId });
        return;
      }

      const mapeo: Record<string, EstadoLibro> = {
        "Wishlist": "deseado",
        "Reading": "leyendo",
        "Finished": "terminado"
      };

      const { error } = await supabase.from('libros').insert({
        book_id: libro.key,
        titulo: libro.title,
        autor: libro.author_name?.[0] || "Unknown Author",
        portada_url: libro.cover_i 
          ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg` 
          : null,
        user_id: user.id,
        estado: mapeo[estadoBoton]
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("Already in your library!", { id: toastId });
        } else {
          throw error;
        }
      } else {
        toast.success("Saved to library!", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to save book", { id: toastId });
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Hero & Search Section */}
      <header className="space-y-6 text-center md:text-left">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Find your next <span className="text-blue-500">adventure.</span>
        </h1>
        <form onSubmit={ejecutarBusqueda} className="relative max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            className="w-full bg-slate-900 border border-slate-800 p-5 pl-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-2xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-colors"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : "Search"}
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      {resultados.length > 0 ? (
        <section className="animate-in fade-in duration-700">
          <div className="flex items-center gap-2 mb-8 text-slate-400">
            <Search className="size-5" />
            <h2 className="text-lg font-semibold uppercase tracking-widest">Search Results</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {resultados.map((libro) => (
              <div key={libro.key} className="group flex flex-col">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border border-slate-800 transition-transform group-hover:-translate-y-2">
                  <img 
                    src={libro.cover_i ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg` : "https://via.placeholder.com/300x450?text=No+Cover"} 
                    alt={libro.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center p-4 gap-2">
                    <button onClick={() => guardarLibro(libro, "Reading")} className="bg-white text-black text-[10px] font-black py-2 rounded-lg hover:bg-slate-200 uppercase tracking-tighter">📖 Reading</button>
                    <button onClick={() => guardarLibro(libro, "Wishlist")} className="bg-blue-600 text-white text-[10px] font-black py-2 rounded-lg hover:bg-blue-500 uppercase tracking-tighter">✨ Wishlist</button>
                    <button onClick={() => guardarLibro(libro, "Finished")} className="bg-slate-800 text-white text-[10px] font-black py-2 rounded-lg hover:bg-slate-700 uppercase tracking-tighter">✅ Finished</button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-white font-bold text-sm truncate">{libro.title}</h3>
                  <p className="text-slate-500 text-xs truncate">{libro.author_name?.[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Empty State / Wishlist Preview */
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="size-5 text-yellow-500" />
              <h2 className="text-lg font-semibold uppercase tracking-widest">From your Wishlist</h2>
            </div>
          </div>

          {loadingWishlist ? (
            <div className="flex gap-6 overflow-hidden">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="min-w-[150px] aspect-[2/3] bg-slate-900 animate-pulse rounded-2xl" />
               ))}
            </div>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {wishlist.map((libro) => (
                <div key={libro.id} className="flex flex-col opacity-70 hover:opacity-100 transition-all cursor-pointer">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden border border-slate-800 shadow-lg mb-3">
                    <img src={libro.portada_url} alt={libro.titulo} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-xs truncate">{libro.titulo}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-20 text-center">
              <BookPlus className="size-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Your shelf is looking a bit lonely...</p>
              <p className="text-slate-600 text-sm">Search for a book to start building your library</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}