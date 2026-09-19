'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyForm) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push('/companies');
      } else {
        alert('Error creating company');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating company');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Company</h1>
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-red-500">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register('address')} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...form.register('website')} />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...form.register('industry')} />
            </div>
            <Button type="submit">Create Company</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}