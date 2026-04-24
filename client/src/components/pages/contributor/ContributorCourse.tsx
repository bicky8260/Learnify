import {
  PlusCircle,
  Trash2,
  Send,
  Eye,
  BookOpen,
  Settings,
  FileEdit,
  CheckCircle,
  Rocket,
  XCircle,
  Clock,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import useRouter from "../../../hooks/useRouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TanstackTable } from "../../lazy/TanstackTable";
import type { CourseWithCategory } from "../../../types";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import ConfirmDialog from "../../lazy/ConfirmDialog";
import { useToast } from "../../../contexts/ToastContext";
import { userStore } from "../../../state/global";

interface CourseQuery extends Response {
  data: {
    courses: CourseWithCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CourseWithStatus extends CourseWithCategory {
  status?: string;
  flags?: string[];
}

// Workflow steps for the visual pipeline
const workflowSteps = [
  { key: "DRAFT", label: "Draft", icon: FileEdit, color: "from-gray-400 to-gray-500", textColor: "text-gray-600 dark:text-gray-400" },
  { key: "SUBMITTED", label: "Submitted", icon: Send, color: "from-blue-400 to-blue-600", textColor: "text-blue-600 dark:text-blue-400" },
  { key: "APPROVED", label: "Approved", icon: CheckCircle, color: "from-green-400 to-green-600", textColor: "text-green-600 dark:text-green-400" },
  { key: "PUBLISHED", label: "Published", icon: Rocket, color: "from-purple-400 to-purple-600", textColor: "text-purple-600 dark:text-purple-400" },
];

function WorkflowPipeline({ stats }: { stats: { draft: number; submitted: number; approved: number; published: number; rejected: number } }) {
  const steps = [
    { ...workflowSteps[0], count: stats.draft },
    { ...workflowSteps[1], count: stats.submitted },
    { ...workflowSteps[2], count: stats.approved },
    { ...workflowSteps[3], count: stats.published },
  ];

  return (
    <div className="theme-card-premium theme-card-shimmer p-6 mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-5">
          Course Workflow Pipeline
        </h3>
        <div className="flex items-center gap-0">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center group flex-1">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl animate-scale-in`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mt-3 animate-count-up-fade" style={{ animationDelay: `${200 + index * 120}ms` }}>
                  <p className={`text-2xl font-bold ${step.textColor}`}>{step.count}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{step.label}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 w-8 lg:w-12 flex items-center justify-center -mt-8">
                  <div className="workflow-connector active" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rejected count if any */}
        {stats.rejected > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]/60">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-xl">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {stats.rejected} course{stats.rejected > 1 ? "s" : ""} rejected — needs revision
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContributorCourses() {
  useInitNavStackOnce([{ title: "My Courses", path: "/contributor/courses" }]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = userStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CourseWithStatus | null>(null);
  const [statusFilter] = useState<string>("");

  const coursesQuery = useQuery({
    queryKey: ["contributor-courses", user?.id, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", "1");
      params.append("limit", "100");
      params.append("_ts", Date.now().toString());

      const res = await api.get<CourseQuery>(
        `${API_ROUTES.COURSE.GET_CONTRIBUTOR.COURSES}?${params.toString()}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      const courses = res.data?.data?.courses || [];
      const inactiveCourses = courses.filter((course) => !course.isActive);

      console.info("[ContributorCourses] API response", {
        total: courses.length,
        courseIds: courses.map((course) => course.id),
        inactiveCourseIds: inactiveCourses.map((course) => course.id),
      });

      if (inactiveCourses.length > 0) {
        console.warn(
          "[ContributorCourses] Inactive/deleted courses found in API response",
          inactiveCourses.map((course) => course.id)
        );
      }

      return res.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const visibleCourses = useMemo(
    () => (coursesQuery.data?.data?.courses || []).filter((course) => course.isActive),
    [coursesQuery.data?.data?.courses]
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.COURSE(id));
      return res.data;
    },
    onSuccess: () => {
      success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contributor-courses"] });
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to delete course");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.post(API_ROUTES.WORKFLOW.SUBMIT_COURSE(courseId));
      return res.data;
    },
    onSuccess: () => {
      success("Course submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["contributor-courses"] });
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to submit course");
    },
  });

  const handleSubmit = (course: CourseWithStatus) => {
    if (window.confirm(`Submit "${course.title}" for review?`)) {
      submitMutation.mutate(course.id);
    }
  };

  const handleDelete = (course: CourseWithStatus) => {
    if (!isAdmin) {
      showError("Only admins can delete courses");
      return;
    }
    setSelected(course);
    setDeleteOpen(true);
  };

  const handleView = (course: CourseWithStatus) => {
    router.push(`/contributor/courses/${course.id}`, course.title);
  };

  const handleManage = (course: CourseWithStatus) => {
    router.push(`/contributor/module/course/${course.id}`, course.title);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const courses = visibleCourses;
    return {
      total: courses.length,
      draft: courses.filter((c: CourseWithStatus) => c.status === "DRAFT")
        .length,
      submitted: courses.filter(
        (c: CourseWithStatus) => c.status === "SUBMITTED"
      ).length,
      approved: courses.filter((c: CourseWithStatus) => c.status === "APPROVED")
        .length,
      published: courses.filter(
        (c: CourseWithStatus) => c.status === "PUBLISHED"
      ).length,
      rejected: courses.filter((c: CourseWithStatus) => c.status === "REJECTED")
        .length,
    };
  }, [visibleCourses]);

  const columns: ColumnDef<CourseWithStatus>[] = useMemo(
    () => {
      const baseColumns: ColumnDef<CourseWithStatus>[] = [
      {
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => (
          <span className="text-[var(--muted-foreground)]">
            {row.original.category?.name || "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status || "DRAFT";
          const isPublished = row.original.published === true;

          let displayStatus = "DRAFT";
          let badgeClass = "bg-gradient-to-r from-gray-400 to-gray-500";

          if (isPublished) {
            displayStatus = "PUBLISHED";
            badgeClass = "bg-gradient-to-r from-purple-500 to-violet-600";
          } else if (status === "APPROVED") {
            displayStatus = "APPROVED";
            badgeClass = "bg-gradient-to-r from-green-500 to-emerald-600";
          } else if (status === "SUBMITTED") {
            displayStatus = "PENDING";
            badgeClass = "bg-gradient-to-r from-blue-500 to-cyan-600";
          } else if (status === "REJECTED") {
            displayStatus = "REJECTED";
            badgeClass = "bg-gradient-to-r from-red-500 to-rose-600";
          }

          return (
            <div className="flex flex-col gap-1">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${badgeClass}`}
              >
                {displayStatus}
              </span>
              {status === "SUBMITTED" && (
                <span className="flex items-center gap-1 text-[10px] text-blue-500 px-1 leading-tight">
                  <Clock className="w-3 h-3 animate-pulse" />
                  Awaiting review
                </span>
              )}
              {status === "APPROVED" && !isPublished && (
                <span className="text-[10px] text-[var(--muted-foreground)] px-1 leading-tight">
                  Approved but not published
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      // ✅ View Column
      {
        header: "View",
        size: 60,
        cell: ({ row }) => (
          <button
            onClick={() => handleView(row.original)}
            className="p-2 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 hover:scale-110"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        ),
      },
      // ✅ Manage Column (with skills under it)
      {
        header: "Manage",
        size: 60,
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleManage(row.original)}
              className="p-2 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl transition-all duration-200 hover:scale-110"
              title="Manage Skills"
            >
              <Settings size={16} />
            </button>
            <span className="text-xs text-[var(--muted-foreground)]">
              Skills
            </span>
          </div>
        ),
      },
      // ✅ Submit Column (only for DRAFT status)
      {
        header: "Submit",
        size: 80,
        cell: ({ row }) => (
          <>
            {row.original.status === "DRAFT" ? (
              <button
                onClick={() => handleSubmit(row.original)}
                disabled={submitMutation.isPending}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap font-medium hover:scale-105"
                title="Submit for Review"
              >
                <Send size={14} />
                Submit
              </button>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">—</span>
            )}
          </>
        ),
      },
      ];

      if (isAdmin) {
        baseColumns.push({
          header: "Delete",
          size: 60,
          cell: ({ row }) => (
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all duration-200 hover:scale-110"
              title="Delete"
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={16} />
            </button>
          ),
        });
      }

      return baseColumns;
    },
    [submitMutation.isPending, deleteMutation.isPending, isAdmin]
  );

  const table = useReactTable({
    data: visibleCourses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              My Courses
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Manage and track your course contributions
            </p>
          </div>
          <button
            onClick={() =>
              router.push("/contributor/courses/create", "Create Course")
            }
            className="theme-btn flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Course
          </button>
        </div>

        {/* Workflow Pipeline (replaces basic stats) */}
        <WorkflowPipeline stats={stats} />

        {/* Table */}
        {coursesQuery.isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--muted-foreground)]">Loading your courses...</p>
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="text-center py-16 theme-card-premium rounded-2xl animate-scale-in">
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-[var(--muted-foreground)]" />
              </div>
              <p className="text-lg font-medium text-[var(--foreground)] mb-2">No courses yet</p>
              <p className="text-[var(--muted-foreground)] mb-6">Start creating your first course to see it here</p>
              <button
                onClick={() => router.push("/contributor/courses/create", "Create Course")}
                className="theme-btn"
              >
                <PlusCircle className="h-4 w-4" />
                Create Your First Course
              </button>
            </div>
          </div>
        ) : (
          <div className="theme-card-premium overflow-hidden animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative z-10 overflow-x-auto">
              <TanstackTable
                table={table}
                paginatedRows={table.getRowModel().rows}
                pageIndex={table.getState().pagination.pageIndex}
                pageSize={table.getState().pagination.pageSize}
                onPageChange={table.setPageIndex}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {isAdmin && (
          <ConfirmDialog
            open={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelected(null);
            }}
            onConfirm={() => {
              if (selected) deleteMutation.mutate(selected.id);
            }}
            title="Delete Course"
            description={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
            loading={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
