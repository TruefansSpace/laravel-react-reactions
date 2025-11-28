import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useForm, Head, router, usePage, Link, createInertiaApp } from "@inertiajs/react";
import { LogOut, User } from "lucide-react";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
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
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full space-y-8", children: [
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
    ] }) })
  ] });
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
const REACTION_TYPES = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠"
};
const REACTION_LABELS = {
  like: "Like",
  love: "Love",
  haha: "Haha",
  wow: "Wow",
  sad: "Sad",
  angry: "Angry"
};
function Reactions({
  reactableType,
  reactableId,
  initialReactions = {},
  userReaction = null
}) {
  const [reactions, setReactions] = useState(initialReactions);
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  const handleMouseEnter = () => {
    if (isProcessing) return;
    timeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 200);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTimeout(() => setShowPicker(false), 100);
  };
  const handleReaction = (type) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setShowPicker(false);
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
    const method = currentUserReaction === type ? "delete" : "post";
    const data = {
      reactable_type: reactableType,
      reactable_id: reactableId,
      type
    };
    router[method]("/reactions", data, {
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
    });
  };
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative inline-block",
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleReaction(currentUserReaction || "like"),
              disabled: isProcessing,
              className: `
                        group inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                        ${currentUserReaction ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}
                        ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                    `,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-lg", children: currentUserReaction ? REACTION_TYPES[currentUserReaction] : "👍" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: currentUserReaction ? REACTION_LABELS[currentUserReaction] : "Like" })
              ]
            }
          ),
          totalReactions > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: Object.entries(reactions).sort(([, a], [, b]) => b - a).map(([type, count]) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleReaction(type),
              disabled: isProcessing,
              className: `
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                        ${currentUserReaction === type ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                                        ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                                    `,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-base", children: REACTION_TYPES[type] }),
                /* @__PURE__ */ jsx("span", { children: count })
              ]
            },
            type
          )) })
        ] }),
        showPicker && !isProcessing && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1", children: Object.entries(REACTION_TYPES).map(([type, emoji]) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleReaction(type),
            className: `
                                    group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200
                                    hover:bg-gray-100 hover:scale-125
                                    ${currentUserReaction === type ? "bg-gray-100" : ""}
                                `,
            title: REACTION_LABELS[type],
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: emoji }),
              /* @__PURE__ */ jsx("span", { className: "absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: REACTION_LABELS[type] })
            ]
          },
          type
        )) }) })
      ]
    }
  );
}
function TestPage({ posts }) {
  const { auth } = usePage().props;
  const handleLogout = (e) => {
    e.preventDefault();
    router.post("/logout");
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reactions Demo" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [
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
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: posts.map((post) => /* @__PURE__ */ jsx(
          "article",
          {
            className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
            children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 mb-3", children: post.title }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 leading-relaxed mb-6", children: post.content }),
              /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsx(
                Reactions,
                {
                  reactableType: post.constructor.name === "Object" ? "Workbench\\App\\Models\\TestPost" : post.constructor.name,
                  reactableId: post.id,
                  initialReactions: post.reactions_summary || {},
                  userReaction: post.user_reaction
                }
              ) })
            ] })
          },
          post.id
        )) }),
        posts.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "📝" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No posts yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Check back later for new content!" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "mt-16 py-8 border-t border-gray-200 bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-4 text-center text-sm text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "Built with Laravel, Inertia.js, React & shadcn/ui" }) }) })
    ] })
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
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Auth/Login.jsx": __vite_glob_0_0, "./Pages/TestPage.jsx": __vite_glob_0_1 });
      const page2 = pages[`./Pages/${name}.jsx`];
      if (!page2) {
        console.error(`Page not found: ./Pages/${name}.jsx`);
        throw new Error(`Page not found: ./Pages/${name}.jsx`);
      }
      return page2;
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  });
});
