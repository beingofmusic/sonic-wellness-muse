
import React, { KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (opts?: { files?: File[] }) => Promise<void> | void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE_MB = 15;

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerSubmit();
    }
  };

  const validateFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const f of incoming) {
      const okType = ACCEPTED_TYPES.includes(f.type);
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024;
      if (okType && okSize) valid.push(f);
    }
    return valid;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const valid = validateFiles(arr);
    if (valid.length < arr.length) {
      // Simple friendly notice; use design-system toasts elsewhere if desired
      console.warn("Some files were rejected due to type/size");
    }
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const triggerSubmit = async () => {
    if ((disabled || sending) || (!value.trim() && files.length === 0)) return;
    try {
      setSending(true);
      await onSubmit({ files });
      setFiles([]);
    } finally {
      setSending(false);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled || sending) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div 
      className={`bg-card/80 border-t border-white/10 ${dragOver ? 'ring-2 ring-music-primary/50' : ''}`}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* Attachments preview */}
      {files.length > 0 && (
        <div className="px-3 pt-3 flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded-md border border-white/10 bg-white/5 text-xs">
              <span className="truncate max-w-[10rem]">{f.name}</span>
              <button onClick={() => removeFile(idx)} className="hover:text-destructive" aria-label={`Remove ${f.name}`}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <button
          type="button"
          className="h-10 w-10 grid place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || sending}
          aria-label="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = ""; }}
          aria-hidden
        />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dragOver ? "Drop files to attach…" : "Type a message..."}
          className="min-h-[60px] max-h-[120px] bg-white/5 border-white/10 resize-none flex-1"
          disabled={disabled || sending}
        />
        <Button 
          onClick={triggerSubmit} 
          disabled={disabled || sending || (!value.trim() && files.length === 0)}
          className="music-button h-10 px-4"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2">{sending ? 'Sending…' : 'Send'}</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
