import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, Building2, KeyRound, Mail, ArrowRight, Eye, EyeOff, AlertCircle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Access Portal · BRG" }] }),
  component: AccessPortal,
});

function AccessPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const auth = localStorage.getItem("brg_auth");
    if (auth) {
      try {
        const user = JSON.parse(auth);
        if (user.role === "admin") {
          navigate({ to: "/admin" });
        } else if (user.role === "business") {
          navigate({ to: "/business" });
        } else if (user.role === "staff") {
          navigate({ to: "/staff" });
        }
      } catch (e) {
        localStorage.removeItem("brg_auth");
      }
    }
  }, [navigate]);

  // Handle standard submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Simulate API request latency
    setTimeout(() => {
      setLoading(false);
      if (email === "admin@brg.np" && password === "admin123") {
        localStorage.setItem("brg_auth", JSON.stringify({ email, role: "admin", name: "Super Admin" }));
        navigate({ to: "/admin" });
      } else if (email === "salon@brg.np" && password === "salon123") {
        localStorage.setItem("brg_auth", JSON.stringify({ email, role: "business", name: "Aura Beauty Lounge" }));
        navigate({ to: "/business" });
      } else if (email === "staff@brg.np" && password === "staff123") {
        localStorage.setItem("brg_auth", JSON.stringify({ email, role: "staff", name: "Anisha" }));
        navigate({ to: "/staff" });
      } else {
        setError("Invalid email or password. Use the quick login buttons below to test.");
      }
    }, 600);
  };

  // Quick Login Utility
  const handleQuickLogin = (role: "admin" | "business" | "staff", staffRole?: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") {
        localStorage.setItem("brg_auth", JSON.stringify({ email: "admin@brg.np", role: "admin", name: "Super Admin" }));
        navigate({ to: "/admin" });
      } else if (role === "business") {
        localStorage.setItem("brg_auth", JSON.stringify({ email: "salon@brg.np", role: "business", name: "Aura Beauty Lounge" }));
        navigate({ to: "/business" });
      } else {
        localStorage.setItem("brg_auth", JSON.stringify({ email: "staff@brg.np", role: "staff", name: staffRole === "receptionist" ? "Priya (Front Desk)" : "Anisha", staffRole }));
        navigate({ to: "/staff" });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-ivory-grain p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1000px] grid lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Premium Branding info */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-luxe mx-auto lg:mx-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Book · Relax · Glow
            </h1>
            <p className="text-sm uppercase tracking-[0.24em] text-accent/80 font-medium">
              Unified Platform Portal
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
            Welcome to the BRG core ecosystem. Sign in with your registered credentials to access your administrative suite or business operations dashboard.
          </p>
          
          {/* Quick Login Section */}
          <div className="pt-4 space-y-3 hidden lg:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Sandbox Logins
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary transition-all duration-200 group"
              >
                <ShieldCheck className="h-5 w-5 text-gold mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Super Admin Suite</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Manage plans & users</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("business")}
                className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary transition-all duration-200 group"
              >
                <Building2 className="h-5 w-5 text-primary mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Business Client Suite</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">POS, calendars, & bookings</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("staff", "provider")}
                className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary transition-all duration-200 group"
              >
                <UserCircle className="h-5 w-5 text-blue-500 mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Staff (Provider)</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Stylist/Therapist role</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("staff", "receptionist")}
                className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary transition-all duration-200 group"
              >
                <UserCircle className="h-5 w-5 text-rose-500 mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground">Staff (Reception)</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Front desk role</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-luxe space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-foreground">Sign In</h2>
              <p className="text-xs text-muted-foreground">
                Enter your administrative or tenant credentials
              </p>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@brg.np"
                    className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 h-10 mt-6 flex items-center justify-center gap-1.5 rounded-lg text-white"
              >
                {loading ? "Verifying..." : "Sign In to Portal"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Mobile / Responsive Quick Logins */}
            <div className="pt-4 border-t border-border space-y-3 lg:hidden">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Quick Sandbox Logins
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleQuickLogin("admin")} className="text-[10px] py-2 border-border h-auto px-1">
                  Super Admin
                </Button>
                <Button variant="outline" onClick={() => handleQuickLogin("business")} className="text-[10px] py-2 border-border h-auto px-1">
                  Business
                </Button>
                <Button variant="outline" onClick={() => handleQuickLogin("staff", "provider")} className="text-[10px] py-2 border-border h-auto px-1 text-blue-600">
                  Staff (Provider)
                </Button>
                <Button variant="outline" onClick={() => handleQuickLogin("staff", "receptionist")} className="text-[10px] py-2 border-border h-auto px-1 text-rose-600">
                  Staff (Reception)
                </Button>
              </div>
            </div>

            <div className="text-center text-[10px] text-muted-foreground">
              Security Notice: Sandbox mode active. Custom credentials enabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
