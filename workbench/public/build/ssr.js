import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useForm, Head, usePage, router, Link, createInertiaApp } from "@inertiajs/react";
import * as React from "react";
import React__default, { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { X, AlertCircle, Loader2, ChevronDown, Send, Clock, MoreVertical, Edit2, Trash2, Reply, MessageSquare, LogOut, User } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import axios from "axios";
import * as ToastPrimitives from "@radix-ui/react-toast";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
function cn$1(...inputs) {
  return twMerge(clsx(inputs));
}
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn$1(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn$1("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h3",
  {
    ref,
    className: cn$1("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "p",
  {
    ref,
    className: cn$1("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn$1("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn$1("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn$1(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
function DebugPanel() {
  var _a;
  const [debugData, setDebugData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const checkDebugbar = () => {
      if (window.phpdebugbar) {
        const openHandler = window.phpdebugbar.openHandler;
        if (openHandler) {
          openHandler.load((data) => {
            setDebugData(data);
          });
        }
      }
    };
    checkDebugbar();
    const timer = setTimeout(checkDebugbar, 500);
    return () => clearTimeout(timer);
  }, []);
  if (!debugData) return null;
  const queries = debugData.queries || [];
  const queryCount = queries.length;
  const totalTime = queries.reduce((sum, q) => sum + (parseFloat(q.duration) || 0), 0);
  const memory = ((_a = debugData.memory) == null ? void 0 : _a.peak_usage_str) || "N/A";
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-50", children: !isOpen ? /* @__PURE__ */ jsxs(
    Button,
    {
      onClick: () => setIsOpen(true),
      className: "shadow-lg",
      variant: "default",
      children: [
        "🐛 Debug (",
        queryCount,
        " queries)"
      ]
    }
  ) : /* @__PURE__ */ jsxs(Card, { className: "w-96 max-h-96 overflow-auto p-4 shadow-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", children: "Debug Info" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => setIsOpen(false),
          variant: "ghost",
          size: "sm",
          children: "✕"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Database Queries" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: queryCount }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
          "Total time: ",
          totalTime.toFixed(2),
          "ms"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: "Memory Usage" }),
        /* @__PURE__ */ jsx("div", { className: "text-lg", children: memory })
      ] }),
      queries.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold mb-2", children: "Recent Queries" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: queries.slice(0, 5).map((query, idx) => /* @__PURE__ */ jsxs("div", { className: "text-xs bg-gray-50 p-2 rounded", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-gray-700 truncate", children: query.sql }),
          /* @__PURE__ */ jsxs("div", { className: "text-gray-500 mt-1", children: [
            query.duration,
            "ms"
          ] })
        ] }, idx)) })
      ] })
    ] })
  ] }) });
}
function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "test@example.com",
    password: "password",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    post("/login");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Login" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Sign in to test reactions" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Use the default credentials below or try other test accounts" })
        ] }),
        /* @__PURE__ */ jsxs("form", { className: "mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md", onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email address" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "email",
                  name: "email",
                  type: "email",
                  autoComplete: "email",
                  required: true,
                  className: "appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                  placeholder: "Email address",
                  value: data.email,
                  onChange: (e) => setData("email", e.target.value)
                }
              ),
              errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  name: "password",
                  type: "password",
                  autoComplete: "current-password",
                  required: true,
                  className: "appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                  placeholder: "Password",
                  value: data.password,
                  onChange: (e) => setData("password", e.target.value)
                }
              ),
              errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.password })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "remember",
                name: "remember",
                type: "checkbox",
                className: "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded",
                checked: data.remember,
                onChange: (e) => setData("remember", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "remember", className: "ml-2 block text-sm text-gray-900", children: "Remember me" })
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50",
              children: processing ? "Signing in..." : "Sign in"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded border border-gray-200", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Test Accounts:" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-xs text-gray-600 space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "• test@example.com / password" }),
              /* @__PURE__ */ jsx("li", { children: "• john@example.com / password" }),
              /* @__PURE__ */ jsx("li", { children: "• jane@example.com / password" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(DebugPanel, {})
    ] })
  ] });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
