/**
 * Watchlist Manager Component - Refactored
 * Manage stock and crypto watchlists with real-time data
 */

"use client";

import { useState, useCallback, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWatchlists, useCreateWatchlist, useDeleteWatchlist } from "@/src/hooks/useApi";
import {
  LoadingCard,
  ErrorCard,
  EmptyState,
  ErrorAlert,
} from "@/src/components/ui/feedback";
import { Plus, Trash2, TrendingUp, X } from "lucide-react";

interface WatchlistManagerProps {
  userId: string;
}

interface WatchlistFormData {
  name: string;
  asset_type: "stock" | "crypto";
  assets: string[];
  currentAsset: string;
}

const WatchlistCard = memo(
  ({
    watchlist,
    onDelete,
    deleting,
  }: {
    watchlist: {
      id: string;
      name: string;
      assets: string[];
      asset_type: string;
    };
    onDelete: (id: string) => void;
    deleting: boolean;
  }) => (
    <Card className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{watchlist.name}</CardTitle>
            <CardDescription className="mt-1">
              {watchlist.asset_type.charAt(0).toUpperCase() +
                watchlist.asset_type.slice(1)}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(watchlist.id)}
            disabled={deleting}
            className="hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {watchlist.assets.map((asset) => (
            <Badge
              key={asset}
              variant="secondary"
              className="glass-button dark:glass-button-dark"
            >
              {asset}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
);

WatchlistCard.displayName = "WatchlistCard";

function WatchlistManager({ userId }: WatchlistManagerProps) {
  const { data: watchlists, loading, error, refetch } = useWatchlists(userId);
  const { createWatchlist } = useCreateWatchlist(userId);
  const { deleteWatchlist } = useDeleteWatchlist(userId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<WatchlistFormData>({
    name: "",
    asset_type: "stock",
    assets: [],
    currentAsset: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddAsset = useCallback(() => {
    const asset = formData.currentAsset.trim().toUpperCase();
    if (!asset) return;

    if (formData.assets.includes(asset)) {
      setFormError(`${asset} is already in the list`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      assets: [...prev.assets, asset],
      currentAsset: "",
    }));
    setFormError(null);
  }, [formData.currentAsset, formData.assets]);

  const handleRemoveAsset = useCallback((asset: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a !== asset),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!formData.name.trim()) {
        setFormError("Watchlist name is required");
        return;
      }

      if (formData.assets.length === 0) {
        setFormError("Add at least one asset");
        return;
      }

      setSubmitting(true);

      try {
        await createWatchlist({
          name: formData.name.trim(),
          assets: formData.assets,
          asset_type: formData.asset_type,
        });

        // Reset form
        setFormData({
          name: "",
          asset_type: "stock",
          assets: [],
          currentAsset: "",
        });
        setShowAddForm(false);

        // Refetch watchlists
        await refetch();
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to create watchlist"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [formData, createWatchlist, refetch]
  );

  const handleDelete = useCallback(
    async (watchlistId: string) => {
      setDeletingId(watchlistId);

      try {
        await deleteWatchlist(watchlistId);
        await refetch();
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to delete watchlist"
        );
      } finally {
        setDeletingId(null);
      }
    },
    [deleteWatchlist, refetch]
  );

  if (loading) {
    return <LoadingCard message="Loading watchlists..." />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Watchlists</h2>
          <p className="text-sm text-muted-foreground">
            Track your favorite stocks and cryptocurrencies
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="glass-button dark:glass-button-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Watchlist
        </Button>
      </div>

      {/* Form Error */}
      {formError && <ErrorAlert error={formError} />}

      {/* Add Watchlist Form */}
      {showAddForm && (
        <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Create New Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Watchlist Name</Label>
                  <Input
                    id="name"
                    placeholder="My Tech Stocks"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select
                    value={formData.asset_type}
                    onValueChange={(value: "stock" | "crypto") =>
                      setFormData((prev) => ({ ...prev, asset_type: value }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="asset-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset">Add Assets</Label>
                <div className="flex gap-2">
                  <Input
                    id="asset"
                    placeholder="Enter symbol"
                    value={formData.currentAsset}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentAsset: e.target.value.toUpperCase(),
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAsset();
                      }
                    }}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    onClick={handleAddAsset}
                    disabled={!formData.currentAsset.trim() || submitting}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {formData.assets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.assets.map((asset) => (
                    <Badge
                      key={asset}
                      variant="secondary"
                      className="glass-button dark:glass-button-dark pr-1"
                    >
                      {asset}
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset)}
                        className="ml-1 hover:text-destructive"
                        disabled={submitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Watchlist"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Watchlists Grid */}
      {watchlists && watchlists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((watchlist) => (
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              onDelete={handleDelete}
              deleting={deletingId === watchlist.id}
            />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <EmptyState
            icon={<TrendingUp className="h-12 w-12 text-muted-foreground opacity-50" />}
            title="No Watchlists Yet"
            description="Create your first watchlist to start tracking assets"
            action={
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Watchlist
              </Button>
            }
          />
        )
      )}
    </div>
  );
}

export default memo(WatchlistManager);
