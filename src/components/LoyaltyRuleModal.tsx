import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SERVICES } from "@/lib/service-data";
import {
  type LoyaltyRule,
  newRuleId,
  upsertRule,
  deleteRule,
  getRedemptions,
} from "@/lib/loyalty-program-data";
import { Check, AlertTriangle, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LoyaltyRuleModal({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: LoyaltyRule | null;
}) {
  const isEdit = !!editing;
  const [name, setName] = useState("");
  const [triggers, setTriggers] = useState<string[]>([]);
  const [milestone, setMilestone] = useState(10);
  const [reward, setReward] = useState<string>(SERVICES[0].id);
  const [active, setActive] = useState(true);
  
  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDirty, setConfirmDirty] = useState(false);

  // Deletion States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (open) {
      setName(editing?.name || "");
      setTriggers(editing?.triggerServiceIds || []);
      setMilestone(editing?.milestone || 10);
      setReward(editing?.rewardServiceId || SERVICES[0].id);
      setActive(editing?.active ?? true);
      setConfirmDirty(false);
      setErrors({});
      setShowDeleteConfirm(false);
      setDeleteInput("");
      setDeleteError("");
    }
  }, [open, editing]);

  function toggleTrigger(id: string) {
    setTriggers((t) => {
      const next = t.includes(id) ? t.filter((x) => x !== id) : [...t, id];
      if (errors.triggers && next.length > 0) {
        setErrors((prev) => {
          const nextErrs = { ...prev };
          delete nextErrs.triggers;
          return nextErrs;
        });
      }
      return next;
    });
  }

  // Validate form fields inline
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Rule name is required";
    } else if (name.length < 2) {
      errs.name = "Rule name must be at least 2 characters";
    }

    if (triggers.length === 0) {
      errs.triggers = "Select at least one trigger service";
    }

    const milestoneNum = Number(milestone);
    if (!milestone || isNaN(milestoneNum)) {
      errs.milestone = "Milestone count is required";
    } else if (milestoneNum < 2 || milestoneNum > 50) {
      errs.milestone = "Milestone must be a whole number between 2 and 50";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save edits or create new rule
  function save() {
    if (!validateForm()) return;

    // Warn if editing & changing trigger/milestone of a rule with progress & not yet confirmed
    if (isEdit && editing!.hasProgress && !confirmDirty) {
      const triggerChanged =
        triggers.length !== editing!.triggerServiceIds.length ||
        triggers.some((id) => !editing!.triggerServiceIds.includes(id));
      const milestoneChanged = milestone !== editing!.milestone;
      if (triggerChanged || milestoneChanged) {
        setConfirmDirty(true);
        return;
      }
    }

    const rule: LoyaltyRule = {
      id: editing?.id || newRuleId(),
      name: name.trim(),
      triggerServiceIds: triggers,
      milestone: Number(milestone),
      rewardServiceId: reward,
      active,
      redemptionsCount: editing?.redemptionsCount || 0,
      hasProgress: editing?.hasProgress || false,
      createdAt: editing?.createdAt || new Date().toISOString().slice(0, 10),
    };
    
    upsertRule(rule);
    toast.success(isEdit ? "Rule updated" : "Loyalty rule created");
    onOpenChange(false);
  }

  // Handle Deletion Confirmation
  function handleDelete() {
    if (deleteInput !== "DELETE") {
      setDeleteError("Type DELETE to confirm");
      return;
    }

    if (editing) {
      deleteRule(editing.id);
      toast.success("Loyalty rule permanently deleted");
      onOpenChange(false);
    }
  }

  // Count pending unclaimed codes for delete warning
  const unclaimedCount = editing
    ? getRedemptions().filter((r) => r.ruleId === editing.id && r.status === "pending").length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card">
        
        {/* VIEW A: Standard Form */}
        {!showDeleteConfirm ? (
          <>
            <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <DialogTitle className="font-serif text-2xl">
                {isEdit ? "Edit loyalty rule" : "Create new loyalty rule"}
              </DialogTitle>
              {isEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Rule
                </Button>
              )}
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* warning banner if rule has customer progress and is editing */}
              {isEdit && editing?.hasProgress && (
                <div className="rounded-xl border border-gold/40 bg-[color-mix(in_oklab,var(--gold)_8%,white)] p-3 flex gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/80 leading-normal">
                    Changing the milestone or trigger service will not affect progress customers have already earned.
                  </span>
                </div>
              )}

              {/* Rule Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Rule Name</Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="e.g. Beard Trim Loyalty"
                  className={cn(errors.name && "border-destructive focus-visible:ring-destructive/30")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name}</p>
                )}
              </div>

              {/* Trigger Services */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Trigger service(s){" "}
                  <span className="text-muted-foreground font-normal">
                    — selecting multiple means all must be present in one visit
                  </span>
                </Label>
                <div className={cn(
                  "max-h-48 overflow-y-auto rounded-xl border bg-background p-2 space-y-1",
                  errors.triggers ? "border-destructive" : "border-border"
                )}>
                  {SERVICES.filter((s) => s.active).map((s) => {
                    const on = triggers.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleTrigger(s.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-left text-sm border transition",
                          on
                            ? "bg-primary/10 border-primary/30"
                            : "border-transparent hover:bg-sand-soft/50",
                        )}
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded grid place-items-center border",
                            on ? "bg-primary border-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {on && <Check className="h-3 w-3" />}
                        </span>
                        <span className="flex-1 font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.category}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.triggers && (
                  <p className="text-xs text-destructive font-medium">{errors.triggers}</p>
                )}
                {triggers.length > 1 && (
                  <p className="text-[11px] text-muted-foreground italic mt-1">
                    A visit counts only when all {triggers.length} selected services are billed together.
                  </p>
                )}
              </div>

              {/* Milestone & Reward Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Milestone Count */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Milestone count</Label>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    value={milestone}
                    onChange={(e) => {
                      setMilestone(Number(e.target.value) || 0);
                      if (errors.milestone) setErrors((p) => ({ ...p, milestone: "" }));
                    }}
                    className={cn(errors.milestone && "border-destructive focus-visible:ring-destructive/30")}
                  />
                  {errors.milestone && (
                    <p className="text-xs text-destructive font-medium">{errors.milestone}</p>
                  )}
                </div>

                {/* Reward Service */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Reward service (free at milestone)</Label>
                  <select
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                  >
                    {SERVICES.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-sand-soft/40 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Active</div>
                  <div className="text-xs text-muted-foreground">Paused rules don't track progress.</div>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              {/* Save Confirmation Dirty Banner */}
              {confirmDirty && (
                <div className="rounded-xl border border-gold/40 bg-[color-mix(in_oklab,var(--gold)_8%,white)] p-3 flex gap-3">
                  <AlertTriangle className="h-4.5 w-4.5 text-gold mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <strong>Heads up:</strong> Customers have active progress under this rule. Changing
                    the triggers or milestone won't wipe out their stamps. They continue from where they left off. Click <strong>Confirm & save</strong> again to save.
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border">
                Cancel
              </Button>
              <Button onClick={save} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                {confirmDirty ? "Confirm & save" : isEdit ? "Save changes" : "Create rule"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* VIEW B: Delete Confirmation Screen */
          <>
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="font-serif text-2xl text-destructive flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" /> Delete Loyalty Rule?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive leading-relaxed space-y-2">
                <p className="font-semibold">
                  Deleting this rule will permanently remove all customer progress. This cannot be undone. Are you sure?
                </p>
                {unclaimedCount > 0 && (
                  <p className="font-semibold border-t border-destructive/20 pt-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Warning: {unclaimedCount} customers have earned but not yet claimed their reward under this rule.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Type <span className="font-bold text-foreground">DELETE</span> to confirm
                </Label>
                <Input
                  value={deleteInput}
                  onChange={(e) => {
                    setDeleteInput(e.target.value);
                    if (deleteError) setDeleteError("");
                  }}
                  placeholder="DELETE"
                  className={cn(deleteError && "border-destructive focus-visible:ring-destructive/30")}
                />
                {deleteError && (
                  <p className="text-xs text-destructive font-medium">{deleteError}</p>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                  setDeleteError("");
                }}
                className="rounded-xl border-border"
              >
                Back
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
              >
                Permanently Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
