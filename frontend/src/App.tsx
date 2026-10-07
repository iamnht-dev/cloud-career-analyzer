import { Upload, FileCheck, Target, Award, Cloud } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Cloud size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-800">Cloud<span className="text-indigo-600">Career</span></span>
        </div>
        <div className="space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Log in
          </button>
          <button className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>Powered by Amazon Bedrock</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Is your CV ready for the <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Cloud Era?</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Upload your resume and our AI will instantly analyze your skills against top AWS engineering roles. Discover your skill gaps, get a personalized certification roadmap, and land your dream cloud job.
        </p>

        {/* Upload Action Area */}
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border-2 border-slate-200 border-dashed hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer group">
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="p-5 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 shadow-sm">
              <Upload size={36} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">Upload your CV</p>
              <p className="text-sm text-slate-500 mt-2">PDF format only (Max 5MB)</p>
            </div>
            <button className="mt-4 px-8 py-3.5 w-full font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Start Free Analysis
            </button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-200 py-20 relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03] bg-indigo-600 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Role Readiness Score</h3>
            <p className="text-slate-600 leading-relaxed">Find out exactly how close you are to becoming a Cloud Engineer or Solutions Architect.</p>
          </div>

          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-xl mb-6">
              <FileCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Skill Gap Analysis</h3>
            <p className="text-slate-600 leading-relaxed">We compare your CV against thousands of real job descriptions to find what you're missing.</p>
          </div>

          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-xl mb-6">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Certification Roadmap</h3>
            <p className="text-slate-600 leading-relaxed">Get a personalized learning path telling you exactly which AWS certs to tackle next.</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default App;
