import{j as g}from"./jsx-runtime-u17CrQMm.js";import{r as De}from"./iframe-C21N2aj2.js";import{r as Pe}from"./index-DUMjRBdx.js";import{A as Fe}from"./AppContext-BGpZXZLM.js";import{T as Ae}from"./TaskEditModal-DRq-RfgX.js";import{P as Oe,a as Le,b as Me,c as qe}from"./popover-DiBFMgZy.js";import{t as u}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{D as S,R as m}from"./recurrence-B2fS74Tu.js";import{d as b,e as B}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BDynpePo.js";import"./index-B7dtx8Vx.js";import"./usePortalContainer-BOxnJgF2.js";import"./Combination-DqTMqw8g.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./date-picker-D0ppNIJs.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./index-BWgloZmU.js";import"./proxy-DXqtKrn2.js";const{expect:r,fn:h,userEvent:o,waitFor:p,within:c}=__STORYBOOK_MODULE_TEST__,Ne=({children:n})=>{const[t,a]=De.useState(null);return g.jsx("div",{"data-testid":"shadow-host",ref:e=>{e&&!t&&a(e.shadowRoot??e.attachShadow({mode:"open"}))},children:t&&Pe.createPortal(n,t)})},ma={title:"Core/TaskEditModal",component:Ae,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onSave:{action:"saved"},onClose:{action:"closed"}},decorators:[(n,{parameters:t})=>{const a=t.theme,e=g.jsx("div",{className:"w-full h-screen flex items-center justify-center bg-slate-50",children:g.jsx(n,{})}),s=t.appProvider===!1?g.jsx("div",{className:"tasks-timeline-app","data-theme":a,children:e}):g.jsx(Fe,{theme:a,children:e});return t.shadowRoot?g.jsx(Ne,{children:s}):s}]},Ie=u.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high",category:"Work",tags:[{id:"1",name:"work"},{id:"2",name:"setup"}]}),f=n=>console.log("Save task:",n),w=()=>console.log("Close modal"),xe=async n=>{const t=await c(n).findByRole("dialog",{name:"Edit Task"});return await p(()=>r(getComputedStyle(t).opacity).toBe("1")),t},l={args:{isOpen:!0,task:Ie,onSave:f,onClose:w,availableCategories:["Work","Personal","Shopping","Health"]}},A={args:{isOpen:!1,task:Ie,onSave:f,onClose:w,availableCategories:["Work","Personal"]}},I={args:{isOpen:!0,task:null,onSave:f,onClose:w,availableCategories:["Work","Personal","Shopping"]}},H={args:{isOpen:!0,task:u.base({title:"Complete quarterly report",description:"Compile and analyze Q4 2024 performance metrics for executive review",priority:"high",category:"Work",tags:[{id:"1",name:"reporting"},{id:"2",name:"quarterly"},{id:"3",name:"urgent"}]}),onSave:f,onClose:w,availableCategories:["Work","Personal","Shopping","Health"]}},T={args:{isOpen:!0,task:u.base({title:"Minimal task",description:"",category:void 0,tags:[]}),onSave:f,onClose:w,availableCategories:["Work","Personal"]}},W={args:{...l.args,task:u.highPriority({title:"Critical bug fix required"})}},P={args:{...l.args,task:u.mediumPriority({title:"Regular task"})}},F={args:{...l.args,task:u.lowPriority({title:"Nice to have task"})}},O={args:{isOpen:!0,task:u.withRecurrence({title:"Daily standup",isRecurring:!0,recurringInterval:new m({freq:m.DAILY,interval:1}).toString()}),onSave:f,onClose:w,availableCategories:["Work"]}},L={args:{isOpen:!0,task:u.withRecurrence({title:"Weekly team meeting",isRecurring:!0,recurringInterval:new m({freq:m.WEEKLY,interval:1,byweekday:[m.MO,m.WE,m.FR]}).toString()}),onSave:f,onClose:w,availableCategories:["Work"]}},M={args:{isOpen:!0,task:u.withRecurrence({title:"Monthly report",isRecurring:!0,recurringInterval:new m({freq:m.MONTHLY,interval:1,bymonthday:[1]}).toString()}),onSave:f,onClose:w,availableCategories:["Work"]}},R={args:{isOpen:!0,task:u.withRecurrence({title:"Annual performance review",isRecurring:!0,recurringInterval:new m({freq:m.YEARLY,interval:1,bymonth:[12],bymonthday:[31]}).toString()}),onSave:f,onClose:w,availableCategories:["Work"]}},q={args:{isOpen:!0,task:u.withRecurrence({title:"Task with limited recurrence",isRecurring:!0,recurringInterval:new m({freq:m.WEEKLY,interval:1,until:new Date(2025,11,31)}).toString()}),onSave:f,onClose:w,availableCategories:["Work"]}},N={args:{isOpen:!0,task:u.base({title:"Water the plants",isRecurring:void 0,recurringInterval:"every week"}),onSave:h(),onClose:w,availableCategories:["Work"]},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t);await a("Shows the task as recurring",async()=>{r(e.getByRole("switch",{name:/Toggle task recurrence/i})).toHaveAttribute("aria-checked","true")}),await a("Saving without changes keeps the rule",async()=>{await o.click(e.getByRole("button",{name:/save/i})),r(n.onSave).toHaveBeenCalledOnce(),r(n.onSave).toHaveBeenCalledWith(r.objectContaining({recurringInterval:"every week"}))})}},j={args:{isOpen:!0,task:u.base({title:"Water the plants",isRecurring:void 0,recurringInterval:"every week when done"}),onSave:h(),onClose:w,availableCategories:["Work"]},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t);await a("Change the frequency to daily",async()=>{await o.selectOptions(e.getByLabelText("Recurrence frequency"),String(m.DAILY))}),await a("Saves Obsidian Tasks text and keeps 'when done'",async()=>{await o.click(e.getByRole("button",{name:/save/i})),r(n.onSave).toHaveBeenCalledWith(r.objectContaining({recurringInterval:"every day when done"}))})}},V={args:{isOpen:!0,task:u.base({title:"Task to save"}),onSave:h(async()=>{throw new Error("The vault is read-only")}),onClose:h(),availableCategories:["Work"]},parameters:{a11y:{test:"error"}},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t);await a("Edit the title and save",async()=>{const s=e.getByDisplayValue("Task to save");await o.clear(s),await o.type(s,"Renamed task"),await o.click(e.getByRole("button",{name:/save/i}))}),await a("Shows the error and keeps the edit",async()=>{r(await e.findByRole("alert")).toHaveTextContent("Could not save the task: The vault is read-only"),r(e.getByDisplayValue("Renamed task")).toBeInTheDocument(),r(n.onClose).not.toHaveBeenCalled()}),await xe(t)}},Y={args:{isOpen:!0,task:u.base({title:"Renew the passport",isRecurring:void 0,recurringInterval:"every year on the 1st in June"}),onSave:h(),onClose:w,availableCategories:["Work"],recurrenceFormat:"text"},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t);await a("Repeat every 2 years",async()=>{const s=e.getByLabelText("Recurrence interval");await o.tripleClick(s),await o.keyboard("2")}),await a("The preview is the text that is saved",async()=>{r(e.getByText("every 2 years on the 1st in June")).toBeInTheDocument(),await o.click(e.getByRole("button",{name:/save/i})),r(n.onSave).toHaveBeenCalledWith(r.objectContaining({recurringInterval:"every 2 years on the 1st in June"}))})}},K={args:{isOpen:!0,task:u.withRecurrence({title:"Five weekly check-ins",isRecurring:!0,recurringInterval:"FREQ=WEEKLY;COUNT=5"}),onSave:h(),onClose:w,availableCategories:["Work"]},parameters:{a11y:{test:"error"}},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Says which parts the settings can't show",async()=>{r(a.getByText(/These settings can't show: repetition count \(COUNT\)\./)).toBeInTheDocument()}),await t("Warns what saving drops once the settings change",async()=>{const e=a.getByLabelText("Recurrence interval");await o.tripleClick(e),await o.keyboard("2");const s=a.getByText("Saving replaces the stored rule and drops the parts these settings can't show: repetition count (COUNT).");r(s).toBeInTheDocument(),s.scrollIntoView({block:"nearest"})}),await xe(n)}},v=n=>n.getRootNode().activeElement,Be=n=>{const t=n.querySelector('[data-testid="shadow-host"]');if(!t)return n;const a=t.shadowRoot?.firstElementChild;if(!(a instanceof HTMLElement))throw new Error("The story's shadow root has no content yet");return a},D=n=>p(()=>{const t=n.querySelector('[role="dialog"][aria-modal="true"]');if(!t)throw new Error("The editor has not opened");return t}),Ee=n=>n.setLocale("en-US").toFormat("cccc, LLLL d, yyyy"),He=async(n,t)=>{const a=async y=>{await p(()=>r(v(n)).toBe(c(n).getByRole("gridcell",{name:Ee(y)}))),r(c(n).getByRole("grid",{name:y.setLocale("en-US").toFormat("LLLL yyyy")})).toBeInTheDocument()},e=S.now().startOf("day"),s=Math.ceil((e.daysInMonth-e.day+1)/7),i=e.plus({weeks:s}),d=i.plus({days:1});await a(e),await o.keyboard("{ArrowDown}".repeat(s)),await a(i),await o.keyboard("{ArrowUp}"),await a(i.minus({weeks:1})),await o.keyboard("{ArrowDown}{ArrowRight}"),await a(d),await o.keyboard("{Enter}"),await p(()=>r(t).toHaveTextContent(d.toFormat("MMM dd, yyyy HH:mm"))),r(c(n).getByRole("gridcell",{name:Ee(d)})).toHaveAttribute("aria-selected","true")},We=async n=>{const t=c(n).getByRole("button",{name:"Close edit task modal"}),a=c(n).getByRole("button",{name:/save/i});await p(()=>r(n.contains(v(n))).toBe(!0)),a.focus(),await o.tab(),r(v(n)).toBe(t),await o.tab({shift:!0}),r(v(n)).toBe(a)},U={args:{...l.args,onClose:h()},play:async({args:n,canvasElement:t,step:a})=>{const s=await c(t).findByRole("dialog",{name:"Edit Task"});await a("Is a modal dialog named by its title",async()=>{r(s).toHaveAttribute("aria-modal","true")}),await a("Keeps Tab and Shift+Tab inside",async()=>{await We(s)}),await a("Closes on Escape",async()=>{await o.keyboard("{Escape}"),r(n.onClose).toHaveBeenCalledOnce()})}},J={args:{...l.args,onClose:h()},parameters:{shadowRoot:!0},play:async({args:n,canvasElement:t,step:a})=>{const s=t.querySelector('[data-testid="shadow-host"]')?.shadowRoot;if(!s)throw new Error("The story did not render into a shadow root");const i=await p(()=>{const d=s.querySelector('[role="dialog"]');if(!d)throw new Error("No dialog in the shadow root yet");return d});await a("Is a modal dialog",async()=>{r(i).toHaveAttribute("aria-modal","true"),r(c(i).getByRole("heading")).toHaveTextContent("Edit Task")}),await a("Keeps Tab and Shift+Tab inside",async()=>{await We(i)}),await a("Closes on Escape",async()=>{await o.keyboard("{Escape}"),r(n.onClose).toHaveBeenCalledOnce()})}},_={args:{...T.args,onClose:h()},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t);await a("Its calendar opens with focus on today",async()=>{await o.click(e.getByRole("button",{name:/Select due date/}));const s=await e.findByRole("gridcell",{name:Ee(S.now())});await p(()=>r(s).toHaveFocus()),await b(100),r(s).toHaveFocus(),await o.keyboard("{Escape}"),await p(()=>r(e.queryByRole("grid")).toBeNull())}),await a("Escape closes the open calendar only",async()=>{await o.click(e.getByRole("button",{name:/Select due date/})),r(await e.findByRole("button",{name:"Today"})).toBeInTheDocument(),await o.keyboard("{Escape}"),await p(()=>r(e.queryByRole("button",{name:"Today"})).toBeNull()),r(n.onClose).not.toHaveBeenCalled()}),await a("Picking a date keeps the editor open",async()=>{await o.click(e.getByRole("button",{name:/Select due date/})),await o.click(await e.findByRole("button",{name:"Today"})),r(e.queryByRole("button",{name:/Select due date/})).toBeNull(),r(e.getByRole("dialog",{name:"Edit Task"})).toBeInTheDocument(),r(n.onClose).not.toHaveBeenCalled()})}},G={args:{...R.args},parameters:{shadowRoot:!0},play:async({canvasElement:n,step:t})=>{const a=await D(await p(()=>Be(n))),e=Array.from(a.querySelectorAll("*")).find(s=>getComputedStyle(s).overflowY==="auto");if(!e)throw new Error("The editor has no scrolling body");await t("Wheel scrolling is not cancelled",async()=>{const s=new WheelEvent("wheel",{deltaY:120,bubbles:!0,cancelable:!0,composed:!0});e.dispatchEvent(s),r(s.defaultPrevented).toBe(!1)}),await t("Touch scrolling is not cancelled",async()=>{const s=d=>{const y=new Touch({identifier:1,target:e,clientX:100,clientY:d});return{touches:[y],targetTouches:[y],changedTouches:[y],bubbles:!0,cancelable:!0,composed:!0}};e.dispatchEvent(new TouchEvent("touchstart",s(200)));const i=new TouchEvent("touchmove",s(100));e.dispatchEvent(i),r(i.defaultPrevented).toBe(!1)})}},Q={args:{...T.args,onClose:h()},parameters:{shadowRoot:!0},play:async({canvasElement:n,step:t})=>{const a=await p(()=>Be(n)),e=await D(a),s=c(e).getByRole("button",{name:/Select due date/});await o.click(s);const i=await p(()=>{const k=a.querySelector("[data-radix-popper-content-wrapper]");if(!k)throw new Error("The date picker has not opened");return k}),d=Array.from(i.querySelectorAll("button, input")).filter(k=>k.tabIndex>=0&&!k.hasAttribute("disabled")),y=d[0],E=d[d.length-1];await t("Arrow keys move through days and months, and Enter picks one",async()=>{await He(i,s)}),await t("Tab from its last field wraps to its first",async()=>{E.focus(),await o.tab(),r(v(i)).toBe(y)}),await t("Shift+Tab from its first field wraps to its last",async()=>{await o.tab({shift:!0}),r(v(i)).toBe(E)}),await t("Shift+Tab from the picker itself stays in it",async()=>{const k=i.querySelector('[role="dialog"]');if(!k)throw new Error("The date picker has no dialog element");k.focus(),await o.tab({shift:!0}),r(v(i)).toBe(E)})}},je=n=>{const[t,a]=De.useState(!1),e=()=>a(!0),s=()=>a(!1);return g.jsxs("div",{className:"flex gap-2",children:[g.jsx("button",{type:"button",onClick:e,children:"Open editor"}),g.jsxs(Oe,{children:[g.jsx(Le,{asChild:!0,children:g.jsx("button",{type:"button",children:"Task actions"})}),g.jsx(Me,{children:g.jsx(qe,{asChild:!0,children:g.jsx("button",{type:"button",onClick:e,children:"Edit details"})})})]}),g.jsx(Ae,{...n,isOpen:t,onClose:s,onSave:s})]})},Ve=async({canvasElement:n,step:t})=>{const a=await p(()=>Be(n)),e=c(a),s=async(i,d)=>{i.focus(),await o.keyboard("{Enter}");const y=await D(a);await p(()=>r(y.contains(v(y))).toBe(!0)),await b(100),r(y.contains(v(y))).toBe(!0),await d(y),await p(()=>r(y.isConnected).toBe(!1))};await t("Escape returns focus to the button that opened it",async()=>{const i=e.getByRole("button",{name:"Open editor"});await s(i,()=>o.keyboard("{Escape}")),await p(()=>r(v(a)).toBe(i))}),await t("Saving returns focus there too",async()=>{const i=e.getByRole("button",{name:"Open editor"});await s(i,d=>o.click(c(d).getByRole("button",{name:/save/i}))),await p(()=>r(v(a)).toBe(i))}),await t("When the opener has gone, focus returns to its popover's trigger",async()=>{const i=e.getByRole("button",{name:"Task actions"});i.focus(),await o.keyboard("{Enter}");const d=await e.findByRole("button",{name:"Edit details"});await s(d,y=>o.click(c(y).getByRole("button",{name:"Cancel"}))),r(d.isConnected).toBe(!1),await p(()=>r(v(a)).toBe(i))})},x={args:{...l.args},render:n=>g.jsx(je,{...n}),play:Ve},X={...x,parameters:{shadowRoot:!0}},$={args:{...l.args},parameters:{appProvider:!1,theme:"midnight"},play:async({canvasElement:n,step:t})=>{const a=n.querySelector('.tasks-timeline-app[data-theme="midnight"]');if(!a)throw new Error("The story has no themed wrapper");const e=await D(n.ownerDocument.body);await t("The editor renders in the themed wrapper",async()=>{r(a.contains(e)).toBe(!0),r(getComputedStyle(e).getPropertyValue("--card")).toBe(getComputedStyle(a).getPropertyValue("--card"))}),await t("So does a date picker's calendar, beside it",async()=>{await o.click(c(e).getByRole("button",{name:/Select due date/}));const s=await p(()=>{const i=a.querySelector('[data-slot="calendar"]');if(!i)throw new Error("No calendar has opened in the wrapper");return i});r(e.contains(s)).toBe(!1),r(s.closest('[aria-hidden="true"]')).toBeNull(),r(getComputedStyle(s).getPropertyValue("--popover")).toBe(getComputedStyle(a).getPropertyValue("--popover"))})}},Ce=()=>{let n=document.activeElement;for(;n?.shadowRoot?.activeElement;)n=n.shadowRoot.activeElement;return n},C=()=>Ce()?.closest("[data-radix-popper-content-wrapper]")??null,z={args:{...l.args},parameters:{appProvider:!1,shadowRoot:!0},play:async({canvasElement:n,step:t})=>{const a=await p(()=>Be(n)),e=await D(a),s=c(e).getByRole("button",{name:/Select due date/});await t("The editor renders in the shadow root",async()=>{r(n.ownerDocument.body.querySelector('[role="dialog"]')).toBeNull()}),await t("Enter on a date field moves focus to its calendar",async()=>{s.focus(),await o.keyboard("{Enter}"),await p(()=>r(C()).not.toBeNull()),await b(100),r(C()).not.toBeNull()}),await t("The calendar renders in the consumer's wrapper",async()=>{const i=C();r(a.contains(i)).toBe(!0),r(e.contains(i)).toBe(!1)}),await t("Arrow keys move through days and months, and Enter picks one",async()=>{const i=C();if(!i)throw new Error("Focus has left the date picker");await He(i,s)}),await t("The keyboard reaches the calendar's controls",async()=>{const i=C(),d=i?.querySelector('input[type="time"]');if(!i||!d)throw new Error("Focus has left the date picker");d.focus(),await o.tab(),r(Ce()).toBe(c(i).getByRole("button",{name:"Previous month"})),await o.keyboard("{Enter}"),r(c(i).getByText(S.now().setLocale("en-US").toFormat("LLLL yyyy"))).toBeInTheDocument()}),await t("Escape closes it and returns to its date field",async()=>{await o.keyboard("{Escape}"),await p(()=>r(Ce()).toBe(s)),r(e.isConnected).toBe(!0)})}},Z={args:{...R.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("The rule's month is pressed",async()=>{r(a.getByRole("button",{name:"Dec"})).toHaveAttribute("aria-pressed","true"),r(a.getByRole("button",{name:"Jan"})).toHaveAttribute("aria-pressed","false")}),await t("Toggling a month updates its state",async()=>{await o.click(a.getByRole("button",{name:"Jan"})),r(a.getByRole("button",{name:"Jan"})).toHaveAttribute("aria-pressed","true")})}},Te=n=>({args:{isOpen:!0,task:u.withRecurrence({title:`Editor in the ${n} theme`,isRecurring:!0,recurringInterval:"FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5"}),onSave:h(async()=>{throw new Error("The vault is read-only")}),onClose:w,availableCategories:["Work"]},parameters:{theme:n,a11y:{test:"error"}},play:async({canvasElement:t,step:a})=>{const e=c(t);await xe(t),await a("Secondary text meets WCAG AA (4.5:1)",async()=>{for(const i of["Task Dates","Repeats automatically","On days"])await B(e.getByText(i))}),await a("Selected weekdays meet AA",async()=>{await B(e.getByRole("button",{name:"Monday",pressed:!0}))}),await a("Selected months and days meet AA",async()=>{await o.selectOptions(e.getByLabelText("Recurrence frequency"),String(m.YEARLY)),await o.click(e.getByRole("button",{name:"Jun"})),await o.click(e.getByRole("button",{name:"15"})),await B(e.getByRole("button",{name:"Jun",pressed:!0})),await B(e.getByRole("button",{name:"15",pressed:!0}))});const s=e.getByText(/^Saving replaces the stored rule/);await a("The warning about dropped rule parts meets AA",async()=>{await B(s)}),await a("The save error meets AA",async()=>{await o.click(e.getByRole("button",{name:/save/i})),await B(await e.findByRole("alert"))}),s.scrollIntoView({block:"nearest"})}}),ee=Te("light"),ae=Te("dark"),te=Te("midnight"),ne=Te("coffee"),re={args:{...l.args,task:u.completed({title:"Completed task to edit"})}},oe={args:{...l.args,task:u.overdue({title:"Overdue task needs attention"})}},se={args:{...l.args,task:u.scheduled({title:"Scheduled for future"})}},ie={args:{...l.args,task:u.base({title:`${"A".repeat(200)} very long title that should wrap properly`})}},ce={args:{...l.args,task:u.base({title:"Task with long description",description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(50)})}},le={args:{...l.args,task:u.withTags(15,{title:"Task with many tags"})}},de={args:{...l.args,availableCategories:["Work","Personal","Shopping","Health","Finance","Education","Home","Travel","Fitness","Hobbies","Social","Family","Career","Projects","Ideas"]}},ue={args:{...l.args,availableCategories:[]}},pe={args:{...l.args,task:u.base({title:"🎉 Unicode test: 日本語 中文 العربية 🚀",description:"Testing emoji and international characters: 你好世界 مرحبا بك ハロー・ワールド",category:"測試"})}},ye={args:{...l.args,task:u.base({title:""})},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Try to save without title",async()=>{const e=a.getByRole("button",{name:/save/i});await o.click(e),await b(100)})}},ge={args:{...l.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Find title input",async()=>{const e=a.getByDisplayValue(/Complete project setup/i);r(e).toBeInTheDocument()}),await t("Clear and type new title",async()=>{const e=a.getByDisplayValue(/Complete project setup/i);await o.clear(e),await o.type(e,"New task title"),await b(100),r(e).toHaveValue("New task title")})}},me={args:{...l.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Find priority selector",async()=>{const e=a.getAllByRole("radio");r(e.length).toBeGreaterThan(0)})}},we={args:{...l.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Find recurrence switch",async()=>{const e=a.getByRole("switch",{name:/recurrence/i});r(e).toHaveAttribute("aria-checked","false")}),await t("Toggle recurrence on",async()=>{const e=a.getByRole("switch",{name:/recurrence/i});await o.click(e),await b(200),r(e).toHaveAttribute("aria-checked","true"),r(a.getByLabelText("Recurrence interval")).toBeInTheDocument()})}},he={args:{...l.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Find category input",async()=>{const e=a.getByLabelText("Category");r(e).toHaveValue("Work")}),await t("Pick a suggested category",async()=>{const e=a.getByLabelText("Category");await o.clear(e),await o.type(e,"Pers"),await o.click(a.getByRole("button",{name:"Personal"})),r(e).toHaveValue("Personal")})}},ve={args:{...l.args},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Find close button",async()=>{const e=a.getAllByRole("button");r(e.length).toBeGreaterThan(0)})}},ke={args:{...l.args,task:u.base({title:"Task to save",description:"This task will be saved"})},play:async({canvasElement:n,step:t})=>{const a=c(n);await t("Modify title",async()=>{const e=a.getByDisplayValue(/Task to save/i);await o.clear(e),await o.type(e,"Modified task title")}),await t("Click save button",async()=>{const e=a.getByRole("button",{name:/save/i});await o.click(e),await b(100)})}},be={args:{...l.args,task:u.base({id:"keyboard-dates",title:"Task with a due date",dueAt:S.local(2026,3,10,9,30).toISO()}),onSave:h()},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t),s=S.local(2026,3,10,9,30).toFormat("MMM dd, yyyy HH:mm"),i=await e.findByRole("button",{name:s});await a("Enter twice keeps the due date",async()=>{i.focus(),await o.keyboard("{Enter}");const d=await e.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await p(()=>r(d).toHaveFocus()),await o.keyboard("{Enter}"),r(d).toHaveAttribute("aria-selected","true"),r(i).toHaveTextContent(s)}),await a("Delete on the selected day clears it",async()=>{await o.keyboard("{Delete}"),r(i).toHaveTextContent("Select due date"),await o.keyboard("{Escape}"),await p(()=>r(e.queryByRole("grid")).toBeNull())}),await a("Saving writes the empty date",async()=>{await o.click(e.getByRole("button",{name:/save/i})),await p(()=>r(n.onSave).toHaveBeenCalledWith(r.objectContaining({dueAt:""})))})}},fe=u.completed({id:"clear-dates",title:"Task with dates to clear",dueAt:S.local(2026,3,10,9,30).toISO(),startAt:S.local(2026,3,5,8,0).toISO(),completedAt:S.local(2026,3,12,18,0).toISO()}),Se={args:{...l.args,task:fe,onSave:h()},play:async({args:n,canvasElement:t,step:a})=>{const e=c(t),s=c(t.ownerDocument.body),i=y=>S.fromISO(y).toFormat("MMM dd, yyyy HH:mm"),d=async(y,E,k)=>{await o.click(e.getByRole("button",{name:i(y)})),await b(200);const Re=s.getByRole("gridcell",{name:E});r(Re).toHaveAttribute("aria-selected","true"),await o.click(Re),r(Re).not.toHaveAttribute("aria-selected"),await o.keyboard("{Escape}"),await b(200),r(e.getByRole("button",{name:k})).toBeInTheDocument()};await a("Clear the due date",async()=>{await d(fe.dueAt,"Tuesday, March 10, 2026","Select due date")}),await a("Clear the start date",async()=>{await d(fe.startAt,"Thursday, March 5, 2026","Select start date")}),await a("Clear the completed date",async()=>{await d(fe.completedAt,"Thursday, March 12, 2026","Select completed date")}),await a("Save writes empty dates",async()=>{await o.click(e.getByRole("button",{name:/save/i})),await b(100),r(n.onSave).toHaveBeenCalledWith(r.objectContaining({dueAt:"",startAt:"",completedAt:""}))})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"]
  }
}`,...l.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: false,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"]
  }
}`,...A.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: null,
    // Creating new task from scratch
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping"]
  }
}`,...I.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Complete quarterly report",
      description: "Compile and analyze Q4 2024 performance metrics for executive review",
      priority: "high",
      category: "Work",
      tags: [{
        id: "1",
        name: "reporting"
      }, {
        id: "2",
        name: "quarterly"
      }, {
        id: "3",
        name: "urgent"
      }]
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"]
  }
}`,...H.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Minimal task",
      description: "",
      category: undefined,
      tags: []
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"]
  }
}`,...T.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.highPriority({
      title: "Critical bug fix required"
    })
  }
}`,...W.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.mediumPriority({
      title: "Regular task"
    })
  }
}`,...P.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.lowPriority({
      title: "Nice to have task"
    })
  }
}`,...F.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Daily standup",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.DAILY,
        interval: 1
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...O.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Weekly team meeting",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: [RRule.MO, RRule.WE, RRule.FR]
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...L.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Monthly report",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: [1] // First day of month
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...M.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Annual performance review",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.YEARLY,
        interval: 1,
        bymonth: [12],
        // December
        bymonthday: [31] // Last day
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...R.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Task with limited recurrence",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        until: new Date(2025, 11, 31) // End on Dec 31, 2025
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...q.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Water the plants",
      isRecurring: undefined,
      recurringInterval: "every week"
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"]
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Shows the task as recurring", async () => {
      expect(canvas.getByRole("switch", {
        name: /Toggle task recurrence/i
      })).toHaveAttribute("aria-checked", "true");
    });
    await step("Saving without changes keeps the rule", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({
        recurringInterval: "every week"
      }));
    });
  }
}`,...N.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Water the plants",
      isRecurring: undefined,
      recurringInterval: "every week when done"
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"]
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Change the frequency to daily", async () => {
      await userEvent.selectOptions(canvas.getByLabelText("Recurrence frequency"), String(RRule.DAILY));
    });
    await step("Saves Obsidian Tasks text and keeps 'when done'", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
      expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({
        recurringInterval: "every day when done"
      }));
    });
  }
}`,...j.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Task to save"
    }),
    onSave: fn(async () => {
      throw new Error("The vault is read-only");
    }),
    onClose: fn(),
    availableCategories: ["Work"]
  },
  // Fail on any axe violation, the error text's contrast included
  parameters: {
    a11y: {
      test: "error"
    }
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Edit the title and save", async () => {
      const title = canvas.getByDisplayValue("Task to save");
      await userEvent.clear(title);
      await userEvent.type(title, "Renamed task");
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
    });
    await step("Shows the error and keeps the edit", async () => {
      expect(await canvas.findByRole("alert")).toHaveTextContent("Could not save the task: The vault is read-only");
      expect(canvas.getByDisplayValue("Renamed task")).toBeInTheDocument();
      expect(args.onClose).not.toHaveBeenCalled();
    });
    await waitForEditorToOpen(canvasElement);
  }
}`,...V.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Renew the passport",
      isRecurring: undefined,
      recurringInterval: "every year on the 1st in June"
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"],
    recurrenceFormat: "text"
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Repeat every 2 years", async () => {
      const interval = canvas.getByLabelText("Recurrence interval");
      // Clearing the field resets it to 1, so replace the value instead
      await userEvent.tripleClick(interval);
      await userEvent.keyboard("2");
    });
    await step("The preview is the text that is saved", async () => {
      expect(canvas.getByText("every 2 years on the 1st in June")).toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
      expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({
        recurringInterval: "every 2 years on the 1st in June"
      }));
    });
  }
}`,...Y.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Five weekly check-ins",
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;COUNT=5"
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"]
  },
  // Fail on any axe violation, the warning's contrast included
  parameters: {
    a11y: {
      test: "error"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Says which parts the settings can't show", async () => {
      expect(canvas.getByText(/These settings can't show: repetition count \\(COUNT\\)\\./)).toBeInTheDocument();
    });
    await step("Warns what saving drops once the settings change", async () => {
      const interval = canvas.getByLabelText("Recurrence interval");
      await userEvent.tripleClick(interval);
      await userEvent.keyboard("2");
      const warning = canvas.getByText("Saving replaces the stored rule and drops the parts these settings can't show: repetition count (COUNT).");
      expect(warning).toBeInTheDocument();
      // axe, which runs next, skips text scrolled out of view
      warning.scrollIntoView({
        block: "nearest"
      });
    });
    await waitForEditorToOpen(canvasElement);
  }
}`,...K.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    onClose: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole("dialog", {
      name: "Edit Task"
    });
    await step("Is a modal dialog named by its title", async () => {
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });
    await step("Keeps Tab and Shift+Tab inside", async () => {
      await expectFocusTrapped(dialog);
    });
    await step("Closes on Escape", async () => {
      await userEvent.keyboard("{Escape}");
      expect(args.onClose).toHaveBeenCalledOnce();
    });
  }
}`,...U.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    onClose: fn()
  },
  parameters: {
    shadowRoot: true
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const host = canvasElement.querySelector<HTMLElement>('[data-testid="shadow-host"]');
    const shadowRoot = host?.shadowRoot;
    if (!shadowRoot) {
      throw new Error("The story did not render into a shadow root");
    }
    const dialog = await waitFor(() => {
      const found = shadowRoot.querySelector<HTMLElement>('[role="dialog"]');
      if (!found) {
        throw new Error("No dialog in the shadow root yet");
      }
      return found;
    });
    await step("Is a modal dialog", async () => {
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(within(dialog).getByRole("heading")).toHaveTextContent("Edit Task");
    });
    await step("Keeps Tab and Shift+Tab inside", async () => {
      await expectFocusTrapped(dialog);
    });
    await step("Closes on Escape", async () => {
      await userEvent.keyboard("{Escape}");
      expect(args.onClose).toHaveBeenCalledOnce();
    });
  }
}`,...J.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...MinimalTask.args,
    onClose: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Its calendar opens with focus on today", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /Select due date/
      }));
      const today = await canvas.findByRole("gridcell", {
        name: calendarDayName(DateTime.now())
      });
      await waitFor(() => expect(today).toHaveFocus());
      // The editor's focus trap sends focus back to the date field if the
      // calendar takes it before its popover's focus scope starts
      await delay(100);
      expect(today).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.queryByRole("grid")).toBeNull());
    });
    await step("Escape closes the open calendar only", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /Select due date/
      }));
      expect(await canvas.findByRole("button", {
        name: "Today"
      })).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.queryByRole("button", {
        name: "Today"
      })).toBeNull());
      expect(args.onClose).not.toHaveBeenCalled();
    });
    await step("Picking a date keeps the editor open", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /Select due date/
      }));
      await userEvent.click(await canvas.findByRole("button", {
        name: "Today"
      }));
      expect(canvas.queryByRole("button", {
        name: /Select due date/
      })).toBeNull();
      expect(canvas.getByRole("dialog", {
        name: "Edit Task"
      })).toBeInTheDocument();
      expect(args.onClose).not.toHaveBeenCalled();
    });
  }
}`,..._.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithYearlyRecurrence.args
  },
  parameters: {
    shadowRoot: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const dialog = await findEditor(await waitFor(() => storyContent(canvasElement)));
    const body = Array.from(dialog.querySelectorAll<HTMLElement>("*")).find(element => getComputedStyle(element).overflowY === "auto");
    if (!body) {
      throw new Error("The editor has no scrolling body");
    }
    await step("Wheel scrolling is not cancelled", async () => {
      const wheel = new WheelEvent("wheel", {
        deltaY: 120,
        bubbles: true,
        cancelable: true,
        composed: true
      });
      body.dispatchEvent(wheel);
      expect(wheel.defaultPrevented).toBe(false);
    });
    await step("Touch scrolling is not cancelled", async () => {
      const touchAt = (clientY: number) => {
        const touch = new Touch({
          identifier: 1,
          target: body,
          clientX: 100,
          clientY
        });
        return {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
          composed: true
        };
      };
      body.dispatchEvent(new TouchEvent("touchstart", touchAt(200)));
      // A swipe up, which scrolls the body down
      const move = new TouchEvent("touchmove", touchAt(100));
      body.dispatchEvent(move);
      expect(move.defaultPrevented).toBe(false);
    });
  }
}`,...G.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    ...MinimalTask.args,
    onClose: fn()
  },
  parameters: {
    shadowRoot: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const content = await waitFor(() => storyContent(canvasElement));
    const dialog = await findEditor(content);
    const dueDate = within(dialog).getByRole("button", {
      name: /Select due date/
    });
    await userEvent.click(dueDate);
    const picker = await waitFor(() => {
      const found = content.querySelector<HTMLElement>("[data-radix-popper-content-wrapper]");
      if (!found) {
        throw new Error("The date picker has not opened");
      }
      return found;
    });
    const fields = Array.from(picker.querySelectorAll<HTMLElement>("button, input")).filter(field => field.tabIndex >= 0 && !field.hasAttribute("disabled"));
    const first = fields[0];
    const last = fields[fields.length - 1];
    await step("Arrow keys move through days and months, and Enter picks one", async () => {
      await expectArrowKeysPickADay(picker, dueDate);
    });
    await step("Tab from its last field wraps to its first", async () => {
      last.focus();
      await userEvent.tab();
      expect(focusedElement(picker)).toBe(first);
    });
    await step("Shift+Tab from its first field wraps to its last", async () => {
      await userEvent.tab({
        shift: true
      });
      expect(focusedElement(picker)).toBe(last);
    });

    // In a shadow root Radix focuses a popover itself as it opens (date
    // pickers focus their calendar's day instead)
    await step("Shift+Tab from the picker itself stays in it", async () => {
      const popover = picker.querySelector<HTMLElement>('[role="dialog"]');
      if (!popover) {
        throw new Error("The date picker has no dialog element");
      }
      popover.focus();
      await userEvent.tab({
        shift: true
      });
      expect(focusedElement(picker)).toBe(last);
    });
  }
}`,...Q.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  render: args => <EditorOpeners {...args} />,
  play: expectFocusReturned
}`,...x.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  ...ReturnsFocusToOpener,
  parameters: {
    shadowRoot: true
  }
}`,...X.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  parameters: {
    appProvider: false,
    theme: "midnight"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>('.tasks-timeline-app[data-theme="midnight"]');
    if (!wrapper) {
      throw new Error("The story has no themed wrapper");
    }
    const dialog = await findEditor(canvasElement.ownerDocument.body);
    await step("The editor renders in the themed wrapper", async () => {
      expect(wrapper.contains(dialog)).toBe(true);
      // The consumer's midnight card, not the light one on :root
      expect(getComputedStyle(dialog).getPropertyValue("--card")).toBe(getComputedStyle(wrapper).getPropertyValue("--card"));
    });
    await step("So does a date picker's calendar, beside it", async () => {
      await userEvent.click(within(dialog).getByRole("button", {
        name: /Select due date/
      }));
      const calendar = await waitFor(() => {
        const found = wrapper.querySelector('[data-slot="calendar"]');
        if (!found) {
          throw new Error("No calendar has opened in the wrapper");
        }
        return found;
      });
      // The editor's transform and overflow would clip it
      expect(dialog.contains(calendar)).toBe(false);
      // The modal editor hides what was outside it as it opened
      expect(calendar.closest('[aria-hidden="true"]')).toBeNull();
      expect(getComputedStyle(calendar).getPropertyValue("--popover")).toBe(getComputedStyle(wrapper).getPropertyValue("--popover"));
    });
  }
}`,...$.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  parameters: {
    appProvider: false,
    shadowRoot: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const content = await waitFor(() => storyContent(canvasElement));
    const dialog = await findEditor(content);
    const dueDate = within(dialog).getByRole("button", {
      name: /Select due date/
    });
    await step("The editor renders in the shadow root", async () => {
      expect(canvasElement.ownerDocument.body.querySelector('[role="dialog"]')).toBeNull();
    });
    await step("Enter on a date field moves focus to its calendar", async () => {
      dueDate.focus();
      await userEvent.keyboard("{Enter}");
      await waitFor(() => expect(focusedDatePicker()).not.toBeNull());
      // The editor's focus trap sent it back to the date field
      await delay(100);
      expect(focusedDatePicker()).not.toBeNull();
    });
    await step("The calendar renders in the consumer's wrapper", async () => {
      const picker = focusedDatePicker();
      expect(content.contains(picker)).toBe(true);
      // The editor's transform and overflow would clip it
      expect(dialog.contains(picker)).toBe(false);
    });
    await step("Arrow keys move through days and months, and Enter picks one", async () => {
      const picker = focusedDatePicker();
      if (!picker) {
        throw new Error("Focus has left the date picker");
      }
      await expectArrowKeysPickADay(picker, dueDate);
    });
    await step("The keyboard reaches the calendar's controls", async () => {
      const picker = focusedDatePicker();
      const time = picker?.querySelector<HTMLElement>('input[type="time"]');
      if (!picker || !time) {
        throw new Error("Focus has left the date picker");
      }
      // Wraps from the time field, the last control, to the first
      time.focus();
      await userEvent.tab();
      expect(deepFocusedElement()).toBe(within(picker).getByRole("button", {
        name: "Previous month"
      }));
      // Back from next month, where the picked day is
      await userEvent.keyboard("{Enter}");
      expect(within(picker).getByText(DateTime.now().setLocale("en-US").toFormat("LLLL yyyy"))).toBeInTheDocument();
    });
    await step("Escape closes it and returns to its date field", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(deepFocusedElement()).toBe(dueDate));
      expect(dialog.isConnected).toBe(true);
    });
  }
}`,...z.parameters?.docs?.source}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithYearlyRecurrence.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("The rule's month is pressed", async () => {
      expect(canvas.getByRole("button", {
        name: "Dec"
      })).toHaveAttribute("aria-pressed", "true");
      expect(canvas.getByRole("button", {
        name: "Jan"
      })).toHaveAttribute("aria-pressed", "false");
    });
    await step("Toggling a month updates its state", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Jan"
      }));
      expect(canvas.getByRole("button", {
        name: "Jan"
      })).toHaveAttribute("aria-pressed", "true");
    });
  }
}`,...Z.parameters?.docs?.source}}};ee.parameters={...ee.parameters,docs:{...ee.parameters?.docs,source:{originalSource:'themedEditorStory("light")',...ee.parameters?.docs?.source}}};ae.parameters={...ae.parameters,docs:{...ae.parameters?.docs,source:{originalSource:'themedEditorStory("dark")',...ae.parameters?.docs?.source}}};te.parameters={...te.parameters,docs:{...te.parameters?.docs,source:{originalSource:'themedEditorStory("midnight")',...te.parameters?.docs?.source}}};ne.parameters={...ne.parameters,docs:{...ne.parameters?.docs,source:{originalSource:'themedEditorStory("coffee")',...ne.parameters?.docs?.source}}};re.parameters={...re.parameters,docs:{...re.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.completed({
      title: "Completed task to edit"
    })
  }
}`,...re.parameters?.docs?.source}}};oe.parameters={...oe.parameters,docs:{...oe.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.overdue({
      title: "Overdue task needs attention"
    })
  }
}`,...oe.parameters?.docs?.source}}};se.parameters={...se.parameters,docs:{...se.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.scheduled({
      title: "Scheduled for future"
    })
  }
}`,...se.parameters?.docs?.source}}};ie.parameters={...ie.parameters,docs:{...ie.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: \`\${"A".repeat(200)} very long title that should wrap properly\`
    })
  }
}`,...ie.parameters?.docs?.source}}};ce.parameters={...ce.parameters,docs:{...ce.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task with long description",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(50)
    })
  }
}`,...ce.parameters?.docs?.source}}};le.parameters={...le.parameters,docs:{...le.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.withTags(15, {
      title: "Task with many tags"
    })
  }
}`,...le.parameters?.docs?.source}}};de.parameters={...de.parameters,docs:{...de.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: ["Work", "Personal", "Shopping", "Health", "Finance", "Education", "Home", "Travel", "Fitness", "Hobbies", "Social", "Family", "Career", "Projects", "Ideas"]
  }
}`,...de.parameters?.docs?.source}}};ue.parameters={...ue.parameters,docs:{...ue.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: []
  }
}`,...ue.parameters?.docs?.source}}};pe.parameters={...pe.parameters,docs:{...pe.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "🎉 Unicode test: 日本語 中文 العربية 🚀",
      description: "Testing emoji and international characters: 你好世界 مرحبا بك ハロー・ワールド",
      category: "測試"
    })
  }
}`,...pe.parameters?.docs?.source}}};ye.parameters={...ye.parameters,docs:{...ye.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: ""
    })
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Try to save without title", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /save/i
      });
      await userEvent.click(saveButton);
      // Form should prevent submission or show error
      await delay(100);
    });
  }
}`,...ye.parameters?.docs?.source}}};ge.parameters={...ge.parameters,docs:{...ge.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find title input", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      expect(titleInput).toBeInTheDocument();
    });
    await step("Clear and type new title", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "New task title");
      await delay(100);
      expect(titleInput).toHaveValue("New task title");
    });
  }
}`,...ge.parameters?.docs?.source}}};me.parameters={...me.parameters,docs:{...me.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find priority selector", async () => {
      // Priority is typically a select or radio group
      const priorityElements = canvas.getAllByRole("radio");
      expect(priorityElements.length).toBeGreaterThan(0);
    });
  }
}`,...me.parameters?.docs?.source}}};we.parameters={...we.parameters,docs:{...we.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find recurrence switch", async () => {
      const recurrenceSwitch = canvas.getByRole("switch", {
        name: /recurrence/i
      });
      expect(recurrenceSwitch).toHaveAttribute("aria-checked", "false");
    });
    await step("Toggle recurrence on", async () => {
      const recurrenceSwitch = canvas.getByRole("switch", {
        name: /recurrence/i
      });
      await userEvent.click(recurrenceSwitch);
      await delay(200);
      expect(recurrenceSwitch).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByLabelText("Recurrence interval")).toBeInTheDocument();
    });
  }
}`,...we.parameters?.docs?.source}}};he.parameters={...he.parameters,docs:{...he.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find category input", async () => {
      const categoryInput = canvas.getByLabelText("Category");
      expect(categoryInput).toHaveValue("Work");
    });
    await step("Pick a suggested category", async () => {
      const categoryInput = canvas.getByLabelText("Category");
      await userEvent.clear(categoryInput);
      await userEvent.type(categoryInput, "Pers");
      await userEvent.click(canvas.getByRole("button", {
        name: "Personal"
      }));
      expect(categoryInput).toHaveValue("Personal");
    });
  }
}`,...he.parameters?.docs?.source}}};ve.parameters={...ve.parameters,docs:{...ve.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find close button", async () => {
      const closeButtons = canvas.getAllByRole("button");
      // Should have at least one close button (X or Cancel)
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
}`,...ve.parameters?.docs?.source}}};ke.parameters={...ke.parameters,docs:{...ke.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task to save",
      description: "This task will be saved"
    })
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Modify title", async () => {
      const titleInput = canvas.getByDisplayValue(/Task to save/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Modified task title");
    });
    await step("Click save button", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      // OnSave should be called
    });
  }
}`,...ke.parameters?.docs?.source}}};be.parameters={...be.parameters,docs:{...be.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      id: "keyboard-dates",
      title: "Task with a due date",
      dueAt: DateTime.local(2026, 3, 10, 9, 30).toISO()!
    }),
    onSave: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const label = DateTime.local(2026, 3, 10, 9, 30).toFormat("MMM dd, yyyy HH:mm");
    const dueDate = await canvas.findByRole("button", {
      name: label
    });
    await step("Enter twice keeps the due date", async () => {
      dueDate.focus();
      await userEvent.keyboard("{Enter}");
      const day = await canvas.findByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      await waitFor(() => expect(day).toHaveFocus());
      await userEvent.keyboard("{Enter}");
      expect(day).toHaveAttribute("aria-selected", "true");
      expect(dueDate).toHaveTextContent(label);
    });
    await step("Delete on the selected day clears it", async () => {
      await userEvent.keyboard("{Delete}");
      expect(dueDate).toHaveTextContent("Select due date");
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.queryByRole("grid")).toBeNull());
    });
    await step("Saving writes the empty date", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
      await waitFor(() => expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({
        dueAt: ""
      })));
    });
  }
}`,...be.parameters?.docs?.source}}};Se.parameters={...Se.parameters,docs:{...Se.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: clearDatesTask,
    onSave: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      // DatePicker trigger text for a value, in the same format and locale
      pickerLabel = (iso: string) => DateTime.fromISO(iso).toFormat("MMM dd, yyyy HH:mm"),
      clearDate = async (iso: string, dayName: string, placeholder: string) => {
        await userEvent.click(canvas.getByRole("button", {
          name: pickerLabel(iso)
        }));
        await delay(200);
        // Clicking the selected day again deselects it
        const day = page.getByRole("gridcell", {
          name: dayName
        });
        expect(day).toHaveAttribute("aria-selected", "true");
        await userEvent.click(day);
        expect(day).not.toHaveAttribute("aria-selected");
        await userEvent.keyboard("{Escape}");
        await delay(200);
        expect(canvas.getByRole("button", {
          name: placeholder
        })).toBeInTheDocument();
      };
    await step("Clear the due date", async () => {
      await clearDate(clearDatesTask.dueAt!, "Tuesday, March 10, 2026", "Select due date");
    });
    await step("Clear the start date", async () => {
      await clearDate(clearDatesTask.startAt!, "Thursday, March 5, 2026", "Select start date");
    });
    await step("Clear the completed date", async () => {
      await clearDate(clearDatesTask.completedAt!, "Thursday, March 12, 2026", "Select completed date");
    });
    await step("Save writes empty dates", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /save/i
      }));
      await delay(100);
      expect(args.onSave).toHaveBeenCalledWith(expect.objectContaining({
        dueAt: "",
        startAt: "",
        completedAt: ""
      }));
    });
  }
}`,...Se.parameters?.docs?.source}}};const wa=["Default","Closed","NewTask","AllFieldsFilled","MinimalTask","HighPriority","MediumPriority","LowPriority","WithDailyRecurrence","WithWeeklyRecurrence","WithMonthlyRecurrence","WithYearlyRecurrence","WithRecurrenceEndDate","SaveKeepsTextRecurrenceRule","EditTextRecurrenceRuleSavesText","SaveFailureKeepsEdits","TextPreviewMatchesSavedRule","WarnsWhichRulePartsSavingDrops","DialogSemantics","DialogSemanticsInShadowRoot","DatePickerInsideDialog","ScrollsInShadowRoot","DatePickerKeepsTabInShadowRoot","ReturnsFocusToOpener","ReturnsFocusToOpenerInShadowRoot","RendersInPlaceWithoutAppProvider","RendersInPlaceInConsumerShadowRoot","MonthTogglesExposeState","LightTheme","DarkTheme","MidnightTheme","CoffeeTheme","CompletedTask","OverdueTask","ScheduledTask","VeryLongTitle","VeryLongDescription","ManyTags","ManyCategories","NoCategories","UnicodeContent","FormValidation","EditTitle","ChangePriority","ToggleRecurrence","SelectCategory","CloseModal","SaveTask","KeyboardKeepsAndClearsADate","ClearDates"];export{H as AllFieldsFilled,me as ChangePriority,Se as ClearDates,ve as CloseModal,A as Closed,ne as CoffeeTheme,re as CompletedTask,ae as DarkTheme,_ as DatePickerInsideDialog,Q as DatePickerKeepsTabInShadowRoot,l as Default,U as DialogSemantics,J as DialogSemanticsInShadowRoot,j as EditTextRecurrenceRuleSavesText,ge as EditTitle,ye as FormValidation,W as HighPriority,be as KeyboardKeepsAndClearsADate,ee as LightTheme,F as LowPriority,de as ManyCategories,le as ManyTags,P as MediumPriority,te as MidnightTheme,T as MinimalTask,Z as MonthTogglesExposeState,I as NewTask,ue as NoCategories,oe as OverdueTask,z as RendersInPlaceInConsumerShadowRoot,$ as RendersInPlaceWithoutAppProvider,x as ReturnsFocusToOpener,X as ReturnsFocusToOpenerInShadowRoot,V as SaveFailureKeepsEdits,N as SaveKeepsTextRecurrenceRule,ke as SaveTask,se as ScheduledTask,G as ScrollsInShadowRoot,he as SelectCategory,Y as TextPreviewMatchesSavedRule,we as ToggleRecurrence,pe as UnicodeContent,ce as VeryLongDescription,ie as VeryLongTitle,K as WarnsWhichRulePartsSavingDrops,O as WithDailyRecurrence,M as WithMonthlyRecurrence,q as WithRecurrenceEndDate,L as WithWeeklyRecurrence,R as WithYearlyRecurrence,wa as __namedExportsOrder,ma as default};
