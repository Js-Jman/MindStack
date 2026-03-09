"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

type Submission = {
  id: number;
  submissionText: string | null;
  fileUrl: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
};

type Props = {
  assignmentId: number;
  assignmentTitle: string;
  assignmentDescription: string | null;
  dueDate: string | null;
};

export default function AssignmentSubmissionForm({
  assignmentId,
  assignmentTitle,
  assignmentDescription,
  dueDate,
}: Props) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    submissionText: "",
    fileUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  async function fetchSubmission() {
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (!res.ok) {
        throw new Error("Failed to fetch submission");
      }
      const data = await res.json();
      setSubmission(data.submission);
      if (data.submission) {
        setFormData({
          submissionText: data.submission.submissionText || "",
          fileUrl: data.submission.fileUrl || "",
        });
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.submissionText.trim() && !formData.fileUrl.trim()) {
      setError("Please provide either submission text or a file URL");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit assignment");
      }

      const data = await res.json();
      setSubmission(data.submission);
      setSuccess(submission ? "Assignment resubmitted successfully!" : "Assignment submitted successfully!");
      setShowForm(false);
      await fetchSubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const isPastDue = dueDate && new Date(dueDate) < new Date();
  const isGraded = submission?.grade !== null && submission?.grade !== undefined;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{assignmentTitle}</h4>
          <p className="text-sm text-gray-600 mt-2">
            {assignmentDescription || "Complete this assignment based on the lesson material."}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${
            isPastDue
              ? "bg-red-50 text-red-700 border-red-100"
              : "bg-purple-50 text-purple-700 border-purple-100"
          }`}
        >
          {dueDate ? `Due ${new Date(dueDate).toLocaleDateString()}` : "No due date"}
        </span>
      </div>

      {/* Submission Status */}
      {submission && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {isGraded ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-semibold text-gray-900">
              {isGraded ? "Graded" : "Submitted - Awaiting Grade"}
            </span>
          </div>

          {submission.submissionText && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Your Submission:</p>
              <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                {submission.submissionText}
              </p>
            </div>
          )}

          {submission.fileUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">File URL:</p>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {submission.fileUrl}
              </a>
            </div>
          )}

          {submission.submittedAt && (
            <p className="text-xs text-gray-500">
              Submitted on {new Date(submission.submittedAt).toLocaleString()}
            </p>
          )}

          {isGraded && (
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Grade:</span>
                <span className="text-lg font-bold text-green-600">{submission.grade}/100</span>
              </div>
              {submission.feedback && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Instructor Feedback:</p>
                  <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                    {submission.feedback}
                  </p>
                </div>
              )}
              {submission.gradedAt && (
                <p className="text-xs text-gray-500">
                  Graded on {new Date(submission.gradedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submission Form */}
      {(!submission || showForm) && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div>
            <label htmlFor={`text-${assignmentId}`} className="block text-sm font-semibold text-gray-700 mb-2">
              Submission Text
            </label>
            <textarea
              id={`text-${assignmentId}`}
              value={formData.submissionText}
              onChange={(e) => setFormData({ ...formData, submissionText: e.target.value })}
              placeholder="Write your submission here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
            />
          </div>

          <div>
            <label htmlFor={`url-${assignmentId}`} className="block text-sm font-semibold text-gray-700 mb-2">
              File URL (GitHub, Google Drive, etc.)
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                id={`url-${assignmentId}`}
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileText className="w-4 h-4" />
              {submitting ? "Submitting..." : submission ? "Resubmit" : "Submit Assignment"}
            </button>
            {submission && showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setFormData({
                    submissionText: submission.submissionText || "",
                    fileUrl: submission.fileUrl || "",
                  });
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Show submit form button if already submitted */}
      {submission && !showForm && !isGraded && (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          Update Submission
        </button>
      )}
    </article>
  );
}
