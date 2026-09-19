"use client";

import Image from "next/image";
import { InterestsStep } from "./interests-step";
import { WorkPreferencesStep } from "./work-preferences-step";
import { AccountTypeStep } from "./account-type-step";
import { CompanyStep } from "./company-step";
import { BranchesStep } from "./branches-step";
import { SubscriptionPlanStep } from "./subscription-plan-step";
import { ProgressIndicator } from "./progress-indicator";
import { useOnboardingStore } from "../store";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const userSteps = [InterestsStep, WorkPreferencesStep, AccountTypeStep];
const companySteps = [CompanyStep, BranchesStep, SubscriptionPlanStep];

const companyStepLabels = ["Company Details", "Branches", "Subscription Plan"];

export default function Onboarding() {
  const { type, currentStep, data } = useOnboardingStore();
  const router = useRouter();
  const steps = type === 'company' ? companySteps : userSteps;
  const stepLabels = type === 'company' ? companyStepLabels : ["Interests", "Preferences", "Account Type"];

  if (currentStep >= steps.length) {
    // Onboarding completed
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-card border rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <Image src="/logo.png" width={40} height={40} className="rounded-[8px]" alt="TaskyPro logo" unoptimized />
            </div>
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">You&apos;re all set!</h1>
              <p className="text-muted-foreground text-lg">
                {type === 'company'
                  ? 'Your company has been set up successfully. You can now start using all the features.'
                  : 'Your account has been configured successfully.'}
              </p>
            </div>
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => router.push("/crm")}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep];
  const stepIndex = currentStep + 1;

  return (
    // At lg+, the whole split screen is taken out of document flow with
    // fixed/inset-0: a position:fixed box never contributes to <body>'s
    // scrollable height no matter how tall its content is, so this is the
    // only way to *guarantee* zero page-level scroll here - relying on
    // flex/grid height containment to prevent it turned out to still leak
    // to the document scrollbar in practice. The right panel's own
    // overflow-y-auto below remains the single, self-contained scroll
    // region. Mobile (below lg) stays in normal flow, unaffected.
    <div className="lg:fixed lg:inset-0 lg:grid lg:grid-cols-[2fr_3fr] lg:overflow-hidden">
      {/* Left side - branded hero panel (hidden on mobile). Fixed dark
          treatment regardless of site theme, same trick used for the
          progress indicator inside it - this panel is a photo backdrop,
          not a themable surface. */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/extra/image5.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

        <div className="dark relative z-10 flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" width={32} height={32} className="rounded-[7px]" alt="TaskyPro logo" unoptimized />
            <span className="font-display text-lg font-bold text-white">Tasky Pro</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">
              {type === "company" ? "Set up your workspace" : "Let's get to know you"}
            </h1>
            <p className="max-w-sm text-white/70">
              {type === "company"
                ? "A few quick steps and your team will be up and running."
                : "Tell us a bit about yourself to personalize your experience."}
            </p>
          </div>

          <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} stepLabels={stepLabels} />
        </div>
      </div>

      {/* Right side - Form Content. Scrolls on its own at lg+ (only scrollbar
          in the split-screen view); flows normally with the page on mobile. */}
      <div className="bg-background pb-8 lg:overflow-y-auto lg:pb-0">
        <div className="flex w-full justify-center">
          <div className={`w-full ${currentStep === 2 && type === 'company' ? 'max-w-7xl' : 'max-w-2xl'} space-y-6 px-4 py-8`}>
            {/* Header + progress for mobile, where the hero panel is hidden */}
            <div className="space-y-4 lg:hidden">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" width={28} height={28} className="rounded-[6px]" alt="TaskyPro logo" unoptimized />
                <span className="font-display text-base font-bold">Tasky Pro</span>
              </div>
              <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} stepLabels={stepLabels} />
            </div>

            {/* Step Content */}
            <div className="bg-card border rounded-lg shadow-sm p-6 sm:p-8">
              <div className="text-muted-foreground mb-6 text-xs font-medium tracking-wide uppercase">
                Step {stepIndex} of {steps.length}
              </div>
              <CurrentStepComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

