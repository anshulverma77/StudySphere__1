import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { recordActivity } from '@/lib/streak';
import { useSubscription } from '@/hooks/useSubscription';
import type { Meeting } from '@/types';
import { CATEGORIES } from '@/types';
import { Avatar } from '@/components/Avatar';
import { TiltCard } from '@/components/TiltCard';
import { formatDateTime, getProfileName, getProfileAvatar } from '@/lib/utils';
import { navigate } from '@/lib/router';
import {
  Video,
  Plus,
  Loader2,
  Calendar,
  Users,
  Crown,
  Lock,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';

export function LiveStudyPage() {
  const { user } = useAuth();
  const { isPremium } = useSubscription(user?.id);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinedMeetings, setJoinedMeetings] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isPremiumMeeting, setIsPremiumMeeting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMeetings();
    if (user) fetchJoinedMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMeetings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meetings')
      .select(
        `id, host_user_id, title, description, category, meeting_link,
         scheduled_at, is_premium, created_at,
         profiles:host_user_id (id, name, avatar)`
      )
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
    } else {
      const meetingsWithCounts = await Promise.all(
        (data || []).map(async (m) => {
          const { count } = await supabase
            .from('meeting_participants')
            .select('id', { count: 'exact', head: true })
            .eq('meeting_id', m.id);
          return { ...m, participant_count: count ?? 0 };
        })
      );
      setMeetings(meetingsWithCounts);
    }
    setLoading(false);
  };

  const fetchJoinedMeetings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('meeting_participants')
      .select('meeting_id')
      .eq('user_id', user.id);
    if (data) {
      setJoinedMeetings(new Set(data.map((d) => d.meeting_id)));
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      navigate('login');
      return;
    }

    if (!title.trim() || !category || !meetingLink.trim() || !scheduledAt) {
      setError('Please fill in all required fields.');
      return;
    }

    setCreating(true);

    const { error: insertError } = await supabase.from('meetings').insert({
      title: title.trim(),
      description: description.trim() || null,
      category,
      meeting_link: meetingLink.trim(),
      scheduled_at: new Date(scheduledAt).toISOString(),
      is_premium: isPremiumMeeting,
    });

    if (insertError) {
      setError('Failed to create meeting. Please try again.');
      setCreating(false);
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setMeetingLink('');
    setScheduledAt('');
    setIsPremiumMeeting(false);
    setCreating(false);
    setShowCreate(false);

    await fetchMeetings();
  };

  const handleJoinMeeting = async (meeting: Meeting) => {
    if (!user) {
      navigate('login');
      return;
    }

    if (meeting.is_premium && !isPremium) {
      navigate('premium');
      return;
    }

    // Record participation
    if (!joinedMeetings.has(meeting.id)) {
      const { error: joinError } = await supabase
        .from('meeting_participants')
        .insert({ meeting_id: meeting.id });

      if (!joinError) {
        setJoinedMeetings(new Set([...joinedMeetings, meeting.id]));
        await recordActivity(user.id, 'join_meeting');
        await fetchMeetings();
      }
    }

    // Open meeting link in new tab
    window.open(meeting.meeting_link, '_blank', 'noopener,noreferrer');
  };

  const isLive = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMin = (now.getTime() - scheduled.getTime()) / 60000;
    return diffMin >= -15 && diffMin <= 120;
  };

  const isUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 font-display">Live Study</h1>
          <p className="text-gray-500 text-sm">Join live study sessions or host your own.</p>
        </div>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="group flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            Create Meeting
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No study meetings scheduled.</p>
          <p className="text-gray-400 text-sm mt-1">
            {user ? 'Create one to get started!' : 'Check back later or log in to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m) => {
            const live = isLive(m.scheduled_at);
            const upcoming = isUpcoming(m.scheduled_at);
            const locked = m.is_premium && !isPremium;
            const joined = joinedMeetings.has(m.id);

            return (
              <TiltCard
                key={m.id}
                maxTilt={7}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {live ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : upcoming ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        Ended
                      </span>
                    )}
                    {m.is_premium && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-full">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{m.title}</h3>
                {m.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{m.description}</p>
                )}

                <div className="space-y-1.5 text-xs text-gray-500 mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(m.scheduled_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    {m.participant_count ?? 0} participants
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                      {m.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar
                      name={getProfileName(m.profiles)}
                      src={getProfileAvatar(m.profiles)}
                      size="sm"
                    />
                    <span>Host: {getProfileName(m.profiles)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinMeeting(m)}
                  disabled={!live && !upcoming}
                  className={`group w-full py-2.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    locked
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : live
                      ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:scale-[1.02] shadow-lg hover:shadow-red-500/30'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Upgrade to Join
                    </>
                  ) : joined ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Open Meeting
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </>
                  )}
                </button>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Create Study Meeting</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Java Doubt Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What will this session cover?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste your Google Meet, Zoom, or other video conference link.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isPremium && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremiumMeeting}
                    onChange={(e) => setIsPremiumMeeting(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Premium only meeting
                </label>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
