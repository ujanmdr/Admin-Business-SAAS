"use client";

import React, { useState, useTransition } from "react";
import { 
  Package as PackageIcon, 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  X,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Package, Subscriber, createPackageAction } from "../actions/subscription-actions";

interface SubscriptionDashboardProps {
  initialPackages: Package[];
  initialSubscribers: Subscriber[];
}

export default function SubscriptionDashboard({
  initialPackages,
  initialSubscribers,
}: SubscriptionDashboardProps) {
  const [activeTab, setActiveTab] = useState<"packages" | "subscribers">("packages");
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingPeriod: "MONTHLY" as "MONTHLY" | "YEARLY",
    maxBranches: "",
    maxStaff: "",
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

  // Handle Form Submission
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setApiError("");
    
    startTransition(async () => {
      const response = await createPackageAction({
        name: formData.name,
        price: parseFloat(formData.price),
        billingPeriod: formData.billingPeriod,
        maxBranches: parseInt(formData.maxBranches),
        maxStaff: parseInt(formData.maxStaff),
      });

      if (response.success && response.data) {
        setPackages((prev) => [response.data!, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setFormData({
          name: "",
          price: "",
          billingPeriod: "MONTHLY",
          maxBranches: "",
          maxStaff: "",
        });
      } else {
        setApiError(response.error || "Failed to create package. Please try again.");
      }
    });
  };

  // Filtering Subscribers
  const filteredSubscribers = subscribers.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.currentPackageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalMRR = subscribers
    .filter((sub) => sub.subscriptionStatus === "ACTIVE")
    .reduce((sum, sub) => {
      const pkg = packages.find((p) => p.name === sub.currentPackageName);
      if (!pkg) return sum;
      return sum + (pkg.billingPeriod === "YEARLY" ? pkg.price / 12 : pkg.price);
    }, 0);

  const activeSubscribersCount = subscribers.filter((s) => s.subscriptionStatus === "ACTIVE").length;
  const pastDueSubscribersCount = subscribers.filter((s) => s.subscriptionStatus === "PAST_DUE").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-1">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-6 dark:border-neutral-800">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Subscription Management
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage your SaaS pricing packages and monitor subscriber activities.
          </p>
        </div>
        <div>
          {activeTab === "packages" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4" />
              Create New Package
            </button>
          )}
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI: Monthly Recurring Revenue */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Est. Monthly Revenue
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              ${totalMRR.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">From active recurring subscriptions</p>
          </div>
        </div>

        {/* KPI: Total Subscribers */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Subscribers
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {subscribers.length}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">Registered businesses on platform</p>
          </div>
        </div>

        {/* KPI: Active Subscribers */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Active Subs
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {activeSubscribersCount}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {((activeSubscribersCount / subscribers.length) * 100).toFixed(0)}% of userbase
            </p>
          </div>
        </div>

        {/* KPI: Past Due Subscriptions */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Past Due Accounts
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              {pastDueSubscribersCount}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">Requires follow-up action</p>
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("packages")}
          className={`relative py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "packages"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          }`}
        >
          Package Builder (CRUD)
          {activeTab === "packages" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-neutral-100" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`relative py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "subscribers"
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          }`}
        >
          Subscriber Overview
          {activeTab === "subscribers" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-neutral-100" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === "packages" ? (
          /* TAB A: PACKAGE BUILDER */
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800/40 dark:text-neutral-400">
                  <tr>
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6 text-right">Price</th>
                    <th className="py-4 px-6">Billing Period</th>
                    <th className="py-4 px-6 text-center">Max Branches</th>
                    <th className="py-4 px-6 text-center">Max Staff</th>
                    <th className="py-4 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20"
                    >
                      <td className="py-4 px-6 font-medium text-neutral-900 dark:text-neutral-100">
                        {pkg.name}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-neutral-900 dark:text-neutral-50">
                        ${pkg.price}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                          {pkg.billingPeriod}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-neutral-700 dark:text-neutral-300">
                        {pkg.maxBranches === 0 ? "Unlimited" : pkg.maxBranches}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-neutral-700 dark:text-neutral-300">
                        {pkg.maxStaff === 0 ? "Unlimited" : pkg.maxStaff}
                      </td>
                      <td className="py-4 px-6 text-neutral-400">
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
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        No pricing packages created yet. Click "Create New Package" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB B: SUBSCRIBER OVERVIEW */
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search businesses by name, email or active plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Subscribers Data Table */}
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800/40 dark:text-neutral-400">
                    <tr>
                      <th className="py-4 px-6">Business Details</th>
                      <th className="py-4 px-6">Current Plan</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Branches Used</th>
                      <th className="py-4 px-6 text-center">Staff Members</th>
                      <th className="py-4 px-6">Next Renewal Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredSubscribers.map((sub) => (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 font-serif text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                              {sub.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                {sub.name}
                              </div>
                              <div className="text-xs text-neutral-400">{sub.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">
                          <span className="inline-flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
                            <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                            {sub.currentPackageName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              sub.subscriptionStatus === "ACTIVE"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : sub.subscriptionStatus === "PAST_DUE"
                                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
                                : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/10 dark:text-neutral-400"
                            }`}
                          >
                            {sub.subscriptionStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-medium text-neutral-800 dark:text-neutral-200">
                          <div className="inline-flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-neutral-400" />
                            {sub.totalBranches}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-medium text-neutral-800 dark:text-neutral-200">
                          <div className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-neutral-400" />
                            {sub.totalStaff}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-neutral-600 dark:text-neutral-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                            {new Date(sub.nextBillingDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSubscribers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
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
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div>
                <h3 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                  Create Subscription Package
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Define a new pricing plan for SaaS tenants.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormErrors({});
                  setApiError("");
                }}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePackage} className="mt-6 space-y-4">
              {apiError && (
                <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Package Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Package Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Starter Plan, Scale Plan"
                  className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-all dark:bg-neutral-950 dark:text-neutral-100 ${
                    formErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-200 focus:border-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100"
                  }`}
                />
                {formErrors.name && (
                  <span className="text-xs text-red-500 font-medium">{formErrors.name}</span>
                )}
              </div>

              {/* Pricing & Period Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="49"
                    min="0"
                    step="0.01"
                    className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-all dark:bg-neutral-950 dark:text-neutral-100 ${
                      formErrors.price
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100"
                    }`}
                  />
                  {formErrors.price && (
                    <span className="text-xs text-red-500 font-medium">{formErrors.price}</span>
                  )}
                </div>

                {/* Billing Period */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Billing Period
                  </label>
                  <select
                    name="billingPeriod"
                    value={formData.billingPeriod}
                    onChange={handleInputChange}
                    className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition-all dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 focus:border-neutral-900 dark:focus:border-neutral-100"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Limits Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Max Branches */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Max Branches
                  </label>
                  <input
                    type="number"
                    name="maxBranches"
                    value={formData.maxBranches}
                    onChange={handleInputChange}
                    placeholder="3"
                    min="0"
                    step="1"
                    className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-all dark:bg-neutral-950 dark:text-neutral-100 ${
                      formErrors.maxBranches
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100"
                    }`}
                  />
                  {formErrors.maxBranches && (
                    <span className="text-xs text-red-500 font-medium">{formErrors.maxBranches}</span>
                  )}
                </div>

                {/* Max Staff */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Max Staff
                  </label>
                  <input
                    type="number"
                    name="maxStaff"
                    value={formData.maxStaff}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                    step="1"
                    className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-all dark:bg-neutral-950 dark:text-neutral-100 ${
                      formErrors.maxStaff
                        ? "border-red-500 focus:border-red-500"
                        : "border-neutral-200 focus:border-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100"
                    }`}
                  />
                  {formErrors.maxStaff && (
                    <span className="text-xs text-red-500 font-medium">{formErrors.maxStaff}</span>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormErrors({});
                    setApiError("");
                  }}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {isPending ? "Creating..." : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
