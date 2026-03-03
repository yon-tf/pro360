"use client";

import { useState, useMemo } from "react";
import {
  predefinedVariables,
  predefinedActions,
  rulesList,
} from "@/lib/mock/rules";
import { Plus, Zap, CheckCircle, AlertTriangle } from "@/components/ui/solar-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/pro360/KpiCard";
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
import { Switch } from "@/components/ui/switch";

export default function RulesPage() {
  const [variable, setVariable] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [rules, setRules] = useState(rulesList);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: would add to rulesList
    setVariable("");
    setCondition("");
    setAction("");
    setRuleName("");
  };

  const ruleStats = useMemo(() => {
    const enabled = rules.filter((r) => r.enabled).length;
    const totalTriggers = rules.reduce((s, r) => s + r.timesTriggered, 0);
    return {
      totalRules: rules.length,
      enabledCount: enabled,
      totalTriggersAllTime: totalTriggers,
      activeToday: 1,
    };
  }, [rules]);

  const toggleRuleEnabled = (ruleId: string, enabled: boolean) => {
    setRules((current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, enabled } : rule))
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard title="Total Rules" value={<>{ruleStats.enabledCount} <span className="text-sm font-normal text-muted-foreground">of {ruleStats.totalRules} enabled</span></>} icon={<Zap className="h-5 w-5" />} />
        <KpiCard title="Total Triggers" value={ruleStats.totalTriggersAllTime} icon={<CheckCircle className="h-5 w-5" />} badge="All time" />
        <KpiCard title="Active Today" value={<>{ruleStats.activeToday} <span className="text-sm font-normal text-muted-foreground">rules triggered</span></>} icon={<AlertTriangle className="h-5 w-5" />} />
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
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.trigger}</TableCell>
                  <TableCell className="text-muted-foreground">{r.action}</TableCell>
                  <TableCell>
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(enabled) => toggleRuleEnabled(r.id, enabled)}
                      aria-label={`Toggle rule ${r.name}`}
                    />
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
