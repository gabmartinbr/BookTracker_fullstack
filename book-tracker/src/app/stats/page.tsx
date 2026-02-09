"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Book, CheckCircle, Clock, Star } from "lucide-react";

export default function StatsPage() {
  const [stats, setStats] = useState({
    total: 0,
    leyendo: 0,
    terminados: 0,
    deseados: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('libros').select('estado').eq('user_id', user.id);
        if (data) {
          setStats({
            total: data.length,
            leyendo: data.filter(l => l.estado === 'leyendo').length,
            terminados: data.filter(l => l.estado === 'terminados').length,
            deseados: data.filter(l => l.estado === 'deseado').length,
          });
        }
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Books", value: stats.total, icon: Book, color: "from-blue-600 to-cyan-500" },
    { title: "Finished", value: stats.terminados, icon: CheckCircle, color: "from-emerald-600 to-teal-500" },
    { title: "Currently Reading", value: stats.leyendo, icon: Clock, color: "from-orange-600 to-yellow-500" },
    { title: "On Wishlist", value: stats.deseados, icon: Star, color: "from-purple-600 to-pink-500" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-white">Reading Insights</h1>
        <p className="text-slate-500">Your journey through pages in numbers</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <card.icon className="text-slate-500 mb-4 size-6" />
            <p className="text-slate-400 text-sm font-medium">{card.title}</p>
            <p className="text-3xl font-black text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6">Reading Progress</h3>
          <div className="space-y-4">
            {/* Barra de progreso simple */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Completion Rate</span>
                <span className="text-white font-bold">
                    {stats.total > 0 ? Math.round((stats.terminados / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(stats.terminados / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
          <div className="size-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Star className="text-blue-400 size-8 fill-blue-400/20" />
          </div>
          <h3 className="text-lg font-bold">Keep it up!</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-[250px]">
            You have {stats.deseados} books waiting for you in your wishlist. Start a new adventure today!
          </p>
        </div>
      </div>
    </div>
  );
}