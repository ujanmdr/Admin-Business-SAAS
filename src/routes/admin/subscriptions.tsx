import { createFileRoute } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { PageHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Search,
  Plus,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  saasPackages as initialSaasPackages,
  saasSubscribers as initialSaasSubscribers,
  SaasPackage,
  SaasSubscriber,
  npr,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [{ title: "SaaS Subscriptions · BRG Admin" }] }),
  component: Subscriptions,
});

function Subscriptions() {
  const [activeTab, setActiveTab] = useState<"packages" | "subscribers">("packages");
  const [packages, setPackages] = useState<SaasPackage[]>(initialSaasPackages);
  const [subscribers, setSubscribers] = useState<SaasSubscriber[]>(initialSaasSubscribers);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingPeriod: "Monthly" as "Monthly" | "Yearly",
    maxBranches: "",
    maxStaff: "",
    maxServices: "",
    includesBRGAI: false,
    posFeatures: [] as string[],
    reportGeneration: "Basic" as "Basic" | "Advanced" | "Custom",
    perExtraStaff: "",
    perExtraBranch: "",
    perExtraService: "",
    isPublic: true,
    assignedBusinesses: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  // Client-side Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Package name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Package name must be at least 2 characters";
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price cannot be negative";
    }

    const branchesNum = parseInt(formData.maxBranches);
    if (!formData.maxBranches) {
      errors.maxBranches = "Max branches is required";
    } else if (isNaN(branchesNum) || branchesNum < 0) {
      errors.maxBranches = "Branches cannot be negative";
    }

    const staffNum = parseInt(formData.maxStaff);
    if (!formData.maxStaff) {
      errors.maxStaff = "Max staff is required";
    } else if (isNaN(staffNum) || staffNum < 0) {
      errors.maxStaff = "Staff cannot be negative";
    }

    const servicesNum = parseInt(formData.maxServices);
    if (!formData.maxServices) {
      errors.maxServices = "Max services is required";
    } else if (isNaN(servicesNum) || servicesNum < 0) {
      errors.maxServices = "Services cannot be negative";
    }

    if (formData.perExtraStaff && parseFloat(formData.perExtraStaff) < 0) errors.perExtraStaff = "Invalid price";
    if (formData.perExtraBranch && parseFloat(formData.perExtraBranch) < 0) errors.perExtraBranch = "Invalid price";
    if (formData.perExtraService && parseFloat(formData.perExtraService) < 0) errors.perExtraService = "Invalid price";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxChange = (feature: string) => {
    setFormData((prev) => {
      const posFeatures = prev.posFeatures.includes(feature)
        ? prev.posFeatures.filter((f) => f !== feature)
        : [...prev.posFeatures, feature];
      return { ...prev, posFeatures };
    });
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, includesBRGAI: checked }));
  };

  // Create Package handler
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setApiError("");

    startTransition(async () => {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 400));

      const newPackage: SaasPackage = {
        id: `PKG-S${packages.length + 1}`,
        name: formData.name,
        price: parseFloat(formData.price),
        billingPeriod: formData.billingPeriod,
        maxBranches: parseInt(formData.maxBranches),
        maxStaff: parseInt(formData.maxStaff),
        maxServices: parseInt(formData.maxServices),
        includesBRGAI: formData.includesBRGAI,
        posFeatures: formData.posFeatures,
        reportGeneration: formData.reportGeneration,
        addOnPricing: {
          ...(formData.perExtraStaff ? { perExtraStaff: parseFloat(formData.perExtraStaff) } : {}),
          ...(formData.perExtraBranch ? { perExtraBranch: parseFloat(formData.perExtraBranch) } : {}),
          ...(formData.perExtraService ? { perExtraService: parseFloat(formData.perExtraService) } : {}),
        },
        isPublic: formData.isPublic,
        assignedBusinesses: formData.isPublic ? [] : formData.assignedBusinesses.split(",").map(s => s.trim()).filter(Boolean),
        isDefault: false,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setPackages((prev) => [newPackage, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        name: "",
        price: "",
        billingPeriod: "Monthly",
        maxBranches: "",
        maxStaff: "",
        maxServices: "",
        includesBRGAI: false,
        posFeatures: [],
        reportGeneration: "Basic",
        perExtraStaff: "",
        perExtraBranch: "",
        perExtraService: "",
        isPublic: true,
        assignedBusinesses: "",
      });
    });
  };

  const handleToggleDefault = (packageId: string) => {
    setPackages((prev) =>
      prev.map((pkg) => ({
        ...pkg,
        isDefault: pkg.id === packageId,
      }))
    );
  };

  const handleToggleVisibility = (packageId: string) => {
    setPackages((prev) =>
      prev.map((pkg) => ({
        ...pkg,
        isPublic: pkg.id === packageId ? !pkg.isPublic : pkg.isPublic,
      }))
    );
  };

  // Filter subscribers list
  const filteredSubscribers = subscribers.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.currentPackageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Financial Stats (calculated dynamically in Nepali Rupees)
  const totalMRR = subscribers
    .filter((sub) => sub.subscriptionStatus === "Active")
    .reduce((sum, sub) => {
      const pkg = packages.find((p) => p.name === sub.currentPackageName);
      if (!pkg) return sum;
      return sum + (pkg.billingPeriod === "Yearly" ? pkg.price / 12 : pkg.price);
    }, 0);

  const activeSubscribersCount = subscribers.filter((s) => s.subscriptionStatus === "Active").length;
  const pastDueSubscribersCount = subscribers.filter((s) => s.subscriptionStatus === "Past_Due").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="SaaS Subscription Management"
        description="Super Admin interface for SaaS subscription packages and tenant management."
        actions={
          activeTab === "packages" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({ ...prev, isPublic: false }));
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-card hover:bg-secondary border-border"
              >
                <Building className="h-4 w-4" /> Custom Plan
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFormData(prev => ({ ...prev, isPublic: true }));
                  setIsModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Public Plan
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* KPI: MRR */}
        <div className="rounded-xl border border-border bg-card p-5 brg-card-shadow">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Est. Monthly Revenue
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {npr(totalMRR)}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Active recurring subscriptions</span>
          </div>
        </div>

        {/* KPI: Total Subscribers */}
        <div className="rounded-xl border border-border bg-card p-5 brg-card-shadow">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Subscribers
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {subscribers.length}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Registered tenants</span>
          </div>
        </div>

        {/* KPI: Active */}
        <div className="rounded-xl border border-border bg-card p-5 brg-card-shadow">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Active Subscribers
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {activeSubscribersCount}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {((activeSubscribersCount / subscribers.length) * 100).toFixed(0)}% of userbase
            </span>
          </div>
        </div>

        {/* KPI: Past Due */}
        <div className="rounded-xl border border-border bg-card p-5 brg-card-shadow">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Past Due Accounts
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {pastDueSubscribersCount}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-destructive font-medium">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("packages")}
          className={`relative py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "packages"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Package Builder (CRUD)
          {activeTab === "packages" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`relative py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "subscribers"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Subscriber Overview
          {activeTab === "subscribers" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === "packages" ? (
          /* Package Builder Data Table */
          <div className="brg-card-shadow overflow-hidden border border-border bg-card rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/40 text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-4 pl-6 pr-2 w-8"></th>
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6 text-right">Price</th>
                    <th className="py-4 px-6">Billing Period</th>
                    <th className="py-4 px-6 text-center">Max Branches</th>
                    <th className="py-4 px-6 text-center">Max Staff</th>
                    <th className="py-4 px-6 text-center">Max Services</th>
                    <th className="py-4 px-6 text-center">Features</th>
                    <th className="py-4 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className={`transition-colors hover:bg-secondary/30 ${pkg.isDefault ? "bg-primary/5 hover:bg-primary/10" : ""}`}
                    >
                      <td className="py-4 pl-6 pr-2">
                        <button 
                          onClick={() => handleToggleDefault(pkg.id)}
                          className="text-muted-foreground hover:text-gold transition-colors focus:outline-none"
                          title={pkg.isDefault ? "Default Package" : "Set as Default"}
                        >
                          <Star className={`h-4 w-4 ${pkg.isDefault ? "fill-gold text-gold" : ""}`} />
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-foreground mb-2">
                          {pkg.name}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`relative inline-flex h-4 w-7 cursor-pointer items-center rounded-full transition-colors ${
                                pkg.isPublic ? "bg-primary" : "bg-secondary border border-border"
                              }`}
                              onClick={() => handleToggleVisibility(pkg.id)}
                            >
                              <span
                                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                                  pkg.isPublic ? "translate-x-3.5 shadow-sm" : "translate-x-0.5"
                                }`}
                              />
                            </div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {pkg.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                          {!pkg.isPublic && pkg.assignedBusinesses && pkg.assignedBusinesses.length > 0 && (
                            <div className="text-[10px] text-muted-foreground mt-0.5 bg-secondary/30 px-2 py-1 rounded inline-block">
                              For: <span className="font-medium text-foreground/80">{pkg.assignedBusinesses.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-foreground">
                        {npr(pkg.price)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-full bg-secondary text-foreground px-2.5 py-0.5 text-xs font-medium border border-border">
                          {pkg.billingPeriod}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-foreground">
                        {pkg.maxBranches === 0 ? "Unlimited" : pkg.maxBranches}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-foreground">
                        {pkg.maxStaff === 0 ? "Unlimited" : pkg.maxStaff}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-foreground">
                        {pkg.maxServices === 0 ? "Unlimited" : pkg.maxServices}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {pkg.includesBRGAI && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">BRG AI</span>}
                          <span className="text-[10px] text-muted-foreground">{pkg.posFeatures?.length || 0} POS Features</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(pkg.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        No pricing packages created yet. Click "Create Plan" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Subscriber Overview */
          <div className="space-y-4">
            {/* Search filter */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search businesses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Subscriber Data Table */}
            <div className="brg-card-shadow overflow-hidden border border-border bg-card rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-4 px-6">Business Details</th>
                      <th className="py-4 px-6">Current Plan</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Branches</th>
                      <th className="py-4 px-6 text-center">Staff Members</th>
                      <th className="py-4 px-6">Next Renewal Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSubscribers.map((sub) => {
                      const pkg = packages.find(p => p.name === sub.currentPackageName);
                      const isCustom = pkg ? !pkg.isPublic : false;
                      
                      return (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-secondary/30"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-serif text-sm font-semibold text-foreground">
                              {sub.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{sub.name}</div>
                              <div className="text-xs text-muted-foreground">{sub.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">
                          <span className="inline-flex items-center gap-1.5 text-foreground">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                            {sub.currentPackageName}
                            {isCustom && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold bg-muted text-muted-foreground ml-1">
                                Custom
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                              sub.subscriptionStatus === "Active"
                                ? "border-[oklch(0.80_0.08_140)] bg-[oklch(0.93_0.06_140)] text-[oklch(0.40_0.10_140)]"
                                : sub.subscriptionStatus === "Past_Due"
                                ? "border-[oklch(0.85_0.09_75)] bg-[oklch(0.95_0.07_85)] text-[oklch(0.50_0.12_70)]"
                                : "border-border bg-secondary text-muted-foreground"
                            }`}
                          >
                            {sub.subscriptionStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-medium text-foreground">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            {sub.totalBranches}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-medium text-foreground">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {sub.totalStaff}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(sub.nextBillingDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                      </tr>
                    )})}
                    {filteredSubscribers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No subscribers found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Create Subscription Package
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Define a new pricing plan for SaaS tenants.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({});
                  setApiError("");
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePackage} className="mt-6 space-y-6">
              {apiError && (
                <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* SECTION: Basic Info */}
              <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full"></span>
                  Basic Information
                </h4>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Package Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Starter Plan, Scale Plan"
                    className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all ${
                      formErrors.name ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                    }`}
                  />
                  {formErrors.name && <span className="text-xs text-destructive font-medium">{formErrors.name}</span>}
                </div>

                <div className="flex items-center justify-between border-y border-border py-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Public Plan</label>
                    <p className="text-[11px] text-muted-foreground">Visible on public pricing pages.</p>
                  </div>
                  <div
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                      formData.isPublic ? "bg-primary" : "bg-secondary border border-border"
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPublic ? "translate-x-6 shadow-sm" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>

                {!formData.isPublic && (
                  <div className="space-y-1 bg-background p-3 rounded-lg border border-border">
                    <label className="text-xs font-semibold text-foreground">Assign to Businesses (Optional)</label>
                    <p className="text-[10px] text-muted-foreground mb-1.5">Enter comma-separated business names.</p>
                    <input
                      type="text"
                      name="assignedBusinesses"
                      value={formData.assignedBusinesses}
                      onChange={handleInputChange}
                      placeholder="e.g. Aura Spa, Zen Studio"
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Monthly Price (रू)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="4900"
                      min="0"
                      step="0.01"
                      className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all ${
                        formErrors.price ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {formErrors.price && <span className="text-xs text-destructive font-medium">{formErrors.price}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Billing Period</label>
                    <select
                      name="billingPeriod"
                      value={formData.billingPeriod}
                      onChange={handleInputChange}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Limits */}
              <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full"></span>
                  Package Limits
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Max Branches</label>
                    <input
                      type="number"
                      name="maxBranches"
                      value={formData.maxBranches}
                      onChange={handleInputChange}
                      placeholder="3"
                      min="0"
                      step="1"
                      className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all ${
                        formErrors.maxBranches ? "border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {formErrors.maxBranches && <span className="text-xs text-destructive">{formErrors.maxBranches}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Max Staff</label>
                    <input
                      type="number"
                      name="maxStaff"
                      value={formData.maxStaff}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="0"
                      step="1"
                      className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all ${
                        formErrors.maxStaff ? "border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {formErrors.maxStaff && <span className="text-xs text-destructive">{formErrors.maxStaff}</span>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Max Services</label>
                    <input
                      type="number"
                      name="maxServices"
                      value={formData.maxServices}
                      onChange={handleInputChange}
                      placeholder="0 for Unlimited"
                      min="0"
                      step="1"
                      className={`h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all ${
                        formErrors.maxServices ? "border-destructive" : "border-border focus:border-primary"
                      }`}
                    />
                    {formErrors.maxServices && <span className="text-xs text-destructive">{formErrors.maxServices}</span>}
                  </div>
                </div>
              </div>

              {/* SECTION: Features */}
              <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="h-4 w-1 bg-primary rounded-full"></span>
                  Features & Access
                </h4>
                
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground">BRG AI Integration</label>
                    <p className="text-[11px] text-muted-foreground">Enable advanced AI capabilities for this plan.</p>
                  </div>
                  <div
                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                      formData.includesBRGAI ? "bg-primary" : "bg-secondary border border-border"
                    }`}
                    onClick={() => handleToggleChange(!formData.includesBRGAI)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.includesBRGAI ? "translate-x-6 shadow-sm" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">Report Generation</label>
                    <select
                      name="reportGeneration"
                      value={formData.reportGeneration}
                      onChange={handleInputChange}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary"
                    >
                      <option value="Basic">Basic Analytics</option>
                      <option value="Advanced">Advanced Insights</option>
                      <option value="Custom">Custom Builder</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">POS Features</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {["Inventory Management", "Shift Management", "Multi-register", "Offline Mode", "Custom Receipts", "Advanced Multi-register"].map((feature) => (
                        <label key={feature} className="flex items-center gap-2.5 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={formData.posFeatures.includes(feature)}
                              onChange={() => handleCheckboxChange(feature)}
                              className="peer h-4 w-4 shrink-0 rounded border border-border appearance-none checked:bg-primary checked:border-primary focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span className="text-[13px] text-foreground group-hover:text-primary transition-colors">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Add-ons */}
              <div className="space-y-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Dynamic Add-on Pricing
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Allow subscribers to pay extra for exceeding limits without upgrading tiers.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Extra Branch (रू)</label>
                    <input
                      type="number"
                      name="perExtraBranch"
                      value={formData.perExtraBranch}
                      onChange={handleInputChange}
                      placeholder="e.g. 1500"
                      min="0"
                      className="h-9 w-full rounded-lg border border-primary/20 bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Extra Staff (रू)</label>
                    <input
                      type="number"
                      name="perExtraStaff"
                      value={formData.perExtraStaff}
                      onChange={handleInputChange}
                      placeholder="e.g. 500"
                      min="0"
                      className="h-9 w-full rounded-lg border border-primary/20 bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Extra Service (रू)</label>
                    <input
                      type="number"
                      name="perExtraService"
                      value={formData.perExtraService}
                      onChange={handleInputChange}
                      placeholder="e.g. 100"
                      min="0"
                      className="h-9 w-full rounded-lg border border-primary/20 bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormErrors({});
                    setApiError("");
                  }}
                  className="rounded-lg border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-primary hover:bg-primary/90"
                >
                  {isPending ? "Creating..." : "Create Package"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
