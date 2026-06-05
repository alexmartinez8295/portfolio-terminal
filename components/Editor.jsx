"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function Editor({ content, setContent }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content,

    immediatelyRender: false, // 🔥 FIX CLAVE

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-neon p-4">
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none"
      />
    </div>
  );
}