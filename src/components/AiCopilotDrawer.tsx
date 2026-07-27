import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, CheckCircle, RefreshCw, Key, Trash2 } from 'lucide-react';
import { AiChatMessage, Task, DiaryEntry, WeeklyGoal, AppSettings } from '../types';
import { GeminiService, AppStateHandlers } from '../services/geminiService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { MarkdownText } from './ui/markdown-text';
import { cn } from '@/lib/utils';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  tasks: Task[];
  diaryEntries: DiaryEntry[];
  weeklyGoals: WeeklyGoal[];
  chatHistory: AiChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<AiChatMessage[]>>;
  appStateHandlers: AppStateHandlers;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const QUICK_PROMPTS = [
  'Plan focus hours for today',
  'Summarize recent notes into simple action items',
  'Help me prioritize my open tasks',
];

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenSettings,
  tasks,
  diaryEntries,
  weeklyGoals,
  chatHistory = [],
  setChatHistory,
  appStateHandlers,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolNotification, setActiveToolNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isKeyConfigured = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim() !== '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeToolNotification, isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [isOpen, initialPrompt, onClearInitialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    if (!isKeyConfigured) {
      alert('Please configure your Google Gemini API key in Settings before sending messages.');
      onClose();
      onOpenSettings();
      return;
    }

    const userMessage: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const gemini = new GeminiService(settings.geminiApiKey.trim(), settings.model || 'gemini-3.6-flash');

      const result = await gemini.chatWithCopilot(
        messageText,
        tasks || [],
        diaryEntries || [],
        weeklyGoals || [],
        appStateHandlers,
        chatHistory
      );

      const assistantMessage: AiChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: result.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCallsExecuted: result.executedTools,
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: AiChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `⚠️ Error: ${err.message || 'Failed to connect to Gemini API. Please verify your API key in Settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md bg-zinc-950 border-l border-zinc-800/80 p-0 flex flex-col justify-between shadow-2xl font-sans"
      >
        {/* Minimal Header */}
        <SheetHeader className="p-4 border-b border-zinc-800/80 bg-zinc-950 text-left shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-zinc-300 shrink-0" aria-hidden="true" />
              <SheetTitle className="text-sm font-semibold text-zinc-100 font-sans">
                AI Assistant
              </SheetTitle>
            </div>

            <div className="flex items-center gap-2">
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setChatHistory([])}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-mono"
                  aria-label="Clear chat history"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md transition-colors"
              >
                <span>Close</span>
                <X className="size-3.5 ml-0.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <SheetDescription className="text-xs text-zinc-400 font-normal">
            Ask for planning suggestions or let Gemini organize your tasks.
          </SheetDescription>
        </SheetHeader>

        {/* Missing Key Prompt */}
        {!isKeyConfigured && (
          <div className="bg-zinc-900/90 border-b border-zinc-800 p-3.5 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Key className="size-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              <span>Gemini API key not entered</span>
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => { onClose(); onOpenSettings(); }} 
              className="h-7 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            >
              Enter Key
            </Button>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4 gap-4">
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                How can I help simplify your tasks or notes today?
              </p>
              <div className="flex flex-col gap-1.5 w-full max-w-xs">
                {QUICK_PROMPTS.map((qp, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSendMessage(qp)}
                    className="text-left text-xs p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300 transition-all"
                  >
                    "{qp}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2 w-full',
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.sender === 'assistant' && (
                    <div className="size-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mb-1">
                      <Sparkles className="size-4 text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed font-sans shadow-sm max-w-[85%]',
                      msg.sender === 'user'
                        ? 'bg-zinc-100 text-zinc-950 rounded-br-sm'
                        : 'bg-zinc-900/60 text-zinc-300 border border-zinc-800 rounded-bl-sm'
                    )}
                  >
                    <MarkdownText text={msg.text} />
                    
                    {msg.toolCallsExecuted && msg.toolCallsExecuted.length > 0 && (
                      <div className={cn(
                        "pt-3 mt-3 border-t flex flex-col gap-1.5 text-[11px] font-mono",
                        msg.sender === 'user' ? 'border-zinc-300 text-zinc-600' : 'border-zinc-800/60 text-zinc-400'
                      )}>
                        {msg.toolCallsExecuted.map((tc, idx) => (
                          <span key={idx} className="flex items-center gap-1.5">
                            <CheckCircle className="size-3 shrink-0 text-emerald-500" aria-hidden="true" />
                            {tc.name} executed
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-500 font-sans pl-10">
                  <RefreshCw className="size-4 animate-spin text-zinc-500" aria-hidden="true" />
                  <span>Thinking…</span>
                </div>
              )}

              {activeToolNotification && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                  <Sparkles className="size-3.5 text-zinc-400" aria-hidden="true" />
                  <span className="font-mono text-xs">{activeToolNotification}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center w-full"
          >
            <Input
              aria-label="Ask assistant"
              placeholder={isKeyConfigured ? "Ask anything..." : "Enter API key in settings..."}
              disabled={!isKeyConfigured || isLoading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-12 text-sm bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-full font-sans pl-5 pr-14 focus-visible:ring-1 focus-visible:ring-zinc-700 shadow-inner"
            />
            <Button
              type="submit"
              disabled={!input.trim() || !isKeyConfigured || isLoading}
              size="icon"
              className="absolute right-1.5 size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold shadow-sm transition-all"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
