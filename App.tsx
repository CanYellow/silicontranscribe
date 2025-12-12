import React, { useState, useEffect, useRef } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ResultArea from './components/ResultArea';
import { transcribeAudio } from './services/siliconFlow';
import { TranscriptionModel } from './types';

const App: React.FC = () => {
  // --- Persistence State ---
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>(TranscriptionModel.SenseVoiceSmall);

  // --- Runtime State ---
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects for LocalStorage ---
  useEffect(() => {
    const storedKey = localStorage.getItem('silicon_api_key');
    const storedModel = localStorage.getItem('silicon_model');
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);
  }, []);

  useEffect(() => {
    localStorage.setItem('silicon_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('silicon_model', model);
  }, [model]);

  // --- Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
      setTranscription(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      // Basic check for audio type (optional but good UX)
      if (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError(null);
        setTranscription(null);
      } else {
        setError("Please upload a valid audio or video file.");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError("Please select an audio file first.");
      return;
    }
    if (!apiKey) {
      setError("Please enter your SiliconFlow API Key in the settings.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscription(null);

    try {
      const result = await transcribeAudio(file, apiKey, model);
      setTranscription(result.text);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">SiliconTranscribe</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            <SettingsPanel 
              apiKey={apiKey} 
              setApiKey={setApiKey} 
              model={model} 
              setModel={setModel} 
            />

            {/* Upload Zone */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M21.2 15c.7 0 1.7 1.6 1.7 1.6a2 2 0 0 1 .1 1.9l-.7 1.6c-.3.7-1 1.2-1.8 1.2H3.5a2.5 2.5 0 0 1-2.2-3.3L3.6 9c.4-1.1 1.4-1.9 2.6-1.9h2.3c.5-1.5 2-2.6 3.6-2.6h.4c1.6 0 3 1.1 3.5 2.6h2.4c1.2 0 2.2.7 2.6 1.9l1.5 5.2a3 3 0 0 0 .9.8z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                Upload Audio
              </h2>

              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="audio/*,video/*"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 mx-auto flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    </div>
                    <p className="font-medium text-slate-800 break-words">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-brand-600 font-medium mt-2">Click to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-brand-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">MP3, WAV, M4A, etc.</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleTranscribe}
                disabled={!file || !apiKey || isLoading}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2
                  ${!file || !apiKey || isLoading 
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                    : 'bg-brand-600 hover:bg-brand-700 hover:shadow-md active:scale-[0.99]'
                  }`}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span>Start Transcription</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             <ResultArea 
                transcription={transcription} 
                error={error} 
                isLoading={isLoading} 
             />
             
             {/* Empty State/Placeholder for Right Column */}
             {!transcription && !error && !isLoading && (
               <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                  <div className="w-16 h-16 mb-4 opacity-50 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-500 mb-1">Ready to Transcribe</h3>
                  <p className="max-w-xs text-sm">Upload an audio file and configure your API key to see the text output here.</p>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
