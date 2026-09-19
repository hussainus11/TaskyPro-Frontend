"use client";

import { useEffect, useState } from "react";
import { platformBillingApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ShieldAlert, Building2, CreditCard, TrendingUp } from "lucide-react";

type TransactionStatus = "pending" | "paid" | "failed";

interface PlatformTransaction {
  id: number;
  plan: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  company: {
    id: number;
    name: string;
    plan: string;
    subscriptionStatus: string;
  };
}

interface BillingSummary {
  totalRevenue: number;
  payingCompanies: number;
  totalCompanies: number;
}

const statusVariant = {
  pending: "warning",
  failed: "destructive",
  paid: "success"
} as const;

export default function PlatformBillingPage() {
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    const owner = user?.company?.isPlatformOwner === true;
    setIsOwner(owner);

    if (!owner) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [transactionsData, summaryData] = await Promise.all([
          platformBillingApi.getTransactions(),
          platformBillingApi.getSummary()
        ]);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setSummary(summaryData);
      } catch (error) {
        console.error("Failed to load platform billing data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (isOwner === null) {
    return null;
  }

  if (!isOwner) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Restricted page</EmptyTitle>
          <EmptyDescription>Only the platform administrator can view platform billing.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Platform Billing</h1>
        <p className="text-muted-foreground text-sm">Payment activity across every company on the platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summary?.totalRevenue ?? 0).toFixed(2)}</div>
            <CardDescription>From paid transactions</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paying Companies</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.payingCompanies ?? 0}</div>
            <CardDescription>On an active paid plan</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalCompanies ?? 0}</div>
            <CardDescription>Across the whole platform</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground py-8 text-center text-sm">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">No billing transactions yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.company?.name ?? "—"}</TableCell>
                    <TableCell>{transaction.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[transaction.status] ?? "secondary"}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
