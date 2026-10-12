import { useState, useRef, useEffect } from 'react';
import { Upload, Target, Award, Cloud, Loader2, CheckCircle, Briefcase, RefreshCw, XCircle, CheckSquare } from 'lucide-react';
import { confirmSignUp, currentUserEmail, getIdToken, resendConfirmationCode, signIn, signOut, signUp } from './cognito';

const ROLES = [
  "Cloud Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Analyst",
  "DevOps Engineer"
];

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'confirm'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [analysisProvider, setAnalysisProvider] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      const token = await getIdToken();
      if (active) {
        setUserEmail(token ? currentUserEmail() : '');
        setAuthReady(true);
      }
    };
    const onSessionChange = () => {
      setUserEmail(currentUserEmail());
      setAuthReady(true);
    };
    window.addEventListener('cognito-session-change', onSessionChange);
    loadSession();
    return () => {
      active = false;
      window.removeEventListener('cognito-session-change', onSessionChange);
    };
  }, []);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        await signUp(authEmail, authPassword);
        setAuthMode('confirm');
      } else if (authMode === 'confirm') {
        await confirmSignUp(authEmail, confirmationCode);
        setAuthMode('signin');
        setAuthPassword('');
        setConfirmationCode('');
        setAuthError('Email đã được xác nhận. Hãy đăng nhập để tiếp tục.');
      } else {
        await signIn(authEmail, authPassword);
        setUserEmail(currentUserEmail());
      }
    } catch (error: any) {
      setAuthError(error.message || 'Không thể xác thực tài khoản.');
    } finally {
      setAuthBusy(false);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    const loadHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) return;
        const token = await getIdToken();
        if (!token) return;
        const baseUrl = apiUrl.replace(/\/upload-url\/?$/, '');
        const response = await fetch(`${baseUrl}/analysis-history`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setHistory(data.items || []);
        }
      } catch (error) {
        console.error('Unable to load analysis history:', error);
      }
    };
    loadHistory();
  }, [userEmail]);

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
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    setAnalysisResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.replace('/upload-url', '');
      const token = await getIdToken();
      if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      
      // 1. Lấy Presigned URL
      setProgressStep('Đang chuẩn bị luồng bảo mật (AWS S3)...');
      const response = await fetch(`${apiUrl}?role=${encodeURIComponent(role)}`, { headers: { Authorization: `Bearer ${token}` } });
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bucket, key: fileName })
      });
      if (!extractRes.ok) throw new Error("Lỗi khi đọc file PDF.");
      const extractData = await extractRes.json();

      // 4. Phân tích CV (AnalyzeCV)
      setProgressStep('AI đang phân tích CV của bạn...');
      const analyzeRes = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          extractedText: extractData.extractedText, 
          targetRole: extractData.targetRole || role,
          customInstructions
        })
      });
      if (!analyzeRes.ok) throw new Error("Lỗi khi phân tích AI.");
      const analyzeData = await analyzeRes.json();

      setAnalysisResult(analyzeData.analysisResult);
      setAnalysisProvider(analyzeData.analysisProvider || 'mock');

      // Save the result only; extracted CV text and the uploaded PDF are never sent to this endpoint.
      try {
        const historyRes = await fetch(`${baseUrl}/analysis-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetRole: role, ...analyzeData.analysisResult })
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
    setAnalysisProvider(null);
    setCustomInstructions('');
  };

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="animate-spin mr-2" /> Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-10">
        <form onSubmit={handleAuth} className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-5">
          <div className="text-center">
            <Cloud size={38} className="text-indigo-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-900">Career<span className="text-indigo-600">AI</span></h1>
            <p className="text-slate-500 mt-2">{authMode === 'signup' ? 'Tạo tài khoản để lưu lịch sử phân tích CV.' : authMode === 'confirm' ? 'Nhập mã xác nhận đã gửi đến email của bạn.' : 'Đăng nhập để phân tích CV và xem lại lịch sử.'}</p>
          </div>
          <label className="block text-sm font-medium text-slate-700">Email
            <input type="email" required autoComplete="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} disabled={authMode === 'confirm'} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
          </label>
          {authMode !== 'confirm' && <label className="block text-sm font-medium text-slate-700">Mật khẩu
            <input type="password" required minLength={authMode === 'signup' ? 8 : undefined} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
          </label>}
          {authMode === 'confirm' && <label className="block text-sm font-medium text-slate-700">Mã xác nhận
            <input required inputMode="numeric" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3" />
          </label>}
          {authError && <p role="alert" className="text-sm text-red-600">{authError}</p>}
          <button disabled={authBusy} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 disabled:opacity-60">{authBusy ? 'Đang xử lý...' : authMode === 'signup' ? 'Tạo tài khoản' : authMode === 'confirm' ? 'Xác nhận email' : 'Đăng nhập'}</button>
          {authMode === 'confirm' ? (
            <button type="button" onClick={async () => { setAuthError(''); try { await resendConfirmationCode(authEmail); setAuthError('Đã gửi lại mã xác nhận.'); } catch (error: any) { setAuthError(error.message); } }} className="w-full text-sm text-indigo-700 hover:underline">Gửi lại mã xác nhận</button>
          ) : (
            <button type="button" onClick={() => { setAuthError(''); setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); }} className="w-full text-sm text-indigo-700 hover:underline">{authMode === 'signup' ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Cloud size={32} />
          <span className="text-xl font-bold tracking-tight text-slate-800">Career<span className="text-indigo-600">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory((visible) => !visible)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
            History ({history.length})
          </button>
          <span className="hidden sm:inline text-sm text-slate-500">{userEmail}</span>
          <button onClick={() => { signOut(); setHistory([]); setAnalysisResult(null); }} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">Đăng xuất</button>
        </div>
      </nav>

      {showHistory && (
        <section className="max-w-5xl mx-auto px-6 pt-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Recent analyses</h2>
            {history.length === 0 ? <p className="text-slate-500">No saved analyses yet.</p> : (
              <ul className="divide-y divide-slate-100">
                {history.map((item) => (
                  <li key={item.analysisId}>
                    <button className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-50" onClick={() => { setRole(item.targetRole); setAnalysisResult(item); setAnalysisProvider(null); setShowHistory(false); }}>
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

            <div className="max-w-xl mx-auto mb-6 text-left">
              <label htmlFor="custom-instructions" className="block text-sm font-semibold text-slate-700 mb-2">JD hoặc yêu cầu đánh giá riêng (không bắt buộc)</label>
              <textarea
                id="custom-instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Dán JD hoặc mô tả tiêu chí bạn muốn AI tập trung, ví dụ: đánh giá CV cho vị trí Marketing Executive..."
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
              />
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
              <p className="text-indigo-100 text-sm mt-2">{analysisProvider === 'openai' ? 'Phân tích bởi OpenAI' : analysisProvider === 'groq' ? 'Phân tích bởi Groq' : analysisProvider === 'mock' ? 'Kết quả dự phòng (AI chưa khả dụng)' : 'Nguồn phân tích không được lưu trong lịch sử'}</p>
              
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
