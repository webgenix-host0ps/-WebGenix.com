import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { BookOpen, Plus, Folder, FileText, Search, ExternalLink, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KnowledgebaseManagement() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', slug: '', order: 0 });
  const [savingCategory, setSavingCategory] = useState(false);

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', slug: '', content: '', categoryId: '', status: 'draft' });
  const [savingArticle, setSavingArticle] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, articlesRes] = await Promise.all([
        adminService.getKbCategories(),
        adminService.getKbArticles()
      ]);
      setCategories(catsRes.data || []);
      setArticles(articlesRes.data || []);
    } catch (error) {
      toast.error('Failed to load KB data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) return toast.error('Name and slug are required');
    setSavingCategory(true);
    try {
      await adminService.createKbCategory(newCategory);
      toast.success('Category created');
      setShowAddCategory(false);
      setNewCategory({ name: '', description: '', slug: '', order: 0 });
      fetchData();
    } catch (error) {
      toast.error('Failed to create category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.categoryId) return toast.error('Title and Category are required');
    setSavingArticle(true);
    try {
      await adminService.createKbArticle(newArticle);
      toast.success('Article created');
      setShowAddArticle(false);
      setNewArticle({ title: '', slug: '', content: '', categoryId: '', status: 'draft' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create article');
    } finally {
      setSavingArticle(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-webgenix">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Self-Service</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Knowledgebase</h1>
            <p className="text-text-secondary text-sm mt-1">Manage help articles, tutorials and categories</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Folder size={14} />
              New Category
            </button>
            <button 
              onClick={() => setShowAddArticle(true)}
              className="bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              <Plus size={14} />
              New Article
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Categories */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Categories</h3>
              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{categories.length}</span>
            </div>
            <div className="space-y-1">
              <button className="w-full text-left px-4 py-3 bg-accent/10 text-accent rounded-xl text-xs font-bold border border-accent/20">
                All Articles
              </button>
              {categories.map(cat => (
                <button key={cat._id} className="w-full text-left px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group">
                  <span>{cat.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit size={10} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main: Articles List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search articles by title or tags..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-accent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-12 text-center">
                <FileText size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
                <h3 className="text-white font-bold mb-2">No articles found</h3>
                <p className="text-sm text-text-muted">Start by creating your first help article or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {articles.map(article => (
                  <div key={article._id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-accent/30 transition-all flex items-start justify-between group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-accent transition-colors">{article.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-text-muted uppercase font-bold">{article.categoryId?.name}</span>
                          <span className="text-[10px] text-text-muted">•</span>
                          <span className="text-[10px] text-text-muted">{article.views} views</span>
                          <span className="text-[10px] text-text-muted">•</span>
                          <span className={`text-[10px] font-bold uppercase ${article.status === 'published' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {article.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors">
                        <ExternalLink size={14} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. Getting Started"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug</label>
                <input 
                  type="text" 
                  value={newCategory.slug}
                  onChange={e => setNewCategory({...newCategory, slug: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="getting-started"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={newCategory.description}
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none h-24 resize-none"
                  placeholder="Short description..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Display Order</label>
                <input 
                  type="number" 
                  value={newCategory.order}
                  onChange={e => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingCategory}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingCategory ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Write New Article</h3>
            <form onSubmit={handleAddArticle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Title</label>
                  <input 
                    type="text" 
                    value={newArticle.title}
                    onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                    placeholder="Article title"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={newArticle.categoryId}
                    onChange={e => setNewArticle({...newArticle, categoryId: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug</label>
                  <input 
                    type="text" 
                    value={newArticle.slug}
                    onChange={e => setNewArticle({...newArticle, slug: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                    placeholder="article-slug"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Content (Markdown)</label>
                  <textarea 
                    value={newArticle.content}
                    onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent outline-none h-48 resize-y font-mono text-sm"
                    placeholder="Write article content here..."
                  ></textarea>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={newArticle.status}
                    onChange={e => setNewArticle({...newArticle, status: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddArticle(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingArticle}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingArticle ? 'Saving...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
