/*
  # Fix subscription status function

  1. Changes
    - Create get_subscription_status function to check user subscription status
    - Function returns subscription status and date for a given user
*/

CREATE OR REPLACE FUNCTION public.get_subscription_status(user_uuid uuid)
RETURNS TABLE (
    status text,
    subscription_date timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.status,
        s.subscription_date
    FROM subscriptions s
    WHERE s.user_id = user_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;