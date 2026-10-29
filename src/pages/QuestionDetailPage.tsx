import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { recordActivity } from '@/lib/streak';
import type { Question, Answer } from '@/types';
import { Avatar } from '@/components/Avatar';
import { formatDate, formatDateTime, getProfileName, getProfileAvatar } from '@/lib/utils';
import { navigate, Link } from '@/lib/router';
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Send,
} from 'lucide-react';

export function QuestionDetailPage({ questionId }: { questionId: string }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select(
        `id, title, description, category, created_at, updated_at, user_id,
         profiles:user_id (id, name, avatar)`
      )
      .eq('id', questionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching question:', error);
      return;
    }
    setQuestion(data as unknown as Question);
  };

  const fetchAnswers = async () => {
    const { data, error } = await supabase
      .from('answers')
      .select(
        `id, question_id, user_id, answer, created_at, updated_at,
         profiles:user_id (id, name, avatar)`
      )
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching answers:', error);
      return;
    }
    setAnswers((data ?? []) as unknown as Answer[]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchQuestion(), fetchAnswers()]);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const handlePostAnswer = async () => {
    if (!user) {
      navigate('login');
      return;
    }
    if (!newAnswer.trim()) return;

    setPosting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        answer: newAnswer.trim(),
      })
      .select(
        `id, question_id, user_id, answer, created_at, updated_at,
         profiles:user_id (id, name, avatar)`
      )
      .single();

    if (insertError) {
      setError('Failed to post answer. Please try again.');
      setPosting(false);
      return;
    }

    setAnswers([...answers, data as unknown as Answer]);
    setNewAnswer('');
    setPosting(false);

    // Record activity and update streak
    await recordActivity(user.id, 'answer_question');
  };

  const handleDeleteQuestion = async () => {
    if (!question || !user) return;
    if (!confirm('Are you sure you want to delete this question? All answers will also be removed.')) return;

    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', question.id);

    if (deleteError) {
      setError('Failed to delete question.');
      return;
    }

    navigate('community');
  };

  const handleSaveQuestionEdit = async () => {
    if (!question) return;
    const { error: updateError } = await supabase
      .from('questions')
      .update({ title: editTitle.trim(), description: editDesc.trim() })
      .eq('id', question.id);

    if (updateError) {
      setError('Failed to update question.');
      return;
    }
    setEditingQuestion(false);
    await fetchQuestion();
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Delete this answer?')) return;

    const { error: deleteError } = await supabase.from('answers').delete().eq('id', answerId);

    if (deleteError) {
      setError('Failed to delete answer.');
      return;
    }

    setAnswers(answers.filter((a) => a.id !== answerId));
  };

  const handleSaveAnswerEdit = async (answerId: string) => {
    const { error: updateError } = await supabase
      .from('answers')
      .update({ answer: editAnswerText.trim() })
      .eq('id', answerId);

    if (updateError) {
      setError('Failed to update answer.');
      return;
    }

    setAnswers(
      answers.map((a) => (a.id === answerId ? { ...a, answer: editAnswerText.trim() } : a))
    );
    setEditingAnswerId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm">Loading question...</span>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Question not found.</p>
          <Link to="community" className="text-blue-600 font-medium hover:text-blue-700">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const isQuestionOwner = user?.id === question.user_id;

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('community')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </button>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        {editingQuestion ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveQuestionEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                onClick={() => setEditingQuestion(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{question.title}</h1>
              <span className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {question.category}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{question.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Avatar
                  name={getProfileName(question.profiles)}
                  src={getProfileAvatar(question.profiles)}
                  size="sm"
                />
                <div className="text-xs">
                  <p className="font-medium text-gray-700">
                    {getProfileName(question.profiles)}
                  </p>
                  <p className="text-gray-400">{formatDateTime(question.created_at)}</p>
                </div>
              </div>
              {isQuestionOwner && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditTitle(question.title);
                      setEditDesc(question.description);
                      setEditingQuestion(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Answers section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-6">
            <p className="text-gray-500 text-sm">No answers yet. Be the first to help!</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {answers.map((answer) => {
              const isAnswerOwner = user?.id === answer.user_id;
              return (
                <div
                  key={answer.id}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  {editingAnswerId === answer.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editAnswerText}
                        onChange={(e) => setEditAnswerText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveAnswerEdit(answer.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAnswerId(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{answer.answer}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={getProfileName(answer.profiles)}
                            src={getProfileAvatar(answer.profiles)}
                            size="sm"
                          />
                          <div className="text-xs">
                            <p className="font-medium text-gray-700">
                              {getProfileName(answer.profiles)}
                            </p>
                            <p className="text-gray-400">{formatDate(answer.created_at)}</p>
                          </div>
                        </div>
                        {isAnswerOwner && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditingAnswerId(answer.id);
                                setEditAnswerText(answer.answer);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Answer form */}
        {user ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Write your answer</h3>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Share your knowledge and help the community..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{newAnswer.length}/5000</p>
              <button
                onClick={handlePostAnswer}
                disabled={!newAnswer.trim() || posting}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Answer
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 text-center">
            <p className="text-gray-500 text-sm">
              Please{' '}
              <Link to="login" className="text-blue-600 font-medium hover:text-blue-700">
                log in
              </Link>{' '}
              to post an answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
