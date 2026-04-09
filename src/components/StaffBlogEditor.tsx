import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  IconDeviceFloppy, IconSend, IconPhotoPlus, IconX,
} from '@tabler/icons-react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { uploadAvatar } from '../lib/storage';
import { useAuth } from '../lib/auth';

const categories = [
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'edukasi', label: 'Edukasi' },
  { value: 'literasi-digital', label: 'Literasi Digital' },
  { value: 'akademik', label: 'Akademik' },
  { value: 'pengumuman', label: 'Pengumuman' },
];

// Auto-generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Extract plain text excerpt from HTML
function extractExcerpt(html: string, maxLength: number = 150): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s\w*$/, '') + '...';
}

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

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-border flex-shrink-0" />;
}

export default function StaffBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Load article if editing
  useEffect(() => {
    if (!isNew && id) {
      const loadArticle = async () => {
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            article_category_mappings (
              article_category_mappings (category_id)
            )
          `)
          .eq('id', id)
          .single();

        if (error || !data) {
          toast({ type: 'error', title: 'Artikel Tidak Ditemukan' });
          navigate('/staff/blog');
          return;
        }

        setTitle(data.title);
        setSlug(data.slug);
        setAutoSlug(false);
        setFeaturedImageUrl(data.featured_image);
        if (data.article_category_mappings?.[0]?.article_category_mappings?.[0]) {
          const catId = data.article_category_mappings[0].article_category_mappings[0].category_id;
          // Fetch category slug to set the value
          const { data: catData } = await supabase
            .from('article_categories')
            .select('slug')
            .eq('id', catId)
            .single();
          if (catData) setCategory(catData.slug);
        }
        editor?.commands.setContent(data.content || '');
      };
      loadArticle();
    }
  }, [id, isNew]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Image,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Placeholder.configure({ placeholder: 'Mulai tulis artikel di sini...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-6',
      },
    },
  });

  const handleFeaturedImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', title: 'File Tidak Valid', description: 'Hanya file gambar yang diperbolehkan.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', title: 'File Terlalu Besar', description: 'Ukuran file maksimal 5MB.' });
      return;
    }
    setUploadingFeatured(true);
    try {
      const url = await uploadAvatar(`blog-featured-${user.id}-${Date.now()}`, file);
      setFeaturedImageUrl(url);
      toast({ type: 'success', title: 'Cover Image Diperbarui', description: 'Gambar sampul berhasil diunggah.' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Mengunggah Gambar', description: error?.message || 'Terjadi kesalahan.' });
    } finally {
      setUploadingFeatured(false);
      if (featuredInputRef.current) featuredInputRef.current.value = '';
    }
  }, [user, toast]);

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
      const url = await uploadAvatar(`blog-content-${user.id}-${Date.now()}`, file);
      editor.chain().focus().setImage({ src: url }).run();
      toast({ type: 'success', title: 'Gambar Disisipkan', description: 'Gambar berhasil ditambahkan ke artikel.' });
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
    if (!slug.trim()) {
      toast({ type: 'error', title: 'Slug Kosong', description: 'Silakan isi slug artikel.' });
      return;
    }
    if (!category) {
      toast({ type: 'error', title: 'Kategori Kosong', description: 'Silakan pilih kategori artikel.' });
      return;
    }
    const htmlContent = editor?.getHTML() || '';
    if (!htmlContent || htmlContent === '<p></p>') {
      toast({ type: 'error', title: 'Konten Kosong', description: 'Silakan tulis konten artikel terlebih dahulu.' });
      return;
    }

    setIsSaving(true);
    try {
      const excerpt = extractExcerpt(htmlContent);
      const articleData = {
        title,
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        excerpt,
        content: htmlContent,
        featured_image: featuredImageUrl,
        author_id: user?.id,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let articleId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select('id')
          .single();
        if (error) throw error;
        articleId = data.id;
      } else {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);
        if (error) throw error;
      }

      // Update category mapping
      const { data: catData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (catData && articleId) {
        // Delete existing mappings
        await supabase.from('article_category_mappings').delete().eq('article_id', articleId);
        // Insert new mapping
        await supabase.from('article_category_mappings').insert({
          article_id: articleId,
          category_id: catData.id,
        });
      }

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
          <button onClick={() => navigate('/staff/blog')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <IconArrowLeft size={20} className="text-text" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text">
              {isNew ? 'Tulis Artikel Baru' : 'Edit Artikel'}
            </h1>
            <p className="text-text-light text-sm mt-0.5">Isi informasi artikel di bawah ini.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-text font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 text-sm"
          >
            <IconDeviceFloppy size={18} />
            <span className="hidden sm:inline">Draft</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
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

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Slug <span className="text-red-500">*</span>
              <button
                onClick={() => setIsEditingSlug(!isEditingSlug)}
                className="ml-2 text-xs text-primary hover:underline"
              >
                {isEditingSlug ? 'Auto-generate' : 'Edit manual'}
              </button>
            </label>
            {isEditingSlug ? (
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                onBlur={() => setIsEditingSlug(false)}
                placeholder="judul-artikel-anda"
                className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text font-mono text-sm"
                autoFocus
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 border border-border rounded-xl text-text-light font-mono text-sm">
                {slug || <span className="text-gray-400">slug-akan-dibuat-otomatis</span>}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-gray-50">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Tebal (Ctrl+B)"><IconBold size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Miring (Ctrl+I)"><IconItalic size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Garis Bawah (Ctrl+U)"><IconUnderline size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Coret"><IconStrikethrough size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><IconHeading size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Daftar"><IconList size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Daftar Bernomor"><IconListNumbers size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri"><IconAlignLeft size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah"><IconAlignCenter size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan"><IconAlignRight size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Kutipan"><IconQuote size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Kode"><IconCode size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => { const url = window.prompt('Masukkan URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} active={editor.isActive('link')} title="Sisipkan Link"><IconLink size={18} /></ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Hapus Link"><IconUnlink size={18} /></ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Sisipkan Gambar">
                {uploadingImage ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : <IconPhotoPlus size={18} />}
              </ToolbarButton>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <EditorContent editor={editor} className="min-h-[400px]" />

            {/* Mobile Quick Toolbar */}
            <div className="lg:hidden flex items-center gap-1 px-2 py-2 border-t border-border bg-gray-50 overflow-x-auto">
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('bold') ? 'bg-primary text-white' : 'text-text-light'}`}><IconBold size={18} /></button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('italic') ? 'bg-primary text-white' : 'text-text-light'}`}><IconItalic size={18} /></button>
              <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-white' : 'text-text-light'}`}><IconHeading size={18} /></button>
              <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'text-text-light'}`}><IconList size={18} /></button>
              <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg flex-shrink-0 ${editor.isActive('blockquote') ? 'bg-primary text-white' : 'text-text-light'}`}><IconQuote size={18} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg flex-shrink-0 text-text-light"><IconPhotoPlus size={18} /></button>
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2 text-xs text-text-light">
            <span className="text-base leading-none mt-0.5">💡</span>
            <p>Tip: Gunakan tombol toolbar di atas untuk memformat teks. Klik tombol 📷 untuk menambahkan gambar dari perangkat Anda.</p>
          </div>
        </div>

        {/* Sidebar: Featured Image + Category */}
        <div className="space-y-4">
          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Gambar Sampul</h3>
            {featuredImageUrl ? (
              <div className="relative group">
                <img src={featuredImageUrl} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => featuredInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-text text-xs font-medium rounded-lg hover:bg-gray-100"
                  >
                    Ganti
                  </button>
                  <button
                    onClick={() => setFeaturedImageUrl(null)}
                    className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => featuredInputRef.current?.click()}
                disabled={uploadingFeatured}
                className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-text-light hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
              >
                {uploadingFeatured ? (
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : (
                  <>
                    <IconPhotoPlus size={24} />
                    <span className="text-xs">Pilih gambar sampul</span>
                  </>
                )}
              </button>
            )}
            <input ref={featuredInputRef} type="file" accept="image/*" onChange={handleFeaturedImageUpload} className="hidden" />
            <p className="text-xs text-text-light mt-2">Gambar ini akan tampil sebagai cover artikel. Maks 5MB.</p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Kategori <span className="text-red-500">*</span></h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary transition-colors text-text bg-white text-sm"
            >
              <option value="">Pilih kategori...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
