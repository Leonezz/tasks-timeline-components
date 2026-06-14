import{j as i}from"./jsx-runtime-u17CrQMm.js";import{r as m}from"./iframe-DyYwBhAw.js";import{T as Nt}from"./TodoList-aavZgrI0.js";import{I as Dt}from"./InputBar-D9GCIqjZ.js";import{S as Et}from"./SettingsModal-s1gFxfAm.js";import{T as Rt}from"./TaskEditModal-Ste5RWDb.js";import{T as Ut}from"./Toast-DfbSugnw.js";import{c as Q}from"./rruleset-Bu4wjl4G.js";import{I as G}from"./Icon-DbBbu-XI.js";import{M as Le}from"./Motion-C605ho8c.js";import{A as st}from"./index--4yt6jTx.js";import{d as ce}from"./BacklogSection-DMlHAQPn.js";import{l as f}from"./logger-CDMKXnH4.js";import{A as Ot}from"./AppContext-B4AVvosB.js";import{T as qt,S as _t}from"./SettingsContext-_M3sdO5p.js";import{c as Ft}from"./SettingsPageAI-Dq3r-Z1U.js";import{g as ne,a as _e,b as We,c as Mt}from"./TaskItem-Bf-LL8J6.js";import{w as ae,d as re}from"./test-utils-BNouzmjp.js";import{t as Pt}from"./tasks-D2syl_55.js";import"./preload-helper-PPVm8Dsz.js";import"./datetime-CoIMkCUY.js";import"./YearSection-CE-zYIK5.js";import"./DaySection-Crw0r5E5.js";import"./useVoiceInput-BafdX-sB.js";import"./collapsible-BXi9_ieD.js";import"./popover-B6Q_rECh.js";import"./index-BKy55o3e.js";import"./index-DbfMYO8J.js";import"./proxy-Cz_1xztS.js";import"./SettingsPage-2Q08lL8x.js";import"./SettingsPageGeneral-7BKGLO_y.js";import"./index-ChmfCxoe.js";import"./date-picker-DLV4XahJ.js";import"./calendar-BC6x6032.js";import"./chevron-right-C_HBJ75Z.js";import"./DateBadge-q8uwpISH.js";import"./TagBadge-Cz2FDcmU.js";import"./PriorityPopover-Cyxmmz_F.js";import"./CategoryPopover-DjL0Ex3d.js";const $t=m.createContext(null),Pe={didCatch:!1,error:null};class $e extends m.Component{constructor(e){super(e),this.resetErrorBoundary=this.resetErrorBoundary.bind(this),this.state=Pe}static getDerivedStateFromError(e){return{didCatch:!0,error:e}}resetErrorBoundary(...e){const{error:t}=this.state;t!==null&&(this.props.onReset?.({args:e,reason:"imperative-api"}),this.setState(Pe))}componentDidCatch(e,t){this.props.onError?.(e,t)}componentDidUpdate(e,t){const{didCatch:n}=this.state,{resetKeys:a}=this.props;n&&t.error!==null&&Yt(e.resetKeys,a)&&(this.props.onReset?.({next:a,prev:e.resetKeys,reason:"keys"}),this.setState(Pe))}render(){const{children:e,fallbackRender:t,FallbackComponent:n,fallback:a}=this.props,{didCatch:o,error:d}=this.state;let r=e;if(o){const c={error:d,resetErrorBoundary:this.resetErrorBoundary};if(typeof t=="function")r=t(c);else if(n)r=m.createElement(n,c);else if(a!==void 0)r=a;else throw d}return m.createElement($t.Provider,{value:{didCatch:o,error:d,resetErrorBoundary:this.resetErrorBoundary}},r)}}function Yt(s=[],e=[]){return s.length!==e.length||s.some((t,n)=>!Object.is(t,e[n]))}const Bt=(s,e)=>{let t=`You are a task management assistant. You help users create, query, update, and delete tasks.

## Task Schema

Tasks have these fields:
- title (string, required): The task name
- description (string): Additional details
- status: One of "todo", "doing", "done", "cancelled" (set explicitly), or derived: "overdue", "due", "scheduled", "doing", "unplanned"
- priority: "low", "medium", or "high"
- dueAt (string): Due date in YYYY-MM-DD format
- startAt (string): Start date in YYYY-MM-DD format
- category (string): Organizational category
- tags (array of strings): Tag labels
- recurrence (string): RRULE format for recurring tasks (RFC 5545)

## Status Rules

- "done" and "cancelled" are terminal states, set explicitly
- Other statuses are derived automatically from dates:
  - "overdue": dueAt is in the past
  - "due": dueAt is today or tomorrow
  - "scheduled": startAt is in the future, not yet started
  - "doing": startAt is in the past, actively working
  - "unplanned": no dates set
- When creating tasks, set status to "todo" — the system derives the display status
- After updating any dates, the system automatically recalculates status

## Recurrence

Recurring tasks use RRULE format (RFC 5545):
- FREQ=DAILY — repeats every day
- FREQ=WEEKLY;BYDAY=MO,WE,FR — repeats on specific days
- FREQ=MONTHLY;BYMONTHDAY=1 — repeats on specific day of month
- FREQ=YEARLY — repeats annually
- Add COUNT=X to limit repetitions, or UNTIL=YYYY-MM-DD to set an end date

When creating or updating tasks:
- Set recurrence field to the RRULE string to make a recurring task
- Set recurrence to empty string to clear recurrence

When completing a recurring task with complete_task:
- The current instance is marked done
- The next occurrence is automatically created
- For non-recurring tasks, only the single task is marked done

## Available Tools

1. **create_task** — Create a new task with title and optional details (description, priority, dates, category, tags, recurrence)
2. **query_tasks** — Search/filter tasks by status, search term, category, tag, date range, recurrence, and sort results
3. **update_task** — Update any field of an existing task by ID (title, description, dates, priority, category, tags, recurrence)
4. **delete_task** — Delete a task by ID
5. **complete_task** — Mark a task as done; for recurring tasks, creates the next occurrence
6. **cancel_task** — Cancel a task; for recurring series, cancels the entire series
7. **batch_update_tasks** — Bulk update multiple tasks matching a filter (status, category, tag, recurrence)
8. **get_task_stats** — Get aggregate statistics: counts by status/priority/category, completion rate, overdue count, recurring count
9. **get_today_plan** — Get today's prioritized plan: tasks due today and overdue tasks (both sorted by priority)
10. **notify_user** — Show a notification to the user with a title, description, body, and visual style (success/error/info/warning). Use this to communicate results or important information.
11. **ask_user** — Ask the user a question. Three modes: free-text (question only), select (question + options), or confirm (question + confirm: true). Use when you need clarification or user input.

## Tool Usage Best Practices

- ALWAYS use query_tasks first before updating or deleting tasks to get their IDs
- When asked to modify tasks by criteria, query first to identify them
- Use batch_update_tasks for bulk operations on multiple matching tasks
- Use complete_task instead of update_task to mark tasks done (handles recurrence)
- Use cancel_task instead of update_task to cancel tasks
- Use get_today_plan to help users focus on what matters today
- Use notify_user to communicate results, progress, or important information to the user
- Use ask_user when you need clarification or user input before proceeding

## Date Handling

- Always use YYYY-MM-DD format for dates
- Today is ${ne()}
- Interpret relative dates: "tomorrow", "next week", "in 3 days", etc.
- Remember timezone-aware operations: dates are local, not UTC

## Response Style

- Be concise and helpful
- You can communicate results in two ways:
  1. **notify_user** — for rich formatted output (with body text, styling, detail blocks)
  2. **Text response** — for simple messages (shown as a notification to the user)
  Choose one per response — do not use both
- If a request is ambiguous, use ask_user to get clarification
- If ask_user returns dismissed: true, the user chose to cancel. Do NOT retry the same question. Either proceed with a reasonable default or explain briefly why you cannot continue.`;return s&&(t+=`

## Host Application Context
${s}`),e&&(t+=`

## User Instructions
${e}`),t};function nt(s){const e=new Date(s);return Number.isNaN(e.getTime())?"":e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function Lt(s){if(s==null)return null;try{const e=typeof s=="string"?s:JSON.stringify(s,null,2);return e.length>900?`${e.slice(0,900)}...`:e}catch{return String(s)}}function Wt(s){switch(s.kind){case"user":return"User";case"assistant":return"Sparkles";case"tool-call":return"Wrench";case"tool-result":return"CheckCircle2";case"error":return"AlertCircle";case"status":return"Activity"}}function zt(s){switch(s.kind){case"user":return"border-slate-100 bg-white text-slate-800";case"assistant":return"border-blue-100 bg-blue-50/50 text-slate-800";case"tool-call":return"border-amber-100 bg-amber-50/50 text-slate-800";case"tool-result":return"border-emerald-100 bg-emerald-50/50 text-slate-800";case"error":return"border-rose-100 bg-rose-50/60 text-rose-900";case"status":return"border-slate-100 bg-slate-50/70 text-slate-700"}}const Kt=({entry:s})=>{const e=Lt(s.payload);return i.jsx("div",{className:Q("border-t px-4 py-3 first:border-t-0",zt(s)),children:i.jsxs("div",{className:"flex items-start gap-2",children:[i.jsx("div",{className:"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200",children:i.jsx(G,{name:Wt(s),size:14})}),i.jsxs("div",{className:"min-w-0 flex-1",children:[i.jsxs("div",{className:"flex items-center justify-between gap-2",children:[i.jsx("h4",{className:"truncate text-xs font-bold uppercase tracking-wide text-slate-500",children:s.title}),i.jsx("span",{className:"shrink-0 font-mono text-[10px] text-slate-400",children:nt(s.timestamp)})]}),s.body&&i.jsx("p",{className:"mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700",children:s.body}),e&&i.jsx("pre",{className:"mt-2 max-h-44 overflow-auto rounded-md border border-slate-200 bg-white/80 p-2 font-mono text-[10px] leading-relaxed text-slate-600",children:e})]})]})})},at=({isOpen:s,sessions:e,activeSessionId:t,onSelectSession:n,onStartNewSession:a,onClose:o,onClear:d})=>{const r=t?e.find(c=>c.id===t)??null:null;return i.jsx(st,{children:s&&i.jsxs(Le,{role:"region","aria-label":"Agent conversation","aria-live":"polite",tabIndex:-1,onKeyDown:c=>{c.key==="Escape"&&o()},initial:{opacity:0,y:-8},animate:{opacity:1,y:0},exit:{opacity:0,y:-8},className:"mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70",children:[i.jsxs("header",{className:"flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx(G,{name:"Bot",size:16,className:"text-blue-500"}),i.jsx("h3",{className:"text-sm font-black text-slate-900",children:"Agent conversation"})]}),i.jsx("p",{className:"mt-0.5 truncate text-xs text-slate-500",children:r?`${r.provider} · ${r.model||"default model"}`:"No agent sessions yet"})]}),i.jsxs("div",{className:"flex shrink-0 items-center gap-1",children:[e.length>0&&i.jsx("button",{type:"button",onClick:a,className:"rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400","aria-label":"Start new agent conversation",title:"Start new agent conversation",children:i.jsx(G,{name:"Plus",size:15})}),e.length>0&&i.jsx("button",{type:"button",onClick:d,className:"rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-blue-400","aria-label":"Clear agent conversation",title:"Clear agent conversation",children:i.jsx(G,{name:"Trash2",size:15})}),i.jsx("button",{type:"button",onClick:o,className:"rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400","aria-label":"Collapse agent conversation",title:"Collapse agent conversation",children:i.jsx(G,{name:"ChevronUp",size:15})})]})]}),e.length>1&&i.jsx("div",{className:"flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2",children:e.map((c,g)=>i.jsxs("button",{type:"button",onClick:()=>n(c.id),className:Q("max-w-40 shrink-0 rounded-md border px-2 py-1 text-left text-[11px] font-semibold transition-colors",c.id===r?.id?"border-blue-300 bg-blue-50 text-blue-700":"border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"),children:[i.jsxs("span",{className:"block truncate",children:["Session ",g+1]}),i.jsx("span",{className:"block truncate font-normal",children:c.prompt})]},c.id))}),i.jsx("div",{className:"max-h-[min(42vh,360px)] overflow-y-auto bg-slate-50/60",children:r?i.jsxs("div",{children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("p",{className:"truncate text-xs font-semibold text-slate-700",children:r.prompt}),i.jsxs("p",{className:"text-[10px] uppercase tracking-wide text-slate-400",children:["Started ",nt(r.startedAt)]})]}),i.jsx("span",{className:Q("ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",r.status==="running"&&"bg-blue-100 text-blue-700",r.status==="complete"&&"bg-emerald-100 text-emerald-700",r.status==="error"&&"bg-rose-100 text-rose-700"),children:r.status})]}),r.entries.map(c=>i.jsx(Kt,{entry:c},c.id))]}):i.jsxs("div",{className:"flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center text-slate-400",children:[i.jsx(G,{name:"MessageSquareText",size:32}),i.jsx("p",{className:"mt-3 text-sm font-semibold text-slate-600",children:"No agent conversation yet"}),i.jsx("p",{className:"mt-1 max-w-64 text-xs leading-relaxed",children:"Send your next AI prompt from the input bar to start a new agent conversation."})]})})]})})};at.__docgenInfo={description:"",methods:[],displayName:"AgentConversationPanel",props:{isOpen:{required:!0,tsType:{name:"boolean"},description:""},sessions:{required:!0,tsType:{name:"Array",elements:[{name:"AgentSession"}],raw:"AgentSession[]"},description:""},activeSessionId:{required:!0,tsType:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}]},description:""},onSelectSession:{required:!0,tsType:{name:"signature",type:"function",raw:"(sessionId: string) => void",signature:{arguments:[{type:{name:"string"},name:"sessionId"}],return:{name:"void"}}},description:""},onStartNewSession:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClear:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};class Gt{name="Local Browser Settings";settingsKey="tasks_timeline_settings_data";settingsSaveTimeout=null;async loadSettings(){const e=localStorage.getItem(this.settingsKey);if(!e)return null;try{const t=JSON.parse(e);return f.debug("Storage","Loaded settings from local storage."),t}catch(t){return f.error("Storage","Failed to parse settings",t),null}}async saveSettings(e){return this.settingsSaveTimeout&&window.clearTimeout(this.settingsSaveTimeout),new Promise(t=>{this.settingsSaveTimeout=window.setTimeout(()=>{try{localStorage.setItem(this.settingsKey,JSON.stringify(e)),f.debug("Storage","Persisted settings."),this.settingsSaveTimeout=null,t()}catch(n){f.error("Storage","Failed to save settings",n),t()}},500)})}}const ze=s=>s instanceof Error?s.message:typeof s=="string"?s:"An unknown error occurred",rt=({error:s,resetErrorBoundary:e})=>i.jsxs(Le,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:"p-8 text-center space-y-4 max-w-md mx-auto",children:[i.jsx("div",{className:"text-rose-500 flex justify-center",children:i.jsx(G,{name:"AlertTriangle",size:48})}),i.jsxs("div",{children:[i.jsx("h3",{className:"font-bold text-lg text-slate-900",children:"Something went wrong"}),i.jsx("p",{className:"text-sm text-slate-600 mt-2 font-mono bg-slate-50 p-3 rounded border border-slate-200",children:ze(s)})]}),i.jsx("button",{onClick:e,className:"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm",children:"Try Again"})]}),it=({error:s,resetErrorBoundary:e})=>i.jsx(Le,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},className:"p-4 bg-rose-50 border border-rose-200 rounded-lg mx-4 mb-4",children:i.jsxs("div",{className:"flex items-start gap-3",children:[i.jsx("div",{className:"text-rose-600 mt-0.5",children:i.jsx(G,{name:"AlertCircle",size:20})}),i.jsxs("div",{className:"flex-1",children:[i.jsx("h4",{className:"font-semibold text-rose-900 text-sm",children:"AI Command Failed"}),i.jsx("p",{className:"text-sm text-rose-700 mt-1",children:ze(s)}),i.jsx("button",{onClick:e,className:"text-xs text-rose-600 underline mt-2 hover:text-rose-800",children:"Dismiss"})]})]})}),ot=({error:s,resetErrorBoundary:e})=>i.jsxs("div",{className:"p-6 text-center space-y-4",children:[i.jsx("div",{className:"text-rose-500 flex justify-center",children:i.jsx(G,{name:"XCircle",size:40})}),i.jsxs("div",{children:[i.jsx("h3",{className:"font-bold text-base text-slate-900",children:"Failed to load modal"}),i.jsx("p",{className:"text-xs text-slate-600 mt-2 font-mono bg-slate-50 p-2 rounded border border-slate-200",children:ze(s)})]}),i.jsx("button",{onClick:e,className:"px-3 py-1.5 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors",children:"Close"})]});rt.__docgenInfo={description:"",methods:[],displayName:"TaskListErrorFallback"};it.__docgenInfo={description:"",methods:[],displayName:"AIErrorFallback"};ot.__docgenInfo={description:"",methods:[],displayName:"ModalErrorFallback"};const Be=new Set(["__proto__","prototype","constructor"]);function Vt(s){const e=[];let t=0;for(;t<s.length;){const n=s[t];if(/\s/.test(n)){t+=1;continue}const a=s.slice(t,t+2);if(["&&","||","==","!=",">=","<="].includes(a)){e.push({type:"operator",value:a}),t+=2;continue}if([">","<","+","-","*","/","%","!"].includes(n)){e.push({type:"operator",value:n}),t+=1;continue}if(n==="."){e.push({type:"dot",value:n}),t+=1;continue}if(n==="("||n===")"){e.push({type:"paren",value:n}),t+=1;continue}if(n==="'"||n==='"'){const o=n;let d="",r=!1;for(t+=1;t<s.length;){const c=s[t];if(c==="\\"){const g=s[t+1];if(g===void 0)throw new Error("Invalid string escape");d+=g,t+=2;continue}if(c===o){t+=1,e.push({type:"string",value:d}),r=!0;break}d+=c,t+=1}if(!r)throw new Error("Unterminated string literal");continue}if(/[0-9]/.test(n)){let o=n;for(t+=1;t<s.length&&/[0-9.]/.test(s[t]);)o+=s[t],t+=1;if(!/^\d+(?:\.\d+)?$/.test(o))throw new Error(`Invalid number literal: ${o}`);e.push({type:"number",value:o});continue}if(/[A-Za-z_$]/.test(n)){let o=n;for(t+=1;t<s.length&&/[A-Za-z0-9_$]/.test(s[t]);)o+=s[t],t+=1;o==="true"||o==="false"?e.push({type:"boolean",value:o}):o==="null"?e.push({type:"null",value:o}):e.push({type:"identifier",value:o});continue}throw new Error(`Unexpected token: ${n}`)}return e.push({type:"eof",value:""}),e}class Ht{index=0;tokens;constructor(e){this.tokens=e}parse(){const e=this.parseOr();if(!this.match("eof"))throw new Error(`Unexpected token: ${this.peek().value}`);return e}parseOr(){let e=this.parseAnd();for(;this.matchOperator("||");)e={type:"binary",operator:"||",left:e,right:this.parseAnd()};return e}parseAnd(){let e=this.parseEquality();for(;this.matchOperator("&&");)e={type:"binary",operator:"&&",left:e,right:this.parseEquality()};return e}parseEquality(){let e=this.parseComparison();for(;this.checkOperator("==")||this.checkOperator("!=");)e={type:"binary",operator:this.advance().value,left:e,right:this.parseComparison()};return e}parseComparison(){let e=this.parseAdditive();for(;this.checkOperator(">")||this.checkOperator(">=")||this.checkOperator("<")||this.checkOperator("<=");)e={type:"binary",operator:this.advance().value,left:e,right:this.parseAdditive()};return e}parseAdditive(){let e=this.parseMultiplicative();for(;this.checkOperator("+")||this.checkOperator("-");)e={type:"binary",operator:this.advance().value,left:e,right:this.parseMultiplicative()};return e}parseMultiplicative(){let e=this.parseUnary();for(;this.checkOperator("*")||this.checkOperator("/")||this.checkOperator("%");)e={type:"binary",operator:this.advance().value,left:e,right:this.parseUnary()};return e}parseUnary(){return this.matchOperator("!")?{type:"unary",operator:"!",argument:this.parseUnary()}:this.parsePrimary()}parsePrimary(){const e=this.peek();if(this.match("number"))return{type:"literal",value:Number(e.value)};if(this.match("string"))return{type:"literal",value:e.value};if(this.match("boolean"))return{type:"literal",value:e.value==="true"};if(this.match("null"))return{type:"literal",value:null};if(this.match("identifier")){const t=[e.value];for(;this.match("dot");){const n=this.consume("identifier","Expected property name");if(Be.has(n.value))throw new Error(`Forbidden property access: ${n.value}`);t.push(n.value)}if(Be.has(t[0]))throw new Error(`Forbidden property access: ${t[0]}`);return{type:"path",parts:t}}if(this.matchParen("(")){const t=this.parseOr();return this.consumeParen(")","Expected closing parenthesis"),t}throw new Error(`Unexpected token: ${e.value||e.type}`)}match(e){return this.peek().type!==e?!1:(this.advance(),!0)}matchOperator(e){return this.checkOperator(e)?(this.advance(),!0):!1}matchParen(e){return this.peek().type!=="paren"||this.peek().value!==e?!1:(this.advance(),!0)}checkOperator(e){return this.peek().type==="operator"&&this.peek().value===e}consume(e,t){if(this.peek().type===e)return this.advance();throw new Error(t)}consumeParen(e,t){if(this.peek().type==="paren"&&this.peek().value===e)return this.advance();throw new Error(t)}advance(){const e=this.peek();return this.index+=1,e}peek(){return this.tokens[this.index]??{type:"eof",value:""}}}function Jt(s,e){let t=e[s[0]];for(const n of s.slice(1)){if(t==null||typeof t!="object"||Be.has(n))return;t=t[n]}if(typeof t=="string"||typeof t=="number"||typeof t=="boolean"||t===null||t===void 0)return t}function K(s){if(typeof s=="number")return s;if(typeof s=="boolean")return s?1:0;if(s==null)return 0;const e=Number(s);return Number.isFinite(e)?e:0}function Te(s,e,t){const n=s??"",a=e??"";switch(t){case">":return n>a;case">=":return n>=a;case"<":return n<a;case"<=":return n<=a}}function ee(s,e){switch(s.type){case"literal":return s.value;case"path":return Jt(s.parts,e);case"unary":return!ee(s.argument,e);case"binary":{if(s.operator==="||")return ee(s.left,e)?!0:!!ee(s.right,e);if(s.operator==="&&")return ee(s.left,e)?!!ee(s.right,e):!1;const t=ee(s.left,e),n=ee(s.right,e);switch(s.operator){case"==":return t===n;case"!=":return t!==n;case">":return Te(t,n,s.operator);case">=":return Te(t,n,s.operator);case"<":return Te(t,n,s.operator);case"<=":return Te(t,n,s.operator);case"+":return typeof t=="string"||typeof n=="string"?String(t??"")+String(n??""):K(t)+K(n);case"-":return K(t)-K(n);case"*":return K(t)*K(n);case"/":return K(t)/K(n);case"%":return K(t)%K(n)}}}}function lt(s){const e=new Ht(Vt(s)).parse();return t=>ee(e,t)}function Qt(s){const e=new Set,t=new Set;return s.forEach(n=>{n.tags.forEach(a=>e.add(a.name)),n.category&&t.add(n.category)}),{uniqueTags:Array.from(e),uniqueCategories:Array.from(t)}}function Xt(s,e){let t=[...s];if(e.tags.include.length>0&&(t=t.filter(n=>n.tags.some(a=>e.tags.include.includes(a.name)))),e.tags.exclude.length>0&&(t=t.filter(n=>!n.tags.some(a=>e.tags.exclude.includes(a.name)))),e.categories.include.length>0&&(t=t.filter(n=>n.category&&e.categories.include.includes(n.category))),e.categories.exclude.length>0&&(t=t.filter(n=>!n.category||!e.categories.exclude.includes(n.category))),e.priorities.include.length>0&&(t=t.filter(n=>e.priorities.include.includes(n.priority))),e.priorities.exclude.length>0&&(t=t.filter(n=>!e.priorities.exclude.includes(n.priority))),e.statuses.include.length>0&&(t=t.filter(n=>e.statuses.include.includes(n.status))),e.statuses.exclude.length>0&&(t=t.filter(n=>!e.statuses.exclude.includes(n.status))),e.enableScript&&e.script.trim())try{const n=lt(e.script);t=t.filter(a=>{try{return!!n({task:a})}catch(o){return f.error("TaskFiltering","Custom filter script execution failed",o),!1}})}catch(n){f.error("TaskFiltering","Custom filter script parsing failed",n)}return t}function Zt(s,e){const t=[...s];let n=null;if(e.field==="custom"&&e.script.trim())try{n=lt(e.script)}catch(a){f.error("TaskFiltering","Custom sort script parsing failed",a)}return t.sort((a,o)=>{if(e.field==="custom"){if(!n)return 0;try{const c=n({a,b:o});return typeof c=="number"?c:0}catch(c){return f.error("TaskFiltering","Custom sort script failed",c),0}}let d=a[e.field],r=o[e.field];if(e.field==="priority"){const c={high:3,medium:2,low:1};d=c[a.priority],r=c[o.priority]}return d==null&&(d=""),r==null&&(r=""),d<r?e.direction==="asc"?-1:1:d>r?e.direction==="asc"?1:-1:0}),t}const es=(s,e,t)=>{const{uniqueTags:n,uniqueCategories:a}=m.useMemo(()=>Qt(s),[s]);return{processedTasks:m.useMemo(()=>Zt(Xt(s,e),t),[s,e,t]),uniqueTags:n,uniqueCategories:a}},ts=s=>m.useMemo(()=>s.reduce((e,t)=>(t.status==="done"||t.status==="cancelled"||(t.status==="todo"&&e.todo++,t.status==="unplanned"&&e.unplanned++,t.status==="scheduled"&&e.scheduled++,t.status==="doing"&&e.doing++,(t.status==="overdue"||t.status==="due")&&e.urgent++),e),{todo:0,unplanned:0,urgent:0,scheduled:0,doing:0}),[s]);function ss(s){return{name:"create_task",description:"Create a new task with a title and optional details like description, priority, dates, tags, and recurrence.",schema:{type:"object",properties:{title:{type:"string",description:"The title of the task (required)"},description:{type:"string",description:"A detailed description of the task"},priority:{type:"string",description:"Task priority level",enum:["low","medium","high"]},status:{type:"string",description:"Initial task status",enum:["todo","scheduled"]},dueAt:{type:"string",description:"Due date in ISO 8601 format (YYYY-MM-DD)"},startAt:{type:"string",description:"Start date in ISO 8601 format (YYYY-MM-DD)"},category:{type:"string",description:"Task category"},tags:{type:"array",description:"List of tag names to attach to the task",items:{type:"string"}},recurrence:{type:"string",description:"Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO)"}},required:["title"]},async execute(e){const t=e.title,n=e.description,a=e.priority??"medium",o=e.status??"todo",d=e.dueAt,r=e.startAt,c=e.category,g=e.tags??[],A=e.recurrence,N=_e("ai"),y=We(),T=g.map(D=>({id:_e("tag"),name:D})),O={id:N,title:t,...n!==void 0?{description:n}:{},priority:a,status:o,createdAt:y,...d!==void 0?{dueAt:d}:{},...r!==void 0?{startAt:r}:{},...c!==void 0?{category:c}:{},tags:T,...A!==void 0?{isRecurring:!0,recurringInterval:A}:{}},Y=ce(O),w={...O,status:Y};return await s.addTask(w),s.notify?.("success",`Created task: ${t}`),{name:"create_task",result:{success:!0,id:N,title:t}}}}}const Ze={high:0,medium:1,low:2};function ns(s){return{id:s.id,title:s.title,status:s.status,priority:s.priority,dueAt:s.dueAt,startAt:s.startAt,category:s.category,tags:s.tags.map(e=>e.name),isRecurring:s.isRecurring===!0}}function as(s,e){const t=e.toLowerCase(),n=s.title.toLowerCase().includes(t),a=s.description?.toLowerCase().includes(t)??!1;return n||a}function rs(s,e){const t=e.toLowerCase();return s.tags.some(n=>n.name.toLowerCase()===t)}function is(s,e,t){return e===void 0&&t===void 0?!0:!(s.dueAt===void 0||e!==void 0&&s.dueAt<e||t!==void 0&&s.dueAt>t)}function os(s,e,t){switch(t){case"priority":return Ze[s.priority]-Ze[e.priority];case"dueAt":return(s.dueAt??"").localeCompare(e.dueAt??"");case"createdAt":return(s.createdAt??"").localeCompare(e.createdAt??"");case"title":return s.title.localeCompare(e.title);default:return 0}}function ls(s){return{name:"query_tasks",description:"Search and filter tasks by status, category, tags, date range, recurrence, and free-text search. Returns a token-efficient summary.",schema:{type:"object",properties:{status:{type:"string",description:"Filter by exact task status",enum:["done","scheduled","todo","due","overdue","cancelled","unplanned","doing"]},search:{type:"string",description:"Case-insensitive substring search on task title and description"},category:{type:"string",description:"Filter by exact category match"},tag:{type:"string",description:"Filter by tag name (case-insensitive)"},dateFrom:{type:"string",description:"Inclusive start of due-date range in ISO 8601 format (YYYY-MM-DD)"},dateTo:{type:"string",description:"Inclusive end of due-date range in ISO 8601 format (YYYY-MM-DD)"},recurring:{type:"boolean",description:"Filter by recurrence: true for recurring tasks, false for non-recurring"},sort:{type:"string",description:"Sort results by the specified field",enum:["priority","dueAt","createdAt","title"]},limit:{type:"number",description:"Maximum number of tasks to return (default 50)"}}},async execute(e){const t=e.status,n=e.search,a=e.category,o=e.tag,d=e.dateFrom,r=e.dateTo,c=e.recurring,g=e.sort,A=e.limit??50,y=(await s.getTasks()).filter(w=>!(t!==void 0&&w.status!==t||n!==void 0&&!as(w,n)||a!==void 0&&w.category!==a||o!==void 0&&!rs(w,o)||!is(w,d,r)||c!==void 0&&(c&&w.isRecurring!==!0||!c&&w.isRecurring===!0))),Y=(g!==void 0?[...y].sort((w,D)=>os(w,D,g)):y).slice(0,A).map(ns);return y.length>0&&s.showToast?.({variant:"info",title:`Found ${y.length} task${y.length===1?"":"s"}`,detail:[{type:"task-list",tasks:y,label:"Search Results"}],timeout:8e3}),{name:"query_tasks",result:{tasks:Y,count:Y.length}}}}}function ds(s){return{name:"update_task",description:"Update an existing task by ID. Only the fields you provide will be changed; all other fields are preserved.",schema:{type:"object",properties:{id:{type:"string",description:"The ID of the task to update (required)"},title:{type:"string",description:"New title for the task"},description:{type:"string",description:"New description for the task"},status:{type:"string",description:"New status for the task (only terminal/settable states allowed)",enum:["todo","done","cancelled"]},priority:{type:"string",description:"New priority level",enum:["low","medium","high"]},dueAt:{type:"string",description:"New due date in ISO 8601 format (YYYY-MM-DD)"},startAt:{type:"string",description:"New start date in ISO 8601 format (YYYY-MM-DD)"},completedAt:{type:"string",description:"Completion timestamp in ISO 8601 format"},category:{type:"string",description:"New task category"},tags:{type:"array",description:"New list of tag names (replaces existing tags)",items:{type:"string"}},recurrence:{type:"string",description:"Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO). Use empty string to clear recurrence."}},required:["id"]},async execute(e){const t=e.id,n=await s.getTask(t);if(!n)return{name:"update_task",result:{success:!1,error:`Task not found: ${t}`}};const a={};if(e.title!==void 0&&(a.title=e.title),e.description!==void 0&&(a.description=e.description),e.status!==void 0&&(a.status=e.status),e.priority!==void 0&&(a.priority=e.priority),e.dueAt!==void 0&&(a.dueAt=e.dueAt),e.startAt!==void 0&&(a.startAt=e.startAt),e.completedAt!==void 0&&(a.completedAt=e.completedAt),e.category!==void 0&&(a.category=e.category),e.tags!==void 0){const g=e.tags.map(A=>({id:_e("tag"),name:A}));a.tags=g}if(e.recurrence!==void 0){const c=e.recurrence;c===""?(a.isRecurring=void 0,a.recurringInterval=void 0):(a.isRecurring=!0,a.recurringInterval=c)}const o={...n,...a},d=ce(o),r={...o,status:d};return await s.updateTask(r),s.notify?.("success",`Updated task: ${t}`),{name:"update_task",result:{success:!0,id:t}}}}}function cs(s){return{name:"delete_task",description:"Delete an existing task by its ID.",schema:{type:"object",properties:{id:{type:"string",description:"The ID of the task to delete (required)"}},required:["id"]},async execute(e){const t=e.id,n=await s.getTask(t);if(!n)return{name:"delete_task",result:{success:!1,message:`Task not found: ${t}`}};const a=await s.confirm?.(`Delete "${n.title}"?`,"This action cannot be undone.");return a===!1||a===null?{name:"delete_task",result:{success:!1,message:"Cancelled by user"}}:(await s.deleteTask(t),s.notify?.("info",`Deleted task: ${n.title}`),{name:"delete_task",result:{success:!0,id:t,title:n.title}})}}}function us(s){return{name:"complete_task",description:"Mark a task as done. For recurring tasks, completes the current instance and creates the next occurrence.",schema:{type:"object",properties:{id:{type:"string",description:"The ID of the task to complete (required)"}},required:["id"]},async execute(e){const t=e.id,n=await s.getTask(t);if(!n)return{name:"complete_task",result:{success:!1,error:`Task not found: ${t}`}};const a=We(),o={...n,status:"done",completedAt:a};await s.updateTask(o);let d=!1;if(n.isRecurring&&n.recurringInterval){const r={...n,id:_e("ai"),status:"todo",createdAt:a,completedAt:void 0,cancelledAt:void 0},c=ce(r),g={...r,status:c};await s.addTask(g),d=!0}return s.notify?.("success",`Completed task: ${n.title}${d?" (next occurrence created)":""}`),{name:"complete_task",result:{success:!0,id:t,title:n.title,createdNextOccurrence:d}}}}}function ps(s){return{name:"cancel_task",description:"Cancel a task. For recurring tasks, cancels the entire series.",schema:{type:"object",properties:{id:{type:"string",description:"The ID of the task to cancel (required)"}},required:["id"]},async execute(e){const t=e.id,n=await s.getTask(t);if(!n)return{name:"cancel_task",result:{success:!1,error:`Task not found: ${t}`}};const a={...n,status:"cancelled",cancelledAt:We()};return await s.updateTask(a),s.notify?.("info",`Cancelled task: ${n.title}`),{name:"cancel_task",result:{success:!0,id:t,title:n.title}}}}}function ms(s,e){const t=e.toLowerCase();return s.tags.some(n=>n.name.toLowerCase()===t)}function gs(s){return{name:"batch_update_tasks",description:"Update multiple tasks matching a filter criteria. All matching tasks receive the same updates. Filters use exact matching for status and category, case-insensitive matching for tags.",schema:{type:"object",properties:{filter:{type:"object",description:"Filter criteria to select tasks to update. All conditions are combined with AND logic.",properties:{status:{type:"string",description:"Filter by exact task status",enum:["done","scheduled","todo","due","overdue","cancelled","unplanned","doing"]},category:{type:"string",description:"Filter by exact category match"},tag:{type:"string",description:"Filter by tag name (case-insensitive)"},recurring:{type:"boolean",description:"Filter by recurrence: true for recurring tasks, false for non-recurring"}}},update:{type:"object",description:"Fields to update on all matching tasks. Omitted fields are not changed.",properties:{status:{type:"string",description:"New status (only terminal/settable states allowed)",enum:["todo","done","cancelled"]},priority:{type:"string",description:"New priority level",enum:["low","medium","high"]},dueAt:{type:"string",description:"New due date in ISO 8601 format (YYYY-MM-DD)"},category:{type:"string",description:"New task category"},recurrence:{type:"string",description:"Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO). Use empty string to clear recurrence."}}}},required:["filter","update"]},async execute(e){const t=e.filter,n=e.update;if(!t||!n)return{name:"batch_update_tasks",result:{success:!1,error:"filter and update are required"}};const a=t.status,o=t.category,d=t.tag,r=t.recurring,g=(await s.getTasks()).filter(y=>!(a!==void 0&&y.status!==a||o!==void 0&&y.category!==o||d!==void 0&&!ms(y,d)||r!==void 0&&(r&&y.isRecurring!==!0||!r&&y.isRecurring===!0)));if(g.length>0){const y=await s.confirm?.(`Update ${g.length} task${g.length===1?"":"s"}?`,"This will apply changes to all matching tasks.");if(y===!1||y===null)return{name:"batch_update_tasks",result:{success:!1,message:"Cancelled by user",updated:0}}}const A=[],N=[];for(const y of g){const T={};if(n.status!==void 0&&(T.status=n.status),n.priority!==void 0&&(T.priority=n.priority),n.dueAt!==void 0&&(T.dueAt=n.dueAt),n.category!==void 0&&(T.category=n.category),n.recurrence!==void 0){const D=n.recurrence;D===""?(T.isRecurring=void 0,T.recurringInterval=void 0):(T.isRecurring=!0,T.recurringInterval=D)}const O={...y,...T},Y=ce(O),w={...O,status:Y};await s.updateTask(w),A.push(y.id),N.push(w)}return N.length>0&&s.showToast?.({variant:"success",title:`Updated ${N.length} task${N.length===1?"":"s"}`,detail:[{type:"task-list",tasks:N,label:"Updated Tasks"}],timeout:6e3}),s.notify?.("success",`Updated ${g.length} task${g.length===1?"":"s"}`),{name:"batch_update_tasks",result:{success:!0,updatedCount:g.length,taskIds:A}}}}}function ks(s){return{name:"get_task_stats",description:"Get aggregate statistics about all tasks including counts by status, priority, category, completion metrics, and recurring task count.",schema:{type:"object",properties:{}},async execute(){const e=await s.getTasks(),t={total:e.length,byStatus:{},byPriority:{},byCategory:{},overdue:0,completedToday:0,completionRate:0,recurring:0,generatedAt:new Date().toISOString()},n=ne();for(const a of e)t.byStatus[a.status]=(t.byStatus[a.status]??0)+1,t.byPriority[a.priority]=(t.byPriority[a.priority]??0)+1,a.category&&(t.byCategory[a.category]=(t.byCategory[a.category]??0)+1),a.status==="overdue"&&(t.overdue+=1),a.completedAt&&a.completedAt.startsWith(n)&&(t.completedToday+=1),a.isRecurring&&(t.recurring+=1);if(e.length>0){const o=(t.byStatus.done??0)/e.length;t.completionRate=Math.round(o*100)/100}return s.showToast?.({variant:"info",title:"Task Statistics",description:`${t.total} total tasks`,detail:[{type:"stats",data:{total:t.total,byStatus:t.byStatus,byPriority:t.byPriority}}],timeout:8e3}),{name:"get_task_stats",result:t}}}}const et={high:0,medium:1,low:2};function tt(s,e){return et[s.priority]-et[e.priority]}function hs(s){return{name:"get_today_plan",description:"Get today's task plan with tasks due today (sorted by priority) and overdue tasks (sorted by priority).",schema:{type:"object",properties:{}},async execute(){const e=await s.getTasks(),t=ne(),n=[],a=[],o=[],d=[];for(const g of e){const A={id:g.id,title:g.title,priority:g.priority,status:g.status,...g.category?{category:g.category}:{},tags:g.tags.map(N=>N.name),...g.isRecurring!==void 0?{isRecurring:g.isRecurring}:{}};g.dueAt===t&&g.status!=="done"&&g.status!=="cancelled"&&(n.push(A),o.push(g)),g.status==="overdue"&&(a.push(A),d.push(g))}n.sort(tt),a.sort(tt);const r={date:t,todayTasks:n,todayCount:n.length,overdueTasks:a,overdueCount:a.length},c=[];return o.length>0&&c.push({type:"task-list",tasks:o,label:"Today"}),d.length>0&&c.push({type:"task-list",tasks:d,label:"Overdue"}),c.length>0&&s.showToast?.({variant:d.length>0?"warning":"info",title:"Today's Plan",description:`${r.todayCount} due today, ${r.overdueCount} overdue`,detail:c,timeout:1e4}),{name:"get_today_plan",result:r}}}}function fs(s){return{name:"notify_user",description:"Show a notification to the user with a title, optional description, body text, and optional timeout. Use this to communicate results, progress, or important information.",schema:{type:"object",properties:{variant:{type:"string",description:"Visual style of the notification",enum:["success","error","info","warning"]},title:{type:"string",description:"Short headline for the notification (required)"},description:{type:"string",description:"Brief subtitle below the title"},body:{type:"string",description:"Longer text content for detailed information"},timeout:{type:"number",description:"Auto-dismiss after this many milliseconds. Use 0 or null for persistent notifications. Default: 8000"}},required:["variant","title"]},async execute(e){const t=e.variant,n=e.title,a=e.description,o=e.body,d=e.timeout,r=d===null||d===0?null:d??8e3;return s.showToast?.({variant:t,title:n,description:a,body:o,timeout:r}),{name:"notify_user",result:{success:!0}}}}}function ys(s){return{name:"ask_user",description:"Ask the user a question and wait for their response. Supports three modes: free-text input (question only), select from options (question + options), or yes/no confirmation (question + confirm). Use this when you need clarification or user input before proceeding.",schema:{type:"object",properties:{question:{type:"string",description:"The question to ask the user (required)"},options:{type:"array",description:"List of options for the user to choose from. When provided, renders a selection list.",items:{type:"object",properties:{label:{type:"string",description:"Display text for this option"},value:{type:"string",description:"Value returned when this option is selected"}}}},confirm:{type:"boolean",description:"When true, presents a yes/no confirmation dialog instead of free-text input"}},required:["question"]},async execute(e){const t=e.question,n=e.options,a=e.confirm,o={question:t,answer:null,error:"User interaction not available"};if(a){if(!s.confirm)return{name:"ask_user",result:o};const r=e.description,c=await s.confirm(t,r);return c===null?{name:"ask_user",result:{question:t,answer:null,dismissed:!0}}:{name:"ask_user",result:{question:t,answer:c?"yes":"no"}}}if(n&&n.length>0){if(!s.select)return{name:"ask_user",result:o};const r=await s.select(t,n);return r===null?{name:"ask_user",result:{question:t,answer:null,dismissed:!0}}:{name:"ask_user",result:{question:t,answer:r}}}if(!s.prompt)return{name:"ask_user",result:o};const d=await s.prompt(t);return d===null?{name:"ask_user",result:{question:t,answer:null,dismissed:!0}}:{name:"ask_user",result:{question:t,answer:d}}}}}function Ts(s){return{name:"all-tasks",uri:"tasks://all",description:"List of all tasks in the system.",mimeType:"application/json",async read(){const e=await s.getTasks();return{contents:[{uri:"tasks://all",text:JSON.stringify({tasks:e,count:e.length,generatedAt:new Date().toISOString()}),mimeType:"application/json"}]}}}}function vs(s){return{name:"task-by-id",uri:"tasks://task",uriTemplate:"tasks://{taskId}",description:"Retrieve a single task by its ID.",mimeType:"application/json",async read(e){const t=e?.taskId??"",n=await s.getTask(t);return{contents:[{uri:`tasks://${t}`,text:JSON.stringify({task:n??null,found:n!==null}),mimeType:"application/json"}]}}}}function bs(s){return[{name:"overdue-tasks",uri:"tasks://overdue",description:"Tasks that are currently overdue.",mimeType:"application/json",async read(){const o=(await s.getTasks()).filter(d=>d.status==="overdue");return{contents:[{uri:"tasks://overdue",text:JSON.stringify({tasks:o,count:o.length,generatedAt:new Date().toISOString()}),mimeType:"application/json"}]}}},{name:"today-tasks",uri:"tasks://today",description:"Tasks due today or starting today.",mimeType:"application/json",async read(){const a=await s.getTasks(),o=ne(),d=a.filter(r=>r.dueAt===o||r.startAt===o);return{contents:[{uri:"tasks://today",text:JSON.stringify({tasks:d,count:d.length,generatedAt:new Date().toISOString()}),mimeType:"application/json"}]}}},{name:"upcoming-tasks",uri:"tasks://upcoming",description:"Tasks due in the next 7 days (excluding today).",mimeType:"application/json",async read(){const a=await s.getTasks(),o=ne(),d=Mt(7),r=a.filter(c=>c.dueAt?c.dueAt>o&&c.dueAt<=d:!1);return{contents:[{uri:"tasks://upcoming",text:JSON.stringify({tasks:r,count:r.length,generatedAt:new Date().toISOString()}),mimeType:"application/json"}]}}}]}function ws(s){return{name:"stats",uri:"tasks://stats",description:"Aggregate statistics about all tasks including counts by status, priority, category, completion metrics, and recurring task count.",mimeType:"application/json",async read(){const e=await s.getTasks(),t=ne(),n={total:e.length,byStatus:{},byPriority:{},byCategory:{},overdue:0,completedToday:0,completionRate:0,recurring:0,generatedAt:new Date().toISOString()};for(const a of e)n.byStatus[a.status]=(n.byStatus[a.status]??0)+1,n.byPriority[a.priority]=(n.byPriority[a.priority]??0)+1,a.category&&(n.byCategory[a.category]=(n.byCategory[a.category]??0)+1),a.status==="overdue"&&(n.overdue+=1),a.completedAt&&a.completedAt.startsWith(t)&&(n.completedToday+=1),a.isRecurring&&(n.recurring+=1);if(e.length>0){const o=(n.byStatus.done??0)/e.length;n.completionRate=Math.round(o*100)/100}return{contents:[{uri:"tasks://stats",text:JSON.stringify(n),mimeType:"application/json"}]}}}}function xs(s){return{name:"plan_my_day",description:"Review today's tasks and create a prioritized plan for the day.",arguments:[{name:"focusArea",description:"What to prioritize today",required:!1}],async render(e){const t=await s.getTasks(),n=ne(),a=t.filter(r=>r.dueAt?.startsWith(n)&&r.status!=="done"&&r.status!=="cancelled"),o=t.filter(r=>r.status==="overdue"),d=["Review my tasks for today and create a prioritized plan."];e?.focusArea&&d.push(`Focus area: ${e.focusArea}`),d.push(""),d.push(`## Today's Tasks (${a.length})`);for(const r of a)d.push(`- [${r.status}] ${r.title} (${r.priority})`);d.push(""),d.push(`## Overdue (${o.length})`);for(const r of o)d.push(`- ${r.title} — due ${r.dueAt}`);return d.push(""),d.push("Use the available tools to reschedule, complete, or update tasks as needed."),[{role:"user",content:d.join(`
`)}]}}}function As(s){return{name:"weekly_review",description:"Review task progress for the week and suggest priorities for next week.",arguments:[{name:"weekStart",description:"Start of week (YYYY-MM-DD)",required:!1}],async render(){const e=await s.getTasks(),t=e.filter(r=>r.status==="done"),n=e.filter(r=>r.status==="overdue"),a=e.filter(r=>r.status!=="done"&&r.status!=="cancelled"&&r.status!=="overdue"),o=e.length,d=["Review my task progress for this week and suggest priorities for next week.","","## Summary",`- Completed: ${t.length}`,`- Overdue: ${n.length}`,`- Active: ${a.length}`,`- Total: ${o}`,"","## Completed Tasks"];for(const r of t)d.push(`- ${r.title} (completed)`);d.push(""),d.push("## Still Active");for(const r of[...n,...a]){const c=r.dueAt?` — due ${r.dueAt}`:"";d.push(`- [${r.status}] ${r.title} (${r.priority})${c}`)}return d.push(""),d.push("Suggest what to prioritize next week and which overdue tasks to reschedule or cancel."),[{role:"user",content:d.join(`
`)}]}}}function Ss(s){return{name:"task_triage",description:"Triage tasks by identifying stale items and suggesting actions.",async render(){const e=await s.getTasks(),t=e.filter(o=>o.status==="overdue"),n=e.filter(o=>o.status==="unplanned"||o.status==="todo"&&!o.dueAt),a=["Triage my tasks: identify stale items and suggest actions.","",`## Overdue (${t.length})`];for(const o of t)a.push(`- ${o.title} — due ${o.dueAt} (${o.priority})`);a.push(""),a.push(`## Unscheduled (${n.length})`);for(const o of n)a.push(`- ${o.title} (${o.priority})`);return a.push(""),a.push("For each task, suggest one action: reschedule to a specific date, cancel, or complete. Use the available tools to make changes."),[{role:"user",content:a.join(`
`)}]}}}function Cs(s){const e=[ss(s),ls(s),ds(s),cs(s),us(s),ps(s),gs(s),ks(s),hs(s),fs(s),ys(s)],t=[Ts(s),vs(s),...bs(s),ws(s)],n=[xs(s),As(s),Ss(s)],a=new Map(e.map(r=>[r.name,r])),o=new Map(t.map(r=>[r.name,r])),d=new Map(n.map(r=>[r.name,r]));return{tools:e,resources:t,prompts:n,getTool:r=>a.get(r),getResource:r=>o.get(r),getPrompt:r=>d.get(r),getSystemPrompt:(r,c)=>Bt(r,c),async executeTool(r,c){const g=a.get(r);return g?g.execute(c):{name:r,result:{error:`Unknown tool: ${r}`}}}}}function Is(s,e){return[...s??[],{role:"user",content:e}]}function js(s,e){const t=e.trim();return t?[...s,{role:"assistant",content:t}]:s}const Ns=(s,e,t,n,a,o,d,r,c,g,A,N,y,T)=>{const O=m.useRef(s),Y=m.useRef(new Map);return m.useEffect(()=>{O.current=s},[s]),{handleAICommand:async(D,ge)=>{const q=a.aiConfig.activeProvider,B=a.aiConfig.providers[q],X=ge?.sessionId??null,te=X?Y.current.get(X):void 0,oe=!!(X&&te),_=oe&&X?X:`agent-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,L=()=>new Date().toISOString(),P=k=>{T?.onAgentEvent?.(k)};P(oe?{kind:"user-message",sessionId:_,timestamp:L(),text:D}:{kind:"session-start",sessionId:_,timestamp:L(),prompt:D,provider:q,model:B.model});const Fe={getTasks:async()=>O.current,getTask:async k=>O.current.find(E=>E.id===k)??null,addTask:async k=>{await e(k)},updateTask:async k=>{const E=O.current.find(v=>v.id===k.id);E&&await t(k,E)},deleteTask:async k=>{const E=O.current.find(v=>v.id===k);E&&await n(k,E)},getSettings:()=>a,notify:(k,E)=>d(k,E),showToast:g?k=>g({...k,interaction:{kind:"dismiss"},timeout:k.timeout??8e3}):void 0,confirm:A,select:N,prompt:y},le=T?.capabilities??Cs(T?.capabilityContext??Fe),se=le.tools.map(k=>({name:k.name,description:k.description,parameters:k.schema})),F=le.getSystemPrompt(c,a.aiConfig.systemPrompt);let $=Is(te,D);Y.current.set(_,$);try{const k=T?.providerFactory??Ft;P({kind:"status",sessionId:_,timestamp:L(),message:"Connecting to provider"});const E=await k(q,B);f.info("AI",`Sending prompt to ${q}`,{input:D,model:B.model}),P({kind:"status",sessionId:_,timestamp:L(),message:"Thinking"});let v=await E.chat(F,D,se,void 0,$);if(r&&(v.tokenUsage||v.tokenCount)){const M=v.tokenUsage||{inputTokens:0,outputTokens:0,totalTokens:v.tokenCount||0};r({provider:q,model:B.model,tokenUsage:M,totalTokens:M.totalTokens}),f.debug("AI","Token Usage",{tokenUsage:M})}let V=0;const ue=5;for(;v.toolCalls&&v.toolCalls.length>0&&V<ue;){V++,$.push({role:"assistant",content:v.text,toolCalls:v.toolCalls});const M=[];for(const b of v.toolCalls){if(!b.name)continue;f.info("AI",`Executing tool: ${b.name}`,b.args),P({kind:"tool-call",sessionId:_,timestamp:L(),toolCallId:b.id,toolName:b.name,args:b.args});const H=await le.executeTool(b.name,b.args);P({kind:"tool-result",sessionId:_,timestamp:L(),toolCallId:b.id,toolName:b.name,result:H.result}),M.push({id:b.id,name:b.name,result:H.result})}if($.push({role:"tool",toolResults:M}),P({kind:"status",sessionId:_,timestamp:L(),message:"Reviewing tool results"}),v=await E.chat(F,D,se,M,$),r&&(v.tokenUsage||v.tokenCount)){const b=v.tokenUsage||{inputTokens:0,outputTokens:0,totalTokens:v.tokenCount||0};r({provider:q,model:B.model,tokenUsage:b,totalTokens:b.totalTokens})}}if(v.text?.trim()){const M=v.text.trim();P({kind:"assistant-message",sessionId:_,timestamp:L(),text:M}),$=js($,M),T?.onAgentEvent&&T.shouldNotifyAgentResponse?.()?d("success","Agent replied","Response added to the agent conversation."):T?.onAgentEvent||d("info","AI",M)}Y.current.set(_,$),P({kind:"session-complete",sessionId:_,timestamp:L()})}catch(k){f.error("AI","Agent processing failed",k),P({kind:"error",sessionId:_,timestamp:L(),message:k instanceof Error?k.message:"Something went wrong while processing your request."}),d("error","AI Agent Error",k instanceof Error?k.message:"Something went wrong while processing your request.")}}}};function Z(s,e,t,n,a,o){const d="toolCallId"in s&&s.toolCallId?s.toolCallId:s.kind;return{id:`${s.sessionId}-${d}-${s.timestamp}-${Math.random().toString(36).slice(2,8)}`,kind:e,title:t,body:n,timestamp:s.timestamp,payload:a,toolName:o}}function Ye(s,e,t){return{...s,status:e,updatedAt:t}}function Ds(s,e){if(e.kind==="session-start"){const t={id:e.sessionId,prompt:e.prompt,provider:e.provider,model:e.model,status:"running",startedAt:e.timestamp,updatedAt:e.timestamp,entries:[Z(e,"user","You",e.prompt),Z(e,"status","Agent started",`${e.provider} · ${e.model||"default model"}`)]};return[...s.filter(n=>n.id!==e.sessionId),t]}return s.map(t=>{if(t.id!==e.sessionId)return t;switch(e.kind){case"status":return{...t,updatedAt:e.timestamp,entries:[...t.entries,Z(e,"status","Status",e.message)]};case"assistant-message":return{...t,updatedAt:e.timestamp,entries:[...t.entries,Z(e,"assistant","Agent",e.text)]};case"user-message":return{...Ye(t,"running",e.timestamp),entries:[...t.entries,Z(e,"user","You",e.text)]};case"tool-call":return{...t,updatedAt:e.timestamp,entries:[...t.entries,Z(e,"tool-call",`Using ${e.toolName}`,void 0,e.args,e.toolName)]};case"tool-result":return{...t,updatedAt:e.timestamp,entries:[...t.entries,Z(e,"tool-result",`${e.toolName} result`,void 0,e.result,e.toolName)]};case"error":return{...Ye(t,"error",e.timestamp),entries:[...t.entries,Z(e,"error","Error",e.message)]};case"session-complete":return Ye(t,"complete",e.timestamp)}})}function Es(s){const[e,t]=m.useState([]),n=m.useCallback(o=>{s?.(o),t(d=>Ds(d,o))},[s]),a=m.useCallback(()=>{t([])},[]);return{agentSessions:e,emitAgentEvent:n,clearAgentSessions:a}}const R={theme:"light",dateFormat:"MMM d",showCompleted:!0,showProgressBar:!0,soundEnabled:!1,fontSize:"base",useRelativeDates:!0,groupingStrategy:["dueAt"],aiConfig:{enabled:!0,defaultMode:!1,activeProvider:"gemini",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:"",useResponsesApi:!0},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:"",useResponsesApi:!1}},systemPrompt:""},voiceConfig:{enabled:!0,activeProvider:"browser",language:"",providers:{browser:{},openai:{apiKey:"",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"",model:"gemini-1.5-flash"}}},defaultFocusMode:!1,totalTokenUsage:0,tokenUsageByModel:{},defaultCategory:"General",filters:{tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""},sort:{field:"createdAt",direction:"asc",script:""}},Rs={isOpen:!1,activeSessionId:null,unreadCount:0};function Us(s,e){switch(e.type){case"open":return{...s,isOpen:!0,unreadCount:0};case"close":return{...s,isOpen:!1};case"clear":return{...s,activeSessionId:null,unreadCount:0};case"select":return{...s,activeSessionId:e.sessionId,unreadCount:0};case"new-session":return{...s,isOpen:!0,activeSessionId:null,unreadCount:0};case"event":return e.event.kind==="session-start"?{isOpen:!0,activeSessionId:e.event.sessionId,unreadCount:0}:{...s,unreadCount:s.isOpen?0:s.unreadCount+1}}}const dt=({className:s,tasks:e,onTaskAdded:t,onTaskUpdated:n,onTaskDeleted:a,settingsRepository:o,apiKey:d,systemInDarkMode:r,onItemClick:c,customSettingsTabs:g,renderTitle:A,aiSystemPrompt:N,aiProviderFactory:y,aiCapabilityContext:T,aiCapabilities:O,voiceRuntime:Y,onAgentEvent:w})=>{const[D,ge]=m.useState(!1),[q,B]=m.useReducer(Us,Rs),[X,te]=m.useState(null),[oe,_]=m.useState(null),[L,P]=m.useState([]),[Fe,le]=m.useState(null),se=m.useMemo(()=>o||new Gt,[o]),[F,$]=m.useState(()=>d?{...R,aiConfig:{...R.aiConfig,providers:{...R.aiConfig.providers,gemini:{...R.aiConfig.providers.gemini,apiKey:d}}}}:R),[k,E]=m.useState(!1),[,v]=m.useTransition(),[V,ue]=m.useState(R.defaultFocusMode),[M,b]=m.useState(!1),[H,de]=m.useState(F.filters),[Ke,ke]=m.useState(F.sort),ct=m.useDeferredValue(H),{agentSessions:Ge,emitAgentEvent:Ve,clearAgentSessions:He}=Es(w),ut=m.useCallback(()=>{B({type:"open"})},[]),pt=m.useCallback(()=>{B({type:"close"})},[]),mt=m.useCallback(()=>{He(),B({type:"clear"})},[He]),gt=m.useCallback(l=>{B({type:"select",sessionId:l})},[]),kt=m.useCallback(()=>{B({type:"new-session"})},[]),ht=m.useCallback(l=>{Ve(l),B({type:"event",event:l})},[Ve]);m.useEffect(()=>{(async()=>{f.info("App","Loading settings...");try{const p=await se.loadSettings();if(p){const u={...R,...p,aiConfig:{...R.aiConfig,...p.aiConfig||{},providers:{...R.aiConfig.providers,...p.aiConfig?.providers||{},...Object.fromEntries(Object.keys(R.aiConfig.providers).map(x=>[x,{...R.aiConfig.providers[x],...p.aiConfig?.providers?.[x]||{}}]))}},voiceConfig:{...R.voiceConfig,...p.voiceConfig||{},providers:{...R.voiceConfig.providers,...p.voiceConfig?.providers||{}}}};if(u.filters){const x=u.filters;Array.isArray(x.tags)&&(x.tags.length===0||typeof x.tags[0]=="string")&&(u.filters={tags:{include:x.tags,exclude:[]},categories:{include:x.categories,exclude:[]},priorities:{include:x.priorities,exclude:[]},statuses:{include:x.statuses,exclude:[]},enableScript:x.enableScript??!1,script:x.script??""})}const h=d?{...u,aiConfig:{...u.aiConfig,providers:{...u.aiConfig.providers,gemini:{...u.aiConfig.providers.gemini,apiKey:d}}}}:u;$(h),ue(h.defaultFocusMode),b(h.aiConfig.enabled&&h.aiConfig.defaultMode),de(h.filters),ke(h.sort)}else b(R.aiConfig.enabled&&R.aiConfig.defaultMode);E(!0)}catch(p){f.error("App","Failed to load settings",p),E(!0)}})()},[se,d]),m.useEffect(()=>{k&&se.saveSettings(F)},[F,se,k]);const pe=m.useRef(new Map),W=m.useCallback(l=>{const p=Math.random().toString(36).slice(2,11);return P(u=>[...u,{...l,id:p}]),p},[]),z=m.useCallback(l=>{P(u=>u.filter(h=>h.id!==l));const p=pe.current.get(l);p&&(p.resolve(!1),pe.current.delete(l)),le(u=>u===l?null:u)},[]),J=m.useCallback((l,p,u)=>{W({variant:l,title:p,description:u,interaction:{kind:"dismiss"},timeout:4e3}),f.info("Notification",p,{type:l,description:u})},[W]),ft=m.useCallback(l=>{W(l)},[W]),yt=m.useCallback((l,p)=>new Promise(u=>{const h=W({variant:"info",title:l,description:p,interaction:{kind:"confirm",onConfirm:()=>{u(!0),z(h)},onCancel:()=>{u(null),z(h)}},timeout:null});pe.current.set(h,{resolve:u})}),[W,z]),Tt=m.useCallback((l,p)=>new Promise(u=>{const h=W({variant:"info",title:l,interaction:{kind:"select",options:p,onSelect:x=>{u(x),z(h)},onCancel:()=>{u(null),z(h)}},timeout:null});pe.current.set(h,{resolve:u})}),[W,z]),vt=m.useCallback(l=>new Promise(p=>{const u=W({variant:"info",title:l,interaction:{kind:"prompt",onSubmit:h=>{p(h),z(u)},onCancel:()=>{p(null),z(u)}},timeout:null});pe.current.set(u,{resolve:p})}),[W,z]),bt=m.useCallback(l=>{le(p=>p===l?null:l)},[]),wt=l=>{$(p=>{const u=`${l.provider}:${l.model}`,h=p.tokenUsageByModel[u]||{inputTokens:0,outputTokens:0,totalTokens:0};return{...p,totalTokenUsage:p.totalTokenUsage+l.totalTokens,tokenUsageByModel:{...p.tokenUsageByModel,[u]:{inputTokens:h.inputTokens+l.tokenUsage.inputTokens,outputTokens:h.outputTokens+l.tokenUsage.outputTokens,totalTokens:h.totalTokens+l.tokenUsage.totalTokens}}}})},he=F.theme==="system"?r?"midnight":"light":F.theme;m.useEffect(()=>{f.info("App","system in dark mode: ",r),oe&&(f.info("App","set theme on outer container: ",he),oe.setAttribute("data-theme",he))},[he,oe,r]);const{processedTasks:xt,uniqueTags:Je,uniqueCategories:Me}=es(e,ct,Ke),me=ts(e),Qe=async l=>{const p=e.find(h=>h.id===l.id);if(!p){console.warn(`Task ${l.id} not found`);return}const u={...l,status:ce(l)};f.info("Task","Updated task",{id:u.id,title:u.title});try{await n(u,p)}catch(h){f.error("Task","Failed to update task",{error:h}),J("error","Update Failed","Could not save changes")}},At=async l=>{const p=e.find(u=>u.id===l);if(!p){console.warn(`Task ${l} not found`);return}J("info","Task Deleted","Item removed from your list"),f.info("Task","Deleted task",{id:l});try{await a(l,p)}catch(u){f.error("Task","Failed to delete task",{error:u}),J("error","Delete Failed","Could not remove task")}},St=l=>{Qe(l),te(null)},Xe=async(l,p)=>{let u;const h={id:`new-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,status:"todo",createdAt:new Date().toISOString(),priority:"medium",tags:[],category:F.defaultCategory};if(typeof l=="string"&&p)u={...h,title:p,dueAt:l};else if(typeof l=="object")u={...h,title:"New Task",...l},u.title||(u.title="Untitled Task");else return;u.status=ce(u),f.info("Task","Created task",{id:u.id,title:u.title});try{await t(u)}catch(x){f.error("Task","Failed to add task",{error:x}),J("error","Add Failed","Could not create task")}},{handleAICommand:Ct}=Ns(e,t,n,a,F,Xe,J,wt,N,ft,yt,Tt,vt,{providerFactory:y,capabilityContext:T,capabilities:O,onAgentEvent:ht,shouldNotifyAgentResponse:()=>!q.isOpen}),It=async l=>{await Ct(l,{sessionId:q.activeSessionId})},fe=l=>{const p=l.every(u=>H.statuses.include.includes(u))&&H.statuses.include.length===l.length;de(u=>({...u,statuses:{...u.statuses,include:p?[]:l}}))},ye=l=>l.every(p=>H.statuses.include.includes(p))&&H.statuses.include.length===l.length,jt=l=>{J("error","Voice Input Error",l),f.error("Voice",l)};return i.jsx("div",{ref:_,className:Q("tasks-timeline-app bg-paper text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900 transition-colors duration-300 antialiased",s),children:i.jsx(Ot,{theme:he,children:i.jsx(qt,{value:{tasks:xt,availableCategories:Me,availableTags:Je,onUpdateTask:Qe,onDeleteTask:At,onAddTask:Xe,onEditTask:te,onAICommand:It,onItemClick:c,renderTitle:A},children:i.jsx(_t,{value:{settings:F,updateSettings:l=>{$(p=>({...p,...l})),l.filters&&de(l.filters),l.sort&&ke(l.sort)},isFocusMode:V,toggleFocusMode:()=>ue(!V),isAiMode:M,toggleAiMode:()=>b(!M),filters:H,onFilterChange:de,sort:Ke,onSortChange:ke,onVoiceError:jt,voiceRuntime:Y,hasAgentSession:Ge.length>0,isAgentPanelOpen:q.isOpen,isAgentConversationActive:q.activeSessionId!==null,agentPanelUnreadCount:q.unreadCount,onOpenAgentPanel:ut,onOpenSettings:F.settingButtonOnInputBar===!1?void 0:()=>ge(!0)},children:i.jsxs("div",{className:"max-w-3xl mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 border-x border-slate-100 pb-10 relative",children:[i.jsxs("div",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300",children:[i.jsx($e,{FallbackComponent:it,onError:(l,p)=>{f.error("InputBar","Error caught by boundary",{error:l,info:p}),J("error","Input Error",l instanceof Error?l.message:String(l))},onReset:()=>{b(!1)},children:i.jsx(Dt,{})}),i.jsx("div",{className:"px-4 sm:px-6 pb-3",children:i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsxs("button",{onClick:()=>{v(()=>ue(!V))},className:Q("rounded-lg p-2 flex flex-col items-center justify-center border w-20 shrink-0 transition-all",V?"bg-purple-100 border-purple-400 text-purple-700 shadow-inner":"bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200"),title:V?"Turn Off Focus Mode":"Turn On Focus Mode",children:[i.jsx(G,{name:V?"Minimize2":"Target",size:20,className:"mb-0.5"}),i.jsx("span",{className:"text-[9px] font-bold uppercase tracking-wider truncate w-full text-center",children:"Focus"})]}),i.jsxs("div",{className:"grid grid-cols-4 gap-2 flex-1",children:[i.jsxs("button",{onClick:()=>fe(["todo"]),className:Q("rounded-lg p-2 flex flex-col items-center justify-center border",ye(["todo"])?"bg-slate-100 border-slate-400":"bg-slate-50 border-slate-100"),children:[i.jsx("span",{className:"text-lg font-black text-slate-800 leading-none",children:me.todo}),i.jsx("span",{className:"text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate w-full text-center",children:"To Do"})]}),i.jsxs("button",{onClick:()=>fe(["unplanned"]),className:Q("rounded-lg p-2 flex flex-col items-center justify-center border",ye(["unplanned"])?"bg-purple-100 border-purple-400":"bg-purple-50 border-purple-100"),children:[i.jsx("span",{className:"text-lg font-black text-purple-600 leading-none",children:me.unplanned}),i.jsx("span",{className:"text-[9px] font-bold text-purple-400 uppercase tracking-wider mt-1 truncate w-full text-center",children:"Unplanned"})]}),i.jsxs("button",{onClick:()=>fe(["due","overdue"]),className:Q("rounded-lg p-2 flex flex-col items-center justify-center border",ye(["due","overdue"])?"bg-rose-100 border-rose-400":"bg-rose-50 border-rose-100"),children:[i.jsx("span",{className:"text-lg font-black text-rose-600 leading-none",children:me.urgent}),i.jsx("span",{className:"text-[9px] font-bold text-rose-400 uppercase tracking-wider mt-1 truncate w-full text-center",children:"Due & OD"})]}),i.jsxs("button",{onClick:()=>fe(["scheduled","doing"]),className:Q("rounded-lg p-2 flex flex-col items-center justify-center border",ye(["scheduled","doing"])?"bg-blue-100 border-blue-400":"bg-blue-50 border-blue-100"),children:[i.jsx("span",{className:"text-lg font-black text-blue-600 leading-none",children:me.scheduled+me.doing}),i.jsx("span",{className:"text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1 truncate w-full text-center",children:"Doing"})]})]})]})})]}),i.jsxs("main",{className:"px-4 sm:px-6 pt-6",children:[i.jsx(at,{isOpen:q.isOpen,sessions:Ge,activeSessionId:q.activeSessionId,onSelectSession:gt,onStartNewSession:kt,onClose:pt,onClear:mt}),i.jsx($e,{FallbackComponent:rt,onError:(l,p)=>{f.error("TodoList","Error caught by boundary",{error:l,info:p}),J("error","Task List Error",l instanceof Error?l.message:String(l))},onReset:()=>{de({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},script:"",enableScript:!1})},children:i.jsx(Nt,{})})]}),i.jsx("footer",{className:"mt-10 py-6 text-center text-slate-400 text-xs border-t border-slate-50",children:i.jsx("p",{children:"Timeline Tasks View"})}),i.jsx("div",{className:"fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 pointer-events-none",children:i.jsx(st,{children:L.map(l=>i.jsx(Ut,{toast:l,onDismiss:z,isExpanded:Fe===l.id,onToggleExpand:bt},l.id))})}),i.jsx(Et,{isOpen:D,onClose:()=>ge(!1),settings:F,onUpdateSettings:l=>{$(l),de(l.filters),ke(l.sort)},availableTags:Je,availableCategories:Me,customTabs:g}),i.jsx($e,{FallbackComponent:ot,onError:(l,p)=>{f.error("TaskEditModal","Error in modal",{error:l,info:p}),J("error","Failed to Edit Task",l instanceof Error?l.message:String(l))},onReset:()=>{te(null)},children:i.jsx(Rt,{isOpen:!!X,onClose:()=>te(null),task:X,onSave:St,availableCategories:Me})})]})})})})})};dt.__docgenInfo={description:"",methods:[],displayName:"TasksTimelineApp",props:{className:{required:!1,tsType:{name:"string"},description:""},tasks:{required:!0,tsType:{name:"Array",elements:[{name:"Task"}],raw:"Task[]"},description:""},onTaskAdded:{required:!0,tsType:{name:"signature",type:"function",raw:"(task: Task) => void | Promise<void>",signature:{arguments:[{type:{name:"Task"},name:"task"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},onTaskUpdated:{required:!0,tsType:{name:"signature",type:"function",raw:"(task: Task, previous: Task) => void | Promise<void>",signature:{arguments:[{type:{name:"Task"},name:"task"},{type:{name:"Task"},name:"previous"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},onTaskDeleted:{required:!0,tsType:{name:"signature",type:"function",raw:"(taskId: string, previous: Task) => void | Promise<void>",signature:{arguments:[{type:{name:"string"},name:"taskId"},{type:{name:"Task"},name:"previous"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:""},settingsRepository:{required:!1,tsType:{name:"SettingsRepository"},description:""},apiKey:{required:!1,tsType:{name:"string"},description:""},systemInDarkMode:{required:!1,tsType:{name:"boolean"},description:""},onItemClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(item: Task) => void",signature:{arguments:[{type:{name:"Task"},name:"item"}],return:{name:"void"}}},description:""},customSettingsTabs:{required:!1,tsType:{name:"Array",elements:[{name:"CustomSettingsTab"}],raw:"CustomSettingsTab[]"},description:"Custom tabs to inject into the Settings page"},renderTitle:{required:!1,tsType:{name:"signature",type:"function",raw:"(title: string) => React.ReactNode",signature:{arguments:[{type:{name:"string"},name:"title"}],return:{name:"ReactReactNode",raw:"React.ReactNode"}}},description:"Custom renderer for task titles. When provided, replaces the default plain-text display."},aiSystemPrompt:{required:!1,tsType:{name:"string"},description:"Additional system prompt injected by the host application"},aiProviderFactory:{required:!1,tsType:{name:"signature",type:"function",raw:`(
  provider: AppSettings["aiConfig"]["activeProvider"],
  config: AppSettings["aiConfig"]["providers"][AppSettings["aiConfig"]["activeProvider"]],
) => Promise<IAIProvider>`,signature:{arguments:[{type:{name:'AppSettings["aiConfig"]["activeProvider"]',raw:'AppSettings["aiConfig"]["activeProvider"]'},name:"provider"},{type:{name:'AppSettings["aiConfig"]["providers"][AppSettings["aiConfig"]["activeProvider"]]',raw:'AppSettings["aiConfig"]["providers"][AppSettings["aiConfig"]["activeProvider"]]'},name:"config"}],return:{name:"Promise",elements:[{name:"IAIProvider"}],raw:"Promise<IAIProvider>"}}},description:"Host-provided AI provider factory. Defaults to the built-in provider adapters."},aiCapabilityContext:{required:!1,tsType:{name:"CapabilityContext"},description:"Host-provided capability context for the built-in AI agent."},aiCapabilities:{required:!1,tsType:{name:"Capabilities"},description:"Fully constructed host capabilities for the built-in AI agent."},voiceRuntime:{required:!1,tsType:{name:"VoiceRuntime"},description:"Host runtime for voice input in embedded environments such as Obsidian."},onAgentEvent:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: AgentEvent) => void",signature:{arguments:[{type:{name:"union",raw:`| {
    kind: "session-start";
    sessionId: string;
    timestamp: ISO8601String;
    prompt: string;
    provider: AIProvider;
    model: string;
  }
| {
    kind: "status";
    sessionId: string;
    timestamp: ISO8601String;
    message: string;
  }
| {
    kind: "assistant-message";
    sessionId: string;
    timestamp: ISO8601String;
    text: string;
  }
| {
    kind: "user-message";
    sessionId: string;
    timestamp: ISO8601String;
    text: string;
  }
| {
    kind: "tool-call";
    sessionId: string;
    timestamp: ISO8601String;
    toolCallId?: string;
    toolName: string;
    args: Record<string, unknown>;
  }
| {
    kind: "tool-result";
    sessionId: string;
    timestamp: ISO8601String;
    toolCallId?: string;
    toolName: string;
    result: unknown;
  }
| {
    kind: "error";
    sessionId: string;
    timestamp: ISO8601String;
    message: string;
  }
| {
    kind: "session-complete";
    sessionId: string;
    timestamp: ISO8601String;
  }`,elements:[{name:"signature",type:"object",raw:`{
  kind: "session-start";
  sessionId: string;
  timestamp: ISO8601String;
  prompt: string;
  provider: AIProvider;
  model: string;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"session-start"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"prompt",value:{name:"string",required:!0}},{key:"provider",value:{name:"union",raw:`| "gemini"
| "openai"
| "anthropic"
| "openai-compatible"`,elements:[{name:"literal",value:'"gemini"'},{name:"literal",value:'"openai"'},{name:"literal",value:'"anthropic"'},{name:"literal",value:'"openai-compatible"'}],required:!0}},{key:"model",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "status";
  sessionId: string;
  timestamp: ISO8601String;
  message: string;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"status"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"message",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "assistant-message";
  sessionId: string;
  timestamp: ISO8601String;
  text: string;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"assistant-message"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"text",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "user-message";
  sessionId: string;
  timestamp: ISO8601String;
  text: string;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"user-message"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"text",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "tool-call";
  sessionId: string;
  timestamp: ISO8601String;
  toolCallId?: string;
  toolName: string;
  args: Record<string, unknown>;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"tool-call"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"toolCallId",value:{name:"string",required:!1}},{key:"toolName",value:{name:"string",required:!0}},{key:"args",value:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "tool-result";
  sessionId: string;
  timestamp: ISO8601String;
  toolCallId?: string;
  toolName: string;
  result: unknown;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"tool-result"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"toolCallId",value:{name:"string",required:!1}},{key:"toolName",value:{name:"string",required:!0}},{key:"result",value:{name:"unknown",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "error";
  sessionId: string;
  timestamp: ISO8601String;
  message: string;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"error"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}},{key:"message",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:`{
  kind: "session-complete";
  sessionId: string;
  timestamp: ISO8601String;
}`,signature:{properties:[{key:"kind",value:{name:"literal",value:'"session-complete"',required:!0}},{key:"sessionId",value:{name:"string",required:!0}},{key:"timestamp",value:{name:"string",required:!0}}]}}]},name:"event"}],return:{name:"void"}}},description:"Optional host observer for structured agent lifecycle events."}}};const{expect:ie}=__STORYBOOK_MODULE_TEST__,vn={title:"Core/TasksTimelineApp",component:dt,tags:["autodocs"],parameters:{layout:"fullscreen"},argTypes:{onItemClick:{action:"item-clicked"},onTaskAdded:{action:"task-added"},onTaskUpdated:{action:"task-updated"},onTaskDeleted:{action:"task-deleted"}}},S=Pt.mixed(10),U=s=>console.log("Clicked item:",s),C=s=>console.log("Task added:",s),I=(s,e)=>console.log("Task updated:",s,"Previous:",e),j=(s,e)=>console.log("Task deleted:",s,"Previous:",e),ve={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U}},be={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Verify app is rendered",async()=>{await re(500);const n=t.queryAllByRole("textbox");ie(n.length).toBeGreaterThan(0)})}},we={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,className:"custom-app-class",onItemClick:U}},xe={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,apiKey:"test-gemini-api-key",onItemClick:U}},Ae={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,systemInDarkMode:!0,onItemClick:U},parameters:{backgrounds:{default:"dark"}}},Se={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,systemInDarkMode:!1,onItemClick:U},parameters:{backgrounds:{default:"light"}}},Ce={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Find and click settings button",async()=>{await re(500);const n=t.getAllByRole("button");ie(n.length).toBeGreaterThan(0)})}},Ie={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Find Focus mode toggle",async()=>{await re(500);const n=t.getAllByRole("button");ie(n.length).toBeGreaterThan(0)})}},je={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Find status filter buttons",async()=>{await re(500);const n=t.getAllByRole("button");ie(n.length).toBeGreaterThan(3)})}},Ne={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Find input bar",async()=>{await re(500);const n=t.queryAllByRole("textbox");ie(n.length).toBeGreaterThan(0)})}},De={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Verify scrollable content",async()=>{await re(500);const n=t.queryAllByRole("button");ie(n.length).toBeGreaterThan(0)})}},Ee={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U},play:async({canvasElement:s,step:e})=>{const t=ae(s);await e("Verify dashboard stats are visible",async()=>{await re(500);const n=t.getAllByRole("button");ie(n.length).toBeGreaterThan(3)})}},Re={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j}},Ue={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,apiKey:"",onItemClick:U}},Oe={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,onItemClick:U,renderTitle:s=>s.toUpperCase()}},qe={args:{tasks:S,onTaskAdded:C,onTaskUpdated:I,onTaskDeleted:j,className:"very-long-custom-class-name-that-might-cause-issues-but-should-still-work",onItemClick:U}};ve.parameters={...ve.parameters,docs:{...ve.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  }
}`,...ve.parameters?.docs?.source}}};be.parameters={...be.parameters,docs:{...be.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify app is rendered", async () => {
      await delay(500);
      // Should have input bar
      const inputs = canvas.queryAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });
  }
}`,...be.parameters?.docs?.source}}};we.parameters={...we.parameters,docs:{...we.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className: "custom-app-class",
    onItemClick: handleItemClick
  }
}`,...we.parameters?.docs?.source}}};xe.parameters={...xe.parameters,docs:{...xe.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "test-gemini-api-key",
    onItemClick: handleItemClick
  }
}`,...xe.parameters?.docs?.source}}};Ae.parameters={...Ae.parameters,docs:{...Ae.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: true,
    onItemClick: handleItemClick
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...Ae.parameters?.docs?.source}}};Se.parameters={...Se.parameters,docs:{...Se.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: false,
    onItemClick: handleItemClick
  },
  parameters: {
    backgrounds: {
      default: "light"
    }
  }
}`,...Se.parameters?.docs?.source}}};Ce.parameters={...Ce.parameters,docs:{...Ce.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find and click settings button", async () => {
      await delay(500); // Wait for app to initialize
      const buttons = canvas.getAllByRole("button");
      // Settings button should be among the buttons
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...Ce.parameters?.docs?.source}}};Ie.parameters={...Ie.parameters,docs:{...Ie.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find Focus mode toggle", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should have Focus button
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...Ie.parameters?.docs?.source}}};je.parameters={...je.parameters,docs:{...je.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find status filter buttons", async () => {
      await delay(500);
      // Should have To Do, Unplanned, Due & OD, Doing buttons
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(3);
    });
  }
}`,...je.parameters?.docs?.source}}};Ne.parameters={...Ne.parameters,docs:{...Ne.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find input bar", async () => {
      await delay(500);
      const inputs = canvas.queryAllByRole("textbox");
      // Should have task input field
      expect(inputs.length).toBeGreaterThan(0);
    });
  }
}`,...Ne.parameters?.docs?.source}}};De.parameters={...De.parameters,docs:{...De.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify scrollable content", async () => {
      await delay(500);
      // App should render with buttons and input
      const buttons = canvas.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...De.parameters?.docs?.source}}};Ee.parameters={...Ee.parameters,docs:{...Ee.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify dashboard stats are visible", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should show stat cards (To Do, Unplanned, Due & OD, Doing)
      expect(buttons.length).toBeGreaterThan(3);
    });
  }
}`,...Ee.parameters?.docs?.source}}};Re.parameters={...Re.parameters,docs:{...Re.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted
    // OnItemClick is optional, should work without it
  }
}`,...Re.parameters?.docs?.source}}};Ue.parameters={...Ue.parameters,docs:{...Ue.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "",
    onItemClick: handleItemClick
  }
}`,...Ue.parameters?.docs?.source}}};Oe.parameters={...Oe.parameters,docs:{...Oe.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick,
    renderTitle: (title: string) => title.toUpperCase()
  }
}`,...Oe.parameters?.docs?.source}}};qe.parameters={...qe.parameters,docs:{...qe.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className: "very-long-custom-class-name-that-might-cause-issues-but-should-still-work",
    onItemClick: handleItemClick
  }
}`,...qe.parameters?.docs?.source}}};const bn=["App","WithItemClick","WithCustomClassName","WithAPIKey","SystemDarkMode","SystemLightMode","OpenSettings","ToggleFocusMode","FilterByStatus","AddNewTask","ScrollTasks","ViewTaskStats","NoOnItemClick","EmptyAPIKey","WithCustomRenderTitle","VeryLongClassName"];export{Ne as AddNewTask,ve as App,Ue as EmptyAPIKey,je as FilterByStatus,Re as NoOnItemClick,Ce as OpenSettings,De as ScrollTasks,Ae as SystemDarkMode,Se as SystemLightMode,Ie as ToggleFocusMode,qe as VeryLongClassName,Ee as ViewTaskStats,xe as WithAPIKey,we as WithCustomClassName,Oe as WithCustomRenderTitle,be as WithItemClick,bn as __namedExportsOrder,vn as default};
