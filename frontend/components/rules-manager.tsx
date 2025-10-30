"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/api-client";
import { TradingRule, RuleCreate, AssetType, RuleType, ActionType } from "@/lib/types";
import { Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";

interface RulesManagerProps {
  userId: string;
}

export default function RulesManager({ userId }: RulesManagerProps) {
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<RuleCreate>({
    name: "",
    description: "",
    asset: "",
    asset_type: "stock",
    rule_type: "price_above",
    condition: { threshold: 0 },
    actions: ["notify_email"],
    priority: 1,
  });

  useEffect(() => {
    loadRules();
  }, [userId]);

  const loadRules = async () => {
    try {
      const data = await apiClient.getRules(userId);
      setRules(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.addRule(userId, formData);
      if (response.success) {
        setRules([...rules, response.rule]);
        setFormData({
          name: "",
          description: "",
          asset: "",
          asset_type: "stock",
          rule_type: "price_above",
          condition: { threshold: 0 },
          actions: ["notify_email"],
          priority: 1,
        });
        setShowAddForm(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  const handleToggle = async (ruleId: string) => {
    try {
      await apiClient.toggleRule(userId, ruleId);
      setRules(
        rules.map((rule) =>
          rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle rule");
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await apiClient.deleteRule(userId, ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete rule");
    }
  };

  const toggleAction = (action: ActionType) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter((a) => a !== action)
        : [...prev.actions, action],
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Rules</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Set up automated alerts and trading triggers
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Trading Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="AAPL Price Alert"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset">Asset Symbol</Label>
                  <Input
                    id="asset"
                    placeholder="AAPL"
                    value={formData.asset}
                    onChange={(e) =>
                      setFormData({ ...formData, asset: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Alert me when Apple stock reaches target"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select
                    value={formData.asset_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, asset_type: value as AssetType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-type">Rule Type</Label>
                  <Select
                    value={formData.rule_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rule_type: value as RuleType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_above">Price Above</SelectItem>
                      <SelectItem value="price_below">Price Below</SelectItem>
                      <SelectItem value="momentum_positive">Momentum Positive</SelectItem>
                      <SelectItem value="momentum_negative">Momentum Negative</SelectItem>
                      <SelectItem value="volume_spike">Volume Spike</SelectItem>
                      <SelectItem value="technical_signal">Technical Signal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold Value</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.condition.threshold || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition: { threshold: parseFloat(e.target.value) || 0 },
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {(["notify_email", "notify_sms", "buy_trigger", "sell_trigger"] as ActionType[]).map(
                    (action) => (
                      <Badge
                        key={action}
                        variant={formData.actions.includes(action) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleAction(action)}
                      >
                        {action.replace("_", " ").toUpperCase()}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Rule</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    {rule.enabled ? (
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{rule.description || rule.rule_type}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggle(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Asset:</span>
                  <p className="font-medium">{rule.asset}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <p className="font-medium">{rule.asset_type}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Condition:</span>
                  <p className="font-medium">
                    {rule.rule_type} {rule.condition.threshold}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Actions:</span>
                  <p className="font-medium">{rule.actions.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-300">No trading rules yet</p>
            <p className="text-sm text-slate-500 mt-2">
              Create rules to automate your trading strategy
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
