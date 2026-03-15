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
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-bold flex items-center gap-2 text-blue-800 mb-2">
              <BookOpen className="w-4 h-4" /> 1. Scientific Explanation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Gravity is currently understood through <strong>General Relativity</strong> as the curvature of spacetime caused by mass and energy. "Anti-gravity" implies a repulsive force. While not currently observed, theoretical physics explores concepts like <strong>Dark Energy</strong> (which accelerates universal expansion) and hypothetical <strong>negative energy density</strong> in Quantum Field Theory that could theoretically warp spacetime to repel matter.
            </p>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <h4 className="font-bold flex items-center gap-2 text-amber-800 mb-2">
              <Zap className="w-4 h-4" /> 2. Identify Scientific Limitations
            </h4>
            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
              <li>Gravity is strictly attractive under the Standard Model and General Relativity.</li>
              <li>Recent antimatter experiments (e.g., CERN's ALPHA) show antimatter still falls downward (it responds normally to gravity).</li>
              <li>No confirmed repulsive gravitational particle or force (like a hypothetical spin-1 graviton variant) exists.</li>
            </ul>
          </div>

          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <h4 className="font-bold flex items-center gap-2 text-purple-800 mb-2">
              <Atom className="w-4 h-4" /> 3. Explore Theoretical Concepts
            </h4>
            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
              <li><strong>Exotic Matter:</strong> Particles with negative mass could create repulsive gravitational fields (Alcubierre warp drives require this).</li>
              <li><strong>Quantum Vacuum Fluctuations:</strong> Manipulating the Casimir effect to achieve negative energy states.</li>
              <li><strong>Electro-gravitics:</strong> Hypothetical high-voltage electric fields altering local gravity (Biefeld-Brown effect, though mostly attributed to ion wind).</li>
              <li><strong>Wave Interference:</strong> Creating gravitational wave interference patterns.</li>
            </ul>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold flex items-center gap-2 text-emerald-800 mb-2">
              <FlaskConical className="w-4 h-4" /> 4. Experimental Possibilities
            </h4>
            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
              <li>High-energy electromagnetic field manipulation in a vacuum to measure local gravitational variations.</li>
              <li>Superconductor field interaction tests (e.g., rotating superconductors like the Podkletnov experiment).</li>
              <li>Advanced interferometry to measure quantum vacuum field fluctuations under intense magnetic stress.</li>
            </ul>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h4 className="font-bold flex items-center gap-2 text-indigo-800 mb-2">
              <Rocket className="w-4 h-4" /> 5. Engineering Applications
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              If stable theoretical concepts are achieved, applications could include <strong>Anti-gravity propulsion concepts</strong>, spacecraft relying on <strong>Spacetime curvature manipulation</strong> (warp drives), and <strong>Quantum field propulsion systems</strong>, which would revolutionize logistics, space exploration, and energy generation.
            </p>
          </div>
        </div>
      );
    } else {
      answer = (
        <p className="text-sm text-slate-600">
          I am the AI Physics Lab. My current focus is advanced theoretical physics. Try asking me: <br/>
          <strong className="text-blue-600 mt-2 block">"Understand Anti-Gravity and propose actions"</strong>
        </p>
      );
    }

    setResponses(prev => [...prev, { q, a: answer }]);
    setQuestion('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <Atom className="h-6 w-6 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">AI Physics Research Lab</h3>
            <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold mt-0.5">Advanced Theoretical Science Engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
        {responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 opacity-70">
            <Atom className="w-16 h-16" />
            <p>Welcome to the AI Physics Lab.<br/>Ask a complex physics query to begin.</p>
          </div>
        ) : (
          responses.map((item, i) => (
            <div key={i} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-end gap-2">
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-md max-w-[80%]">
                  {item.q}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Atom className="w-4 h-4 text-indigo-300" />
                </div>
                <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm text-sm shadow-sm w-full max-w-[90%]">
                  {item.a}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            placeholder="E.g., Understand Anti-Gravity and propose actions"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
          <button 
            onClick={handleAsk} 
            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-400 font-medium tracking-wide">
          SYSTEM: ENGAGED | THEORETICAL MODULE: ACTIVE
        </div>
      </div>
    </div>
  );
}