function ReactionsModal({
  isOpen,
  onClose,
  reactableType,
  reactableId,
  reactionsSummary,
  onUserClick
}) {
  const pageProps = usePage().props;
  const reactionTypes = pageProps.reactionTypes;
  const [activeTab, setActiveTab] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const modalRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      loadReactions(1, false);
    }
  }, [isOpen, activeTab]);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [tabindex="0"]'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement == null ? void 0 : lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement == null ? void 0 : firstElement.focus();
        }
      }
    };
    modalRef.current.addEventListener("keydown", handleTabKey);
    const currentModalRef = modalRef.current;
    return () => currentModalRef == null ? void 0 : currentModalRef.removeEventListener("keydown", handleTabKey);
  }, [isOpen, reactions]);
  const tabs = [
    { key: "all", label: "All", count: Object.values(reactionsSummary).reduce((a, b) => a + b, 0) },
    ...Object.entries(reactionsSummary).filter(([, count2]) => count2 > 0).map(([type, count2]) => ({
      key: type,
      label: reactionTypes[type] || type,
      count: count2
    }))
  ];
  const loadReactions = async (pageNum, append = false) => {
    if (isLoading || isLoadingMore) return;
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }
    try {
      const url = `/reactions/list/${encodeURIComponent(reactableType)}/${reactableId}?type=${activeTab}&page=${pageNum}`;
      const response = await fetch(url, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.reactions) {
        const paginatedData = data.reactions;
        if (append) {
          setReactions((prev) => [...prev, ...paginatedData.data]);
        } else {
          setReactions(paginatedData.data);
        }
        setHasMore(paginatedData.current_page < paginatedData.last_page);
        setPage(paginatedData.current_page);
      }
    } catch (error2) {
      console.error("Failed to load reactions:", error2);
      setError(append ? "Failed to load more reactions" : "Failed to load reactions");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading) {
      loadReactions(page + 1, true);
    }
  };
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };
  if (!isOpen && !isAnimating) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${isOpen && isAnimating ? "bg-black/50" : "bg-black/0"}`,
      onClick: handleClose,
      "data-testid": "modal-overlay",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          ref: modalRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "modal-title",
          className: `bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col transition-all duration-200 ${isOpen && isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`,
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200", children: [
              /* @__PURE__ */ jsx("h2", { id: "modal-title", className: "text-lg font-semibold", children: "Reactions" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "p-1 hover:bg-gray-100 rounded-full transition-colors",
                  "data-testid": "close-modal",
                  children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setActiveTab(tab.key),
                "data-testid": `reaction-tab-${tab.key}`,
                className: `
                                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${activeTab === tab.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                            `,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-base", children: tab.label }),
                  /* @__PURE__ */ jsx("span", { children: tab.count })
                ]
              },
              tab.key
            )) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                ref: scrollRef,
                onScroll: handleScroll,
                className: "flex-1 overflow-y-auto p-4",
                children: error ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mb-3" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-900 font-medium mb-1", children: "Oops! Something went wrong" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-4", children: error }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => loadReactions(1, false),
                      className: "px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors",
                      children: "Try Again"
                    }
                  )
                ] }) : isLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 animate-pulse", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-32 mb-2" }),
                    /* @__PURE__ */ jsx("div", { className: "h-3 bg-gray-200 rounded w-48" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-gray-200 rounded flex-shrink-0" })
                ] }, i)) }) : reactions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-6xl mb-3", children: "😊" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-900 font-medium mb-1", children: "No reactions yet" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Be the first to react!" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  reactions.map((reaction, index) => {
                    var _a, _b, _c, _d;
                    return /* @__PURE__ */ jsxs(
                      "div",
                      {
                        role: onUserClick ? "button" : void 0,
                        tabIndex: onUserClick ? 0 : void 0,
                        onClick: () => {
                          var _a2;
                          return onUserClick == null ? void 0 : onUserClick((_a2 = reaction.user) == null ? void 0 : _a2.id);
                        },
                        "data-testid": "user-reaction-item",
                        onKeyDown: (e) => {
                          var _a2;
                          if (onUserClick && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onUserClick((_a2 = reaction.user) == null ? void 0 : _a2.id);
                          }
                        },
                        className: `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${onUserClick ? "hover:bg-gray-100 cursor-pointer active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" : "hover:bg-gray-50"}`,
                        style: { animationDelay: `${index * 30}ms`, animationFillMode: "backwards" },
                        children: [
                          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0", children: ((_b = (_a = reaction.user) == null ? void 0 : _a.name) == null ? void 0 : _b.charAt(0).toUpperCase()) || "?" }),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                            /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 truncate", children: ((_c = reaction.user) == null ? void 0 : _c.name) || "Unknown User" }),
                            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 truncate", children: (_d = reaction.user) == null ? void 0 : _d.email })
                          ] }),
                          /* @__PURE__ */ jsx("div", { className: "text-2xl flex-shrink-0", "data-testid": "user-reaction-type", children: reactionTypes[reaction.type] || reaction.type })
                        ]
                      },
                      reaction.id
                    );
                  }),
                  isLoadingMore && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-4 text-gray-500", children: [
                    /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin mr-2" }),
                    /* @__PURE__ */ jsx("span", { children: "Loading more..." })
                  ] }),
                  !hasMore && reactions.length > 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-sm text-gray-400", children: "That's all! 🎉" })
                ] })
              }
            )
          ]
        }
      )
    }
  );
}
function Reactions({
  reactableType,
  reactableId,
  initialReactions = {},
  userReaction = null,
  onUserClick
}) {
  const pageProps = usePage().props;
  const reactionTypes = pageProps.reactionTypes;
  const [reactions, setReactions] = useState(initialReactions);
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hoverTimeoutRef = React__default.useRef(null);
  const reactionLabels = Object.keys(reactionTypes).reduce((acc, key) => {
    acc[key] = key.charAt(0).toUpperCase() + key.slice(1);
    return acc;
  }, {});
  const defaultReactionType = Object.keys(reactionTypes)[0] || "like";
  const handleReaction = (type) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const previousReactions = { ...reactions };
    const previousUserReaction = currentUserReaction;
    const newReactions = { ...reactions };
    if (currentUserReaction === type) {
      if (newReactions[type] > 0) {
        newReactions[type]--;
        if (newReactions[type] === 0) {
          delete newReactions[type];
        }
      }
      setCurrentUserReaction(null);
    } else {
      if (currentUserReaction && newReactions[currentUserReaction] > 0) {
        newReactions[currentUserReaction]--;
        if (newReactions[currentUserReaction] === 0) {
          delete newReactions[currentUserReaction];
        }
      }
      newReactions[type] = (newReactions[type] || 0) + 1;
      setCurrentUserReaction(type);
    }
    setReactions(newReactions);
    const isRemoving = currentUserReaction === type;
    const data = {
      reactable_type: reactableType,
      reactable_id: reactableId,
      type
    };
    const options = {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page) => {
        if (page.props.reactions_summary) {
          setReactions(page.props.reactions_summary);
        }
        if (page.props.user_reaction !== void 0) {
          setCurrentUserReaction(page.props.user_reaction);
        }
        setIsProcessing(false);
      },
      onError: (errors) => {
        console.error("Failed to update reaction:", errors);
        setReactions(previousReactions);
        setCurrentUserReaction(previousUserReaction);
        setIsProcessing(false);
      }
    };
    if (isRemoving) {
      router.visit("/reactions", {
        method: "delete",
        data,
        ...options
      });
    } else {
      router.post("/reactions", data, options);
    }
  };
  const totalReactions = Object.values(reactions).reduce((sum, count2) => sum + count2, 0);
  const handleMouseEnter = () => {
    if (isProcessing) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxs(DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, modal: false, children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleReaction(currentUserReaction || defaultReactionType),
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          disabled: isProcessing,
          "data-testid": `reaction-button-${currentUserReaction || defaultReactionType}`,
          className: `
                            group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200
                            ${currentUserReaction ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}
                            ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                        `,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: currentUserReaction ? reactionTypes[currentUserReaction] : reactionTypes[defaultReactionType] }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: currentUserReaction ? reactionLabels[currentUserReaction] : reactionLabels[defaultReactionType] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        DropdownMenuContent,
        {
          side: "top",
          align: "start",
          className: "bg-white rounded-xl shadow-xl border border-gray-200 p-2",
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          children: /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: Object.entries(reactionTypes).map(([type, emoji]) => /* @__PURE__ */ jsx(
            DropdownMenuItem,
            {
              onClick: () => handleReaction(type),
              "data-testid": `reaction-button-${type}`,
              className: `
                                    group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200
                                    hover:bg-gray-100 hover:scale-125 cursor-pointer
                                    ${currentUserReaction === type ? "bg-gray-100" : ""}
                                `,
              title: reactionLabels[type],
              children: /* @__PURE__ */ jsx("span", { className: "text-2xl", children: emoji })
            },
            type
          )) })
        }
      )
    ] }),
    totalReactions > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      Object.entries(reactions).sort(([, a], [, b]) => b - a).map(([type, count2]) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleReaction(type),
          disabled: isProcessing,
          "data-testid": `reaction-count-${type}`,
          className: `
                                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                                    ${currentUserReaction === type ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                                    ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                                `,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-base", children: reactionTypes[type] }),
            /* @__PURE__ */ jsx("span", { children: count2 })
          ]
        },
        type
      )),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowModal(true),
          className: "p-1.5 hover:bg-gray-100 rounded-full transition-colors",
          title: "See who reacted",
          children: /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-gray-600" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      ReactionsModal,
      {
        isOpen: showModal,
        onClose: () => setShowModal(false),
        reactableType,
        reactableId,
        reactionsSummary: reactions,
        onUserClick
      }
    )
  ] });
}
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-gray-500", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function CommentForm({
  commentableType,
  commentableId,
  parentId = null,
  initialContent = "",
  commentId = null,
  onSuccess,
  onCancel,
  isEditing = false,
  placeholder = "Write a comment..."
}) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      adjustTextareaHeight();
    }
  }, []);
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    if (content.length > 5e3) {
      setError("Comment is too long (max 5000 characters)");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const data = {
      commentable_type: commentableType,
      commentable_id: commentableId,
      content: content.trim(),
      parent_id: parentId
    };
    if (isEditing && commentId) {
      router.put(`/comments/${commentId}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          onSuccess(content.trim());
          setContent("");
        },
        onError: (errors) => {
          setError(errors.content || errors.error || "Failed to update comment");
          setIsSubmitting(false);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } else {
      router.post("/comments", data, {
        preserveScroll: true,
        onSuccess: () => {
          setContent("");
          if (onCancel) onCancel();
        },
        onError: (errors) => {
          setError(errors.content || errors.error || "Failed to add comment");
          setIsSubmitting(false);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    }
  };
  const handleCancel = () => {
    setContent(initialContent);
    setError("");
    onCancel();
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref: textareaRef,
          value: content,
          onChange: (e) => {
            setContent(e.target.value);
            adjustTextareaHeight();
            setError("");
          },
          placeholder,
          disabled: isSubmitting,
          "data-testid": isEditing ? "edit-comment-input" : "comment-input",
          className: `w-full px-4 py-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${error ? "border-red-500" : "border-gray-300"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`,
          rows: 3,
          maxLength: 5e3
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 right-3 text-xs text-gray-400", children: [
        content.length,
        "/5000"
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleCancel,
          disabled: isSubmitting,
          className: "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting || !content.trim(),
          "data-testid": isEditing ? "save-edit" : "submit-comment",
          className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }),
            isEditing ? "Updating..." : "Posting..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
            isEditing ? "Update" : "Post"
          ] })
        }
      )
    ] })
  ] });
}
function CommentItem({
  comment,
  commentableType,
  commentableId,
  reactionsEnabled,
  onUserClick,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
  currentUserId,
  isReply = false
}) {
  var _a, _b, _c, _d, _e;
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwner = currentUserId === comment.user_id;
  const formattedDate = new Date(comment.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    router.delete(`/comments/${comment.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        onCommentDeleted(comment.id);
      },
      onError: () => {
        setIsDeleting(false);
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };
  const handleEditSuccess = (updatedContent) => {
    onCommentUpdated(comment.id, updatedContent);
    setIsEditing(false);
  };
  const handleReplySuccess = (newReply) => {
    onReplyAdded(comment.id, { ...comment, content: newReply });
    setShowReplyForm(false);
  };
  if (isDeleting) {
    return /* @__PURE__ */ jsx("div", { className: "animate-pulse bg-gray-50 rounded-md p-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Deleting..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `${isReply ? "ml-10" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { "data-content_id": comment.id, "data-content_owner_id": `container_${(_a = comment.user) == null ? void 0 : _a.id}`, className: "bg-white rounded-md border border-gray-200 p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              "data-user_id": comment.user_id,
              role: "avatar",
              onClick: () => {
                var _a2;
                return onUserClick == null ? void 0 : onUserClick((_a2 = comment.user) == null ? void 0 : _a2.id);
              },
              className: `w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${onUserClick ? "cursor-pointer hover:ring-2 hover:ring-gray-900 hover:ring-offset-1 transition-all" : ""}`,
              children: ((_c = (_b = comment.user) == null ? void 0 : _b.name) == null ? void 0 : _c.charAt(0).toUpperCase()) || "?"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  onClick: () => {
                    var _a2;
                    return onUserClick == null ? void 0 : onUserClick((_a2 = comment.user) == null ? void 0 : _a2.id);
                  },
                  className: `text-sm font-semibold text-gray-900 ${onUserClick ? "cursor-pointer hover:underline" : ""}`,
                  children: ((_d = comment.user) == null ? void 0 : _d.name) || "Unknown User"
                }
              ),
              comment.is_edited && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-2.5 h-2.5" }),
                "edited"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: formattedDate })
          ] })
        ] }),
        isOwner && !isEditing && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx("button", { "data-content_owner_id": `view_more_button_${(_e = comment.user) == null ? void 0 : _e.id}`, className: "p-1 hover:bg-gray-100 rounded-full transition-colors", children: /* @__PURE__ */ jsx(MoreVertical, { className: "w-4 h-4 text-gray-600" }) }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleEdit, className: "cursor-pointer", "data-testid": "edit-comment", children: [
              /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4 mr-2" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleDelete, className: "cursor-pointer text-red-600", "data-testid": "delete-comment", children: [
              /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 mr-2" }),
              "Delete"
            ] })
          ] })
        ] })
      ] }),
      isEditing ? /* @__PURE__ */ jsx(
        CommentForm,
        {
          commentableType,
          commentableId,
          initialContent: comment.content,
          commentId: comment.id,
          onSuccess: handleEditSuccess,
          onCancel: () => setIsEditing(false),
          isEditing: true
        }
      ) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-800 whitespace-pre-wrap mb-2", children: comment.content }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          reactionsEnabled && /* @__PURE__ */ jsx(
            Reactions,
            {
              reactableType: "TrueFans\\\\LaravelReactReactions\\\\Models\\\\Comment",
              reactableId: comment.id,
              initialReactions: comment.reactions_summary || {},
              userReaction: comment.user_reaction,
              onUserClick
            }
          ),
          !isReply && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowReplyForm(!showReplyForm),
              "data-testid": "reply-button",
              className: "flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Reply, { className: "w-4 h-4" }),
                "Reply"
              ]
            }
          )
        ] })
      ] })
    ] }),
    showReplyForm && /* @__PURE__ */ jsx("div", { className: "ml-12 mt-3", children: /* @__PURE__ */ jsx(
      CommentForm,
      {
        commentableType,
        commentableId,
        parentId: comment.id,
        onSuccess: handleReplySuccess,
        onCancel: () => setShowReplyForm(false),
        placeholder: "Write a reply..."
      }
    ) }),
    comment.replies && comment.replies.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: comment.replies.map((reply) => /* @__PURE__ */ jsx(
      CommentItem,
      {
        comment: reply,
        commentableType,
        commentableId,
        reactionsEnabled,
        onUserClick,
        onCommentUpdated,
        onCommentDeleted,
        onReplyAdded,
        currentUserId,
        isReply: true
      },
      reply.id
    )) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: showDeleteConfirm, onOpenChange: setShowDeleteConfirm, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete Comment" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Are you sure you want to delete this comment? This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: confirmDelete, className: "bg-red-600 hover:bg-red-700", "data-testid": "confirm-delete", children: "Delete" })
      ] })
    ] }) })
  ] });
}
function Comments({
  commentableType,
  commentableId,
  initialComments = [],
  totalComments = null,
  reactionsEnabled = true,
  onUserClick,
  currentUserId,
  perPage = 5
}) {
  const [comments, setComments] = useState(initialComments);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  useEffect(() => {
    console.log("Comments initialized:", {
      initialCount: initialComments.length,
      totalComments,
      hasMore: initialComments.length < (totalComments || initialComments.length)
    });
    setComments(initialComments);
    setPage(1);
    const total = totalComments !== null ? totalComments : initialComments.length;
    setHasMore(initialComments.length < total);
  }, [initialComments, totalComments]);
  const handleCommentAdded = () => {
    setShowForm(false);
  };
  const handleCommentUpdated = (commentId, updatedContent) => {
    setComments((prev) => prev.map(
      (comment) => comment.id === commentId ? { ...comment, content: updatedContent, is_edited: true, edited_at: (/* @__PURE__ */ new Date()).toISOString() } : comment
    ));
  };
  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };
  const handleReplyAdded = (parentId, newReply) => {
    setComments((prev) => prev.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [newReply, ...comment.replies || []]
        };
      }
      return comment;
    }));
  };
  const loadMoreComments = async () => {
    var _a;
    if (loading || !hasMore) {
      console.log("Load more skipped:", { loading, hasMore });
      return;
    }
    console.log("Loading more comments...");
    setLoading(true);
    try {
      const nextPage = page + 1;
      const encodedType = btoa(commentableType);
      const url = `/comments/list/${encodedType}/${commentableId}?page=${nextPage}&per_page=${perPage}`;
      console.log("Fetching URL:", url);
      console.log("Original type:", commentableType);
      console.log("Encoded type:", encodedType);
      const response = await axios.get(url);
      console.log("Response received:", response.data);
      if (response.data.success) {
        const newComments = response.data.comments;
        console.log("New comments:", newComments.length);
        if (newComments.length > 0) {
          setComments((prev) => {
            const updated = [...prev, ...newComments];
            console.log("Updated comments count:", updated.length);
            return updated;
          });
          setPage(nextPage);
        }
        setHasMore(response.data.pagination.has_more);
        console.log("Has more:", response.data.pagination.has_more);
      } else {
        console.error("API returned success: false");
      }
    } catch (error) {
      console.error("Failed to load more comments:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", (_a = error.response) == null ? void 0 : _a.data);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  const showLessComments = () => {
    setComments(initialComments);
    setPage(1);
    setHasMore(initialComments.length < (totalComments || initialComments.length));
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-gray-600" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-base font-semibold text-gray-900", children: [
          "Comments (",
          totalComments !== null ? totalComments : comments.length,
          ")"
        ] })
      ] }),
      !showForm && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowForm(true),
          "data-testid": "add-comment-button",
          className: "px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors",
          children: "Add Comment"
        }
      )
    ] }),
    showForm && /* @__PURE__ */ jsx(
      CommentForm,
      {
        commentableType,
        commentableId,
        onSuccess: handleCommentAdded,
        onCancel: () => setShowForm(false)
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: comments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-medium mb-1", children: "No comments yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Be the first to comment!" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      comments.map((comment) => /* @__PURE__ */ jsx(
        CommentItem,
        {
          comment,
          commentableType,
          commentableId,
          reactionsEnabled,
          onUserClick,
          onCommentUpdated: handleCommentUpdated,
          onCommentDeleted: handleCommentDeleted,
          onReplyAdded: handleReplyAdded,
          currentUserId
        },
        comment.id
      )),
      (hasMore || comments.length > initialComments.length) && /* @__PURE__ */ jsxs("div", { className: "pt-4 flex justify-center gap-3", children: [
        hasMore && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: loadMoreComments,
            disabled: loading,
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
              "Loading..."
            ] }) : /* @__PURE__ */ jsx(Fragment, { children: "Show More Comments" })
          }
        ),
        comments.length > initialComments.length && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: showLessComments,
            disabled: loading,
            className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            children: "Show Less"
          }
        )
      ] })
    ] }) })
  ] });
}
const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5e3;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast(props) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn$1(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    ToastPrimitives.Root,
    {
      ref,
      className: cn$1(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        variant === "destructive" && "destructive group border-red-500 bg-red-500 text-white",
        variant === "success" && "border-green-500 bg-green-500 text-white",
        !variant && "border bg-white text-gray-900",
        className
      ),
      ...props
    }
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn$1(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn$1(
      "absolute right-2 top-2 rounded-md p-1 text-white/50 opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Title,
  {
    ref,
    className: cn$1("text-sm font-semibold", className),
    ...props
  }
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Description,
  {
    ref,
    className: cn$1("text-sm opacity-90", className),
    ...props
  }
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
function TestPage({ posts }) {
  const page = usePage();
  const { auth, flash, errors } = page.props;
  useEffect(() => {
    console.log("Flash:", flash, "Errors:", errors);
    if (flash == null ? void 0 : flash.success) {
      console.log("Showing success toast:", flash.success);
      toast({
        title: "Success",
        description: flash.success,
        variant: "success"
      });
    }
    if (errors && Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors)[0];
      console.log("Showing error toast:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [flash, errors]);
  const handleLogout = (e) => {
    e.preventDefault();
    router.post("/logout");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reactions Demo" }),
    /* @__PURE__ */ jsxs("div", { "data-auth_user": JSON.stringify(auth == null ? void 0 : auth.user) || "", className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [
      /* @__PURE__ */ jsx("header", { className: "bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Reactions Demo" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Facebook-like reaction system" })
        ] }),
        (auth == null ? void 0 : auth.user) ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm", children: auth.user.name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: auth.user.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: auth.user.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleLogout,
              className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors",
              children: [
                /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
                "Logout"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/login",
            className: "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm",
            children: [
              /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
              "Login to React"
            ]
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxs("main", { className: "max-w-5xl mx-auto px-4 py-8", children: [
        !(auth == null ? void 0 : auth.user) && /* @__PURE__ */ jsx("div", { className: "mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💡" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-amber-900 mb-1", children: "Login Required" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-800", children: [
              "You need to be logged in to add reactions to posts.",
              " ",
              /* @__PURE__ */ jsx(Link, { href: "/login", className: "underline font-medium hover:text-amber-900", children: "Click here to login" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: posts.map((post) => {
          var _a;
          return /* @__PURE__ */ jsx(
            "article",
            {
              className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
              children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 mb-3", children: post.title }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 leading-relaxed mb-6", children: post.content }),
                /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsx(
                  Reactions,
                  {
                    reactableType: "Workbench\\\\App\\\\Models\\\\TestPost",
                    reactableId: post.id,
                    initialReactions: post.reactions_summary || {},
                    userReaction: post.user_reaction,
                    onUserClick: (userId) => {
                      console.log("User clicked from TestPage:", userId);
                    }
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "pt-6 border-t border-gray-100 mt-6", children: /* @__PURE__ */ jsx(
                  Comments,
                  {
                    commentableType: "Workbench\\\\App\\\\Models\\\\TestPost",
                    commentableId: post.id,
                    initialComments: post.comments || [],
                    totalComments: post.total_comments,
                    reactionsEnabled: true,
                    currentUserId: ((_a = auth == null ? void 0 : auth.user) == null ? void 0 : _a.id) || 0,
                    perPage: 5,
                    onUserClick: (userId) => {
                      console.log("User clicked from comment:", userId);
                    }
                  }
                ) })
              ] })
            },
            post.id
          );
        }) }),
        posts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "📝" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No posts yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Check back later for new content!" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "mt-16 py-8 border-t border-gray-200 bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 text-center text-sm text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "Built with Laravel, Inertia.js, React & shadcn/ui" }) }) })
    ] }),
    /* @__PURE__ */ jsx(Toaster, {})
  ] });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TestPage
}, Symbol.toStringTag, { value: "Module" }));
const appName = "Laravel";
createServer((page) => {
  console.log("SSR Request:", JSON.stringify(page));
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Auth/Login.tsx": __vite_glob_0_0, "./Pages/TestPage.tsx": __vite_glob_0_1 });
      const page2 = pages[`./Pages/${name}.tsx`];
      if (!page2) {
        console.error(`Page not found: ./Pages/${name}.tsx`);
        throw new Error(`Page not found: ./Pages/${name}.tsx`);
      }
      return page2;
    },
    defaults: {
      future: {
        useDialogForErrorModal: true
      }
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  });
});
