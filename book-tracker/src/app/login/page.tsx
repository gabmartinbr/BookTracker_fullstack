"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: "LOGIN" | "SIGNUP") => {
    setLoading(true);
    const { error } = type === "LOGIN" 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      if (type === "SIGNUP") alert("¡Cuenta creada! Ya puedes loguearte.");
      else router.push("/"); // Te manda al buscador al entrar
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Access your personal library</p>
        
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email address" 
            className="w-full p-4 bg-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-slate-800 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => handleAuth("LOGIN")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Sign In"}
            </button>
            <button 
              onClick={() => handleAuth("SIGNUP")}
              disabled={loading}
              className="w-full bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 p-4 rounded-2xl font-bold transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}