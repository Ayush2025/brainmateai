import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  interval: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    interval: "forever",
    description: "Perfect for getting started",
    icon: <Star className="w-6 h-6" />,
    features: [
      { text: "1 AI Tutor", included: true },
      { text: "Basic chat interface", included: true },
      { text: "3 content files per tutor", included: true },
      { text: "Community support", included: true },
      { text: "Notes downloads", included: false },
      { text: "YouTube & Google recommendations", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Voice interaction", included: false },
      { text: "Robotic AI avatars", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    originalPrice: 399,
    currency: "INR",
    interval: "month",
    description: "Best for individual educators",
    popular: true,
    icon: <Zap className="w-6 h-6" />,
    features: [
      { text: "5 AI Tutors", included: true },
      { text: "Advanced chat interface", included: true },
      { text: "10 content files per tutor", included: true },
      { text: "Notes downloads", included: true },
      { text: "YouTube & Google recommendations", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Voice interaction", included: true },
      { text: "Interactive PhET Simulations", included: true },
      { text: "Email support", included: true },
      { text: "Robotic AI avatars", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 599,
    originalPrice: 999,
    currency: "INR",
    interval: "month",
    description: "Perfect for institutions",
    icon: <Crown className="w-6 h-6" />,
    features: [
      { text: "Unlimited AI Tutors", included: true },
      { text: "Advanced chat interface", included: true },
      { text: "Unlimited content files", included: true },
      { text: "Notes downloads", included: true },
      { text: "YouTube & Google recommendations", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Voice interaction", included: true },
      { text: "Interactive PhET Simulations", included: true },
      { text: "NASA Space Simulations", included: true },
      { text: "Premium robotic AI avatars", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: true },
    ],
  },
];

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    if (plan.id === "free") {
      toast({
        title: "Already on Free Plan",
        description: "You're already using the free plan!",
      });
      return;
    }

    setLoading(plan.id);

    try {
      // Create Razorpay order
      const orderResponse = await apiRequest("POST", "/api/create-order", {
        amount: plan.price,
        planType: plan.id,
      });

      const order = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Test key - Update with production key when ready
        amount: order.amount,
        currency: order.currency,
        name: "BrainMate AI",
        description: `Subscribe to ${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await apiRequest("POST", "/api/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.id,
            });

            const result = await verifyResponse.json();

            if (result.success) {
              toast({
                title: "Subscription Successful!",
                description: `Welcome to ${plan.name}! Your subscription is now active.`,
              });
              // Refresh user data
              window.location.reload();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if the amount was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: (user as any)?.firstName || "",
          email: (user as any)?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered education with our flexible pricing plans
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-indigo-500 shadow-lg scale-105"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium text-center py-2">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.id === "free" ? "bg-gray-100 dark:bg-gray-800" :
                    plan.id === "pro" ? "bg-indigo-100 dark:bg-indigo-900" :
                    "bg-purple-100 dark:bg-purple-900"
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{plan.originalPrice}
                    </span>
                  )}
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.interval}
                  </span>
                </div>
                
                <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check
                        className={`w-5 h-5 ${
                          feature.included
                            ? "text-green-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.id === "free"
                      ? "bg-gray-600 hover:bg-gray-700"
                      : plan.id === "pro"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white font-medium py-3`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : plan.id === "free" ? (
                    "Current Plan"
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! Start with our free plan and upgrade when you're ready to unlock more features.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! We use industry-standard encryption and security measures to protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}