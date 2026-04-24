import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response } from "../../../types";
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  Folder,
  FileText,
  GraduationCap,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LucideLineChart } from "lucide-react";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import TopBar from "../../lazy/TopBar";
import { useState, useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";

interface DashboardStatistics extends Response {
  data: {
    totals: {
      courses: number;
      students: number;
      purchases: number;
      chapters: number;
      modules: number;
      lessons: number;
      skillCategories: number;
      expertise: number;
    };
    revenue: {
      total: number;
      average: number;
    };
    purchasesByMonth: Array<{
      month: string;
      count: number;
      revenue: number;
    }>;
    chapterPriceDistribution: Array<{
      range: string;
      count: number;
    }>;
    topCourses: Array<{
      course: any;
      purchaseCount: number;
      totalRevenue: number;
    }>;
    studentsByMonth: Array<{
      month: string;
      count: number;
    }>;
    coursesByMonth: Array<{
      month: string;
      count: number;
    }>;
    recentPurchases: any[];
    studentsByGoal: Array<{
      goal: string;
      count: number;
    }>;
    studentsByStatus: Array<{
      status: string;
      count: number;
    }>;
    chapters: {
      total: number;
      free: number;
      paid: number;
      totalValue: number;
      averagePrice: number;
    };
  };
}

const COLORS = [
  "#7c3aed",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
];

// Animated counter hook
function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// Time-based greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return { text: "Good Evening", emoji: "🌙" };
}

