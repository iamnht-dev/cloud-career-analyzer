import { useState, useRef, useEffect } from 'react';
import { Upload, FileCheck, Target, Award, Cloud, Loader2, CheckCircle, Briefcase, RefreshCw, XCircle, CheckSquare } from 'lucide-react';

const ROLES = [
  "Cloud Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Analyst",
  "DevOps Engineer"
];

const HISTORY_SESSION_KEY = 'cloud-career-analyzer-session';
const getSessionId = () => {
  let id = localStorage.getItem(HISTORY_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(HISTORY_SESSION_KEY, id);
  }
  return id;
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) return;
        const baseUrl = apiUrl.replace(/\/upload-url\/?$/, '');
        const response = await fetch(`${baseUrl}/analysis-history?sessionId=${encodeURIComponent(getSessionId())}`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data.items || []);
        }
      } catch (error) {
        console.error('Unable to load analysis history:', error);
      }
    };
    loadHistory();
  }, []);

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
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setAnalysisResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.replace('/upload-url', '');
      
      // 1. Lấy Presigned URL
      setProgressStep('Đang chuẩn bị luồng bảo mật (AWS S3)...');
      const response = await fetch(`${apiUrl}?role=${encodeURIComponent(role)}`);
      if (!response.ok) throw new Error("Không thể kết nối đến máy chủ.");
      const data = await response.json();
      const { uploadUrl, fileName } = data;

      // 2. Upload file PDF lên S3
      setProgressStep('Đang tải CV của bạn lên Đám mây...');
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" }
      });
      if (!uploadResponse.ok) throw new Error("Lỗi khi tải file lên S3.");

      // Trích xuất Bucket name từ URL
      const bucket = new URL(uploadUrl).hostname.split('.')[0];

      // 3. Trích xuất văn bản (ExtractText)
      setProgressStep('Đang bóc tách chữ từ file PDF...');
      const extractRes = await fetch(`${baseUrl}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, key: fileName })
      });
      if (!extractRes.ok) throw new Error("Lỗi khi đọc file PDF.");
      const extractData = await extractRes.json();

      // 4. Phân tích CV (AnalyzeCV)
      setProgressStep('Gemini AI đang chấm điểm CV của bạn...');
      const analyzeRes = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extractedText: extractData.extractedText, 
          targetRole: extractData.targetRole 
        })
      });
      if (!analyzeRes.ok) throw new Error("Lỗi khi phân tích AI.");
      const analyzeData = await analyzeRes.json();

      setAnalysisResult(analyzeData.analysisResult);
      setUploadSuccess(true);

      // Save the result only; extracted CV text and the uploaded PDF are never sent to this endpoint.
      try {
        const historyRes = await fetch(`${baseUrl}/analysis-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: getSessionId(), targetRole: role, ...analyzeData.analysisResult })
        });
        if (historyRes.ok) {
          const saved = await historyRes.json();
          setHistory((items) => [saved.item, ...items].slice(0, 50));
        } else {
          console.error('Could not save analysis history.');
        }
      } catch (historyError) {
        console.error('Could not save analysis history:', historyError);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Đã có lỗi xảy ra: ${error.message}`);
    } finally {
      setIsUploading(false);
      setProgressStep('');
    }
  };

  const resetForm = () => {
    setFile(null);
    setAnalysisResult(null);
    setUploadSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Cloud size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-800">Career<span className="text-indigo-600">AI</span></span>
        </div>
        <button onClick={() => setShowHistory((visible) => !visible)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
          History ({history.length})
        </button>
      </nav>

      {showHistory && (
        <section className="max-w-5xl mx-auto px-6 pt-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Recent analyses</h2>
            {history.length === 0 ? <p className="text-slate-500">No saved analyses yet.</p> : (
              <ul className="divide-y divide-slate-100">
                {history.map((item) => (
                  <li key={item.analysisId}>
                    <button className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-50" onClick={() => { setRole(item.targetRole); setAnalysisResult(item); setShowHistory(false); }}>
                      <span><strong>{item.targetRole}</strong><span className="block text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</span></span>
                      <span className="font-bold text-indigo-600">{item.score}/100</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-20">
        {!analysisResult ? (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Is your CV ready for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                {role === "Cloud Engineer" ? "the Cloud Era?" : `a ${role} role?`}
              </span>
            </h1>
            
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Briefcase className="text-slate-400" size={24} />
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm text-lg font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div 
              onClick={() => !file && !isUploading && fileInputRef.current?.click()}
              className={`max-w-xl mx-auto p-8 rounded-2xl shadow-sm border-2 border-dashed transition-all duration-300 ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'} group`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />

              <div className="flex flex-col items-center justify-center space-y-5">
                <div className={`p-5 rounded-2xl transition-transform shadow-sm ${file ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-600'}`}>
                  {isUploading ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} />}
                </div>
                
                <div>
                  <p className="text-xl font-bold">{file ? file.name : "Upload your CV"}</p>
                  <p className="text-sm text-slate-500 mt-2">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF format only (Max 5MB)"}</p>
                  {progressStep && <p className="text-indigo-600 font-medium mt-3 animate-pulse">{progressStep}</p>}
                </div>

                {!isUploading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="mt-4 px-8 py-3.5 w-full font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md flex items-center justify-center"
                  >
                    {file ? `Analyze for ${role}` : "Select PDF File"}
                  </button>
                )}
                {file && !isUploading && (
                  <p onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-sm text-red-500 hover:underline cursor-pointer">Remove file</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white text-center relative">
              <h2 className="text-3xl font-bold mb-2">AI Analysis Complete</h2>
              <p className="text-indigo-100 opacity-90">Target Role: {role}</p>
              
              <div className="mt-8 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-indigo-200 shadow-lg relative">
                  <span className="text-4xl font-extrabold text-indigo-600">{analysisResult.score}</span>
                  <span className="absolute -bottom-3 bg-indigo-900 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">SCORE</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center"><Target className="text-blue-500 mr-2" size={20}/> Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed">{analysisResult.feedback}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center"><CheckSquare className="text-green-500 mr-2" size={20}/> Top Strengths</h3>
                  <ul className="space-y-3">
                    {analysisResult.strengths?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start"><CheckCircle className="text-green-500 mr-2 mt-0.5 shrink-0" size={18}/> <span className="text-slate-600">{item}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center"><XCircle className="text-red-500 mr-2" size={20}/> Skill Gaps</h3>
                  <ul className="space-y-3">
                    {analysisResult.skillGaps?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start"><XCircle className="text-red-400 mr-2 mt-0.5 shrink-0" size={18}/> <span className="text-slate-600">{item}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center"><Award className="text-indigo-600 mr-2" size={20}/> Recommended Certifications</h3>
                <div className="flex flex-wrap gap-3">
                  {analysisResult.recommendedCerts?.map((cert: string, i: number) => (
                    <span key={i} className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg font-medium text-sm shadow-sm">{cert}</span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button onClick={resetForm} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors inline-flex items-center">
                  <RefreshCw className="mr-2" size={18} /> Try Another CV
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
