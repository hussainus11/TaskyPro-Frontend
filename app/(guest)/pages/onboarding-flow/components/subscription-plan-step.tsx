"use client";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "../store";
import { Sparkles, Check, X, Loader2, Zap, Crown, Rocket } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const subscriptionPlans = [
  {
    id: "Free",
    title: "Free",
    price: "$0",
    period: "forever",
    tagline: "For trying things out",
    icon: Sparkles,
    features: {
      users: true,
      storage: true,
      projects: true,
      taskManagement: true,
      crm: true,
      support: true,
      notifications: true,
      reporting: true,
      api: false,
      integrations: false,
      branding: false,
      backup: false,
      compliance: false,
      audit: false
    }
  },
  {
    id: "Basic",
    title: "Basic",
    price: "$9",
    period: "/month",
    tagline: "For small growing teams",
    icon: Zap,
    features: {
      users: true,
      storage: true,
      projects: true,
      taskManagement: true,
      crm: true,
      support: true,
      notifications: true,
      reporting: true,
      api: true,
      integrations: false,
      branding: false,
      backup: false,
      compliance: false,
      audit: false
    }
  },
  {
    id: "Pro",
    title: "Pro",
    price: "$19",
    period: "/month",
    tagline: "For scaling businesses",
    icon: Rocket,
    popular: true,
    features: {
      users: true,
      storage: true,
      projects: true,
      taskManagement: true,
      crm: true,
      support: true,
      notifications: true,
      reporting: true,
      api: true,
      integrations: true,
      branding: true,
      backup: true,
      compliance: false,
      audit: false
    }
  },
  {
    id: "Enterprise",
    title: "Enterprise",
    price: "$49",
    period: "/month",
    tagline: "For large organizations",
    icon: Crown,
    features: {
      users: true,
      storage: true,
      projects: true,
      taskManagement: true,
      crm: true,
      support: true,
      notifications: true,
      reporting: true,
      api: true,
      integrations: true,
      branding: true,
      backup: true,
      compliance: true,
      audit: true
    }
  }
];

const featureLabels: Record<string, string> = {
  users: "Unlimited users",
  storage: "Cloud storage",
  projects: "Unlimited projects",
  taskManagement: "Task management",
  crm: "CRM",
  support: "Priority support",
  notifications: "Notifications",
  reporting: "Reporting",
  api: "API access",
  integrations: "Integrations",
  branding: "Custom branding",
  backup: "Backup & export",
  compliance: "Compliance tools",
  audit: "Audit logs"
};

const featureOrder = Object.keys(featureLabels);

export function SubscriptionPlanStep() {
  const { data, updateSubscriptionPlan, prevStep } = useOnboardingStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!data.subscriptionPlan) {
      toast.error("Please select a subscription plan");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user from localStorage (created during registration)
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!userStr) {
        throw new Error("User not found. Please register first.");
      }
      const currentUser = JSON.parse(userStr);

      // Create company with selected plan and all company data
      const companyRes = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.company.name,
          email: data.company.email,
          phone: data.company.phone,
          address: data.company.address,
          website: data.company.website,
          industry: data.company.industry,
          plan: data.subscriptionPlan || 'Free',
          // Additional fields for future use
          city: data.company.city,
          state: data.company.state,
          country: data.company.country,
          zipCode: data.company.zipCode,
          companySize: data.company.companySize,
          taxId: data.company.taxId,
          registrationNumber: data.company.registrationNumber,
          description: data.company.description,
          foundedYear: data.company.foundedYear,
          timezone: data.company.timezone,
          currency: data.company.currency,
        }),
      });

      if (!companyRes.ok) {
        const errorData = await companyRes.json();
        throw new Error(errorData.error || "Failed to create company");
      }

      const company = await companyRes.json();

      // Create branches
      const createdBranchIds: number[] = [];
      for (const branch of data.branches) {
        const branchRes = await fetch(`${API_BASE_URL}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...branch, companyId: company.id }),
        });

        if (!branchRes.ok) {
          const errorData = await branchRes.json();
          throw new Error(errorData.error || "Failed to create branch");
        }

        const createdBranch = await branchRes.json();
        createdBranchIds.push(createdBranch.id);
      }

      // Update existing user to associate with company
      const userRes = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token')
            ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            : {})
        },
        body: JSON.stringify({
          companyId: company.id,
          branchId: createdBranchIds[0] || null,
          role: "admin",
          plan_name: data.subscriptionPlan,
        }),
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      // Update user in localStorage
      const updatedUser = await userRes.json();
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Onboarding completed successfully
      toast.success("Company setup completed successfully!");
      router.push("/crm");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error("Setup failed", {
        description: error.message || "An error occurred during onboarding. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary flex size-10 items-center justify-center rounded-full">
          <Sparkles className="text-primary-foreground size-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground text-sm">Select the subscription plan that fits your needs. You can change this anytime.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {subscriptionPlans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = data.subscriptionPlan === plan.id;

          return (
            <Card
              key={plan.id}
              onClick={() => updateSubscriptionPlan(plan.id)}
              className={cn(
                "relative cursor-pointer gap-4 p-5 transition-all hover:shadow-md",
                isSelected ? "border-primary ring-primary/20 ring-2" : "hover:border-primary/40"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}

              <div className="space-y-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold">{plan.title}</h3>
                  <p className="text-muted-foreground text-xs">{plan.tagline}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>

              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSubscriptionPlan(plan.id);
                }}
              >
                {isSelected ? "Selected" : `Choose ${plan.title}`}
              </Button>

              <ul className="space-y-2 border-t pt-4">
                {featureOrder.map((key) => {
                  const included = plan.features[key as keyof typeof plan.features];
                  return (
                    <li
                      key={key}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        included ? "text-foreground" : "text-muted-foreground/60"
                      )}
                    >
                      {included ? (
                        <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="size-4 shrink-0" />
                      )}
                      {featureLabels[key]}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
          Back
        </Button>
        <Button size="lg" onClick={handleComplete} disabled={!data.subscriptionPlan || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </div>
  );
}
