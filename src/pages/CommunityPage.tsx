import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/types';
import { CATEGORIES } from '@/types';
import { Avatar } from '@/components/Avatar';
import { TiltCard } from '@/components/TiltCard';
import { formatDate, getProfileName, getProfileAvatar } from '@/lib/utils';
import { Link } from '@/lib/router';
import { MessageCircle, Search, Loader2, Filter } from 'lucide-react';

export function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let query = supabase
        .from('questions')
        .select(
          `id, title, description, category, created_at, user_id,
           profiles:user_id (id, name, avatar)`
        )
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        const questionsWithCounts = await Promise.all(
          (data || []).map(async (q) => {
            const { count } = await supabase
              .from('answers')
              .select('id', { count: 'exact', head: true })
              .eq('question_id', q.id);
            return { ...q, answer_count: count ?? 0 };
          })
        );
        setQuestions(questionsWithCounts);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [category, search]);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 font-display">Community</h1>
        <p className="text-gray-500 text-sm">Browse doubts asked by learners and help others by answering.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading questions...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No questions found.</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <TiltCard
              key={q.id}
              maxTilt={4}
              className={`animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}
            >
            <Link
              to="question"
              param={q.id}
              className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-1">
                  {q.title}
                </h3>
                <span className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {q.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{q.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={getProfileName(q.profiles)}
                    src={getProfileAvatar(q.profiles)}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500">
                    {getProfileName(q.profiles)} · {formatDate(q.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{q.answer_count ?? 0} Answers</span>
                </div>
              </div>
            </Link>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}
