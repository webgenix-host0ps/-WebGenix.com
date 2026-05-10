import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { kbService } from '../services/kb.service';
import { BookOpen, Search, Folder, FileText, ChevronRight, HelpCircle } from 'lucide-react';

export default function Knowledgebase() {
  const [categories, setCategories] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, articlesRes] = await Promise.all([
        kbService.getCategories(),
        kbService.getArticles({ limit: 5, sort: 'views:desc' })
      ]);
      setCategories(catsRes.data || []);
      setPopularArticles(articlesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch KB data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-[32px] animate-fade-in-webgenix">
        
        {/* Search Header */}
        <div className="relative p-12 lg:p-20 rounded-[40px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-white/[0.08] overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(var(--accent-rgb),0.15),transparent)]"></div>
          
          <div className="relative z-10 max-w-2xl w-full">
            <div className="flex items-center justify-center gap-2 mb-6">
               <BookOpen size={20} className="text-accent" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Knowledgebase Terminal</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-8 leading-tight">
              How can we <span className="text-accent">help you</span> today?
            </h1>
            
            <div className="relative group">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search for documentation, tutorials, and troubleshooting..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] pl-16 pr-6 py-6 text-white placeholder-text-muted/50 focus:outline-none focus:border-accent/40 transition-all shadow-2xl"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link 
                  key={cat._id} 
                  to={`/kb/category/${cat.slug || cat._id}`}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8 hover:border-accent/30 transition-all group flex items-start gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-lg shadow-accent/5">
                    <Folder size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-accent transition-colors">{cat.name}</h3>
                    <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed opacity-60 font-medium">
                      {cat.description || `Browse all articles related to ${cat.name}.`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Popular Articles */}
            <div className="space-y-6 pt-8">
               <div className="flex items-center gap-3 px-2">
                  <HelpCircle size={20} className="text-accent" />
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Popular Solutions</h2>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {popularArticles.map((article) => (
                    <Link 
                      key={article._id} 
                      to={`/kb/article/${article.slug || article._id}`}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-accent/20 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <FileText size={18} className="text-text-muted group-hover:text-accent transition-colors" />
                        <span className="text-white font-bold group-hover:text-accent transition-colors">{article.title}</span>
                      </div>
                      <ChevronRight size={16} className="text-text-muted group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </Link>
                  ))}
               </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
