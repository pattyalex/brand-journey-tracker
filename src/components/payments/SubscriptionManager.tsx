
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  plan: {
    amount: number;
    currency: string;
    interval: string;
  };
}

const SubscriptionManager: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      // Replace with your API call to get user's subscription
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    try {
      await fetch(`/api/subscription/${subscription.id}/cancel`, {
        method: 'POST',
      });
      
      toast.success('Subscription cancelled successfully');
      loadSubscription(); // Reload subscription data
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const updateSubscription = async (newPriceId: string) => {
    if (!subscription) return;

    try {
      await fetch(`/api/subscription/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: newPriceId,
        }),
      });

      toast.success('Subscription updated successfully');
      loadSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You don't have an active subscription.</p>
          <Button className="mt-4">Subscribe Now</Button>
        </CardContent>
      </Card>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Subscription
          <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="font-medium">
            {formatAmount(subscription.plan.amount, subscription.plan.currency)} / {subscription.plan.interval}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Next billing date</p>
          <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => updateSubscription('price_annual_plan_id')}
            disabled={subscription.plan.interval === 'year'}
          >
            Switch to Annual
          </Button>
          <Button
            variant="outline"
            onClick={() => updateSubscription('price_monthly_plan_id')}
            disabled={subscription.plan.interval === 'month'}
          >
            Switch to Monthly
          </Button>
          <Button
            variant="destructive"
            onClick={cancelSubscription}
          >
            Cancel Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
