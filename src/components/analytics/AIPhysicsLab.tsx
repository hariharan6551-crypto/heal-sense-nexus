import { useState } from 'react';
import { Send, FlaskConical, Atom, Zap, Rocket, BookOpen } from 'lucide-react';

export default function AIPhysicsLab() {
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<{ q: string; a: React.ReactNode }[]>([]);

  const handleAsk = () => {
    if (!question.trim()) return;
    const q = question.trim();
    const ql = q.toLowerCase();

    let answer: React.ReactNode = null;

    if (ql.includes('understand anti-gravity') || ql.includes('anti gravity') || ql.includes('antigravity')) {
      answer = (
        <div className="space-y-4 fade-in">
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]">
            <h4 className="font-bold flex items-center gap-2 text-blue-400 mb-2 drop-shadow-[0_0_5px_currentColor]">
              <BookOpen className="w-4 h-4" /> 1. Scientific Explanation
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              Gravity is currently understood through <strong className="text-blue-300">General Relativity</strong> as the curvature of spacetime caused by mass and energy. "Anti-gravity" implies a repulsive force. While not currently observed, theoretical physics explores concepts like <strong className="text-blue-300">Dark Energy</strong> (which accelerates universal expansion) and hypothetical <strong className="text-blue-300">negative energy density</strong> in Quantum Field Theory that could theoretically warp spacetime to repel matter.
            </p>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]">
            <h4 className="font-bold flex items-center gap-2 text-amber-400 mb-2 drop-shadow-[0_0_5px_currentColor]">
              <Zap className="w-4 h-4" /> 2. Identify Scientific Limitations
            </h4>
            <ul className="text-sm text-slate-300 space-y-2 list-none pl-1 font-mono">
              <li className="flex gap-2"><span className="text-amber-500">▶</span> Gravity is strictly attractive under the Standard Model and General Relativity.</li>
              <li className="flex gap-2"><span className="text-amber-500">▶</span> Recent antimatter experiments (e.g., CERN's ALPHA) show antimatter still falls downward.</li>
              <li className="flex gap-2"><span className="text-amber-500">▶</span> No confirmed repulsive gravitational particle or force exists.</li>
            </ul>
          </div>

          <div className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/30 shadow-[inset_0_0_15px_rgba(139,92,246,0.1)]">
            <h4 className="font-bold flex items-center gap-2 text-violet-400 mb-2 drop-shadow-[0_0_5px_currentColor]">
              <Atom className="w-4 h-4" /> 3. Explore Theoretical Concepts
            </h4>
            <ul className="text-sm text-slate-300 space-y-2 list-none pl-1 font-mono">
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-300">Exotic Matter:</strong> Particles with negative mass could create repulsive gravitational fields.</li>
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-300">Quantum Vacuum Fluctuations:</strong> Manipulating the Casimir effect.</li>
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-300">Electro-gravitics:</strong> Hypothetical high-voltage electric fields altering local gravity.</li>
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-300">Wave Interference:</strong> Creating gravitational wave interference patterns.</li>
            </ul>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
            <h4 className="font-bold flex items-center gap-2 text-emerald-400 mb-2 drop-shadow-[0_0_5px_currentColor]">
              <FlaskConical className="w-4 h-4" /> 4. Experimental Possibilities
            </h4>
            <ul className="text-sm text-slate-300 space-y-2 list-none pl-1 font-mono">
              <li className="flex gap-2"><span className="text-emerald-500">▶</span> High-energy electromagnetic field manipulation in a vacuum.</li>
              <li className="flex gap-2"><span className="text-emerald-500">▶</span> Superconductor field interaction tests.</li>
              <li className="flex gap-2"><span className="text-emerald-500">▶</span> Advanced interferometry to measure field fluctuations.</li>
            </ul>
          </div>

          <div className="bg-pink-500/10 p-4 rounded-xl border border-pink-500/30 shadow-[inset_0_0_15px_rgba(236,72,153,0.1)]">
            <h4 className="font-bold flex items-center gap-2 text-pink-400 mb-2 drop-shadow-[0_0_5px_currentColor]">
              <Rocket className="w-4 h-4" /> 5. Engineering Applications
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              If stable theoretical concepts are achieved, applications could include <strong className="text-pink-300">Anti-gravity propulsion concepts</strong>, spacecraft relying on <strong className="text-pink-300">Spacetime curvature manipulation</strong> (warp drives), and <strong className="text-pink-300">Quantum field propulsion systems</strong>.
            </p>
          </div>
        </div>
      );
    } else {
      answer = (
        <p className="text-sm text-slate-400 font-mono">
          I am the AI Physics Lab. My current focus is advanced theoretical physics. Try asking me: <br/>
          <strong className="text-blue-400 mt-2 block hover:text-blue-300 cursor-pointer transition-colors" onClick={() => setQuestion('Understand Anti-Gravity and propose actions')}>{">>"} "Understand Anti-Gravity and propose actions"</strong>
        </p>
      );
    }

    setResponses(prev => [...prev, { q, a: answer }]);
    setQuestion('');
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-xl border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-b border-blue-500/30 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-[80px] -z-10" />
        
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Atom className="h-6 w-6 text-blue-400 drop-shadow-[0_0_5px_currentColor] animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] uppercase">AI Physics Research Lab</h3>
            <p className="text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold font-mono mt-0.5">Advanced Theoretical Science Engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/30 custom-scrollbar relative">
        {responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-blue-300/30 space-y-4">
            <div className="relative">
              <Atom className="w-24 h-24 stroke-[1] animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Atom className="w-12 h-12 stroke-[1.5] text-blue-400/50 animate-[spin_10s_linear_infinite_reverse]" />
              </div>
            </div>
            <p className="font-mono text-sm tracking-widest">AWAITING QUANTUM QUERY...</p>
          </div>
        ) : (
          responses.map((item, i) => (
            <div key={i} className="space-y-4 animate-scale-in">
              <div className="flex items-start justify-end gap-2">
                <div className="bg-blue-600/20 border border-blue-500/50 text-blue-100 px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] max-w-[80%] font-mono">
                  {item.q}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                   <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                  <Atom className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_currentColor] relative z-10" />
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] w-full max-w-[90%]">
                  {item.a}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-5 bg-black/60 border-t border-blue-500/30 backdrop-blur-xl">
        <div className="flex gap-3 relative">
          <input
            type="text"
            placeholder="Initialize theoretical query..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 pl-4 pr-14 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 text-blue-100 placeholder-blue-300/30 font-mono shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] transition-all"
          />
          <button 
            onClick={handleAsk} 
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600/80 text-white rounded-lg hover:bg-blue-500 border border-blue-400/50 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            <Send className="h-4 w-4 drop-shadow-[0_0_5px_currentColor]" />
          </button>
        </div>
        <div className="mt-3 text-center text-[9px] text-blue-400/60 font-black tracking-[0.3em] uppercase">
          System: Online | Module: Active | Sec-Lvl: Alpha
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
}
