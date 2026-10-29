import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types';

export function useSubscription(userId: string | null | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const isPremium =
    subscription?.plan === 'premium' &&
    subscription?.status === 'active';

  useEffect(() => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data as Subscription | null);
      }
      setLoading(false);
    };

    fetchSubscription();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { subscription, isPremium, loading };
}
