"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2Icon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch (error: any) {
      toast.error("Failed to send reset instructions", {
        description: error.message || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex pb-8 lg:h-screen lg:pb-0">
      <div className="hidden w-1/2 bg-gray-100 lg:block">
        <Image
          width={1000}
          height={1000}
          src="/images/extra/image4.jpg"
          alt="shadcn/ui login page"
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4">
          {!isSubmitted ? (
            <>
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold">Forgot password?</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Enter your email address and we&#39;ll send you instructions to reset your password.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email" className="sr-only">
                          Email address
                        </Label>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform opacity-30" />
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              autoComplete="email"
                              className="w-full pl-10"
                              placeholder="Enter your email address"
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <MailIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  If an account with that email exists, we have sent password reset instructions.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
              >
                Resend email
              </Button>
            </div>
          )}

          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/login/v1" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
