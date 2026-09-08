"use client";

import { useState } from "react";
import {
  useGetMessagesQuery,
  useToggleReadMessageMutation,
  useDeleteMessageMutation,
  MessageItem,
} from "@/redux/api/message.api";
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Inbox,
  Clock,
  Send,
  User,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function AdminMessagesPage() {
  const { data, isLoading, isFetching, refetch } = useGetMessagesQuery();
  const [toggleRead, { isLoading: isToggling }] = useToggleReadMessageMutation();
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const messages = data?.messages || [];
  const unreadCount = data?.unreadCount ?? messages.filter((m) => !m.isRead).length;

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "unread") return !msg.isRead;
    if (statusFilter === "read") return msg.isRead;
    return true;
  });

  const handleToggleRead = async (msg: MessageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await toggleRead({ id: msg._id, isRead: !msg.isRead }).unwrap();
      if (selectedMessage && selectedMessage._id === msg._id) {
        setSelectedMessage({ ...selectedMessage, isRead: !msg.isRead });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.data?.message || "Failed to update message status",
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    setDeletingId(id);
    try {
      await deleteMessage(id).unwrap();
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      setFeedback({ type: "success", message: "Message deleted successfully." });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.data?.message || "Failed to delete message",
      });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectMessage = (msg: MessageItem) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      toggleRead({ id: msg._id, isRead: true });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Customer Inquiries & Messages
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#ff6b00] px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-white/40 mt-1">
            Read, manage, and respond to incoming inquiries from the Contact Us page.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-white/80 hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-black/10 dark:border-white/[0.08] pb-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-4 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 outline-none focus:border-[#ff6b00]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start">
          {[
            { id: "all", label: `All (${messages.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "read", label: `Read (${messages.length - unreadCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#ff6b00] text-white"
                  : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-white/60 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#ff6b00]" size={36} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMessages.length === 0 && (
        <div className="rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-400 dark:text-white/30">
            <Inbox size={32} />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No Messages Found
          </h3>
          <p className="mt-1 text-xs text-neutral-500 dark:text-white/40 max-w-sm mx-auto">
            {searchQuery
              ? "No inquiries matched your search keyword."
              : "You do not have any incoming inquiries at the moment."}
          </p>
        </div>
      )}

      {/* Messages Layout: Master-Detail */}
      {!isLoading && filteredMessages.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* List Column */}
          <div className={`${selectedMessage ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?._id === msg._id;
              return (
                <div
                  key={msg._id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#ff6b00] bg-[#ff6b00]/5 shadow-sm"
                      : msg.isRead
                      ? "border-black/10 dark:border-white/[0.06] bg-white dark:bg-[#0c0c0c] hover:border-black/20 dark:hover:border-white/20"
                      : "border-[#ff6b00]/40 bg-orange-50/50 dark:bg-[#ff6b00]/5 hover:border-[#ff6b00]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff6b00]" />
                      )}
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {msg.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400 dark:text-white/30 shrink-0">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-neutral-800 dark:text-white/90 truncate">
                    {msg.subject || "General Inquiry"}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500 dark:text-white/50 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-black/5 dark:border-white/[0.04] pt-2 text-[11px] text-neutral-400 dark:text-white/40">
                    <span className="truncate max-w-[180px]">{msg.email}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleRead(msg, e)}
                        className="rounded-lg p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        title={msg.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {msg.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
                      </button>

                      <button
                        onClick={(e) => handleDelete(msg._id, e)}
                        disabled={deletingId === msg._id}
                        className="rounded-lg p-1 text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete message"
                      >
                        {deletingId === msg._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details Column */}
          {selectedMessage && (
            <div className="lg:col-span-7">
              <div className="sticky top-20 rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c0c0c] p-6 sm:p-8 space-y-6 shadow-sm">
                {/* Detail Header */}
                <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/[0.08] pb-5">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {selectedMessage.subject || "General Inquiry"}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-white/50">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-[#ff6b00]" />
                        <span className="font-semibold text-neutral-800 dark:text-white">
                          {selectedMessage.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} className="text-[#ff6b00]" />
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="hover:text-[#ff6b00] underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-white/80 hover:bg-neutral-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      {selectedMessage.isRead ? (
                        <>
                          <Mail size={14} /> Mark Unread
                        </>
                      ) : (
                        <>
                          <MailOpen size={14} /> Mark Read
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      disabled={deletingId === selectedMessage._id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      {deletingId === selectedMessage._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30">
                    Message Content
                  </span>
                  <div className="rounded-xl border border-black/5 dark:border-white/[0.04] bg-neutral-50 dark:bg-white/[0.02] p-5 text-sm leading-relaxed text-neutral-800 dark:text-white/90 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply Action */}
                <div className="border-t border-black/10 dark:border-white/[0.08] pt-5">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject || "General Inquiry"
                    )}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ff6b00] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e05e00] transition-colors cursor-pointer"
                  >
                    <Send size={14} />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
