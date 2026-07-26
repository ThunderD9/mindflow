import React, { useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { mergeAttributes, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { 
  BoldIcon, 
  ItalicIcon, 
  ListIcon, 
  ListOrderedIcon, 
  Heading1Icon,
  Heading2Icon, 
  Heading3Icon,
  CodeIcon, 
  QuoteIcon, 
  StrikethroughIcon,
  PaperclipIcon,
  LinkIcon,
  CheckSquareIcon,
  FileTextIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface JournalEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const FileAttachmentNodeView = (props: any) => {
  const { url, name } = props.node.attrs;
  
  const isPdf = url?.includes('application/pdf') || name?.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return (
      <NodeViewWrapper className="file-attachment my-4" contentEditable={false}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center gap-2 p-2 px-3 border-b border-zinc-800 bg-zinc-950/50">
            <FileTextIcon className="size-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-200 truncate font-sans">{name}</span>
          </div>
          <iframe src={url} title={name} className="w-full h-[400px] bg-zinc-100" />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="file-attachment my-2 inline-block" contentEditable={false}>
      <a 
        href={url} 
        download={name}
        className="flex items-center gap-2.5 p-2 px-3 border border-zinc-800 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer no-underline group w-fit max-w-[300px]"
      >
        <div className="size-8 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:text-emerald-300">
          <FileTextIcon className="size-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-200 truncate leading-none font-sans">{name}</span>
          <span className="text-[10px] text-zinc-500 mt-1 uppercase font-mono tracking-wider">Download File</span>
        </div>
      </a>
    </NodeViewWrapper>
  );
};

const FileAttachment = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      name: { default: 'File' },
      type: { default: 'file' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file-attachment"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file-attachment' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNodeView)
  },
});

const MenuBar = ({ editor, onAttachClick }: { editor: any, onAttachClick?: () => void }) => {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkLabel, setLinkLabel] = React.useState('');
  const [isLinkOpen, setIsLinkOpen] = React.useState(false);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-sm transition-all duration-300">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('bold') && 'bg-zinc-800 text-zinc-100')}
        title="Bold"
      >
        <BoldIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('italic') && 'bg-zinc-800 text-zinc-100')}
        title="Italic"
      >
        <ItalicIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('strike') && 'bg-zinc-800 text-zinc-100')}
        title="Strikethrough"
      >
        <StrikethroughIcon className="size-4" />
      </Button>

      <div className="w-px h-4 bg-zinc-800/50 mx-1.5" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('heading', { level: 1 }) && 'bg-zinc-800 text-zinc-100')}
        title="Heading 1"
      >
        <Heading1Icon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('heading', { level: 2 }) && 'bg-zinc-800 text-zinc-100')}
        title="Heading 2"
      >
        <Heading2Icon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('heading', { level: 3 }) && 'bg-zinc-800 text-zinc-100')}
        title="Heading 3"
      >
        <Heading3Icon className="size-4" />
      </Button>
      
      <div className="w-px h-4 bg-zinc-800/50 mx-1.5" />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('bulletList') && 'bg-zinc-800 text-zinc-100')}
        title="Bullet List"
      >
        <ListIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('orderedList') && 'bg-zinc-800 text-zinc-100')}
        title="Ordered List"
      >
        <ListOrderedIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('taskList') && 'bg-zinc-800 text-zinc-100')}
        title="Task List"
      >
        <CheckSquareIcon className="size-4" />
      </Button>
      
      <div className="w-px h-4 bg-zinc-800/50 mx-1.5" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('codeBlock') && 'bg-zinc-800 text-zinc-100')}
        title="Code Block"
      >
        <CodeIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('blockquote') && 'bg-zinc-800 text-zinc-100')}
        title="Blockquote"
      >
        <QuoteIcon className="size-4" />
      </Button>
      <Popover open={isLinkOpen} onOpenChange={(open) => {
        setIsLinkOpen(open);
        if (open) {
          setLinkUrl(editor.getAttributes('link').href || '');
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to, ' ');
          setLinkLabel(text || '');
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors', editor.isActive('link') && 'bg-zinc-800 text-zinc-100')}
            title="Link"
          >
            <LinkIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-zinc-900 border-zinc-800 rounded-xl shadow-lg flex flex-col gap-3" sideOffset={8}>
          <form 
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (linkUrl === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
              } else {
                const finalLabel = linkLabel.trim() || linkUrl;
                // If there's an existing text selection or we just want to set the link on selection
                if (editor.state.selection.empty && finalLabel) {
                  editor.chain().focus().insertContent(`<a href="${linkUrl}">${finalLabel}</a>`).run();
                } else if (!editor.state.selection.empty && linkLabel !== editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')) {
                   // They changed the label text, replace selection
                   editor.chain().focus().insertContent(`<a href="${linkUrl}">${finalLabel}</a>`).run();
                } else {
                  editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                }
              }
              setIsLinkOpen(false);
            }}
          >
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">URL</label>
              <Input 
                autoFocus
                placeholder="https://..." 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-8 text-sm bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Text</label>
              <Input 
                placeholder="Display text..." 
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                className="h-8 text-sm bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <Button type="submit" size="sm" className="w-full h-8 mt-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg">
              Save Link
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      <div className="w-px h-4 bg-zinc-800/50 mx-1.5" />
      
      <div className="relative">
        <input 
          type="file" 
          accept="image/*,application/pdf,.doc,.docx,.txt" 
          id="editor-file-upload" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                if (file.type.startsWith('image/')) {
                  editor.chain().focus().setImage({ src: result }).run();
                } else {
                  editor.chain().focus().insertContent({
                    type: 'fileAttachment',
                    attrs: {
                      url: result,
                      name: file.name,
                      type: file.type
                    }
                  }).run();
                }
              };
              reader.readAsDataURL(file);
            }
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => document.getElementById('editor-file-upload')?.click()}
          className="size-8 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Insert File or Image"
        >
          <PaperclipIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export const JournalEditor: React.FC<JournalEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-xl max-h-[400px] border border-zinc-800/50',
        }
      }),
      FileAttachment,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-indigo-400 underline decoration-indigo-400/30 underline-offset-4 hover:decoration-indigo-400 transition-all cursor-pointer',
        }
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your reflection here... Use markdown shortcuts like # or ``` to format.',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[460px] pb-32 text-lg text-zinc-200 leading-relaxed font-sans prose prose-invert prose-p:my-4 prose-headings:font-heading max-w-none',
      },
    },
  });

  // Keep editor content in sync with external changes (e.g. switching entries)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col flex-1 w-full relative">
      <div className="sticky top-0 z-20 w-full mb-4">
        <MenuBar editor={editor} />
      </div>
      <div className="w-full">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
