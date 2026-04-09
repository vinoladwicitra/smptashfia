import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  IconArrowLeft, IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconList, IconListNumbers, IconQuote, IconCode, IconHeading,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconLink, IconUnlink,
  IconDeviceFloppy, IconSend, IconPhotoPlus,
} from '@tabler/icons-react';
import { useToast } from '../context/ToastContext';
import { uploadAvatar } from '../lib/storage';
import { useAuth } from '../lib/auth';

const categories = [
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'edukasi', label: 'Edukasi' },
  { value: 'literasi-digital', label: 'Literasi Digital' },
  { value: 'akademik', label: 'Akademik' },
  { value: 'pengumuman', label: 'Pengumuman' },
];

// Toolbar button component
function ToolbarButton({ onClick, active, children, title, disabled }: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors flex-shrink-0
        ${active ? 'bg-primary text-white' : 'text-text-light hover:bg-gray-100 hover:text-text'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

// Separator
function ToolbarSeparator() {
  return <div className="w-px h-6 bg-border flex-shrink-0" />;
}

export default function StaffBlogEditor({ isNew = true }: { isNew?: boolean }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Placeholder.configure({
        placeholder: 'Mulai tulis artikel di sini...',
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-6',
      },
    },
  });

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', title: 'File Tidak Valid', description: 'Hanya file gambar yang diperbolehkan.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', title: 'File Terlalu Besar', description: 'Ukuran file maksimal 5MB.' });
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadAvatar(`blog-${user.id}-${Date.now()}`, file);
      editor.chain().focus().setImage({ src: url }).run();
      toast({ type: 'success', title: 'Gambar Ditambahkan', description: 'Gambar berhasil disisipkan ke artikel.' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Mengunggah Gambar', description: error?.message || 'Terjadi kesalahan.' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [editor, user, toast]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast({ type: 'error', title: 'Judul Kosong', description: 'Silakan isi judul artikel terlebih dahulu.' });
      return;
    }

    if (!category) {
      toast({ type: 'error', title: 'Kategori Kosong', description: 'Silakan pilih kategori artikel.' });
      return;
    }

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      toast({ type: 'error', title: 'Konten Kosong', description: 'Silakan tulis konten artikel terlebih dahulu.' });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        type: 'success',
        title: status === 'published' ? 'Artikel Diterbitkan!' : 'Draft Tersimpan!',
        description: status === 'published' ? 'Artikel Anda sudah bisa dilihat publik.' : 'Artikel disimpan sebagai draft.',
      });
      navigate('/staff/blog');
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Menyimpan', description: error?.message || 'Terjadi kesalahan.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/staff/blog')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconArrowLeft size={20} className="text-text" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text">
              {isNew ? 'Tulis Artikel Baru' : 'Edit Artikel'}
            </h1>
            <p className="text-text-light text-sm mt-0.5">Isi informasi artikel di bawah ini.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-text font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 text-sm"
          >
            <IconDeviceFloppy size={18} />
            <span className="hidden sm:inline">Simpan Draft</span>
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <IconSend size={18} />
                <span className="hidden sm:inline">Terbitkan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Judul Artikel <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul artikel yang menarik..."
            className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text text-lg font-medium"
          />
        </div>

        {/* Category & Excerpt Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Kategori <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text bg-white"
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Ringkasan (opsional)</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Deskripsi singkat artikel..."
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Toolbar - Desktop */}
        <div className="hidden lg:flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-gray-50">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Tebal (Ctrl+B)"
          >
            <IconBold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Miring (Ctrl+I)"
          >
            <IconItalic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Garis Bawah (Ctrl+U)"
          >
            <IconUnderline size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Coret"
          >
            <IconStrikethrough size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <IconHeading size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Daftar"
          >
            <IconList size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Daftar Bernomor"
          >
            <IconListNumbers size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Rata Kiri"
          >
            <IconAlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Rata Tengah"
          >
            <IconAlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Rata Kanan"
          >
            <IconAlignRight size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Kutipan"
          >
            <IconQuote size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Kode"
          >
            <IconCode size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Link */}
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Masukkan URL:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive('link')}
            title="Sisipkan Link"
          >
            <IconLink size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="Hapus Link"
          >
            <IconUnlink size={18} />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Image Upload */}
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="Sisipkan Gambar"
          >
            {uploadingImage ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <IconPhotoPlus size={18} />
            )}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} className="min-h-[400px]" />

        {/* Mobile Quick Toolbar */}
        <div className="lg:hidden flex items-center gap-1 px-2 py-2 border-t border-border bg-gray-50 overflow-x-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('bold') ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            <IconBold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('italic') ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            <IconItalic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            <IconHeading size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            <IconList size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('blockquote') ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            <IconQuote size={18} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg flex-shrink-0 text-text-light"
          >
            <IconPhotoPlus size={18} />
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 flex items-start gap-2 text-xs text-text-light">
        <span className="text-base leading-none mt-0.5">💡</span>
        <p>Tip: Gunakan tombol toolbar di atas untuk memformat teks. Klik tombol 📷 untuk menambahkan gambar dari perangkat Anda.</p>
      </div>
    </div>
  );
}
