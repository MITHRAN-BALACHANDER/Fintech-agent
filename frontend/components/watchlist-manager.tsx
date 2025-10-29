"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiClient from "@/lib/api-client";
import { Watchlist, WatchlistCreate, AssetType } from "@/lib/types";
import { Plus, Trash2, TrendingUp, Bitcoin } from "lucide-react";

interface WatchlistManagerProps {
  userId: string;
}

export default function WatchlistManager({ userId }: WatchlistManagerProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<WatchlistCreate>({
    name: "",
    assets: [],
    asset_type: "stock",
  });
  const [assetInput, setAssetInput] = useState("");

  useEffect(() => {
    loadWatchlists();
  }, [userId]);

  const loadWatchlists = async () => {
    try {
      const data = await apiClient.getWatchlists(userId);
      setWatchlists(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    if (assetInput.trim()) {
      setFormData({
        ...formData,
        assets: [...formData.assets, assetInput.trim().toUpperCase()],
      });
      setAssetInput("");
    }
  };

  const handleRemoveAsset = (asset: string) => {
    setFormData({
      ...formData,
      assets: formData.assets.filter((a) => a !== asset),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.addWatchlist(userId, formData);
      if (response.success) {
        setWatchlists([...watchlists, response.watchlist]);
        setFormData({ name: "", assets: [], asset_type: "stock" });
        setShowAddForm(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (watchlistId: string) => {
    try {
      await apiClient.deleteWatchlist(userId, watchlistId);
      setWatchlists(watchlists.filter((w) => w.id !== watchlistId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading watchlists...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your Watchlists</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your favorite stocks and cryptocurrencies
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Watchlist
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create New Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Watchlist Name</Label>
                <Input
                  id="name"
                  placeholder="My Tech Stocks"
                  className="glass-input dark:glass-input-dark"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_type" className="text-sm">Asset Type</Label>
                <Select
                  value={formData.asset_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, asset_type: value as AssetType })
                  }
                >
                  <SelectTrigger className="glass-input dark:glass-input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stocks</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assets" className="text-sm">
                  Add Assets (e.g., AAPL, GOOGL for stocks or BTC-USD, ETH-USD for crypto)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="assets"
                    placeholder="Enter symbol"
                    className="glass-input dark:glass-input-dark"
                    value={assetInput}
                    onChange={(e) => setAssetInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAsset();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddAsset} className="glass-button dark:glass-button-dark border-0">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.assets.map((asset) => (
                    <Badge
                      key={asset}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveAsset(asset)}
                    >
                      {asset} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={formData.assets.length === 0}>
                  Create Watchlist
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id} className="glass-card dark:glass-card-dark border-0 shadow-lg smooth-transition hover:scale-105">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg glass-button dark:glass-button-dark flex items-center justify-center">
                    {watchlist.asset_type === "stock" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <Bitcoin className="w-4 h-4" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(watchlist.id)}
                  className="glass-button dark:glass-button-dark border-0 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                {watchlist.asset_type === "stock" ? "Stocks" : "Cryptocurrency"} •{" "}
                {watchlist.assets.length} assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {watchlist.assets.map((asset) => (
                  <Badge key={asset} variant="outline">
                    {asset}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {watchlists.length === 0 && !showAddForm && (
        <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg glass-button dark:glass-button-dark flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No watchlists yet</p>
            <p className="text-xs text-muted-foreground mt-2">
              Create a watchlist to start monitoring your favorite assets
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