export default function Dashboard() {
  useInitNavStackOnce([{ title: "Dashboard", path: "/admin/dashboard" }]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: async () => {
      const res = await api.get<DashboardStatistics>(
        API_ROUTES.STATISTICS.GET_DASHBOARD
      );
      return res.data;
    },
  });

  const greeting = getGreeting();

  if (isLoading) {
    return (
      <div className="w-full p-8 theme-page-shell">
        <div className="space-y-6">
          {/* Skeleton header */}
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg w-1/3 mb-3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="theme-card-premium rounded-2xl h-32 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-6 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="theme-card-premium rounded-2xl h-96 animate-pulse p-6">
                <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/4 mb-6"></div>
                <div className="h-64 bg-muted rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full p-8 theme-page-shell">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Zap className="w-10 h-10 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-muted-foreground mb-6">
            We couldn't fetch your statistics. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="theme-btn px-6 py-2.5"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data.data;

  // Format month labels
  const formatMonth = (month: string) => {
    const [year, mon] = month.split("-");
    const date = new Date(parseInt(year), parseInt(mon) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totals.courses,
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      title: "Total Students",
      value: stats.totals.students,
      icon: Users,
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      title: "Total Purchases",
      value: stats.totals.purchases,
      icon: ShoppingCart,
      gradient: "from-purple-500 to-violet-500",
      bgGlow: "bg-purple-500/10",
    },
    {
      title: "Total Revenue",
      value: stats.revenue.total,
      icon: DollarSign,
      gradient: "from-amber-500 to-yellow-500",
      bgGlow: "bg-amber-500/10",
      prefix: "$",
      isRevenue: true,
    },
    {
      title: "Expertise",
      value: stats.totals.modules,
      icon: Folder,
      gradient: "from-indigo-500 to-blue-500",
      bgGlow: "bg-indigo-500/10",
    },
    {
      title: "Chapters",
      value: stats.totals.chapters,
      icon: FileText,
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/10",
    },
    {
      title: "Lessons",
      value: stats.totals.lessons,
      icon: GraduationCap,
      gradient: "from-orange-500 to-amber-500",
      bgGlow: "bg-orange-500/10",
    },
    {
      title: "Avg Purchase",
      value: stats.revenue.average,
      icon: TrendingUp,
      gradient: "from-teal-500 to-cyan-500",
      bgGlow: "bg-teal-500/10",
      prefix: "$",
      isRevenue: true,
    },
  ];

  return (
    <>
      <TopBar />
      <div className="w-full p-5 lg:p-8 space-y-8 min-h-screen theme-page-shell">
        {/* Header with greeting */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{greeting.emoji}</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {greeting.text}
              </h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              Here's your LMS overview for today
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-in">
          {statCards.map((card) => (
            <PremiumStatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumChart
            title="Revenue & Purchases Over Time"
            subtitle="Last 12 months"
            icon={<LucideLineChart size={20} />}
            delay={0}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.purchasesByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickFormatter={formatMonth} stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#7c3aed" fill="url(#colorRevenue)" strokeWidth={2.5} />
                <Area yAxisId="right" type="monotone" dataKey="count" name="Purchases" stroke="#06b6d4" fill="url(#colorCount)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </PremiumChart>

          <PremiumChart
            title="Student Registration"
            subtitle="Last 12 months"
            icon={<BarChart3 size={20} />}
            delay={100}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.studentsByMonth}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickFormatter={formatMonth} stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Bar dataKey="count" name="New Students" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PremiumChart>

          <PremiumChart
            title="Chapter Price Distribution"
            subtitle="Free vs Paid"
            icon={<PieChart size={20} />}
            delay={200}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.chapterPriceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent, payload }) =>
                    `${payload.range}: ${
                      percent !== undefined ? (percent * 100).toFixed(0) : "0"
                    }%`
                  }
                  outerRadius={100}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="count"
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {stats.chapterPriceDistribution.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </PremiumChart>

          <PremiumChart
            title="Students by Learning Goal"
            subtitle="Distribution"
            icon={<Award size={20} />}
            delay={300}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={stats.studentsByGoal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }) =>
                    `${payload.goal}: ${
                      percent !== undefined ? (percent * 100).toFixed(0) : "0"
                    }%`
                  }
                  outerRadius={100}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="count"
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {stats.studentsByGoal.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </PremiumChart>

          <PremiumChart
            title="Course Creation Timeline"
            subtitle="Last 12 months"
            icon={<Calendar size={20} />}
            delay={400}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.coursesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickFormatter={formatMonth} stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                  labelFormatter={(value) => formatMonth(value)}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Courses Created"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "#f97316", r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                  activeDot={{ r: 8, fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PremiumChart>

          <PremiumChart
            title="Top Selling Courses"
            subtitle="By purchase count"
            icon={<TrendingUp size={20} />}
            delay={500}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.topCourses.map((tc) => ({
                  name: tc.course?.title || "Unknown",
                  purchases: tc.purchaseCount,
                  revenue: tc.totalRevenue,
                }))}
                layout="vertical"
              >
                <defs>
                  <linearGradient id="topBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <YAxis type="category" dataKey="name" width={150} stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend />
                <Bar dataKey="purchases" name="Purchases" fill="url(#topBarGrad)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PremiumChart>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chapters Stats */}
          <div className="theme-card-premium theme-card-shimmer p-6 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Chapters Overview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Free vs Paid breakdown
                  </p>
                </div>
                <div className="stat-icon-ring !w-11 !h-11 !rounded-xl">
                  <FileText size={20} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="text-foreground font-medium">
                    Total Chapters
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {stats.chapters.total}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Free</div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.chapters.free}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl">
                    <div className="text-sm text-muted-foreground mb-1">Paid</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.chapters.paid}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-[var(--ring)]/5 border border-primary/20 rounded-xl">
                  <span className="text-foreground font-medium">
                    Average Price
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ${stats.chapters.averagePrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="theme-card-premium theme-card-shimmer p-6 animate-fade-up" style={{ animationDelay: "700ms" }}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Recent Purchases
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last 10 transactions
                  </p>
                </div>
                <div className="stat-icon-ring !w-11 !h-11 !rounded-xl">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-sm">
                {stats.recentPurchases.map((purchase, index) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3.5 theme-panel rounded-xl hover:bg-muted/80 transition-all duration-200 group animate-slide-in-right"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                        {purchase.user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {purchase.chapter?.module?.expertise?.skillCategory
                          ?.course?.title || "Unknown Course"}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="font-bold text-foreground flex items-center gap-1">
                        <span className="text-primary">$</span>
                        {purchase.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(purchase.purchaseAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Premium Stat Card with count-up animation
function PremiumStatCard({
  title,
  value,
  icon: Icon,
  gradient,
  bgGlow,
  prefix,
  isRevenue,
}: {
  title: string;
  value: number;
  icon: ElementType;
  gradient: string;
  bgGlow: string;
  prefix?: string;
  isRevenue?: boolean;
}) {
  const { count, ref } = useCountUp(Math.round(value), 1800);
  const displayValue = isRevenue
    ? `${prefix || ""}${count.toLocaleString()}`
    : count.toLocaleString();

  return (
    <div
      ref={ref}
      className="theme-card-premium theme-card-shimmer group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            {title}
          </p>
          <div className="text-3xl font-bold text-foreground animate-count-up-fade">
            {displayValue}
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
        >
          <Icon size={22} />
        </div>
      </div>
      {/* Bottom glow */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${gradient} opacity-60`} />
    </div>
  );
}

// Premium Chart Card
function PremiumChart({
  title,
  subtitle,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="theme-card-premium p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[var(--primary)]">{icon}</span>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}