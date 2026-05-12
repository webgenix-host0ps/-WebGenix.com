import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { kbService } from '../services/kb.service';
import { BookOpen, FileText, ArrowLeft, Loader2, Calendar, Eye, Share2 } from 'lucide-react';

export default function KnowledgebaseArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await kbService.getArticle(id);
      setArticle(response.data);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading Article...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <FileText className="w-12 h-12 text-red-400 mb-4 opacity-50" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Article Not Found</h2>
          <p className="text-text-secondary text-sm mb-6">The requested article could not be located.</p>
          <Link 
            to="/kb"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all"
          >
            Return to Knowledgebase
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="flex items-center justify-between">
          <Link to={`/kb/category/${article.categoryId}`} className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-white uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} /> Back to Category
          </Link>
          
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-text-muted hover:text-white">
            <Share2 size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">{article.title}</h1>
          
          <div className="flex flex-wrap gap-6 border-y border-white/10 py-6">
             <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
                <Calendar size={14} className="text-accent" />
                Updated {new Date(article.updatedAt).toLocaleDateString()}
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
                <Eye size={14} className="text-accent" />
                {article.views || 0} Views
             </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-8 md:p-12">
          <div 
            className="prose prose-invert prose-webgenix max-w-none text-text-secondary leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Helpful? section */}
        <div className="p-10 rounded-[32px] bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 text-center space-y-6">
           <h4 className="text-lg font-black text-white uppercase tracking-tight">Was this article helpful?</h4>
           <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Yes, it helped</button>
              <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">No, I still need help</button>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
