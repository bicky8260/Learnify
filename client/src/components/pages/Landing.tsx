import {
  BookOpen,
  Brain,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Shield,
  Send,
  CheckCircle,
  Upload,
  GraduationCap,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../ui/Landing/Footer";
import NavBar from "../ui/Landing/NavBar";
import { useState, useEffect, useRef } from "react";
import type { ElementType } from "react";

const features = [
  {
    title: "Curated Learning Paths",
    description:
      "Follow structured paths built to help you learn faster without feeling lost.",
    icon: BookOpen,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Smart Skill Mapping",
    description:
      "Track strengths, identify gaps, and focus on skills that move your career forward.",
    icon: Brain,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Real-Time Progress",
    description:
      "Measure growth through live milestones, completion trends, and learning streaks.",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    title: "Mentor + Peer Support",
    description:
      "Ask questions, collaborate, and get practical guidance from a trusted community.",
    icon: MessageCircle,
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
  },
  {
    title: "Personalized Experience",
    description:
      "Get recommendations based on your goals, pace, and the topics you love most.",
    icon: Sparkles,
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
  {
    title: "Career-Ready Outcomes",
    description:
      "Build a portfolio of practical capabilities that employers actively look for.",
    icon: Users,
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-500",
  },
];

const coursePreviews = [
  {
    title: "AI Foundations for Everyday Work",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1677442135136-760c813028c2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Data Storytelling and Dashboards",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1551281044-8d8d7fca31b1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Modern Product Thinking",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Leadership Communication Essentials",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Cloud and DevOps Starter Track",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Design Systems for Teams",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
];

const trustStats = [
  { value: 120000, suffix: "+", label: "Active learners", icon: Users },
  { value: 1500, suffix: "+", label: "Expert-led courses", icon: BookOpen },
  { value: 4.8, suffix: "/5", label: "Average learner rating", icon: Star, isDecimal: true },
  { value: 95, suffix: "%", label: "Goal completion rate", icon: TrendingUp },
];

const workflowSteps = [
  {
    step: 1,
    title: "Admin Sets Up",
    description: "Admin creates Brands and Applications to organize the course catalog",
    icon: Shield,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  {
    step: 2,
    title: "Contributor Creates",
    description: "Contributors build courses with modules, chapters, and lessons under existing brands",
    icon: Layers,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    step: 3,
    title: "Submit for Review",
    description: "Contributor submits the completed course content for quality review",
    icon: Send,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    step: 4,
    title: "Moderator Reviews",
    description: "Moderator thoroughly reviews and approves or requests changes",
    icon: CheckCircle,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    step: 5,
    title: "Admin Publishes",
    description: "Admin publishes approved courses making them available to all students",
    icon: Upload,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    step: 6,
    title: "Students Learn",
    description: "Students access published courses and begin their learning journey",
    icon: GraduationCap,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
];

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, isDecimal: boolean = false) {
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
            const currentValue = isDecimal
              ? Math.round(eased * target * 10) / 10
              : Math.round(eased * target);
            setCount(currentValue);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, isDecimal]);

  return { count, ref };
}

function AnimatedStat({ value, suffix, label, icon: Icon, isDecimal }: {
  value: number;
  suffix: string;
  label: string;
  icon: ElementType;
  isDecimal?: boolean;
}) {
  const { count, ref } = useCountUp(value, 2000, isDecimal);
  const display = isDecimal
    ? count.toFixed(1)
    : count >= 1000
    ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 0)}K`
    : count.toString();

  // Better formatting for large numbers
  const formattedDisplay = isDecimal
    ? count.toFixed(1)
    : value >= 100000
    ? `${Math.round(count / 1000)}K`
    : value >= 1000
    ? `${(count / 1000).toFixed(1)}K`
    : count.toString();

  return (
    <div
      ref={ref}
      className="theme-card-premium theme-card-shimmer group rounded-2xl px-5 py-5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative z-10 flex items-center gap-4">
        <div className="stat-icon-ring !w-12 !h-12 !rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {formattedDisplay}
            <span className="text-[var(--primary)]">{suffix}</span>
          </p>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen theme-page-shell animate-page-in">
      <NavBar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%),radial-gradient(circle_at_92%_8%,color-mix(in_oklab,var(--accent)_70%,transparent),transparent_44%)]" />

        <div className="relative mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-10">
          {/* ===== HERO SECTION ===== */}
          <section className="pt-10 pb-16 lg:pt-14 lg:pb-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-7 animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/70 bg-[var(--card)]/70 px-4 py-2 text-sm text-[var(--muted-foreground)] animate-pulse-glow">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  New Era of Digital Learning
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
                    <span className="text-[var(--foreground)]">Learn Smarter with </span>
                    <span className="text-gradient">Learnify</span>
                  </h1>
                  <p className="max-w-xl text-base text-[var(--muted-foreground)] sm:text-lg">
                    Learnify helps you build practical skills through guided courses,
                    measurable progress, and a community that keeps your growth on
                    track.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    className="theme-btn px-6 py-3 text-sm sm:text-base group"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    className="theme-btn-secondary px-6 py-3 text-sm sm:text-base"
                    onClick={() => {
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    How it Works
                  </button>
                </div>

                <div className="grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    "Interactive lessons",
                    "Expert instructors",
                    "Career growth paths",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2 text-xs font-medium text-[var(--foreground)] sm:text-sm animate-fade-up"
                      style={{ animationDelay: `${300 + i * 100}ms` }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="relative animate-fade-up"
                style={{ animationDelay: "120ms", animationFillMode: "both" }}
              >
                {/* Animated blob backgrounds */}
                <div className="pointer-events-none absolute -left-6 -top-5 h-28 w-28 rounded-full bg-[var(--primary)]/20 blur-2xl animate-morph-blob" />
                <div
                  className="pointer-events-none absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-[var(--accent)]/80 blur-2xl animate-morph-blob"
                  style={{ animationDelay: "2s" }}
                />

                <div className="theme-card-premium relative p-4 sm:p-5">
                  <div className="relative z-10 rounded-[calc(var(--radius)+6px)] border border-[var(--border)]/70 bg-[var(--card)]/80 p-4">
                    <img
                      src="/learnify_logo.png"
                      alt="Learnify logo"
                      className="mx-auto h-20 w-auto object-contain sm:h-24"
                    />
                  </div>

                  <div className="relative z-10 mt-4 overflow-hidden rounded-[calc(var(--radius)+8px)]">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
                      alt="Learners collaborating"
                      className="h-[240px] w-full object-cover sm:h-[300px]"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
                    <div className="theme-card-shimmer rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Avg completion
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        92<span className="text-[var(--primary)]">%</span>
                      </p>
                    </div>
                    <div className="theme-card-shimmer rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Weekly active
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        28<span className="text-[var(--primary)]">K</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== HOW IT WORKS - WORKFLOW SECTION ===== */}
          <section id="how-it-works" className="pb-16 lg:pb-20">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                Platform Workflow
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl">
                <span className="text-[var(--foreground)]">How </span>
                <span className="text-gradient">Learnify</span>
                <span className="text-[var(--foreground)]"> Works</span>
              </h2>
              <p className="mt-3 mx-auto max-w-2xl text-sm text-[var(--muted-foreground)] sm:text-base">
                From content creation to student learning — a seamless workflow powered by collaboration between Admins, Contributors, and Moderators.
              </p>
            </div>

            {/* Desktop workflow - horizontal */}
            <div className="hidden lg:block">
              <div className="flex items-start gap-0">
                {workflowSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start flex-1">
                    <div className="flex flex-col items-center text-center group">
                      {/* Step icon circle */}
                      <div
                        className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl animate-scale-in`}
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        <step.icon className="h-7 w-7" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                          {step.step}
                        </span>
                      </div>

                      {/* Step content */}
                      <div
                        className="mt-4 max-w-[150px] animate-count-up-fade"
                        style={{ animationDelay: `${200 + index * 120}ms` }}
                      >
                        <h4 className="text-sm font-semibold text-[var(--foreground)]">
                          {step.title}
                        </h4>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < workflowSteps.length - 1 && (
                      <div className="flex-1 flex items-center pt-8 px-2">
                        <div className="workflow-connector active" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet workflow - vertical */}
            <div className="lg:hidden">
              <div className="relative space-y-1">
                {/* Vertical connector line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[var(--primary)] via-[var(--accent-foreground)] to-[var(--primary)] opacity-30" />

                {workflowSteps.map((step, index) => (
                  <div
                    key={step.step}
                    className="relative flex items-start gap-5 animate-slide-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <step.icon className="h-6 w-6" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                        {step.step}
                      </span>
                    </div>
                    <div className={`flex-1 theme-card-premium theme-card-shimmer rounded-xl p-4 border ${step.borderColor}`}>
                      <h4 className="relative z-10 text-sm font-semibold text-[var(--foreground)]">
                        {step.title}
                      </h4>
                      <p className="relative z-10 mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== FEATURES SECTION ===== */}
          <section className="pb-16 lg:pb-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Features
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl">
                  <span className="text-[var(--foreground)]">A Learning Platform Built for </span>
                  <span className="text-gradient">Real Growth</span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-[var(--muted-foreground)] sm:text-base">
                Every section is designed to make learning practical, consistent,
                and outcome-focused for modern learners.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-in">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="theme-card-premium theme-card-shimmer group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/45"
                    style={{
                      animationDelay: `${100 + index * 70}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div className={`relative z-10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative z-10 text-lg text-[var(--foreground)]">
                      {feature.title}
                    </h3>
                    <p className="relative z-10 mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ===== COURSE PREVIEW SECTION ===== */}
          <section id="course-preview" className="pb-16 lg:pb-20">
            <div className="mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Course Preview
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl">
                  <span className="text-[var(--foreground)]">Discover What You Can </span>
                  <span className="text-gradient">Learn Next</span>
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {coursePreviews.map((course, index) => (
                <article
                  key={course.title}
                  className="theme-card-premium theme-card-shimmer group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/45 animate-fade-up"
                  style={{
                    animationDelay: `${140 + index * 70}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="relative z-10 space-y-3 p-5">
                    <h3 className="text-lg leading-snug text-[var(--foreground)]">
                      {course.title}
                    </h3>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-1 text-sm text-[var(--foreground)]">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.rating} learner rating
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ===== TRUST STATS SECTION ===== */}
          <section className="pb-16 lg:pb-20">
            <div className="theme-card-premium relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_38%),radial-gradient(circle_at_94%_100%,color-mix(in_oklab,var(--accent)_72%,transparent),transparent_42%)]" />

              <div className="relative z-10">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    Trusted by Learners
                  </p>
                  <h2 className="mt-2 text-3xl sm:text-4xl">
                    <span className="text-[var(--foreground)]">Learning Outcomes You Can </span>
                    <span className="text-gradient">Measure</span>
                  </h2>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {trustStats.map((stat) => (
                    <AnimatedStat key={stat.label} {...stat} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===== CTA SECTION ===== */}
          <section className="pb-16">
            <div className="relative overflow-hidden rounded-[calc(var(--radius)+18px)] border border-[var(--border)]/70 bg-[linear-gradient(130deg,color-mix(in_oklab,var(--primary)_86%,black),color-mix(in_oklab,var(--accent-foreground)_80%,black))] px-6 py-10 text-[var(--primary-foreground)] sm:px-9 lg:px-12 lg:py-14">
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-xl animate-morph-blob" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/12 blur-2xl animate-morph-blob" style={{ animationDelay: "3s" }} />

              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                    Start Today
                  </p>
                  <h2 className="mt-2 text-3xl text-white sm:text-4xl">
                    Start your learning journey today
                  </h2>
                  <p className="mt-3 text-sm text-white/80 sm:text-base">
                    Join Learnify and build the skills you need to stay ready for
                    what comes next.
                  </p>
                </div>

                <button
                  className="rounded-[calc(var(--radius)+8px)] border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl sm:text-base group flex items-center gap-2"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}