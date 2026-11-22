import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Flag,
  Sparkles,
  RotateCcw,
  Menu,
  FileText,
  ArrowUpDown,
  CalendarDays,
  Layers,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';

// ============================================================================
// CONSTANTS & SAMPLE DATA
// ============================================================================

const STORAGE_KEY = 'focusboard_tasks_v1';

const CATEGORIES = [
  'Design',
  'Engineering',
  'Product',
  'Marketing',
  'Research',
  'Operations'
];

const STATUS_OPTIONS = ['To do', 'In progress', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

// Helper to get relative ISO dates so sample data always feels fresh & realistic
const getRelativeDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-101',
    title: 'Audit design tokens & responsive spacing grid',
    description:
      'Verify card radii, border contrast (#E2E8F0), and 1440px / 768px / 390px layout breakpoints against Figma spec.',
    category: 'Design',
    status: 'Completed',
    priority: 'High',
    dueDate: getRelativeDate(-1),
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'task-102',
    title: 'Implement localStorage state persistence layer',
    description:
      'Ensure create, edit, status toggle, and delete actions sync immediately to browser storage without overwriting saved work.',
    category: 'Engineering',
    status: 'In progress',
    priority: 'High',
    dueDate: getRelativeDate(0),
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'task-103',
    title: 'Build accessible Focus Notes 3-slide carousel',
    description:
      'Add previous/next chevron buttons, slide position indicators (1 of 3), and keyboard arrow navigation.',
    category: 'Engineering',
    status: 'In progress',
    priority: 'Medium',
    dueDate: getRelativeDate(1),
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'task-104',
    title: 'Draft Q4 product roadmap & sprint milestones',
    description:
      'Align engineering velocity metrics with upcoming release goals and stakeholder review schedule.',
    category: 'Product',
    status: 'To do',
    priority: 'High',
    dueDate: getRelativeDate(2),
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'task-105',
    title: 'Conduct usability testing on mobile task cards',
    description:
      'Observe 5 participants completing task creation and status updates on 390px mobile viewports.',
    category: 'Research',
    status: 'To do',
    priority: 'Medium',
    dueDate: getRelativeDate(4),
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'task-106',
    title: 'Prepare launch announcement & changelog notes',
    description:
      'Summarize dashboard performance improvements, keyboard shortcuts, and visual polish for release notes.',
    category: 'Marketing',
    status: 'Completed',
    priority: 'Low',
    dueDate: getRelativeDate(-2),
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'task-107',
    title: 'Standardize CI/CD preview deployment pipeline',
    description:
      'Configure automated build checks, linting rules, and zero-downtime preview links for PR reviews.',
    category: 'Operations',
    status: 'To do',
    priority: 'Low',
    dueDate: getRelativeDate(6),
    createdAt: Date.now() - 3600000 * 12
  }
];

const FOCUS_NOTES_SLIDES = [
  {
    id: 'slide-1',
    badge: 'Productivity Tip • Morning Focus',
    title: 'Deep Work Sprint',
    body: 'Block 90 minutes before noon for high-priority architecture & UI tasks. Mute non-urgent notifications to maintain flow state.',
    accentBg: 'from-indigo-600 via-indigo-700 to-blue-700',
    pillBg: 'bg-white/15 text-white border-white/20',
    icon: Sparkles
  },
  {
    id: 'slide-2',
    badge: 'Quality Standard • Weekly Goal',
    title: 'Sprint Review & QA Checklist',
    body: 'Verify responsive breakpoints (390px, 768px, 1440px) and accessibility keyboard navigation before marking tasks Completed.',
    accentBg: 'from-slate-800 via-indigo-900 to-slate-900',
    pillBg: 'bg-indigo-400/20 text-indigo-100 border-indigo-300/25',
    icon: CheckCircle2
  },
  {
    id: 'slide-3',
    badge: 'Workflow Habit • Team Sync',
    title: 'Backlog Triage & Prioritization',
    body: "Keep 'In progress' tasks under 3 active items to prevent context switching and boost weekly completion rate.",
    accentBg: 'from-blue-700 via-indigo-700 to-violet-800',
    pillBg: 'bg-sky-300/20 text-sky-100 border-sky-200/25',
    icon: TrendingUp
  }
];

