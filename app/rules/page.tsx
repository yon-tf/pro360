"use client";

import { useState, useMemo } from "react";
import {
  predefinedVariables,
  predefinedActions,
  rulesList,
} from "@/lib/mock/rules";
import { Plus, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function RulesPage() {
  const [variable, setVariable] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("");
  const [ruleName, setRuleName] = useState("");

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: would add to rulesList
    setVariable("");
    setCondition("");
    setAction("");
    setRuleName("");
  };

  const ruleStats = useMemo(() => {
    const enabled = rulesList.filter((r) => r.enabled).length;
    const totalTriggers = rulesList.reduce((s, r) => s + r.timesTriggered, 0);
    return {
      totalRules: rulesList.length,
      enabledCount: enabled,
      totalTriggersAllTime: totalTriggers,
      activeToday: 1,
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Top section stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <Zap className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-semibold text-foreground">{ruleStats.totalRules}</p>
            <p className="text-xs text-muted-foreground">{ruleStats.enabledCount} enabled</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <Zap className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Total Triggers</p>
            <p className="text-2xl font-semibold text-foreground">{ruleStats.totalTriggersAllTime}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-5">
            <Zap className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Active Today</p>
            <p className="text-2xl font-semibold text-foreground">{ruleStats.activeToday}</p>
            <p className="text-xs text-muted-foreground">Rules triggered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Create new rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRule} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Rule name</label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Low response alert"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Variable</label>
              <Select value={variable} onValueChange={setVariable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedVariables.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Condition</label>
              <Input
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="e.g. &lt; 90% or is not TFP+"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedActions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button type="submit">Create rule</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Rules created</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Times triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rulesList.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.trigger}</TableCell>
                  <TableCell className="text-muted-foreground">{r.action}</TableCell>
                  <TableCell>
                    <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${r.enabled ? "border-primary bg-primary" : "border-input bg-muted"}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition translate-y-0.5 ${r.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{r.timesTriggered}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
