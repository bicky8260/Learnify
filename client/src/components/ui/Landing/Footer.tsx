import { useNavigate } from "react-router-dom";
import { modernMedia } from "../../../assets/modernMedia";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Career Paths", path: "/career-path" },
  { label: "Explore Quizzes", path: "/quizzes/explore" },
  { label: "Corporate", path: "/corporate" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="px-4 pb-6">
      <div className="mx-auto max-w-[1420px] overflow-hidden rounded-[calc(var(--radius)+16px)] border border-[var(--border)]/70 theme-glass">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl border border-[var(--border)]/70 bg-[var(--card)]/80 px-3 py-2"
          >
            <img
              src={modernMedia.logo}
              alt="Learnify logo"
              className="h-11 w-auto max-w-[170px] object-contain"
            />
          </button>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                {item.label}
              </button>
            ))}
          </nav>

        </div>

        <div className="border-t border-[var(--border)]/70 px-6 py-4 sm:px-8">
          <p className="text-xs text-[var(--muted-foreground)]">
            Copyright {currentYear} Learnify. Empowering Knowledge and Growth.
          </p>
        </div>
      </div>
    </footer>
  );
}
