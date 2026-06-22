import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import {
  Lock,
  Key,
  FileUp,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Sliders,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';

function App() {
  const { user, login, signup, logout, loading: authLoading } = useAuth();
  
  // Auth Form State
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // App Tabs (for admin users)
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | admin

  // Workspace State
  const [openaiKey, setOpenaiKey] = useState(sessionStorage.getItem('openai_key') || '');
  const [geminiKey, setGeminiKey] = useState(sessionStorage.getItem('gemini_key') || '');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  const [modelChoice, setModelChoice] = useState('gemini'); // gemini | openai
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Generation Progress States
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Admin Config State
  const [maxPdfPages, setMaxPdfPages] = useState(10);
  const [maxSlidesAllowed, setMaxSlidesAllowed] = useState(12);
  const [allowSignups, setAllowSignups] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  // Persist keys to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('openai_key', openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    sessionStorage.setItem('gemini_key', geminiKey);
  }, [geminiKey]);

  // Load Admin Config if Admin
  useEffect(() => {
    if (user?.isAdmin && activeTab === 'admin') {
      fetchAdminConfig();
    }
  }, [user, activeTab]);

  const fetchAdminConfig = async () => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const response = await axios.get('/api/admin/config');
      setMaxPdfPages(response.data.max_pdf_pages);
      setMaxSlidesAllowed(response.data.max_slides_allowed);
      setAllowSignups(response.data.allow_signups);
    } catch (err) {
      setAdminError(err.response?.data?.detail || 'Failed to fetch administrator configurations.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminConfigSave = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminSuccess('');
    setAdminError('');
    try {
      const response = await axios.post('/api/admin/config', {
        max_pdf_pages: parseInt(maxPdfPages, 10),
        max_slides_allowed: parseInt(maxSlidesAllowed, 10),
        allow_signups: allowSignups
      });
      setAdminSuccess('Configuration settings successfully saved!');
      setMaxPdfPages(response.data.max_pdf_pages);
      setMaxSlidesAllowed(response.data.max_slides_allowed);
      setAllowSignups(response.data.allow_signups);
    } catch (err) {
      setAdminError(err.response?.data?.detail || 'Failed to save configuration settings.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Auth submission handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setFormSubmitting(true);

    if (!email || !password) {
      setAuthError('Please fill in all credentials.');
      setFormSubmitting(false);
      return;
    }

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(email, password);
        setAuthSuccess('Sign up completed successfully! You can now log in.');
        setIsLoginView(true);
        setPassword('');
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Authentication operation failed. Please check your credentials.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // File drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setGenerationError('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setGenerationError('');
      } else {
        setGenerationError('Only PDF files are supported.');
      }
    }
  };

  // PowerPoint Presentation Generator handler
  const handleGeneratePresentation = async () => {
    if (!selectedFile) {
      setGenerationError('Please select a PDF document first.');
      return;
    }

    if (modelChoice === 'openai' && !openaiKey) {
      setGenerationError('Please enter your OpenAI API key.');
      return;
    }

    if (modelChoice === 'gemini' && !geminiKey) {
      setGenerationError('Please enter your Gemini API key.');
      return;
    }

    setGenerating(true);
    setGenerationError('');
    setGenerationSuccess(false);
    setGenerationStep(1); // 1. Uploading & Parsing

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('model_choice', modelChoice);

    // Simulate multi-step pipeline updates for a premium visual feel
    const stepIntervals = [
      { step: 2, delay: 2000, label: 'Reading PDF contents & page verification...' },
      { step: 3, delay: 4500, label: 'Prompt engineering & contacting LLM...' },
      { step: 4, delay: 9000, label: 'Receiving outline & structuring layout template...' },
      { step: 5, delay: 13000, label: 'Rendering widescreen PPTX presentation slides...' }
    ];

    const timeouts = stepIntervals.map((item) => 
      setTimeout(() => {
        setGenerationStep(item.step);
      }, item.delay)
    );

    try {
      const response = await axios.post('/api/generate-presentation', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear timeouts since generation finished
      timeouts.forEach(clearTimeout);

      setGenerationStep(6); // Download Triggered
      setGenerationSuccess(true);

      // Create browser download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Clean name
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
      link.setAttribute('download', `${originalName}_pitchflow.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      timeouts.forEach(clearTimeout);
      
      // Parse blob error if backend returned JSON exception
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const parsed = JSON.parse(text);
          setGenerationError(parsed.detail || 'An error occurred during PPTX creation.');
        } catch {
          setGenerationError('An error occurred during PPTX creation.');
        }
      } else {
        setGenerationError(err.response?.data?.detail || 'An error occurred during generation.');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-corp-canvas text-corp-text">
        <Loader2 className="h-10 w-10 animate-spin text-corp-accent" />
        <span className="ml-3 text-lg font-semibold tracking-wide">Initializing Pitchflow...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-corp-canvas text-corp-text flex flex-col">
      
      {/* ⚠️ Dynamic Security Warning Bar */}
      <div className="bg-corp-surface border-b border-corp-border px-4 py-2 text-center text-xs sm:text-sm text-corp-mutedText flex items-center justify-center gap-2">
        <Lock className="h-4 w-4 text-corp-accent flex-shrink-0 animate-pulse" />
        <span>
          <strong>Pitchflow Privacy Architecture:</strong> This is a personal project and No Api has been saved in our systems. Your API keys are saved strictly on your local browser's tab session.
        </span>
      </div>

      {!user ? (
        // --- AUTH SHELL VIEW ---
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-corp-accent/10 via-corp-canvas to-corp-canvas">
          <div className="max-w-md w-full space-y-8 bg-corp-surface border border-corp-border p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-corp-accent/5 rounded-full blur-3xl"></div>
            
            <div className="text-center relative">
              <div className="inline-flex items-center justify-center p-3 bg-corp-canvas border border-corp-border mb-3 rounded-xl">
                <Sparkles className="h-8 w-8 text-corp-accent" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-corp-text">
                Pitchflow
              </h2>
              <p className="mt-2 text-sm text-corp-mutedText">
                Transform standard PDFs into stunning PowerPoint slides in seconds.
              </p>
            </div>

            {/* View Selector */}
            <div className="flex border-b border-corp-border">
              <button
                className={`w-1/2 pb-3 text-sm font-semibold transition-colors duration-250 ${
                  isLoginView ? 'border-b-2 border-corp-accent text-corp-text' : 'text-corp-mutedText hover:text-corp-text'
                }`}
                onClick={() => {
                  setIsLoginView(true);
                  setAuthError('');
                  setAuthSuccess('');
                }}
              >
                Log In
              </button>
              <button
                className={`w-1/2 pb-3 text-sm font-semibold transition-colors duration-250 ${
                  !isLoginView ? 'border-b-2 border-corp-accent text-corp-text' : 'text-corp-mutedText hover:text-corp-text'
                }`}
                onClick={() => {
                  setIsLoginView(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
              >
                Sign Up
              </button>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleAuthSubmit}>
              {authError && (
                <div className="bg-red-950/40 border border-red-800/40 text-red-300 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-450 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 p-3 rounded-lg text-sm flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-450 flex-shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <div className="rounded-md space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-corp-border bg-corp-inputBg placeholder-slate-600 text-corp-text rounded-lg focus:outline-none focus:ring-1 focus:ring-corp-accent focus:border-corp-accent sm:text-sm"
                    placeholder="you@domain.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-corp-border bg-corp-inputBg placeholder-slate-600 text-corp-text rounded-lg focus:outline-none focus:ring-1 focus:ring-corp-accent focus:border-corp-accent sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-corp-text bg-corp-accent hover:bg-corp-accentHover focus:outline-none disabled:opacity-50 transition-all duration-200"
                >
                  {formSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isLoginView ? (
                    'Log In'
                  ) : (
                    'Register Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // --- DUAL DASHBOARD VIEW ---
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-corp-surface/40 backdrop-blur-md border-b border-corp-border px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-corp-canvas border border-corp-border rounded-lg">
                <Sparkles className="h-6 w-6 text-corp-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-corp-text">
                  Pitchflow
                </h1>
                <span className="text-xs text-corp-mutedText font-medium">Professional PDF-to-PPTX Creator</span>
              </div>
            </div>

            {/* Navigation Tabs (Admin Check) */}
            <div className="flex items-center gap-3">
              {user.isAdmin && (
                <div className="flex bg-corp-canvas p-1 border border-corp-border rounded-lg">
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      activeTab === 'workspace'
                        ? 'bg-corp-surface text-corp-text border border-corp-border'
                        : 'text-corp-mutedText hover:text-corp-text'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      activeTab === 'admin'
                        ? 'bg-corp-surface text-corp-text border border-corp-border'
                        : 'text-corp-mutedText hover:text-corp-text'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin Panel
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 border-l border-corp-border pl-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-semibold text-corp-text">{user.email}</p>
                  <p className="text-[10px] text-corp-mutedText uppercase tracking-wider font-semibold">
                    {user.isAdmin ? 'System Administrator' : 'Standard User'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 border border-corp-border hover:border-red-800/40 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {activeTab === 'workspace' ? (
              // --- VIEW 1: USER WORKSPACE DASHBOARD ---
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Keys Configuration */}
                <div className="space-y-6">
                  <div className="bg-corp-surface border border-corp-border p-6 rounded-xl relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-corp-accent/5 rounded-full blur-2xl"></div>
                    
                    <h3 className="text-base font-bold text-corp-text mb-4 flex items-center gap-2">
                      <Key className="h-4 w-4 text-corp-accent" />
                      Client-Side API Keys
                    </h3>
                    
                    <p className="text-xs text-corp-mutedText leading-relaxed mb-6">
                      Your keys are injected locally during requests. Closing the tab or signing out will immediately purge them from memory.
                    </p>

                    <div className="space-y-4">
                      {/* OpenAI Key */}
                      <div>
                        <label className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                          OpenAI Key
                        </label>
                        <div className="relative">
                          <input
                            type={showOpenaiKey ? 'text' : 'password'}
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            placeholder="sk-proj-..."
                            className="w-full bg-corp-inputBg border border-corp-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-corp-text placeholder-slate-600 focus:outline-none focus:border-corp-accent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                            className="absolute right-3 top-3 text-corp-mutedText hover:text-corp-text"
                          >
                            {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Gemini Key */}
                      <div>
                        <label className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                          Gemini API Key
                        </label>
                        <div className="relative">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-corp-inputBg border border-corp-border rounded-lg py-2.5 pl-3 pr-10 text-sm text-corp-text placeholder-slate-600 focus:outline-none focus:border-corp-accent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute right-3 top-3 text-corp-mutedText hover:text-corp-text"
                          >
                            {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div className="bg-corp-surface border border-corp-border p-6 rounded-xl backdrop-blur-sm">
                    <h3 className="text-base font-bold text-corp-text mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-corp-accent" />
                      LLM Model Engine
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          modelChoice === 'gemini'
                            ? 'border-corp-accent bg-corp-accent text-white font-semibold'
                            : 'border-corp-border text-corp-mutedText bg-corp-dropzone hover:bg-corp-dropzone/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value="gemini"
                          checked={modelChoice === 'gemini'}
                          onChange={() => setModelChoice('gemini')}
                          className="sr-only"
                        />
                        <span className="font-semibold text-sm">Gemini 1.5 Flash</span>
                        <span className="text-[10px] mt-1 opacity-80">Structured JSON</span>
                      </label>

                      <label
                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          modelChoice === 'openai'
                            ? 'border-corp-accent bg-corp-accent text-white font-semibold'
                            : 'border-corp-border text-corp-mutedText bg-corp-dropzone hover:bg-corp-dropzone/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value="openai"
                          checked={modelChoice === 'openai'}
                          onChange={() => setModelChoice('openai')}
                          className="sr-only"
                        />
                        <span className="font-semibold text-sm">GPT-4o Mini</span>
                        <span className="text-[10px] mt-1 opacity-80">Fast & Balanced</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Center/Right: Dropzone and Status console */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Main Action area */}
                  <div className="bg-corp-surface border border-corp-border p-8 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm min-h-[320px]">
                    
                    {!generating && !generationSuccess && (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-corp-dropzone ${
                          dragOver ? 'border-corp-accent bg-corp-accent/15' : 'border-corp-border hover:border-corp-border/70'
                        }`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="sr-only"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                        
                        <label htmlFor="file-upload" className="cursor-pointer block">
                          <FileUp className="h-12 w-12 text-corp-mutedText mx-auto mb-4 hover:text-corp-accent transition-colors" />
                          <p className="text-sm font-semibold text-corp-text">
                            Drag & drop your PDF here, or <span className="text-corp-accent underline">browse file</span>
                          </p>
                          <p className="text-xs text-corp-mutedText mt-2">
                            Only standard PDFs are accepted. Large documents will be validated against server page limits.
                          </p>
                        </label>

                        {selectedFile && (
                          <div className="mt-6 p-3 bg-corp-inputBg border border-corp-border rounded-lg flex items-center justify-between text-left max-w-md mx-auto">
                            <div className="flex items-center gap-3 truncate">
                              <FileText className="h-5 w-5 text-corp-accent flex-shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-semibold text-corp-text truncate">{selectedFile.name}</p>
                                <p className="text-xs text-corp-mutedText">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="text-xs text-red-400 hover:underline px-2 ml-4 flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress Indicator */}
                    {generating && (
                      <div className="w-full max-w-md text-center py-6">
                        <div className="relative inline-flex items-center justify-center mb-6">
                          <Loader2 className="h-16 w-16 text-corp-accent animate-spin" />
                          <div className="absolute font-semibold text-sm text-corp-text">{generationStep}/5</div>
                        </div>

                        <h4 className="text-base font-bold text-corp-text mb-2">Generating PowerPoint Deck</h4>
                        
                        <div className="w-full bg-corp-inputBg h-2 border border-corp-border rounded-full overflow-hidden mb-4">
                          <div
                            className="bg-corp-accent h-full transition-all duration-500"
                            style={{ width: `${(generationStep / 5) * 100}%` }}
                          ></div>
                        </div>

                        <p className="text-xs text-corp-mutedText animate-pulse">
                          {generationStep === 1 && 'Uploading local PDF document...'}
                          {generationStep === 2 && 'Reading PDF contents & page verification...'}
                          {generationStep === 3 && 'Prompt engineering & contacting LLM...'}
                          {generationStep === 4 && 'Receiving outline & structuring layout template...'}
                          {generationStep === 5 && 'Rendering widescreen PPTX presentation slides...'}
                        </p>
                      </div>
                    )}

                    {/* Generation Success Panel */}
                    {generationSuccess && !generating && (
                      <div className="text-center py-6 max-w-md">
                        <div className="inline-flex items-center justify-center p-3 bg-corp-accent/10 border border-corp-accent/25 rounded-full mb-4">
                          <CheckCircle className="h-12 w-12 text-corp-accent" />
                        </div>
                        <h4 className="text-lg font-bold text-corp-text mb-2">Presentation Created!</h4>
                        <p className="text-sm text-corp-mutedText mb-6">
                          Your PDF has been summarized and styled into a premium 16:9 PowerPoint file. The download has been triggered in your browser.
                        </p>
                        
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setGenerationSuccess(false);
                              setSelectedFile(null);
                            }}
                            className="px-4 py-2 text-xs font-semibold border border-corp-border bg-corp-inputBg rounded-lg hover:bg-corp-surface text-corp-text"
                          >
                            Convert Another PDF
                          </button>
                          <button
                            onClick={handleGeneratePresentation}
                            className="px-4 py-2 text-xs font-semibold bg-corp-accent hover:bg-corp-accentHover text-corp-text rounded-lg flex items-center gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Redownload File
                          </button>
                        </div>
                      </div>
                    )}

                    {generationError && (
                      <div className="w-full max-w-lg mt-6 bg-red-950/20 border border-red-800/40 p-4 rounded-xl flex gap-3 text-left">
                        <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-200">Operation Error</p>
                          <p className="text-xs text-red-400 mt-1">{generationError}</p>
                        </div>
                      </div>
                    )}

                    {/* Trigger Generation button */}
                    {!generating && !generationSuccess && (
                      <button
                        onClick={handleGeneratePresentation}
                        disabled={!selectedFile || (modelChoice === 'openai' && !openaiKey) || (modelChoice === 'gemini' && !geminiKey)}
                        className={`mt-8 px-8 py-3.5 text-sm font-semibold rounded-lg text-white bg-corp-accent hover:bg-corp-accentHover disabled:opacity-40 disabled:bg-[#1E293B] disabled:text-corp-mutedText disabled:border disabled:border-corp-border transition-all duration-200 shadow-md shadow-corp-accent/5`}
                      >
                        Create PowerPoint Presentation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // --- VIEW 2: ADMIN CONFIGURATION DASHBOARD ---
              <div className="max-w-2xl mx-auto bg-corp-surface border border-corp-border p-8 rounded-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-corp-accent/5 rounded-full blur-3xl"></div>
                
                <h3 className="text-lg font-bold text-corp-text mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-corp-accent" />
                  Global Security Configuration
                </h3>

                {adminError && (
                  <div className="mb-6 bg-red-950/40 border border-red-800/40 text-red-300 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminSuccess && (
                  <div className="mb-6 bg-corp-accent/10 border border-corp-accent/25 text-corp-text p-3 rounded-lg text-sm flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-corp-accent flex-shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                {adminLoading && !maxPdfPages ? (
                  <div className="flex justify-center items-center py-12 text-corp-text">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <form onSubmit={handleAdminConfigSave} className="space-y-6">
                    {/* Max Pages */}
                    <div>
                      <label className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                        Maximum PDF Pages Allowed
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={maxPdfPages}
                        onChange={(e) => setMaxPdfPages(e.target.value)}
                        className="w-full bg-corp-inputBg border border-corp-border rounded-lg py-2.5 px-3 text-sm text-corp-text focus:outline-none focus:border-corp-accent"
                      />
                      <p className="text-[10px] text-corp-mutedText mt-1 font-semibold">
                        Any uploaded PDF with a page count exceeding this numeric limit will be rejected immediately at the backend.
                      </p>
                    </div>

                    {/* Max Slides */}
                    <div>
                      <label className="block text-xs font-semibold text-corp-mutedText uppercase tracking-wider mb-2">
                        Maximum Output Slides Allowed
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxSlidesAllowed}
                        onChange={(e) => setMaxSlidesAllowed(e.target.value)}
                        className="w-full bg-corp-inputBg border border-corp-border rounded-lg py-2.5 px-3 text-sm text-corp-text focus:outline-none focus:border-corp-accent"
                      />
                      <p className="text-[10px] text-corp-mutedText mt-1 font-semibold">
                        The backend will instruct the LLM to generate at most this number of slides, and slice array lengths post-generation for total enforcement.
                      </p>
                    </div>

                    {/* Allow Signups Toggle */}
                    <div className="flex items-center justify-between border border-corp-border bg-corp-inputBg p-4 rounded-xl">
                      <div>
                        <span className="block text-sm font-semibold text-corp-text">Allow New User Signups</span>
                        <span className="text-[10px] text-corp-mutedText font-semibold">
                          If disabled, new registrations will return a 403 Forbidden exception.
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setAllowSignups(!allowSignups)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          allowSignups ? 'bg-corp-accent' : 'bg-corp-border'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-corp-canvas shadow ring-0 transition duration-200 ease-in-out ${
                            allowSignups ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="w-full py-3 border border-transparent text-sm font-semibold rounded-lg text-corp-text bg-corp-accent hover:bg-corp-accentHover focus:outline-none disabled:opacity-50 transition-colors"
                    >
                      {adminLoading ? 'Saving config...' : 'Save Configuration Changes'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-corp-canvas border-t border-corp-border py-6 text-center text-xs text-corp-mutedText">
        <p>© 2026 Pitchflow. Designed by Rituraj Shukla. Built for high security presentation pipeline.</p>
      </footer>
    </div>
  );
}

export default App;
