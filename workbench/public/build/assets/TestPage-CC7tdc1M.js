import{j as e,r as c,a as T,H as E}from"./app-D2h1KGri.js";function P({reactions:a,onSelect:l,currentReaction:u}){return e.jsxs("div",{className:"absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 animate-fade-in z-10",style:{animation:"fadeInScale 0.2s ease-out"},children:[Object.entries(a).map(([n,o])=>e.jsx("button",{onClick:()=>l(n),className:`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        transition-all duration-200 hover:scale-125 hover:bg-gray-100
                        ${u===n?"bg-blue-100 scale-110":""}
                    `,title:n,children:o},n)),e.jsx("style",{jsx:!0,children:`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `})]})}function C({type:a,emoji:l,count:u,isActive:n,onClick:o}){return e.jsxs("button",{onClick:o,className:`
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
                transition-all duration-200 hover:scale-105
                ${n?"bg-blue-100 text-blue-600":"bg-gray-100 text-gray-600 hover:bg-gray-200"}
            `,children:[e.jsx("span",{className:"text-base",children:l}),e.jsx("span",{children:u})]})}const p={like:"👍",love:"❤️",haha:"😂",wow:"😮",sad:"😢",angry:"😠"};function I({reactableType:a,reactableId:l,initialReactions:u={},userReaction:n=null}){const[o,f]=c.useState(u),[t,x]=c.useState(n),[v,h]=c.useState(!1),[b,g]=c.useState(!1),d=c.useRef(null),R=c.useRef(null);c.useEffect(()=>()=>{d.current&&clearTimeout(d.current)},[]);const N=()=>{d.current=setTimeout(()=>{h(!0)},300)},k=()=>{d.current&&clearTimeout(d.current),h(!1)},j=s=>{if(b)return;g(!0),h(!1);const m={...o},S=t,r={...o};t===s?(r[s]>0&&(r[s]--,r[s]===0&&delete r[s]),x(null)):(t&&r[t]>0&&(r[t]--,r[t]===0&&delete r[t]),r[s]=(r[s]||0)+1,x(s)),f(r);const y=t===s?"delete":"post",_={reactable_type:a,reactable_id:l,type:s};T[y]("/reactions",_,{preserveScroll:!0,preserveState:!0,onSuccess:i=>{i.props.reactions_summary&&f(i.props.reactions_summary),i.props.user_reaction!==void 0&&x(i.props.user_reaction),g(!1)},onError:i=>{console.error("Failed to update reaction:",i),f(m),x(S),g(!1)}})},w=Object.values(o).reduce((s,m)=>s+m,0);return e.jsxs("div",{ref:R,className:"relative inline-block",onMouseEnter:N,onMouseLeave:k,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:()=>j(t||"like"),disabled:b,className:`
                        px-4 py-2 rounded-lg font-medium transition-all duration-200
                        ${t?"bg-blue-100 text-blue-600 hover:bg-blue-200":"bg-gray-100 text-gray-600 hover:bg-gray-200"}
                        ${b?"opacity-50 cursor-not-allowed":"cursor-pointer"}
                    `,children:e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xl",children:t?p[t]:"👍"}),e.jsx("span",{children:t||"Like"})]})}),w>0&&e.jsx("div",{className:"flex items-center gap-1",children:Object.entries(o).map(([s,m])=>e.jsx(C,{type:s,emoji:p[s],count:m,isActive:t===s,onClick:()=>j(s)},s))})]}),v&&e.jsx(P,{reactions:p,onSelect:j,currentReaction:t})]})}function O({post:a}){return e.jsxs(e.Fragment,{children:[e.jsx(E,{title:"Test Reactions"}),e.jsx("div",{className:"min-h-screen bg-gray-100 py-12",children:e.jsx("div",{className:"max-w-4xl mx-auto px-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-md p-6",children:[e.jsx("h1",{className:"text-3xl font-bold mb-4",children:a.title}),e.jsx("p",{className:"text-gray-700 mb-6",children:a.content}),e.jsx("div",{className:"border-t pt-4",children:e.jsx(I,{reactableType:"Workbench\\\\App\\\\Models\\\\TestPost",reactableId:a.id,initialReactions:a.reactions_summary||{},userReaction:a.user_reaction})})]})})})]})}export{O as default};
