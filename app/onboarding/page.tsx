'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
});

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email'),
});

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CompanyForm = z.infer<typeof companySchema>;
type BranchForm = z.infer<typeof branchSchema>;
type UserForm = z.infer<typeof userSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState<CompanyForm | null>(null);
  const [branches, setBranches] = useState<BranchForm[]>([]);
  const [branchIds, setBranchIds] = useState<number[]>([]);

  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  const branchForm = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
  });

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const onCompanySubmit = (data: CompanyForm) => {
    setCompanyData(data);
    setStep(2);
  };

  const onBranchSubmit = (data: BranchForm) => {
    setBranches([...branches, data]);
    branchForm.reset();
  };

  const onUserSubmit = async (data: UserForm) => {
    if (!companyData) return;

    try {
      // Create company
      const companyRes = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      const company = await companyRes.json();

      // Create branches
      const createdBranchIds: number[] = [];
      for (const branch of branches) {
        const branchRes = await fetch(`${API_BASE_URL}/branches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...branch, companyId: company.id }),
        });
        const createdBranch = await branchRes.json();
        createdBranchIds.push(createdBranch.id);
      }
      setBranchIds(createdBranchIds);

      // Create admin user
      await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'admin',
          country: 'US', // default
          image: '/images/avatars/default.png',
          status: 'active',
          plan_name: 'Enterprise',
          companyId: company.id,
          branchId: branchIds[0] || null, // assign to first branch
        }),
      });

      alert('Onboarding completed!');
    } catch (error) {
      console.error(error);
      alert('Error during onboarding');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Company Onboarding</h1>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" {...companyForm.register('name')} />
                {companyForm.formState.errors.name && <p className="text-red-500">{companyForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...companyForm.register('email')} />
                {companyForm.formState.errors.email && <p className="text-red-500">{companyForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...companyForm.register('phone')} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...companyForm.register('address')} />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...companyForm.register('website')} />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" {...companyForm.register('industry')} />
              </div>
              <Button type="submit">Next</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={branchForm.handleSubmit(onBranchSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="branchName">Branch Name</Label>
                <Input id="branchName" {...branchForm.register('name')} />
                {branchForm.formState.errors.name && <p className="text-red-500">{branchForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="branchEmail">Email</Label>
                <Input id="branchEmail" type="email" {...branchForm.register('email')} />
                {branchForm.formState.errors.email && <p className="text-red-500">{branchForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="branchPhone">Phone</Label>
                <Input id="branchPhone" {...branchForm.register('phone')} />
              </div>
              <div>
                <Label htmlFor="branchAddress">Address</Label>
                <Input id="branchAddress" {...branchForm.register('address')} />
              </div>
              <Button type="submit">Add Branch</Button>
            </form>
            <div className="mt-4">
              <h3>Added Branches:</h3>
              <ul>
                {branches.map((b, i) => <li key={i}>{b.name}</li>)}
              </ul>
            </div>
            <div className="mt-4">
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Admin User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" {...userForm.register('name')} />
                {userForm.formState.errors.name && <p className="text-red-500">{userForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input id="userEmail" type="email" {...userForm.register('email')} />
                {userForm.formState.errors.email && <p className="text-red-500">{userForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...userForm.register('password')} />
                {userForm.formState.errors.password && <p className="text-red-500">{userForm.formState.errors.password.message}</p>}
              </div>
              <Button type="submit">Complete Onboarding</Button>
            </form>
            <div className="mt-4">
              <Button onClick={() => setStep(2)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}