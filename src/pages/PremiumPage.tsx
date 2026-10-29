import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import { navigate } from '@/lib/router';
import { TiltCard } from '@/components/TiltCard';
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  Video,
  Users,
  Calendar,
  Lock,
  ArrowLeft,
  Zap,
} from 'lucide-react';

export function PremiumPage() {
  const { user } = useAuth();
  const { isPremium, subscription, loading } = useSubscription(user?.id);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!user) {
      navigate('login');
      return;
    }

    setActivating(true);
    setError(null);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const { error: insertError } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'premium',
      status: 'active',
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
    });

    if (insertError) {
      setError('Failed to activate premium. Please try again.');
      setActivating(false);
      return;
    }

    setSuccess(true);
    setActivating(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="min-h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light">
        <button
          onClick={() => navigate('home')}
          className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        <TiltCard maxTilt={6} className="relative animate-fade-in-scale">
          <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 rounded-3xl p-8 text-white text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-20" />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-yellow-200/20 blur-2xl animate-float-medium" />
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-subtle shadow-xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 font-display">You're a Premium Member!</h1>
              <p className="text-amber-50 mb-1">Thank you for supporting StudySphere.</p>
              <p className="text-amber-100 text-sm">
                {subscription?.end_date
                  ? `Active until ${new Date(subscription.end_date).toLocaleDateString()}`
                  : 'Your subscription is active'}
              </p>
            </div>
          </div>
        </TiltCard>

        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-md animate-fade-in-up delay-200">
          <h2 className="font-bold text-gray-900 mb-4 font-display">Your Premium Benefits</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Video, text: 'Premium Live Sessions', gradient: 'from-red-400 to-orange-500' },
              { icon: Users, text: 'Premium Study Rooms', gradient: 'from-blue-400 to-cyan-500' },
              { icon: Sparkles, text: 'Exclusive Discussions', gradient: 'from-purple-400 to-pink-500' },
              { icon: Calendar, text: 'Premium Study Events', gradient: 'from-emerald-400 to-teal-500' },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.text}
                  className="group flex items-center gap-3 text-sm text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${benefit.gradient} shadow-md transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {benefit.text}
                  <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mesh-bg-light">
      <button
        onClick={() => navigate('home')}
        className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-all"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </button>

      {/* Premium banner with 3D tilt and shimmer */}
      <TiltCard maxTilt={5} className="relative mb-6 animate-fade-in-scale">
        <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 rounded-3xl p-8 text-white text-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-20" />
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-yellow-200/15 blur-2xl animate-float-medium" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-white/20">
              <Sparkles className="w-4 h-4 animate-bounce-subtle" />
              StudySphere Premium
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display">
              Unlock Premium Community
            </h1>
            <p className="text-amber-50 max-w-xl mx-auto">
              Get access to premium study rooms, exclusive live sessions, premium discussions, and
              special study events.
            </p>
          </div>
        </div>
      </TiltCard>

      {/* Feature cards with 3D tilt */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            icon: Video,
            title: 'Premium Live Sessions',
            desc: 'Join exclusive live study sessions with top learners.',
            gradient: 'from-red-400 to-orange-500',
          },
          {
            icon: Users,
            title: 'Premium Study Rooms',
            desc: 'Access premium-only study rooms and discussions.',
            gradient: 'from-blue-400 to-cyan-500',
          },
          {
            icon: Sparkles,
            title: 'Exclusive Discussions',
            desc: 'Participate in premium-only discussion areas.',
            gradient: 'from-purple-400 to-pink-500',
          },
          {
            icon: Calendar,
            title: 'Premium Study Events',
            desc: 'Join special study events and workshops.',
            gradient: 'from-emerald-400 to-teal-500',
          },
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <TiltCard
              key={feature.title}
              maxTilt={7}
              className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-md animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Pricing card with glow */}
      <TiltCard maxTilt={4} className="relative bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-xl animate-fade-in-up delay-500">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
          <Zap className="w-3 h-3" />
          BEST VALUE
        </div>
        <div className="flex items-baseline justify-center gap-1 mb-1 mt-2">
          <span className="text-5xl font-bold text-gray-900 font-display">$9.99</span>
          <span className="text-gray-500 text-sm">/year</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Full access to all premium features</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-left animate-fade-in-up">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm mb-4 animate-fade-in-up">
            Premium activated! Refresh the page to see your benefits.
          </div>
        ) : (
          <>
            {user ? (
              <button
                onClick={handleActivate}
                disabled={activating}
                className="group w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
                {activating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    Upgrade to Premium
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => navigate('signup')}
                className="group w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-xl hover:shadow-amber-500/30 hover:scale-105"
              >
                <Crown className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Sign Up to Get Premium
              </button>
            )}
          </>
        )}

        <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Secure payment integration coming soon. This is a demo activation.
        </p>
      </TiltCard>

      {/* Free vs Premium comparison */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 shadow-md animate-fade-in-up delay-700">
        <h2 className="font-bold text-gray-900 mb-4 font-display">Free vs Premium</h2>
        <div className="space-y-1">
          {[
            { feature: 'Ask & Answer Doubts', free: true, premium: true },
            { feature: 'Community Access', free: true, premium: true },
            { feature: 'Basic Live Meetings', free: true, premium: true },
            { feature: 'Premium Study Rooms', free: false, premium: true },
            { feature: 'Premium Live Sessions', free: false, premium: true },
            { feature: 'Exclusive Discussions', free: false, premium: true },
            { feature: 'Premium Study Events', free: false, premium: true },
          ].map((row) => (
            <div
              key={row.feature}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/50 -mx-2 px-2 rounded-lg"
            >
              <span className="text-sm text-gray-700">{row.feature}</span>
              <div className="flex gap-8">
                <span
                  className={`text-sm w-6 text-center ${row.free ? 'text-emerald-600 font-bold' : 'text-gray-300'}`}
                >
                  {row.free ? '✓' : '—'}
                </span>
                <span
                  className={`text-sm w-6 text-center ${row.premium ? 'text-amber-600 font-bold' : 'text-gray-300'}`}
                >
                  {row.premium ? '✓' : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-8 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 w-6 text-center">Free</span>
          <span className="text-xs font-bold text-amber-600 w-6 text-center">Premium</span>
        </div>
      </div>
    </div>
  );
}
