import { useState, useRef } from 'react';
import { Upload, FileCheck, Target, Award, Cloud, Loader2, CheckCircle, Briefcase } from 'lucide-react';

const ROLES = [
  "Cloud Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Analyst",
  "DevOps Engineer"
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        alert("Vui lòng chỉ tải lên định dạng PDF.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng tải file dưới 5MB.");
        return;
      }
      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      // 1. Lấy Presigned URL, có truyền thêm tên Ngành nghề (Role)
      const response = await fetch(`${apiUrl}?role=${encodeURIComponent(role)}`);
      if (!response.ok) throw new Error("Không thể kết nối đến máy chủ.");
      
      const data = await response.json();
      const { uploadUrl } = data;

      // 2. Upload thẳng file PDF lên S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/pdf"
        }
      });

      if (!uploadResponse.ok) throw new Error("Lỗi khi tải file lên S3.");
      
      setUploadSuccess(true);
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi tải CV lên. Vui lòng thử lại sau.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Cloud size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-800">Career<span className="text-indigo-600">AI</span></span>
        </div>
        <div className="space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Log in</button>
          <button className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md">Sign up</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-20 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>Powered by Universal AI Analysis</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Is your CV ready for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
            {role === "Cloud Engineer" ? "the Cloud Era?" : `a ${role} role?`}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Select your dream role and upload your resume. Our AI will instantly analyze your skills, discover hidden gaps, and forge a personalized learning roadmap just for you.
        </p>

        {/* Role Selector */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Briefcase className="text-slate-400" size={24} />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-lg font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-300"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Upload Action Area */}
        <div 
          onClick={() => !file && fileInputRef.current?.click()}
          className={`max-w-xl mx-auto p-8 rounded-2xl shadow-sm border-2 border-dashed transition-all duration-300 ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer'} group`}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />

          <div className="flex flex-col items-center justify-center space-y-5">
            {uploadSuccess ? (
              <div className="p-5 bg-green-100 text-green-600 rounded-2xl shadow-sm animate-bounce">
                <CheckCircle size={36} strokeWidth={2.5} />
              </div>
            ) : (
              <div className={`p-5 rounded-2xl transition-transform duration-300 shadow-sm ${file ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110 group-hover:-translate-y-1'}`}>
                {isUploading ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} strokeWidth={2.5} />}
              </div>
            )}
            
            <div>
              {uploadSuccess ? (
                <>
                  <p className="text-xl font-bold text-green-700">Upload Successful!</p>
                  <p className="text-sm text-green-600 mt-2">AI is analyzing your CV for <b>{role}</b>...</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-slate-800">{file ? file.name : "Upload your CV"}</p>
                  <p className="text-sm text-slate-500 mt-2">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF format only (Max 5MB)"}</p>
                </>
              )}
            </div>

            {!uploadSuccess && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={isUploading}
                className="mt-4 px-8 py-3.5 w-full font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center"
              >
                {isUploading ? <><Loader2 size={20} className="animate-spin mr-2" /> Uploading to S3...</> : file ? `Analyze for ${role}` : "Select PDF File"}
              </button>
            )}
            
            {file && !isUploading && !uploadSuccess && (
              <p onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-sm text-red-500 hover:underline cursor-pointer mt-2">Remove file</p>
            )}
          </div>
        </div>
      </main>

      <section className="bg-white border-t border-slate-200 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03] bg-indigo-600 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl mb-6"><Target size={32} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Role Precision</h3>
            <p className="text-slate-600 leading-relaxed">Find out exactly how close you are to becoming a top-tier {role}.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white transition-all shadow-sm">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-xl mb-6"><FileCheck size={32} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Skill Gap Analysis</h3>
            <p className="text-slate-600 leading-relaxed">We compare your CV against thousands of real job descriptions to find what you're missing.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-white transition-all shadow-sm">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-xl mb-6"><Award size={32} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Certification Roadmap</h3>
            <p className="text-slate-600 leading-relaxed">Get a personalized learning path telling you exactly what to tackle next.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
