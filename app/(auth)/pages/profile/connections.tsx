"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { generateAvatarFallback } from "@/lib/utils";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { userConnectionsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

interface Connection {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string;
  status: "pending" | "connected" | "blocked";
  isInitiator?: boolean;
}

export function Connections() {
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actingId, setActingId] = React.useState<number | null>(null);

  const fetchConnections = React.useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const data = await userConnectionsApi.getConnections(user.id);
      const list: Connection[] = Array.isArray(data) ? data : [];
      setConnections(list.filter((c) => c.status !== "blocked"));
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleDisconnect = async (connection: Connection) => {
    setActingId(connection.id);
    try {
      await userConnectionsApi.deleteConnection(connection.id);
      setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      toast.success(`Disconnected from ${connection.name}`);
    } catch (error: any) {
      toast.error("Failed to disconnect", { description: error.message });
    } finally {
      setActingId(null);
    }
  };

  const handleConnect = async (connection: Connection) => {
    setActingId(connection.id);
    try {
      await userConnectionsApi.acceptConnection(connection.id);
      setConnections((prev) =>
        prev.map((c) => (c.id === connection.id ? { ...c, status: "connected" } : c))
      );
      toast.success(`Connected with ${connection.name}`);
    } catch (error: any) {
      toast.error("Failed to connect", { description: error.message });
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-4 text-center text-sm">Loading connections...</div>
        </CardContent>
      </Card>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-4 text-center text-sm">No connections yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
        <CardAction>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <a href="/pages/profile?tab=members">
                    <ChevronRight />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View All</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {connections.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback>{generateAvatarFallback(item.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground text-xs">{item.email}</div>
                </div>
              </div>
              {item.status === "connected" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actingId === item.id}
                  onClick={() => handleDisconnect(item)}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={actingId === item.id}
                  onClick={() => handleConnect(item)}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
