
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, ListOrdered, AlignLeft } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

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
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", 
          !value && "text-muted-foreground"
        ),
      },
    },
  });

  return (
    <div className={cn("rich-text-editor space-y-2", className)}>
      <div className="flex flex-wrap gap-1 bg-card/70 rounded-md p-1">
        <Toggle
          size="sm"
          pressed={editor?.isActive("bold") || false}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("italic") || false}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("bulletList") || false}
          onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive("orderedList") || false}
          onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
      <EditorContent 
        editor={editor} 
        className={cn("prose prose-invert max-w-none", className)}
      />
      {!editor?.isEmpty && editor?.getHTML().trim() === "" && (
        <p className="text-sm text-muted-foreground py-2 px-3">{placeholder}</p>
      )}
    </div>
  );
};

export { RichTextEditor };
