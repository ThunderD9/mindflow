import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Cpu, Wand2, Download, Upload, X, Globe } from 'lucide-react';
import { AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import { LocalStorageService } from '../services/storage';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-3.6-flash');
  const [enableAiAutoEdit, setEnableAiAutoEdit] = useState<boolean>(settings.enableAiAutoEdit ?? true);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please paste an API Key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const gemini = new GeminiService(apiKey.trim(), model);
      const isValid = await gemini.validateApiKey();

      if (isValid) {
        setTestResult({ success: true, message: 'Connection verified!' });
      } else {
        setTestResult({ success: false, message: 'Connection failed. Please check key.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error validating key.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportData = () => {
    const jsonStr = LocalStorageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = LocalStorageService.importData(content);
      if (success) {
        alert('Backup restored successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Failed to restore backup. Please verify file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      model,
      enableAiAutoEdit,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg bg-zinc-950 border border-zinc-800 p-6 text-zinc-100 shadow-2xl font-sans rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-zinc-100 font-sans">
              Preferences & API Configuration
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-400 font-normal">
            Configure your Gemini API key, choose AI models, and manage computer storage backups.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-3 font-sans">
          {/* Gemini API Key */}
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-2">
                <Key className="size-3.5 text-zinc-400" aria-hidden="true" />
                <span>Google Gemini API Key</span>
              </label>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>

            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy…"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="pr-10 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 h-9 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestKey}
                disabled={isTesting || !apiKey.trim()}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                {isTesting ? 'Testing connection…' : 'Test connection'}
              </Button>

              {testResult && (
                <span
                  className={`text-xs font-medium inline-flex items-center gap-1.5 ${
                    testResult.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 className="size-3.5 shrink-0" /> : <AlertTriangle className="size-3.5 shrink-0" />}
                  {testResult.message}
                </span>
              )}
            </div>
          </div>

          {/* AI Model Selection featuring Gemini 3.6 */}
          <div className="space-y-2">
            <label htmlFor="gemini-model" className="text-xs font-medium text-zinc-200 flex items-center gap-2">
              <Cpu className="size-3.5 text-zinc-400" aria-hidden="true" />
              <span>Gemini Model</span>
            </label>
            <select
              id="gemini-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 font-sans focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended - Latest High-Speed Architecture)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (High Precision Fast Engine)</option>
              <option value="gemini-3.0-flash">Gemini 3.0 Flash (Ultra-Low Latency Agentic Responses)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced Multi-Step Reasoning)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Classic Flash Fallback)</option>
            </select>
          </div>

          {/* AI Autonomous Actions */}
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-xs text-zinc-300 cursor-pointer">
              <div className="flex flex-col gap-0.5 max-w-[80%]">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Wand2 className="size-3.5 text-zinc-400" aria-hidden="true" />
                  Autonomous Tool Execution
                </span>
                <span className="text-[11px] text-zinc-400 leading-relaxed">
                  Allow assistant to directly create, schedule, or modify tasks and notes on your behalf.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableAiAutoEdit}
                onChange={(e) => setEnableAiAutoEdit(e.target.checked)}
                className="size-4 accent-zinc-200 rounded shrink-0 cursor-pointer"
                aria-label="Autonomous tool execution checkbox"
              />
            </label>
          </div>

          {/* Computer Storage / File Backups */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-200 block">
              Computer Storage & Backups
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="h-8 text-xs gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300 w-full justify-center hover:bg-zinc-800"
              >
                <Download className="size-3.5" aria-hidden="true" />
                <span>Save to Computer</span>
              </Button>

              <label className="h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer transition-colors w-full">
                <Upload className="size-3.5" aria-hidden="true" />
                <span>Restore Backup</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>
          </div>

          {/* Time & Region Settings */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-200 block">
              Time & Region
            </span>
            <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between text-xs text-zinc-300">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Globe className="size-3.5 text-zinc-400" aria-hidden="true" />
                  System Timezone
                </span>
                <span className="text-[11px] text-zinc-500">
                  Automatically synced with your device clock.
                </span>
              </div>
              <div className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 font-mono tracking-tight">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
          </div>

          {/* Local Security Notice */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg flex items-start gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed text-[11px] font-sans">
              All tasks, journals, and API keys are stored solely on your computer in local browser storage.
            </p>
          </div>

          {/* Dialog Footer Actions */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-800/80">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="h-8 px-4 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-8 px-5 text-xs font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
