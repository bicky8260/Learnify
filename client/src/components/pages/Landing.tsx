import {
  BookOpen,
  Brain,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../ui/Landing/Footer";
import NavBar from "../ui/Landing/NavBar";

const features = [
  {
    title: "Curated Learning Paths",
    description:
      "Follow structured paths built to help you learn faster without feeling lost.",
    icon: BookOpen,
  },
  {
    title: "Smart Skill Mapping",
    description:
      "Track strengths, identify gaps, and focus on skills that move your career forward.",
    icon: Brain,
  },
  {
    title: "Real-Time Progress",
    description:
      "Measure growth through live milestones, completion trends, and learning streaks.",
    icon: TrendingUp,
  },
  {
    title: "Mentor + Peer Support",
    description:
      "Ask questions, collaborate, and get practical guidance from a trusted community.",
    icon: MessageCircle,
  },
  {
    title: "Personalized Experience",
    description:
      "Get recommendations based on your goals, pace, and the topics you love most.",
    icon: Sparkles,
  },
  {
    title: "Career-Ready Outcomes",
    description:
      "Build a portfolio of practical capabilities that employers actively look for.",
    icon: Users,
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
  { value: "120K+", label: "Active learners" },
  { value: "1,500+", label: "Expert-led courses" },
  { value: "4.8/5", label: "Average learner rating" },
  { value: "95%", label: "Goal completion rate" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen theme-page-shell animate-page-in">
      <NavBar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%),radial-gradient(circle_at_92%_8%,color-mix(in_oklab,var(--accent)_70%,transparent),transparent_44%)]" />

        <div className="relative mx-auto w-full max-w-[1420px] px-4 sm:px-6 lg:px-10">
          <section className="pt-10 pb-16 lg:pt-14 lg:pb-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-7 animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)]/70 bg-[var(--card)]/70 px-4 py-2 text-sm text-[var(--muted-foreground)]">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  New Era of Digital Learning
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl leading-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                    Learn Smarter with Learnify
                  </h1>
                  <p className="max-w-xl text-base text-[var(--muted-foreground)] sm:text-lg">
                    Learnify helps you build practical skills through guided courses,
                    measurable progress, and a community that keeps your growth on
                    track.
                  </p>
                </div>

                <div>
                  <button
                    className="theme-btn px-6 py-3 text-sm sm:text-base"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                  </button>
                </div>

                <div className="grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    "Interactive lessons",
                    "Expert instructors",
                    "Career growth paths",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2 text-xs font-medium text-[var(--foreground)] sm:text-sm"
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
                <div className="pointer-events-none absolute -left-6 -top-5 h-24 w-24 rounded-full bg-[var(--primary)]/20 blur-2xl animate-float-soft" />
                <div
                  className="pointer-events-none absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-[var(--accent)]/80 blur-2xl animate-float-soft"
                  style={{ animationDelay: "1.1s" }}
                />

                <div className="theme-card relative overflow-hidden p-4 sm:p-5">
                  <div className="rounded-[calc(var(--radius)+6px)] border border-[var(--border)]/70 bg-[var(--card)]/80 p-4">
                    <img
                      src="/learnify_logo.png"
                      alt="Learnify logo"
                      className="mx-auto h-20 w-auto object-contain sm:h-24"
                    />
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[calc(var(--radius)+8px)]">
                    <img
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
                      alt="Learners collaborating"
                      className="h-[240px] w-full object-cover sm:h-[300px]"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Avg completion
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        92%
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/70 px-3 py-2">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Weekly active
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        28K
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-16 lg:pb-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Features
                </p>
                <h2 className="mt-2 text-3xl text-[var(--foreground)] sm:text-4xl">
                  A Learning Platform Built for Real Growth
                </h2>
              </div>
              <p className="max-w-md text-sm text-[var(--muted-foreground)] sm:text-base">
                Every section is designed to make learning practical, consistent,
                and outcome-focused for modern learners.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="theme-card group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/45"
                    style={{
                      animationDelay: `${100 + index * 70}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg text-[var(--foreground)]">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="course-preview" className="pb-16 lg:pb-20">
            <div className="mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Course Preview
                </p>
                <h2 className="mt-2 text-3xl text-[var(--foreground)] sm:text-4xl">
                  Discover What You Can Learn Next
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {coursePreviews.map((course, index) => (
                <article
                  key={course.title}
                  className="theme-card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/45"
                  style={{
                    animationDelay: `${140 + index * 70}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-3 p-5">
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

          <section className="pb-16 lg:pb-20">
            <div className="theme-card relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_38%),radial-gradient(circle_at_94%_100%,color-mix(in_oklab,var(--accent)_72%,transparent),transparent_42%)]" />

              <div className="relative">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    Trusted by Learners
                  </p>
                  <h2 className="mt-2 text-3xl text-[var(--foreground)] sm:text-4xl">
                    Learning Outcomes You Can Measure
                  </h2>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {trustStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/80 px-4 py-4"
                    >
                      <p className="text-2xl font-semibold text-[var(--foreground)]">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="pb-16">
            <div className="relative overflow-hidden rounded-[calc(var(--radius)+18px)] border border-[var(--border)]/70 bg-[linear-gradient(130deg,color-mix(in_oklab,var(--primary)_86%,black),color-mix(in_oklab,var(--accent-foreground)_80%,black))] px-6 py-10 text-[var(--primary-foreground)] sm:px-9 lg:px-12 lg:py-14">
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/12 blur-xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/12 blur-2xl" />

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
                  className="rounded-[calc(var(--radius)+8px)] border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 sm:text-base"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
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