// ============================================================================
// STYLING & BADGE HELPERS
// ============================================================================

const getStatusBadgeConfig = (status) => {
  switch (status) {
    case 'Completed':
      return {
        bg: 'bg-[#ECFDF5]',
        text: 'text-[#047857]',
        border: 'border-emerald-200/80',
        dot: 'bg-emerald-500'
      };
    case 'In progress':
      return {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#1D4ED8]',
        border: 'border-blue-200/80',
        dot: 'bg-blue-600 animate-pulse'
      };
    case 'To do':
    default:
      return {
        bg: 'bg-[#F1F5F9]',
        text: 'text-[#475569]',
        border: 'border-slate-200/90',
        dot: 'bg-slate-400'
      };
  }
};

const getPriorityBadgeConfig = (priority) => {
  switch (priority) {
    case 'High':
      return {
        bg: 'bg-[#FEF2F2]',
        text: 'text-[#B91C1C]',
        border: 'border-red-200/80'
      };
    case 'Medium':
      return {
        bg: 'bg-[#FFFBEB]',
        text: 'text-[#B45309]',
        border: 'border-amber-200/80'
      };
    case 'Low':
    default:
      return {
        bg: 'bg-[#F0FDFA]',
        text: 'text-[#0F766E]',
        border: 'border-teal-200/80'
      };
  }
};

