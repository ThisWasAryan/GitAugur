import { Shield, Key, Sparkles, Sliders } from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { toast } from "sonner";

export function SettingsView() {
  const { repoPath } = useRepositoryStore();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    async function loadConfig() {
      if (!repoPath) return;
      try {
        const nameRes: any = await invoke('git_exec', { repoPath, args: ['config', 'user.name'] });
        const emailRes: any = await invoke('git_exec', { repoPath, args: ['config', 'user.email'] });
        
        if (nameRes.stdout) setUserName(nameRes.stdout.trim());
        if (emailRes.stdout) setUserEmail(emailRes.stdout.trim());
      } catch (err) {
        console.error("Failed to load config", err);
      }
    }
    loadConfig();
  }, [repoPath]);

  const handleSaveConfig = async () => {
    if (!repoPath) return;
    try {
      await invoke('git_exec', { repoPath, args: ['config', 'user.name', userName] });
      await invoke('git_exec', { repoPath, args: ['config', 'user.email', userEmail] });
      toast.success("User configuration saved");
    } catch (err) {
      toast.error("Failed to save configuration");
    }
  };

  const { 
    uiMode, 
    setUiMode, 
    cryptographicVerification, 
    setCryptographicVerification,
    gpgKeyId,
    setGpgKeyId
  } = useSettingsStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">Configure GitAugur's behavior, terminology, and security features.</p>
        
        {/* User Configuration */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Git Configuration
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>
            <button onClick={handleSaveConfig} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow transition-colors text-sm font-medium">Save Configuration</button>
          </div>
        </section>

        {/* UI Mode Settings */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Interface Mode
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-sm text-slate-400 mb-6">
              Choose the terminology and complexity level that best suits your Git experience.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Beginner Mode */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${uiMode === 'beginner' ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}
                onClick={() => setUiMode('beginner')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Beginner Mode
                  </h3>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${uiMode === 'beginner' ? 'border-blue-500' : 'border-slate-600'}`}>
                    {uiMode === 'beginner' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Uses approachable terminology like "Save Version" instead of "Commit", and "Incoming Changes" instead of "Remote Tracking Branches". Best for new developers.</p>
              </div>

              {/* Advanced Mode */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${uiMode === 'advanced' ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}
                onClick={() => setUiMode('advanced')}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Advanced Mode
                  </h3>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${uiMode === 'advanced' ? 'border-blue-500' : 'border-slate-600'}`}>
                    {uiMode === 'advanced' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400">Uses standard Git terminology (HEAD, Index, Working Tree, Rebase, Cherry-Pick). Full power and complete control.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cryptographic Trust */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Cryptographic Trust
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-medium text-slate-200 mb-1">Enforce Commit Signing</h3>
                <p className="text-sm text-slate-400">Require all commits to be signed with a GPG or SSH key. Unverified commits will be highlighted.</p>
              </div>
              <button 
                onClick={() => setCryptographicVerification(!cryptographicVerification)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cryptographicVerification ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cryptographicVerification ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {cryptographicVerification && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  GPG Key ID / SSH Signing Key
                </label>
                <input 
                  type="text" 
                  value={gpgKeyId}
                  onChange={(e) => setGpgKeyId(e.target.value)}
                  placeholder="e.g. 3AA5C34371567BD2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-slate-500">This key will be used to automatically sign your commits.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
