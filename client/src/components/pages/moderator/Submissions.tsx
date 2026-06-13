import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  BookOpen,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Clock,
  User,
  Inbox,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";
import { useToast } from "../../../contexts/ToastContext";
import Modal from "../../lazy/Modal";

interface Submission {
  id: string;
  title: string;
  entityType: "COURSE" | "CHAPTER" | "LESSON";
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PUBLISHED";
  submittedAt: string | null;
  submittedBy?: string | null;
  createdAt: string;
  description?: string;
  content?: string;
  [key: string]: any;
}

interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: Submission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const entityTypeConfig = {
  COURSE: {
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    label: "Course",
  },
  CHAPTER: {
    icon: FileText,
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    label: "Chapter",
  },
  LESSON: {
    icon: Video,
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    label: "Lesson",
  },
};

export default function Submissions() {
  useInitNavStackOnce([
    { title: "Submissions", path: "/moderator/submissions" },
  ]);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  const [entityFilter, setEntityFilter] = useState<
    "COURSE" | "CHAPTER" | "LESSON" | undefined
  >(undefined);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", entityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", "SUBMITTED");
      if (entityFilter) params.append("entityType", entityFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await api.get<SubmissionsResponse>(
        `${API_ROUTES.WORKFLOW.GET_SUBMISSIONS}?${params.toString()}`
      );
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (submission: Submission) => {
      let endpoint;
      if (submission.entityType === "COURSE") {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_COURSE(submission.id);
      } else if (submission.entityType === "CHAPTER") {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_CHAPTER(submission.id);
      } else {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_LESSON(submission.id);
      }
      const res = await api.post(endpoint);
      return res.data;
    },
    onSuccess: () => {
      success("Approved successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setReviewModalOpen(false);
      setSelectedSubmission(null);
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to approve");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      submission,
      reason,
    }: {
      submission: Submission;
      reason: string;
    }) => {
      let endpoint;
      if (submission.entityType === "COURSE") {
        endpoint = API_ROUTES.WORKFLOW.REJECT_COURSE(submission.id);
      } else if (submission.entityType === "CHAPTER") {
        endpoint = API_ROUTES.WORKFLOW.REJECT_CHAPTER(submission.id);
      } else {
        endpoint = API_ROUTES.WORKFLOW.REJECT_LESSON(submission.id);
      }
      const res = await api.post(endpoint, { rejectionReason: reason });
      return res.data;
    },
    onSuccess: () => {
      success("Rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowRejectModal(false);
      setReviewModalOpen(false);
      setSelectedSubmission(null);
      setRejectionReason("");
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to reject");
    },
  });

  const handleApprove = (submission: Submission) => {
    if (
      window.confirm(`Are you sure you want to approve "${submission.title}"?`)
    ) {
      approveMutation.mutate(submission);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }
    if (selectedSubmission) {
      rejectMutation.mutate({
        submission: selectedSubmission,
        reason: rejectionReason,
      });
    }
  };

  const openReviewModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  };

  const getEntityPath = (submission: Submission) => {
    if (submission.entityType === "COURSE") {
      return `/admin/courses/view?courseId=${submission.id}`;
    } else if (submission.entityType === "CHAPTER") {
      return `/admin/chapters/view?chapterId=${submission.id}`;
    } else {
      return `/admin/lessons/view?lessonId=${submission.id}`;
    }
  };

  const totalSubmissions = data?.data?.total || 0;
  const filterOptions = [
    { value: undefined, label: "All Types" },
    { value: "COURSE" as const, label: "Courses" },
    { value: "CHAPTER" as const, label: "Chapters" },
    { value: "LESSON" as const, label: "Lessons" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with queue count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-up">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                Submissions
              </h1>
              {totalSubmissions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-[var(--primary)]/20 to-[var(--ring)]/20 text-[var(--primary)] border border-[var(--primary)]/30 animate-pulse-glow">
                  <Sparkles className="w-3.5 h-3.5" />
                  {totalSubmissions} pending
                </span>
              )}
            </div>
            <p className="text-[var(--muted-foreground)] mt-1">
              Review and approve or reject submitted content
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="theme-card-premium p-2 mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="relative z-10 flex items-center gap-1 flex-wrap">
            <div className="flex items-center gap-2 px-3 text-[var(--muted-foreground)]">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Filter:</span>
            </div>
            {filterOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setEntityFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  entityFilter === opt.value
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Loading submissions...
            </p>
          </div>
        ) : !data?.data?.submissions?.length ? (
          <div className="text-center py-16 theme-card-premium rounded-2xl animate-scale-in">
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center">
                <Inbox className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                All caught up! 🎉
              </h3>
              <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                There are no pending submissions to review. Check back later for new content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {data.data.submissions.map((submission, index) => {
                const config = entityTypeConfig[submission.entityType];
                const EntityIcon = config.icon;

                return (
                  <div
                    key={submission.id}
                    className="theme-card-premium theme-card-shimmer group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl animate-slide-in-right"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="relative z-10 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Entity Icon */}
                          <div
                            className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110`}
                          >
                            <EntityIcon className="h-6 w-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                {submission.title}
                              </h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                                {config.label}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-pulse" />
                                SUBMITTED
                              </span>
                            </div>

                            {submission.description && (
                              <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                                {submission.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                              {submission.submittedBy && (
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" />
                                  <span>
                                    Contributor: {submission.submittedBy.slice(0, 8)}...
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  Submitted{" "}
                                  {submission.submittedAt
                                    ? new Date(
                                        submission.submittedAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => router.push(getEntityPath(submission), submission.title)}
                            className="px-4 py-2.5 theme-btn-secondary rounded-xl text-sm flex items-center gap-2 hover:scale-105 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => openReviewModal(submission)}
                            className="px-4 py-2.5 theme-btn rounded-xl text-sm flex items-center gap-2 hover:scale-105 transition-all"
                          >
                            <ArrowRight className="h-4 w-4" />
                            <span className="hidden sm:inline">Review</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {data.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="theme-btn-secondary px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-[var(--muted-foreground)] font-medium">
                  Page {page} of {data.data.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.data.totalPages, p + 1))
                  }
                  disabled={page >= data.data.totalPages}
                  className="theme-btn-secondary px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Review Modal */}
        <Modal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSubmission(null);
            setRejectionReason("");
          }}
        >
          <div className="p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">
              Review {selectedSubmission?.entityType}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Carefully review the content before approving or rejecting
            </p>
            {selectedSubmission && (
              <div className="space-y-5">
                <div className="theme-card-premium p-5 rounded-xl">
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-3">
                      {(() => {
                        const config = entityTypeConfig[selectedSubmission.entityType];
                        return (
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                            <config.icon className="h-5 w-5" />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="font-semibold text-lg text-[var(--foreground)]">
                          {selectedSubmission.title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {selectedSubmission.entityType} • Submitted{" "}
                          {selectedSubmission.submittedAt
                            ? new Date(
                                selectedSubmission.submittedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {selectedSubmission.description && (
                      <p className="text-sm text-[var(--foreground)] leading-relaxed">
                        {selectedSubmission.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    disabled={approveMutation.isPending}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:scale-[1.02]"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold hover:scale-[1.02]"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          open={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        >
          <div className="p-6 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Reject Submission
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  This will notify the contributor
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection. This will be sent to the contributor..."
                  className="theme-input w-full min-h-[120px] resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 theme-btn-secondary py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:scale-[1.02]"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
