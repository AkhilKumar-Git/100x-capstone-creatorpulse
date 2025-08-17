'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, Calendar, Check, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  current: boolean;
  popular?: boolean;
}

export function BillingSection() {
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = {
    name: 'Creator Pro',
    price: '$29',
    period: 'month',
    nextBilling: 'February 15, 2024',
    features: ['Unlimited AI drafts', 'Advanced analytics', 'Priority support', 'Custom integrations']
  };

  const paymentMethod = {
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2027'
  };

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$9',
      period: 'month',
      current: false,
      features: ['50 AI drafts/month', 'Basic analytics', 'Email support', '3 integrations']
    },
    {
      id: 'pro',
      name: 'Creator Pro',
      price: '$29',
      period: 'month',
      current: true,
      popular: true,
      features: ['Unlimited AI drafts', 'Advanced analytics', 'Priority support', 'Custom integrations']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      current: false,
      features: ['Everything in Pro', 'Team collaboration', 'Custom AI training', 'Dedicated support']
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv_001',
      date: 'Jan 15, 2024',
      amount: '$29.00',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: 'Dec 15, 2023',
      amount: '$29.00',
      status: 'paid',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: 'Nov 15, 2023',
      amount: '$29.00',
      status: 'paid',
      downloadUrl: '#'
    }
  ];

  const handleChangePlan = async (planId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Plan change initiated. You will be redirected to payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Redirecting to payment method update...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Subscription cancelled. You can continue using Pro until Feb 15, 2024.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-400">Manage your subscription, payment methods, and billing history</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-400" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-gray-400 mb-4">
                <span className="text-2xl font-bold text-white">{currentPlan.price}</span>
                <span className="text-gray-400">/{currentPlan.period}</span>
              </p>
              <div className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-green-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-4">
                <Calendar className="h-4 w-4 inline mr-1" />
                Next billing: {currentPlan.nextBilling}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Change Plan
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 w-full"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border transition-all ${
                  plan.current
                    ? 'border-purple-500 bg-purple-500/5'
                    : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={plan.current || isLoading}
                  className={`w-full ${
                    plan.current
                      ? 'bg-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-400" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">{paymentMethod.brand}</span>
              </div>
              <div>
                <p className="text-white font-medium">
                  •••• •••• •••• {paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-400">
                  Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleUpdatePayment}
              disabled={isLoading}
              className="border-neutral-700 text-gray-300 hover:bg-neutral-800"
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800">
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="border-neutral-800">
                  <TableCell className="text-white">{invoice.date}</TableCell>
                  <TableCell className="text-white">{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                      className={
                        invoice.status === 'paid'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
