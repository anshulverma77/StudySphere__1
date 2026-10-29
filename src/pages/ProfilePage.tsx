import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import { Avatar } from '@/components/Avatar';
import { TiltCard } from '@/components/TiltCard';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { formatDate } from '@/lib/utils';
import { navigate } from '@/lib/router';
import {
  Flame,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  Calendar,
  Crown,
  Edit2,
  Save,
  X,
  Loader2,
  Camera,
  Video,
} from 'lucide-react';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { isPremium, subscription } = useSubscription(user?.id);
  const [stats, setStats] = useState({
    questionsAsked: 0,
    answersGiven: 0,
    meetingsJoined: 0,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatar(profile.avatar);
    }
  }, [profile]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const [questionsRes, answersRes, meetingsRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('meeting_participants')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setStats({
        questionsAsked: questionsRes.count ?? 0,
        answersGiven: answersRes.count ?? 0,
        meetingsJoined: meetingsRes.count ?? 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), avatar })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 mesh-bg-light">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('login')}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: profile.current_streak,
      suffix: ' days',
      gradient: 'from-orange-400 to-red-500',
      glow: 'glow-warm',
      bgGradient: 'from-orange-50 to-red-50',
    },
    {
      icon: TrendingUp,
      label: 'Longest Streak',
      value: profile.longest_streak,
      suffix: ' days',
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'glow-green',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      icon: HelpCircle,
      label: 'Questions Asked',
      value: stats.questionsAsked,
      suffix: '',
      gradient: 'from-blue-400 to-cyan-500',
      glow: 'glow-blue',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      icon: MessageCircle,
      label: 'Answers Given',
      value: stats.answersGiven,
      suffix: '',
      gradient: 'from-purple-400 to-pink-500',
      glow: '',
      bgGradient: 'from-purple-50 to-pink-50',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light">
      {/* Profile header with 3D gradient cover */}
      <div className="relative bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-lg animate-fade-in-up">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 animate-gradient-shift bg-[length:200%_100%] relative overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-20" />
          <div className="absolute top-2 right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-float-slow" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative">
              {editing ? (
                <div className="relative">
                  <div className="ring-4 ring-white rounded-full">
                    <Avatar name={name || 'User'} src={avatar} size="lg" />
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer border border-gray-200 hover:bg-gray-50 transition-all hover:scale-110">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              ) : (
                <div className="ring-4 ring-white rounded-full">
                  <Avatar name={profile.name} src={profile.avatar} size="lg" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:scale-105 transition-all disabled:opacity-50 shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(profile.name);
                      setAvatar(profile.avatar);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="group flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Edit2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold text-gray-900 border border-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 font-display"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 mb-1 font-display">{profile.name}</h1>
          )}

          <p className="text-sm text-gray-500 mb-3">{profile.email}</p>

          <div className="flex flex-wrap gap-2">
            {isPremium ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                <Crown className="w-3.5 h-3.5" />
                Premium Member
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                Free Plan
              </span>
            )}
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard stats with 3D tilt cards and animated numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <TiltCard
              key={stat.label}
              maxTilt={8}
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl border border-gray-100 p-5 shadow-md animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow}`}
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 font-display">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Activity summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md animate-fade-in-up delay-500">
        <h2 className="text-lg font-bold text-gray-900 mb-4 font-display">Activity Summary</h2>
        <div className="space-y-3">
          {[
            { label: 'Questions Asked', value: stats.questionsAsked, icon: HelpCircle, color: 'text-blue-500' },
            { label: 'Answers Given', value: stats.answersGiven, icon: MessageCircle, color: 'text-purple-500' },
            { label: 'Meetings Joined', value: stats.meetingsJoined, icon: Video, color: 'text-teal-500' },
            {
              label: 'Community Activity',
              value: stats.questionsAsked + stats.answersGiven > 0 ? 'Active' : 'New',
              icon: TrendingUp,
              color: 'text-emerald-500',
              isText: true,
            },
            {
              label: 'Last Activity',
              value: profile.last_activity_date ? formatDate(profile.last_activity_date) : 'No activity yet',
              icon: Calendar,
              color: 'text-gray-400',
              isText: true,
            },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/50 -mx-2 px-2 rounded-lg"
              >
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${row.color}`} />
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {row.isText ? row.value : <AnimatedNumber value={row.value as number} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription info */}
      {subscription && (
        <div className="mt-6 relative bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-2xl border border-blue-100 p-6 overflow-hidden animate-fade-in-up delay-700">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-blue-200/20 blur-3xl animate-float-slow" />
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 font-display">Subscription</h3>
              <p className="text-sm text-gray-600">
                Plan:{' '}
                <span className="font-medium capitalize">{subscription.plan}</span> · Status:{' '}
                <span className="font-medium capitalize">{subscription.status}</span>
              </p>
              {subscription.end_date && (
                <p className="text-xs text-gray-500 mt-1">
                  Valid until: {formatDate(subscription.end_date)}
                </p>
              )}
            </div>
            {!isPremium && (
              <button
                onClick={() => navigate('premium')}
                className="group flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-amber-500/30"
              >
                <Crown className="w-4 h-4 transition-transform group-hover:rotate-12" />
                Upgrade
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
