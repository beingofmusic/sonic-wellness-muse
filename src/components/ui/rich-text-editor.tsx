
import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/lib/utils";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Quote, 
  Code, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Code2
} from "lucide-react";
import { 
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange,
  placeholder = "Type here...",
  className
}: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePopoverOpen, setYoutubePopoverOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-music-primary underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-md overflow-hidden',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-invert max-w-none", 
          !value && "text-muted-foreground"
        ),
      },
    },
  });

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      // Make sure to include protocol if missing
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      setLinkUrl('');
      setLinkPopoverOpen(false);
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      editor?.chain().focus().insertContent(`<img src="${imageUrl}" alt="" />`).run();
      setImageUrl('');
      setImagePopoverOpen(false);
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl) {
      editor?.commands.setYoutubeVideo({ src: youtubeUrl });
      setYoutubeUrl('');
      setYoutubePopoverOpen(false);
    }
  };

  const addHorizontalRule = () => {
    editor?.chain().focus().setHorizontalRule().run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("rich-text-editor space-y-2", className)}>
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-1 bg-card/70 rounded-md p-1">
          <div className="flex flex-wrap gap-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("bold")}
                  onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("italic")}
                  onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("code")}
                  onPressedChange={() => editor.chain().focus().toggleCode().run()}
                >
                  <Code className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Inline Code</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          
          {/* Headings */}
          <div className="flex flex-wrap gap-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("heading", { level: 1 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("heading", { level: 2 })}
                  onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Heading 2</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("blockquote")}
                  onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Quote</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("codeBlock")}
                  onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  <Code2 className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Code Block</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          
          {/* Lists */}
          <div className="flex flex-wrap gap-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("bulletList")}
                  onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("orderedList")}
                  onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Ordered List</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          
          {/* Alignment */}
          <div className="flex flex-wrap gap-1 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'left' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                >
                  <AlignLeft className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'center' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                >
                  <AlignCenter className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive({ textAlign: 'right' })}
                  onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                >
                  <AlignRight className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          
          {/* Media */}
          <div className="flex flex-wrap gap-1 mr-2">
            {/* Link */}
            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Toggle
                      size="sm"
                      pressed={editor.isActive("link")}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Toggle>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Add Link</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-72">
                <form onSubmit={handleLinkSubmit} className="flex flex-col gap-2">
                  <label className="text-sm">
                    URL
                    <Input
                      type="text"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <div className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run();
                        setLinkPopoverOpen(false);
                      }}
                      disabled={!editor.isActive("link")}
                    >
                      Remove Link
                    </Button>
                    <Button type="submit" size="sm">Add Link</Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
            
            {/* Image */}
            <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Toggle size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Toggle>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Add Image</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-72">
                <form onSubmit={handleImageSubmit} className="flex flex-col gap-2">
                  <label className="text-sm">
                    Image URL
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Add Image</Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
            
            {/* YouTube */}
            <Popover open={youtubePopoverOpen} onOpenChange={setYoutubePopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Toggle size="sm">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" stroke="currentColor" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </Toggle>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Add YouTube Video</TooltipContent>
              </Tooltip>
              <PopoverContent className="w-72">
                <form onSubmit={handleYoutubeSubmit} className="flex flex-col gap-2">
                  <label className="text-sm">
                    YouTube URL
                    <Input
                      type="text"
                      placeholder="https://youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Add Video</Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
            
            {/* Horizontal Rule */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onPressedChange={() => addHorizontalRule()}
                >
                  <Minus className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Add Horizontal Line</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          
          {/* Undo/Redo */}
          <div className="flex flex-wrap gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onPressedChange={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  onPressedChange={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
      
      <div className="rounded-md border border-input bg-card/30">
        <EditorContent editor={editor} className="prose prose-invert max-w-none px-3 py-2" />
      </div>
      
      {!editor.isEmpty && editor.getHTML().trim() === "" && (
        <p className="text-sm text-muted-foreground py-2 px-3">{placeholder}</p>
      )}
    </div>
  );
};

export { RichTextEditor };
