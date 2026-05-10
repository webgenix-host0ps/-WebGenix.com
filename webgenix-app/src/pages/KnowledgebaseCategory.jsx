import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { kbService } from '../services/kb.service';
import { BookOpen, Folder, FileText, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function KnowledgebaseCategory() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, [id]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      // In a real app, we might have getCategory(id)
      const catsRes = await kbService.getCategories();
      const cat = catsRes.data.find(c => c._id === id || c.slug === id);
      setCategory(cat);

      const articlesRes = await kbService.getArticles({ category: id });
      setArticles(articlesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch category data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading Category...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-in fade-in duration-700">
        
        <div className="flex items-center gap-4">
          <Link to="/kb" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-text-muted hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Folder size={14} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">Knowledgebase</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">{category?.name || 'Category'}</h1>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-2 overflow-hidden shadow-2xl">
          {articles.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <FileText size={40} className="mx-auto text-text-muted mb-4" />
              <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No articles in this category yet.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Link 
                key={article._id} 
                to={`/kb/article/${article._id}`}
                className="p-8 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-white/10 flex items-center justify-center text-text-muted group-hover:text-accent group-hover:border-accent/30 transition-all">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-accent transition-colors mb-1">{article.title}</h4>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-60">Last updated {new Date(article.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-text-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </Link>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
