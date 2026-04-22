import useAuth from "../../../hooks/useAuth";
import { useInterceptBackButton } from "../../../hooks/useInterceptBackButton";
import useCheckLogin from "../../../hooks/useLoginCheck";
import useRouter from "../../../hooks/useRouter";
import { useSideBarStore } from "../../../state/global";
import AsideLeft from "./AsideLeft";
import { PageShell } from "../primitives";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useInterceptBackButton(() => {
    router.back();
  });
  useCheckLogin();
  useAuth();
  const isCollapsed = useSideBarStore((state) => state.isCollapsed);

  return (
    <PageShell className="flex w-screen h-screen transition-all duration-500 animate-page-in">
      <div className="relative flex-shrink-0 z-20">
        <AsideLeft style={{ width: isCollapsed ? "65px" : "256px" }} />
      </div>
      <div className="relative flex-1 w-full h-screen overflow-y-auto scrollbar-sm transition-all duration-500 z-10 p-2 md:p-3">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 18%, transparent), transparent 36%), radial-gradient(circle at 12% 100%, color-mix(in oklab, var(--accent) 62%, transparent), transparent 44%)",
          }}
        />
        <div className="relative min-h-full rounded-[calc(var(--radius)+10px)] border border-[var(--border)]/60 theme-glass">
          {children}
        </div>
      </div>
    </PageShell>
  );
}
