"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatLayout } from "@/components/layout/ChatLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Plus, Trash2, TrendingUp, TrendingDown, Activity, BarChart3, Loader2 } from "lucide-react"
import { useAuth } from "@/src/store/auth.context"
import apiService from "@/src/services/api.service"
import type { TradingRule, RuleType, ActionType } from "@/lib/types"

export default function RulesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [rules, setRules] = useState<TradingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    asset: "",
    asset_type: "stock" as "stock" | "crypto",
    rule_type: "price_above" as RuleType,
    threshold: "",
    actions: ["notify_email" as ActionType]
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const loadRules = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const data = await apiService.getRules(user.id)
      setRules(data)
    } catch (error) {
      console.error("Failed to load rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadRules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleToggleRule = async (ruleId: string) => {
    if (!user?.id) return
    
    try {
      await apiService.toggleRule(user.id, ruleId)
      setRules(rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ))
    } catch (error) {
      console.error("Failed to toggle rule:", error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!user?.id || !confirm("Are you sure you want to delete this rule?")) return
    
    try {
      await apiService.deleteRule(user.id, ruleId)
      setRules(rules.filter(rule => rule.id !== ruleId))
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const ruleData = {
        name: formData.name,
        description: formData.description,
        asset: formData.asset,
        asset_type: formData.asset_type,
        rule_type: formData.rule_type,
        condition: {
          threshold: parseFloat(formData.threshold)
        },
        actions: formData.actions as ActionType[],
        priority: 1
      }

      const response = await apiService.createRule(user.id, ruleData)
      setRules([...rules, response.rule])
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create rule:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      asset: "",
      asset_type: "stock",
      rule_type: "price_above",
      threshold: "",
      actions: ["notify_email"]
    })
  }

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case "price_above": return <TrendingUp className="h-4 w-4" />
      case "price_below": return <TrendingDown className="h-4 w-4" />
      case "momentum_positive": return <Activity className="h-4 w-4" />
      case "momentum_negative": return <Activity className="h-4 w-4" />
      case "volume_spike": return <BarChart3 className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getRuleTypeLabel = (ruleType: string) => {
    return ruleType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (authLoading || !user) {
    return (
      <ChatLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ChatLayout>
    )
  }

  return (
    <ChatLayout>
      <div className="flex justify-center w-full">
        <div className="space-y-6 max-w-6xl w-full px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trading Rules</h1>
              <p className="text-muted-foreground">Automate your trading strategy with custom rules</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create Trading Rule</DialogTitle>
                  <DialogDescription>
                    Set up a new automated trading rule to monitor your assets
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Rule Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., AAPL Price Alert"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of this rule"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="asset">Asset Symbol</Label>
                        <Input
                          id="asset"
                          value={formData.asset}
                          onChange={(e) => setFormData({ ...formData, asset: e.target.value.toUpperCase() })}
                          placeholder="AAPL, TCS.NS, BTC-USD"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="asset_type">Asset Type</Label>
                        <Select
                          value={formData.asset_type}
                          onValueChange={(value: "stock" | "crypto") => setFormData({ ...formData, asset_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rule_type">Rule Type</Label>
                      <Select
                        value={formData.rule_type}
                        onValueChange={(value: RuleType) => setFormData({ ...formData, rule_type: value })}
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
                    <div className="grid gap-2">
                      <Label htmlFor="threshold">Threshold Value</Label>
                      <Input
                        id="threshold"
                        type="number"
                        step="0.01"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                        placeholder="e.g., 150.00"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Rule</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trading Rules Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first rule to start automating your trading strategy
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getRuleIcon(rule.rule_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{rule.name}</CardTitle>
                          <CardDescription>{rule.description || "No description"}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {rule.asset}
                      </Badge>
                      <Badge variant="secondary">
                        {getRuleTypeLabel(rule.rule_type)}
                      </Badge>
                      <Badge variant="outline">
                        Threshold: {rule.condition.threshold}
                      </Badge>
                      {rule.last_triggered && (
                        <Badge variant="default">
                          Last triggered: {new Date(rule.last_triggered).toLocaleDateString()}
                        </Badge>
                      )}
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  )
}
