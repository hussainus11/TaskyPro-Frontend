"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { settingsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type TransactionStatus = "pending" | "failed" | "paid";

interface Transaction {
  id: string;
  product: string;
  status: TransactionStatus;
  date: string;
  amount: string;
}

export function AboutMe() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = getCurrentUser();
        if (!user?.id) {
          setLoading(false);
          return;
        }

        const data = await settingsApi.getBillingTransactions(user.id);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8 text-sm">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8 text-sm">No transactions yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const statusMap = {
                pending: "warning",
                failed: "destructive",
                paid: "success"
              } as const;

              const statusClass = statusMap[transaction.status] ?? "secondary";

              return (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>
                    <Badge variant={statusClass}>{transaction.status}</Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="text-right font-medium">{transaction.amount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
