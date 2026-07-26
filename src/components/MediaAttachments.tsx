import React, { useState } from 'react';
import { 
  PaperclipIcon, 
  ImageIcon, 
  VideoIcon, 
  FileTextIcon, 
  LinkIcon, 
  PlusIcon, 
  Trash2Icon, 
  ExternalLinkIcon, 
  DownloadIcon, 
  EyeIcon,
  XIcon
} from 'lucide-react';
import { Attachment } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface MediaAttachmentsProps {
  attachments?: Attachment[];
  onAddAttachment: (attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  onRemoveAttachment: (id: string) => void;
  compact?: boolean;
}

export const MediaAttachments: React.FC<MediaAttachmentsProps> = ({
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  compact = false,
}) => {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [previewMedia, setPreviewMedia] = useState<Attachment | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      onAddAttachment({
        type,
        name: file.name,
        url: dataUrl,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    
    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onAddAttachment({
      type: 'link',
      name: linkName.trim() || formattedUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
      url: formattedUrl,
    });
    setLinkUrl('');
    setLinkName('');
    setIsAddingLink(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Action Buttons Header ("Minimal But Cool" Affordances) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mr-1 font-sans">
          <PaperclipIcon className="size-3.5 text-zinc-500" aria-hidden="true" />
          <span>Attachments ({attachments.length})</span>
        </span>

        {/* Upload File / Image / Video Control */}
        <label className="h-7 px-2.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer transition-colors select-none">
          <PlusIcon className="size-3 text-zinc-400" aria-hidden="true" />
          <span>Attach Media or File</span>
          <input
            id="journal-file-upload"
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.md,.zip,.csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload file or media attachment"
          />
        </label>

        {/* Add Web Link Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddingLink(!isAddingLink)}
          className="h-7 px-2.5 text-[11px] font-medium gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-sans"
        >
          <LinkIcon className="size-3 text-zinc-400" aria-hidden="true" />
          <span>{isAddingLink ? 'Cancel Link' : 'Add Web Link'}</span>
        </Button>
      </div>

      {/* Inline Link Creator Modal/Box */}
      {isAddingLink && (
        <form onSubmit={handleAddLinkSubmit} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input
            aria-label="Link URL"
            placeholder="https://notion.so/..., figma.com/..., or github.com/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 flex-1 placeholder:text-zinc-500 font-mono"
            required
          />
          <Input
            aria-label="Optional display label for link"
            placeholder="Label (e.g. Pitch Deck UI)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="h-8 text-xs bg-zinc-900 border-zinc-700 text-zinc-100 sm:w-44 placeholder:text-zinc-500 font-sans"
          />
          <Button type="submit" size="sm" className="h-8 px-3 text-xs font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            Add
          </Button>
        </form>
      )}

      {/* Attachments Feed (Minimalist Tasteful Cards & Badges) */}
      {attachments.length > 0 && (
        <div className={cn(
          'grid gap-2',
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
        )}>
          {attachments.map((att) => {
            if (att.type === 'image') {
              return (
                <div 
                  key={att.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all group relative flex items-center justify-between p-2 shadow-xs rounded-xl"
                >
                  <div 
                    onClick={() => setPreviewMedia(att)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="size-9 rounded bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60 relative flex items-center justify-center">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <EyeIcon className="size-4 text-zinc-200" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate font-sans">{att.name}</p>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Image {formatFileSize(att.size)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove attachment ${att.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(att.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <Trash2Icon className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            }

            if (att.type === 'video') {
              return (
                <div 
                  key={att.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all group relative flex items-center justify-between p-2 shadow-xs rounded-xl"
                >
                  <div 
                    onClick={() => setPreviewMedia(att)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="size-9 rounded bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                      <VideoIcon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate font-sans">{att.name}</p>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Video {formatFileSize(att.size)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove video ${att.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(att.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <Trash2Icon className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            }

            if (att.type === 'file') {
              return (
                <div 
                  key={att.id}
                  className="bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden transition-all group relative flex items-center justify-between p-2 shadow-xs rounded-xl"
                >
                  <div 
                    onClick={() => setPreviewMedia(att)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="size-9 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 relative">
                      <FileTextIcon className="size-4" aria-hidden="true" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                        <EyeIcon className="size-4 text-zinc-200" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate font-sans">{att.name}</p>
                      <span className="text-[10px] text-emerald-500/80 uppercase font-mono tracking-wider">File {formatFileSize(att.size)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove file ${att.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(att.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  >
                    <Trash2Icon className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            }

            // Web Link Attachment
            return (
              <div 
                key={att.id}
                className="bg-zinc-900/40 border border-zinc-800/80 hover:border-indigo-500/40 transition-all group relative flex items-center justify-between p-2 shadow-xs rounded-xl"
              >
                <a 
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-indigo-300 transition-colors"
                >
                  <div className="size-9 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                    <ExternalLinkIcon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate font-sans group-hover:text-indigo-200 transition-colors">
                      {att.name}
                    </p>
                    <span className="text-[10px] text-zinc-500 truncate font-mono block">
                      {att.url}
                    </span>
                  </div>
                </a>

                <button
                  type="button"
                  aria-label={`Remove link ${att.name}`}
                  onClick={() => onRemoveAttachment(att.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded shrink-0"
                >
                  <Trash2Icon className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Clean Media Preview Lightbox / Modal */}
      {previewMedia && (
        <div 
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-4xl max-h-[85vh] flex flex-col gap-3 shadow-2xl overflow-hidden relative"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200 truncate pr-6 font-sans">{previewMedia.name}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setPreviewMedia(null)}
                className="size-7 text-zinc-400 hover:text-zinc-100"
                aria-label="Close media preview"
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-zinc-950/80 rounded-lg p-2 min-h-[300px] max-h-[65vh]">
              {previewMedia.type === 'image' && (
                <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-[60vh] object-contain rounded" />
              )}
              {previewMedia.type === 'video' && (
                <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[60vh] rounded" />
              )}
              {previewMedia.type === 'file' && (
                previewMedia.url.includes('application/pdf') || previewMedia.name.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewMedia.url} title={previewMedia.name} className="w-full h-full min-h-[60vh] rounded bg-zinc-100" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <FileTextIcon className="size-16 opacity-50" />
                    <p className="text-sm font-medium">Preview not available for this file type.</p>
                  </div>
                )
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
              <span>{formatFileSize(previewMedia.size)}</span>
              <a 
                href={previewMedia.url} 
                download={previewMedia.name}
                className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1 font-sans font-medium"
              >
                <DownloadIcon className="size-3" />
                <span>Save to Computer</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
