import { Upload, FileCheck, Target, Award, CloudLightning } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-cyan-400">
          <CloudLightning size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-100">Cloud<span className="text-cyan-400">Career</span></span>
        </div>
        <div className="space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
            Log in
          </button>
          <button className="px-5 py-2 text-sm font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-rose-400 text-sm font-bold mb-8 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Powered by Amazon Bedrock</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-100 mb-8 leading-tight">
          Is your CV ready for the <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cloud Era?</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Upload your resume and let our AI dissect your skills. Discover hidden gaps, forge a personalized AWS certification roadmap, and strike your next career target.
        </p>

        {/* Upload Action Area (The Greninja Scarf Accent) */}
        <div className="max-w-xl mx-auto bg-slate-900/50 p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-rose-500 hover:bg-slate-900 transition-all duration-300 cursor-pointer group shadow-lg">
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="p-5 bg-slate-950 text-rose-500 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]">
              <Upload size={36} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-200">Drop your CV here</p>
              <p className="text-sm text-slate-500 mt-2">PDF format only (Max 5MB)</p>
            </div>
            <button className="mt-4 px-8 py-3.5 w-full font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-500 transition-all shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5">
              Initiate Analysis
            </button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-slate-950 border-t border-slate-900 py-20 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 bg-cyan-500 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          {/* Card 1 */}
          <div className="flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <div className="p-4 bg-slate-950 text-cyan-400 rounded-xl mb-6 shadow-inner">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Role Precision</h3>
            <p className="text-slate-400 leading-relaxed">Pinpoint exactly how close you are to becoming a Cloud Engineer or Solutions Architect.</p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-colors">
            <div className="p-4 bg-slate-950 text-rose-400 rounded-xl mb-6 shadow-inner">
              <FileCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Skill Gap Detection</h3>
            <p className="text-slate-400 leading-relaxed">We cross-reference your CV against thousands of elite job descriptions to find your blind spots.</p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
            <div className="p-4 bg-slate-950 text-cyan-400 rounded-xl mb-6 shadow-inner">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Evolution Roadmap</h3>
            <p className="text-slate-400 leading-relaxed">Get a strategic learning path dictating exactly which AWS certs to conquer next.</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default App;