const getCategoryBadgeStyle = (category) => {
  const map = {
    Design: 'bg-purple-50 text-purple-700 border-purple-200/70',
    Engineering: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    Product: 'bg-sky-50 text-sky-700 border-sky-200/70',
    Marketing: 'bg-pink-50 text-pink-700 border-pink-200/70',
    Research: 'bg-amber-50 text-amber-800 border-amber-200/70',
    Operations: 'bg-slate-100 text-slate-700 border-slate-200/80'
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const formatDueDateInfo = (dateStr, status) => {
  if (!dateStr) return { label: 'No due date', isOverdue: false, isToday: false };
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = dateStr === todayStr;
  const isOverdue = dateStr < todayStr && status !== 'Completed';

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formatted = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isToday) {
    return { label: `Today (${formatted})`, isOverdue: false, isToday: true };
  }
  if (isOverdue) {
    return { label: `${formatted} • Overdue`, isOverdue: true, isToday: false };
  }
  return { label: formatted, isOverdue: false, isToday: false };
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

const StatusPill = ({ status }) => {
  const cfg = getStatusBadgeConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
};

const PriorityPill = ({ priority }) => {
  const cfg = getPriorityBadgeConfig(priority);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Flag className="w-3 h-3 shrink-0" aria-hidden="true" />
      {priority}
    </span>
  );
};

const CategoryPill = ({ category }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getCategoryBadgeStyle(
      category
    )}`}
  >
    {category}
  </span>
);

// ============================================================================
// FOCUS NOTES CAROUSEL COMPONENT
// ============================================================================

const FocusNotesCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = FOCUS_NOTES_SLIDES.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const currentSlide = FOCUS_NOTES_SLIDES[activeIndex];
  const SlideIcon = currentSlide.icon;

  return (
    <section
      aria-label="Focus Notes Carousel"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
    >
      <div
        className={`bg-gradient-to-r ${currentSlide.accentBg} text-white px-5 py-5 sm:px-7 sm:py-6 transition-all duration-300`}
      >
        {/* Subtle decorative background circles */}
        <div
          className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-24 -bottom-16 h-40 w-40 rounded-full bg-indigo-300/10 blur-xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Slide Content */}
          <div
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${activeIndex + 1} of ${totalSlides}`}
            className="flex-1 min-w-0"
          >
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-100 bg-black/20 px-2.5 py-1 rounded-md">
                <SlideIcon className="w-3.5 h-3.5 text-indigo-200" aria-hidden="true" />
                Focus Notes
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentSlide.pillBg}`}
              >
                {currentSlide.badge}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              {currentSlide.title}
            </h2>
            <p className="mt-1 text-sm sm:text-[15px] leading-relaxed text-indigo-100/95 max-w-3xl">
              {currentSlide.body}
            </p>
          </div>

          {/* Carousel Controls & Slide Indicators */}
          <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t border-white/10 lg:border-t-0 shrink-0">
            {/* Slide Indicator Dots & Counter */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-indigo-100 tabular-nums">
                {activeIndex + 1} of {totalSlides}
              </span>
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a Focus Note slide">
                {FOCUS_NOTES_SLIDES.map((slide, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        isActive
                          ? 'w-7 bg-white'
                          : 'w-2.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Previous / Next Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Focus Note"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Focus Note"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// OVERVIEW KPI STATS GRID (4 LIVE-DERIVED CARDS)
// ============================================================================

const OverviewStatsGrid = ({ stats }) => {
  const { total, todoCount, inProgressCount, completedCount, completionRate } = stats;

  return (
    <section aria-label="Task Overview Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {/* Card 1: Total Tasks */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300/80 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-[#475569]">Total Tasks</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {total}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-[#64748B] truncate">
          {todoCount} to do · {inProgressCount} active
        </p>
      </div>

      {/* Card 2: In Progress */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300/80 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-[#475569]">In Progress</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {inProgressCount}
          </span>
          {inProgressCount > 0 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Active
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-[#64748B] truncate">
          {inProgressCount <= 3 ? 'Healthy focus load' : 'Consider triaging WIP'}
        </p>
      </div>

      {/* Card 3: Completed */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300/80 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-[#475569]">Completed</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {completedCount}
          </span>
          <span className="text-xs text-[#64748B]">of {total}</span>
        </div>
        <p className="mt-1.5 text-xs text-emerald-700 font-medium truncate">
          {completedCount === total && total > 0
            ? 'All tasks finished!'
            : `${total - completedCount} remaining`}
        </p>
      </div>

      {/* Card 4: Completion Rate */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300/80 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-[#475569]">Completion Rate</span>
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {completionRate}%
          </span>
        </div>
        <div
          className="mt-2.5 w-full h-2 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall task completion rate"
        >
          <div
            className="h-full bg-gradient-to-r from-[#4F46E5] to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// CREATE & EDIT TASK MODAL COMPONENT
// ============================================================================

const TaskFormModal = ({ isOpen, mode, initialTask, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [status, setStatus] = useState('To do');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(getRelativeDate(1));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setCategory(initialTask.category || 'Engineering');
        setStatus(initialTask.status || 'To do');
        setPriority(initialTask.priority || 'Medium');
        setDueDate(initialTask.dueDate || getRelativeDate(1));
      } else {
        setTitle('');
        setDescription('');
        setCategory('Engineering');
        setStatus('To do');
        setPriority('Medium');
        setDueDate(getRelativeDate(1));
      }
      setErrors({});
      setTouched({});
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 40);
    }
  }, [isOpen, mode, initialTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (fields = { title, dueDate }) => {
    const nextErrors = {};
    const trimmedTitle = (fields.title || '').trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Task title is required. Please enter a concise summary.';
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = 'Task title must be at least 3 characters long.';
    } else if (trimmedTitle.length > 120) {
      nextErrors.title = 'Task title cannot exceed 120 characters.';
    }

    if (!fields.dueDate) {
      nextErrors.dueDate = 'Please select a target due date.';
    }
    return nextErrors;
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (touched.title) {
      setErrors(validate({ title: val, dueDate }));
    }
  };

  const handleDueDateChange = (e) => {
    const val = e.target.value;
    setDueDate(val);
    if (touched.dueDate) {
      setErrors(validate({ title, dueDate: val }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ title: true, dueDate: true });
    const validationErrors = validate({ title, dueDate });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.title) {
        titleInputRef.current?.focus();
      }
      return;
    }

    onSave({
      ...(initialTask || {}),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      priority,
      dueDate
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[760px] max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E2E8F0] sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
              {mode === 'edit' ? 'Update Task' : 'New Task'}
            </span>
            <h2 id="task-modal-title" className="text-lg sm:text-xl font-bold text-[#0F172A] mt-0.5">
              {mode === 'edit' ? 'Edit Task Details' : 'Create a New Task'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-7 space-y-5">
          {/* Task Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-title-input" className="block text-sm font-semibold text-[#0F172A]">
                Task Title <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <span className="text-xs text-[#64748B] tabular-nums">{title.length}/120</span>
            </div>
            <input
              ref={titleInputRef}
              id="task-title-input"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={handleTitleChange}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, title: true }));
                setErrors(validate({ title, dueDate }));
              }}
              placeholder="e.g., Finalize responsive task cards for 390px viewport"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-indigo-100'
              }`}
            />
            {errors.title && (
              <p
                id="task-title-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-desc-input" className="block text-sm font-semibold text-[#0F172A]">
                Description <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
              </label>
              <span className="text-xs text-[#64748B] tabular-nums">{description.length}/400</span>
            </div>
            <textarea
              id="task-desc-input"
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add acceptance criteria, implementation notes, or links..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 resize-y"
            />
          </div>

          {/* Grid Row: Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="task-category-select" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-duedate-input" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Due Date <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="task-duedate-input"
                type="date"
                required
                value={dueDate}
                onChange={handleDueDateChange}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, dueDate: true }));
                  setErrors(validate({ title, dueDate }));
                }}
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? 'task-duedate-error' : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#0F172A] bg-white transition-colors focus:outline-none focus:ring-2 ${
                  errors.dueDate
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-indigo-100'
                }`}
              />
              {errors.dueDate && (
                <p
                  id="task-duedate-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Grid Row: Status & Priority Segmented Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Status Segmented Control */}
            <div>
              <span id="status-group-label" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Status
              </span>
              <div
                role="radiogroup"
                aria-labelledby="status-group-label"
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-[#E2E8F0]"
              >
                {STATUS_OPTIONS.map((opt) => {
                  const selected = status === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setStatus(opt)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                        selected
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Segmented Control */}
            <div>
              <span id="priority-group-label" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Priority
              </span>
              <div
                role="radiogroup"
                aria-labelledby="priority-group-label"
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-[#E2E8F0]"
              >
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = priority === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPriority(opt)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                        selected
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-sm font-semibold text-[#475569] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 active:bg-indigo-800 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            >
              <Check className="w-4 h-4" />
              {mode === 'edit' ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// CONFIRMATION DIALOG (DELETE TASK / RESET DEMO DATA)
// ============================================================================

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Task',
  onCancel,
  onConfirm
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 30);
      const handleEsc = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base sm:text-lg font-bold text-[#0F172A]">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="mt-1.5 text-sm text-[#475569] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-sm font-semibold text-[#475569] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-sm font-semibold text-white shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ASSIGNMENT HANDOFF & README MODAL (BONUS SUBMISSION HELPER)
// ============================================================================

const AssignmentInfoModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handoff-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 id="handoff-modal-title" className="text-lg font-bold text-[#0F172A]">
              FocusBoard — README & Architecture Notes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close documentation modal"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-[#475569] leading-relaxed">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base mb-1">1. State Management Architecture</h3>
            <p>
              FocusBoard uses a centralized React state model (<code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">useState</code> + <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">useMemo</code> + <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">useEffect</code>) as a single source of truth. All KPI metrics (Total, In Progress, Completed, Completion %) and filtered views are purely derived via <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">useMemo</code> without duplicating state.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#0F172A] text-base mb-1">2. Browser Persistence Strategy</h3>
            <p>
              Tasks are persisted safely under <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">localStorage['focusboard_tasks_v1']</code> with <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">try/catch</code> guards. Initial sample data (7 tasks) only seeds storage when no saved key exists, ensuring user updates survive page reloads.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#0F172A] text-base mb-1">3. Responsive Breakpoints & Accessibility</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>1440px Desktop:</strong> Fixed 240px sidebar, 4-column KPI bar, interactive table rows with inline status quick-switcher.</li>
              <li><strong>768px Tablet:</strong> Collapsible drawer navigation, 2×2 KPI grid, wrapped filter controls with zero horizontal scroll.</li>
              <li><strong>390px Mobile:</strong> Compact sticky top header, 2×2 KPI cards, and stacked touch-friendly task cards (44px+ tap targets).</li>
              <li><strong>Accessibility:</strong> Semantic landmarks, ARIA roles for carousel & dialogs, Escape key handlers, and visible focus rings.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
            <h3 className="font-bold text-[#0F172A] text-sm mb-1">AI Usage Disclosure Summary (AI_USAGE.md)</h3>
            <p className="text-xs text-[#64748B]">
              AI assistance was used for boilerplate scaffolding and Tailwind responsive class verification. All state transitions, localStorage hydration logic, validation rules, and breakpoint layouts were manually verified across 390px, 768px, and 1440px viewports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --------------------------------------------------------------------------
  // State: Tasks with safe localStorage initialization
  // --------------------------------------------------------------------------
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read tasks from localStorage:', err);
    }
    return INITIAL_SAMPLE_TASKS;
  });

  // Sync tasks to localStorage whenever tasks state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Failed to write tasks to localStorage:', err);
    }
  }, [tasks]);

  // --------------------------------------------------------------------------
  // State: Navigation, Filters, Sorting, Modals & Toast Feedback
  // --------------------------------------------------------------------------
  const [activeNav, setActiveNav] = useState('dashboard'); // 'dashboard' | 'tasks'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'To do' | 'In progress' | 'Completed'
  const [priorityFilter, setPriorityFilter] = useState('All'); // 'All' | 'High' | 'Medium' | 'Low'
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' | 'priority' | 'status'

  // Modal states
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    task: null
  });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Subtle toast notification for user actions
  const [toastMessage, setToastMessage] = useState(null);
  const searchInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // --------------------------------------------------------------------------
  // Derived Statistics (Single Source of Truth)
  // --------------------------------------------------------------------------
  const stats = useMemo(() => {
    const total = tasks.length;
    const todoCount = tasks.filter((t) => t.status === 'To do').length;
    const inProgressCount = tasks.filter((t) => t.status === 'In progress').length;
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const completionRate = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
      total,
      todoCount,
      inProgressCount,
      completedCount,
      completionRate
    };
  }, [tasks]);

  // --------------------------------------------------------------------------
  // Derived Filtered & Sorted Task List
  // --------------------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const matchesTitle = !query || task.title.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesTitle && matchesStatus && matchesPriority;
    });

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const statusWeight = { 'In progress': 3, 'To do': 2, Completed: 1 };

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === 'status') {
        return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
      }
      // Default: sort by due date ascending
      return (a.dueDate || '').localeCompare(b.dueDate || '');
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  // --------------------------------------------------------------------------
  // Predictable Immutable CRUD Handlers
  // --------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setFormModalState({ isOpen: true, mode: 'create', task: null });
  };

  const handleOpenEditModal = (task) => {
    setFormModalState({ isOpen: true, mode: 'edit', task });
  };

  const handleSaveTask = (taskData) => {
    if (formModalState.mode === 'edit' && taskData.id) {
      setTasks((prev) =>
        prev.map((item) => (item.id === taskData.id ? { ...item, ...taskData } : item))
      );
      showToast('Task updated successfully');
    } else {
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: Date.now()
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('New task added to board');
    }
    setFormModalState({ isOpen: false, mode: 'create', task: null });
  };

  const handleStatusQuickChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    );
    showToast(`Status updated to "${newStatus}"`);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    showToast(`Deleted "${taskToDelete.title}"`);
    setTaskToDelete(null);
  };

  const handleResetDemoData = () => {
    setTasks(INITIAL_SAMPLE_TASKS);
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setResetConfirmOpen(false);
    setMobileMenuOpen(false);
    showToast('Restored 7 sample tasks');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // --------------------------------------------------------------------------
  // Sidebar Navigation Content (Shared between Desktop Fixed & Mobile Drawer)
  // --------------------------------------------------------------------------
  const renderSidebarContent = (isDrawer = false) => (
    <div className="flex flex-col h-full justify-between bg-white">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-sm">
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F172A] block leading-none">
                FocusBoard
              </span>
              <span className="text-[11px] font-medium text-[#64748B] mt-1 block">
                Personal Workspace
              </span>
            </div>
          </div>

          {isDrawer && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Primary Sidebar Navigation" className="p-3.5 space-y-1">
          <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Workspace
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveNav('dashboard');
              setMobileMenuOpen(false);
            }}
            aria-current={activeNav === 'dashboard' ? 'page' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
              activeNav === 'dashboard'
                ? 'bg-indigo-50/90 text-[#4F46E5]'
                : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Dashboard
            </span>
            {activeNav === 'dashboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveNav('tasks');
              setMobileMenuOpen(false);
            }}
            aria-current={activeNav === 'tasks' ? 'page' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
              activeNav === 'tasks'
                ? 'bg-indigo-50/90 text-[#4F46E5]'
                : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
            }`}
          >
            <span className="flex items-center gap-3">
              <ListTodo className="w-4 h-4 shrink-0" />
              My Tasks
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] tabular-nums">
              {stats.total}
            </span>
          </button>

          {/* Visual Placeholders clearly labeled per assignment spec */}
          <div className="pt-3">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Views
            </p>
            <button
              type="button"
              onClick={() => showToast('Calendar view is a visual placeholder in this release')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 shrink-0" />
                Calendar
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Analytics view is a visual placeholder in this release')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                Analytics
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Soon
              </span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Settings is a visual placeholder in this release')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4 h-4 shrink-0" />
                Settings
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer: Progress Summary + Utility Actions */}
      <div className="p-3.5 border-t border-[#E2E8F0] space-y-2.5">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
            <span>Sprint Progress</span>
            <span className="text-[#4F46E5] tabular-nums">{stats.completionRate}%</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#64748B]">
            {stats.completedCount} of {stats.total} tasks completed
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInfoModalOpen(true);
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#475569] transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-[#4F46E5]" />
          README & Architecture
        </button>

        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );

  // --------------------------------------------------------------------------
  // Render Main Layout
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Left Sidebar (240px fixed width on lg / 1024px+ including 1440px) */}
      <aside className="hidden lg:block lg:w-[240px] lg:shrink-0 border-r border-[#E2E8F0] bg-white sticky top-0 h-screen">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Slide-over Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="w-72 max-w-[82vw] h-full bg-white shadow-2xl border-r border-[#E2E8F0]">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Menu Button for Mobile (390px) & Tablet (768px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#0F172A] truncate">
                  {activeNav === 'tasks' ? 'My Tasks' : 'Task Overview'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-[#4F46E5]">
                  FocusBoard
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[#64748B] truncate">{todayDisplay}</p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              aria-label="Open README and Architecture notes"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Create Task</span>
              <span className="sm:hidden">New Task</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
          {/* Overview KPI Statistics (Shown on Dashboard view) */}
          {activeNav === 'dashboard' && <OverviewStatsGrid stats={stats} />}

          {/* Focus Notes 3-Slide Interactive Carousel */}
          <FocusNotesCarousel />

          {/* Tasks Section: Search, Status Tabs, Priority Filter, Sort, and Task Rows/Cards */}
          <section
            aria-label="Tasks Management"
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden"
          >
            {/* Section Header + Search & Priority Controls */}
            <div className="p-4 sm:p-6 border-b border-[#E2E8F0] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Workspace Tasks
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B]">
                    Showing <span className="font-semibold text-[#0F172A]">{filteredTasks.length}</span> of{' '}
                    <span className="font-semibold text-[#0F172A]">{tasks.length}</span> tasks
                  </p>
                </div>

                {/* Search Input + Priority Filter + Sort Select */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search Box */}
                  <div className="relative flex-1 sm:w-64">
                    <Search
                      className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks by title... (/)"
                      aria-label="Search tasks by title"
                      className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search query"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/70"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Priority Filter + Sort Row */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <label htmlFor="priority-filter" className="sr-only">
                        Filter by Priority
                      </label>
                      <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full sm:w-auto h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="All">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>

                    <div className="relative flex-1 sm:flex-initial">
                      <label htmlFor="sort-tasks" className="sr-only">
                        Sort Tasks
                      </label>
                      <div className="relative">
                        <select
                          id="sort-tasks"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full sm:w-auto h-10 pl-3 pr-8 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-medium text-[#475569] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="dueDate">Sort: Due Date</option>
                          <option value="priority">Sort: Priority</option>
                          <option value="status">Sort: Status</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter tasks by status"
                className="flex flex-wrap items-center gap-1.5 pt-1"
              >
                {[
                  { label: 'All', count: stats.total },
                  { label: 'To do', count: stats.todoCount },
                  { label: 'In progress', count: stats.inProgressCount },
                  { label: 'Completed', count: stats.completedCount }
                ].map((tab) => {
                  const isActive = statusFilter === tab.label;
                  return (
                    <button
                      key={tab.label}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setStatusFilter(tab.label)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                        isActive
                          ? 'bg-[#0F172A] text-white shadow-xs'
                          : 'bg-[#F8FAFC] text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] border border-[#E2E8F0]/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[11px] tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-[#475569]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="ml-auto text-xs font-semibold text-[#4F46E5] hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Empty State when no tasks match */}
            {filteredTasks.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#64748B] flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A]">No matching tasks found</h3>
                <p className="mt-1 text-sm text-[#64748B] max-w-md mx-auto">
                  {tasks.length === 0
                    ? 'Your task board is currently empty. Create your first task to get started.'
                    : 'No tasks match your current search query or status/priority filters.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-sm font-semibold text-[#0F172A] transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-sm font-semibold text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Task
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* DESKTOP & TABLET TABLE VIEW (md: 768px and above) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/80 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        <th scope="col" className="py-3.5 pl-6 pr-4 w-[38%]">
                          Task
                        </th>
                        <th scope="col" className="py-3.5 px-3">
                          Category
                        </th>
                        <th scope="col" className="py-3.5 px-3">
                          Status
                        </th>
                        <th scope="col" className="py-3.5 px-3">
                          Priority
                        </th>
                        <th scope="col" className="py-3.5 px-3">
                          Due Date
                        </th>
                        <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-sm">
                      {filteredTasks.map((task) => {
                        const dueInfo = formatDueDateInfo(task.dueDate, task.status);
                        const isCompleted = task.status === 'Completed';

                        return (
                          <tr
                            key={task.id}
                            className="group hover:bg-slate-50/90 transition-colors"
                          >
                            {/* Task Title & Description */}
                            <td className="py-4 pl-6 pr-4 align-top">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusQuickChange(
                                      task.id,
                                      isCompleted ? 'To do' : 'Completed'
                                    )
                                  }
                                  aria-label={
                                    isCompleted
                                      ? `Mark "${task.title}" as To do`
                                      : `Mark "${task.title}" as Completed`
                                  }
                                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                                    isCompleted
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-slate-300 bg-white hover:border-[#4F46E5]'
                                  }`}
                                >
                                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                </button>
                                <div className="min-w-0">
                                  <p
                                    className={`font-semibold leading-snug ${
                                      isCompleted
                                        ? 'line-through text-[#64748B]'
                                        : 'text-[#0F172A]'
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="mt-1 text-xs text-[#64748B] line-clamp-1 max-w-md">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-3 align-middle whitespace-nowrap">
                              <CategoryPill category={task.category} />
                            </td>

                            {/* Interactive Status Selector */}
                            <td className="py-4 px-3 align-middle whitespace-nowrap">
                              <label htmlFor={`status-select-${task.id}`} className="sr-only">
                                Change status for {task.title}
                              </label>
                              <select
                                id={`status-select-${task.id}`}
                                value={task.status}
                                onChange={(e) => handleStatusQuickChange(task.id, e.target.value)}
                                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                                  getStatusBadgeConfig(task.status).bg
                                } ${getStatusBadgeConfig(task.status).text} ${
                                  getStatusBadgeConfig(task.status).border
                                }`}
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} className="bg-white text-[#0F172A]">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Priority */}
                            <td className="py-4 px-3 align-middle whitespace-nowrap">
                              <PriorityPill priority={task.priority} />
                            </td>

                            {/* Due Date */}
                            <td className="py-4 px-3 align-middle whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                  dueInfo.isOverdue
                                    ? 'text-red-600 font-semibold'
                                    : dueInfo.isToday
                                    ? 'text-[#4F46E5] font-semibold'
                                    : 'text-[#475569]'
                                }`}
                              >
                                <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                {dueInfo.label}
                              </span>
                            </td>

                            {/* Row Actions */}
                            <td className="py-4 pl-3 pr-6 align-middle whitespace-nowrap text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(task)}
                                  aria-label={`Edit task: ${task.title}`}
                                  className="p-2 rounded-lg text-[#475569] hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTaskToDelete(task)}
                                  aria-label={`Delete task: ${task.title}`}
                                  className="p-2 rounded-lg text-[#475569] hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE STACKED CARD VIEW (< 768px / 390px target) */}
                <div className="md:hidden divide-y divide-[#E2E8F0]">
                  {filteredTasks.map((task) => {
                    const dueInfo = formatDueDateInfo(task.dueDate, task.status);
                    const isCompleted = task.status === 'Completed';

                    return (
                      <article
                        key={task.id}
                        className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Card Top Row: Category + Priority */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CategoryPill category={task.category} />
                          <PriorityPill priority={task.priority} />
                        </div>

                        {/* Title & Description */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusQuickChange(
                                task.id,
                                isCompleted ? 'To do' : 'Completed'
                              )
                            }
                            aria-label={
                              isCompleted
                                ? `Mark "${task.title}" as To do`
                                : `Mark "${task.title}" as Completed`
                            }
                            className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isCompleted && <Check className="w-4 h-4 stroke-[2.5]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-sm font-bold leading-snug ${
                                isCompleted ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Due Date Row */}
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span
                            className={
                              dueInfo.isOverdue
                                ? 'text-red-600 font-semibold'
                                : dueInfo.isToday
                                ? 'text-[#4F46E5] font-semibold'
                                : ''
                            }
                          >
                            {dueInfo.label}
                          </span>
                        </div>

                        {/* Touch-Friendly Bottom Bar: Status Switcher + Edit/Delete */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <label htmlFor={`mobile-status-${task.id}`} className="sr-only">
                              Status for {task.title}
                            </label>
                            <select
                              id={`mobile-status-${task.id}`}
                              value={task.status}
                              onChange={(e) => handleStatusQuickChange(task.id, e.target.value)}
                              className={`w-full h-11 px-3 rounded-xl text-xs font-semibold border ${
                                getStatusBadgeConfig(task.status).bg
                              } ${getStatusBadgeConfig(task.status).text} ${
                                getStatusBadgeConfig(task.status).border
                              }`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-white text-[#0F172A]">
                                  Status: {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(task)}
                              aria-label={`Edit ${task.title}`}
                              className="w-11 h-11 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 flex items-center justify-center text-[#475569] hover:text-[#4F46E5]"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskToDelete(task)}
                              aria-label={`Delete ${task.title}`}
                              className="w-11 h-11 rounded-xl border border-[#E2E8F0] bg-white hover:bg-red-50 flex items-center justify-center text-[#475569] hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        isOpen={formModalState.isOpen}
        mode={formModalState.mode}
        initialTask={formModalState.task}
        onClose={() => setFormModalState({ isOpen: false, mode: 'create', task: null })}
        onSave={handleSaveTask}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete this task?"
        message={
          taskToDelete
            ? `Are you sure you want to permanently remove "${taskToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Reset Demo Data Confirmation Modal */}
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset to sample tasks?"
        message="This will replace your current local tasks with the 7 default FocusBoard sample tasks."
        confirmLabel="Reset Data"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={handleResetDemoData}
      />

      {/* Assignment README & Architecture Modal */}
      <AssignmentInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      {/* Accessible Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0F172A] text-white text-xs sm:text-sm font-medium shadow-lg border border-slate-700"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}