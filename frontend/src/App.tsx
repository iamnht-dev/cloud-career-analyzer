import { Upload, FileCheck, Target, Award, Cloud } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Cloud size={32} />
          <span className="text-xl font-bold tracking-tight">CloudCareer AI</span>
        </div>
        <div className="space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            Log in
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-6">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
          <span>Powered by Amazon Bedrock</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Is your CV ready for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Cloud</span>?
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Upload your resume and our AI will instantly analyze your skills against top AWS engineering roles. Discover your skill gaps, get a personalized certification roadmap, and land your dream cloud job.
        </p>

        {/* Upload Action Area */}
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 border-dashed hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">Upload your CV</p>
              <p className="text-sm text-slate-500 mt-1">PDF format (Max 5MB)</p>
            </div>
            <button className="mt-4 px-6 py-3 w-full font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition-all">
              Start Free Analysis
            </button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center text-center p-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mb-4">
              <Target size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Role Readiness Score</h3>
            <p className="text-slate-600">Find out exactly how close you are to becoming a Cloud Engineer or Solutions Architect.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mb-4">
              <FileCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Skill Gap Analysis</h3>
            <p className="text-slate-600">We compare your CV against thousands of real job descriptions to find what you're missing.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl mb-4">
              <Award size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Certification Roadmap</h3>
            <p className="text-slate-600">Get a personalized learning path telling you exactly which AWS certs to tackle next.</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default App;
