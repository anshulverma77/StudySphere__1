import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, navigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Question } from '@/types';
import { Avatar } from '@/components/Avatar';
import { TiltCard } from '@/components/TiltCard';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { formatDate, getProfileName, getProfileAvatar } from '@/lib/utils';
import {
  GraduationCap,
  Users,
  MessageCircle,
  Video,
  Flame,
  ArrowRight,
  PlusCircle,
  Loader2,
  Sparkles,
  Zap,
  BookOpen,
  Lightbulb,
  Trophy,
} from 'lucide-react';

export function HomePage() {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(
          `id, title, description, category, created_at, user_id,
           profiles:user_id (id, name, avatar)`
        )
        .order('created_at', { ascending: false })
        .limit(4);

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
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] mesh-bg-light">
      {/* ===== Hero Section with 3D parallax ===== */}
      <section
        onMouseMove={handleHeroMouseMove}
        className="relative mesh-bg-dark text-white overflow-hidden noise-overlay"
        style={{ minHeight: '70vh' }}
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/25 blur-[120px] animate-float-slow"
            style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)` }}
          />
          <div
            className="absolute top-[15%] right-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-400/20 blur-[100px] animate-float-medium"
            style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -15}px)` }}
          />
          <div
            className="absolute bottom-[-15%] left-[35%] w-[400px] h-[400px] rounded-full bg-teal-500/15 blur-[110px] animate-float-fast"
            style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 25}px)` }}
          />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        {/* Floating 3D geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[20%] left-[12%] w-16 h-16 preserve-3d animate-float-slow"
            style={{ transform: `rotateY(${mousePos.x * 40}deg) rotateX(${mousePos.y * 40}deg)` }}
          >
            <div className="w-full h-full rounded-2xl border-2 border-blue-400/30 bg-blue-500/5 backdrop-blur-sm" />
          </div>
          <div
            className="absolute top-[60%] left-[8%] w-12 h-12 preserve-3d animate-float-medium"
            style={{ transform: `rotateY(${mousePos.x * -50}deg) rotateX(${mousePos.y * -30}deg)` }}
          >
            <div className="w-full h-full rounded-full border-2 border-cyan-400/25 bg-cyan-500/5 backdrop-blur-sm" />
          </div>
          <div
            className="absolute top-[25%] right-[15%] w-20 h-20 preserve-3d animate-float-fast"
            style={{ transform: `rotateY(${mousePos.x * -35}deg) rotateX(${mousePos.y * 35}deg)` }}
          >
            <div
              className="w-full h-full border-2 border-teal-400/20 bg-teal-500/5 backdrop-blur-sm"
              style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            />
          </div>
          <div
            className="absolute top-[65%] right-[10%] w-14 h-14 preserve-3d animate-float-slow"
            style={{ transform: `rotateY(${mousePos.x * 45}deg) rotateX(${mousePos.y * -45}deg)` }}
          >
            <div className="w-full h-full rounded-xl border-2 border-indigo-400/20 bg-indigo-500/5 backdrop-blur-sm rotate-45" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-blue-100">Learn Together, Grow Together</span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 font-display animate-fade-in-up delay-200"
              style={{
                transform: `perspective(800px) rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * -5}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
              }}
            >
              <span className="text-gradient-blue animate-gradient-shift bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                StudySphere
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/80 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-300">
              Ask doubts. Help others. Build streaks. Join live study sessions.
              <br className="hidden sm:block" />
              Connect with a community of learners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
              {user ? (
                <button
                  onClick={() => navigate('ask')}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30"
                >
                  <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                  Ask a Doubt
                </button>
              ) : (
                <button
                  onClick={() => navigate('signup')}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-semibold rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/30"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300" />
                </button>
              )}
              <button
                onClick={() => navigate('community')}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 glass text-white font-semibold rounded-2xl hover:bg-white/15 transition-all duration-300"
              >
                Explore Community
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* ===== Floating Stats Cards ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Active Learners', color: 'from-blue-500 to-cyan-400', bgGlow: 'glow-blue' },
            { icon: MessageCircle, label: 'Doubts Solved', color: 'from-emerald-500 to-teal-400', bgGlow: 'glow-green' },
            { icon: Video, label: 'Live Sessions', color: 'from-purple-500 to-pink-400', bgGlow: '' },
            { icon: Flame, label: 'Day Streaks', color: 'from-orange-500 to-amber-400', bgGlow: 'glow-warm' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <TiltCard
                key={stat.label}
                maxTilt={6}
                className={`relative bg-white rounded-2xl border border-gray-100 p-5 shadow-lg animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} shadow-lg ${stat.bgGlow}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ===== User streak banner ===== */}
      {user && profile && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl overflow-hidden animate-gradient-shift bg-[length:200%_100%]">
            <div className="absolute inset-0 shimmer opacity-30" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce-subtle">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    Welcome back, {profile.name}!
                  </p>
                  <p className="text-orange-50 text-sm">
                    Current streak: {profile.current_streak} days | Longest:{' '}
                    {profile.longest_streak} days
                  </p>
                </div>
              </div>
              <Link
                to="profile"
                className="hidden sm:block px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-300 text-sm hover:scale-105"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== Feature highlights with 3D cards ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 font-display mb-2">
            Everything you need to{' '}
            <span className="text-gradient-blue">learn better</span>
          </h2>
          <p className="text-gray-500">A complete toolkit for collaborative studying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Lightbulb,
              title: 'Ask & Answer',
              desc: 'Post your doubts and get answers from the community. Help others by sharing your knowledge.',
              gradient: 'from-amber-400 to-orange-500',
              glow: 'glow-warm',
            },
            {
              icon: Flame,
              title: 'Build Streaks',
              desc: 'Stay consistent with daily activity tracking. Build your learning streak and stay motivated.',
              gradient: 'from-orange-400 to-red-500',
              glow: 'glow-warm',
            },
            {
              icon: Video,
              title: 'Live Sessions',
              desc: 'Join real-time study meetings or host your own. Connect with learners face-to-face.',
              gradient: 'from-blue-400 to-cyan-500',
              glow: 'glow-blue',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <TiltCard
                key={feature.title}
                maxTilt={8}
                className={`relative bg-white rounded-2xl border border-gray-100 p-7 shadow-md animate-fade-in-up delay-${(i + 1) * 200}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} mb-4`}
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* ===== Latest Questions ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">Latest Questions</h2>
          </div>
          <Link
            to="community"
            className="group text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No questions found yet.</p>
            <p className="text-gray-400 text-sm mt-1">Be the first person to ask a doubt!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {questions.map((q, i) => (
              <TiltCard
                key={q.id}
                maxTilt={5}
                className={`relative animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <Link
                  to="question"
                  param={q.id}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 font-display">
                      {q.title}
                    </h3>
                    <span className="flex-shrink-0 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
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
                    <span className="flex items-center gap-1 text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {q.answer_count ?? 0}
                    </span>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
