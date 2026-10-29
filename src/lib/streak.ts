import { supabase } from '@/lib/supabase';

export async function recordActivity(
  userId: string,
  activityType: 'ask_question' | 'answer_question' | 'join_meeting'
) {
  const today = new Date().toISOString().split('T')[0];

  // Insert activity record (unique per user per day)
  const { error: insertError } = await supabase
    .from('user_activity')
    .insert({
      user_id: userId,
      activity_type: activityType,
      activity_date: today,
    });

  if (insertError) {
    // If it's a unique constraint violation, the activity was already recorded today
    if (insertError.code !== '23505') {
      console.error('Error recording activity:', insertError);
    }
  }

  // Always call the streak update function
  const { error: streakError } = await supabase.rpc('update_streak', {
    p_user_id: userId,
  });

  if (streakError) {
    console.error('Error updating streak:', streakError);
  }
}
