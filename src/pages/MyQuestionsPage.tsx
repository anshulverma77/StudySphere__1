import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/types';
import { Avatar } from '@/components/Avatar';
import { formatDate } from '@/lib/utils';
import { TiltCard } from '@/components/TiltCard';
import { Link, navigate } from '@/lib/router';
import { MessageCircle, Loader2, PlusCircle, Edit2, Trash2 } from 'lucide-react';

export function MyQuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('questions')
        .select(
          `id, title, description, category, created_at, user_id,
           profiles:user_id (id, name, avatar)`
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question? All answers will also be removed.')) return;
    setDeleting(id);

    const { error } = await supabase.from('questions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
    } else {
      setQuestions(questions.filter((q) => q.id !== id));
    }
    setDeleting(null);
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view your questions.</p>
          <Link to="login" className="text-blue-600 font-medium hover:text-blue-700">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 font-display">My Questions</h1>
          <p className="text-gray-500 text-sm">Manage questions you've asked.</p>
        </div>
        <button
          onClick={() => navigate('ask')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Ask Question
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You haven't asked any questions yet.</p>
          <p className="text-gray-400 text-sm mt-1">Start by asking your first doubt!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <TiltCard
              key={q.id}
              maxTilt={4}
              className={`animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}
            >
            <div
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link to="question" param={q.id} className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                    {q.title}
                  </h3>
                </Link>
                <span className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {q.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{q.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {q.answer_count ?? 0} Answers
                  </span>
                  <span>{formatDate(q.created_at)}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => navigate('question', q.id)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate('question', q.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    disabled={deleting === q.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === q.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}
