import{j as B}from"./jsx-runtime-u17CrQMm.js";import{r as m}from"./iframe-C21N2aj2.js";import{Y as N}from"./YearSection-D8iTL7DI.js";import{T as L,S as W}from"./SettingsContext-CD1KsnZl.js";import{s as a}from"./settings-GESQiD84.js";import{t as X}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{D as _}from"./recurrence-B2fS74Tu.js";import{d as j}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./DaySection-t1zvpuwx.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";const{expect:y,userEvent:U,within:$}=__STORYBOOK_MODULE_TEST__,be={title:"Sections/YearSection",component:N,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(c,o)=>{const[n,r]=m.useState([]),[l,f]=m.useState(!1),[x,u]=m.useState(!1),[R,g]=m.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[S,V]=m.useState({field:"dueAt",direction:"asc",script:""}),k={tasks:n,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:t=>{r(p=>p.map(d=>d.id===t.id?t:d)),console.log("Update task:",t)},onDeleteTask:t=>{r(p=>p.filter(d=>d.id!==t)),console.log("Delete task:",t)},onAddTask:t=>{const p={id:`task-${Date.now()}`,title:t.title||"New Task",status:"todo",priority:"medium",createdAt:_.now().toISO(),...t};r(d=>[...d,p]),console.log("Add task:",p)},onEditTask:t=>console.log("Edit task:",t),onAICommand:async t=>console.log("AI command:",t)},z={settings:o.args.settings||a.default(),updateSettings:t=>console.log("Update settings:",t),isFocusMode:l,toggleFocusMode:()=>f(!l),isAiMode:x,toggleAiMode:()=>u(!x),filters:R,onFilterChange:g,sort:S,onSortChange:V,onVoiceError:t=>console.error("Voice error:",t),onOpenSettings:()=>console.log("Open settings")};return B.jsx(L,{value:k,children:B.jsx(W,{value:z,children:B.jsx("div",{className:"p-4",children:B.jsx(c,{})})})})}]},e=_.now().year,s=(c,o,n=3,r=.5)=>{const l=Array.from({length:o},(u,R)=>{const g=_.local(c,1,1).plus({days:R*7}),S=X.many(n,{dueAt:g.toISO()}),V=Math.floor(n*r);return S.slice(0,V).forEach(k=>{k.status="done",k.completedAt=g.toISO()}),{date:g.toISODate(),tasks:S}}),f=l.flatMap(u=>u.tasks),x=f.filter(u=>u.status==="done").length;return{year:c,dayGroups:l,totalTasks:f.length,completedTasks:x}},i={args:{group:s(e,5,3,.4),settings:a.default()}},Y={args:{...i.args}},T={args:{group:s(e,5,4,.6),settings:a.default()}},w={args:{group:s(e,5,4,.6),settings:a.minimalUI()}},h={args:{group:s(e,5,3,1),settings:a.default()}},v={args:{group:s(e,5,3,0),settings:a.default()}},E={args:{group:s(e,5,4,.5),settings:a.default()}},D={args:{group:s(e,30,2,.3),settings:a.default()}},C={args:{group:s(e,10,1,.5),settings:a.default()}},A={args:{group:s(e,15,8,.4),settings:a.default()}},G={args:{...i.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},b={args:{...i.args,settings:a.largeFontSize()}},I={args:{group:s(e,1,3,.3),settings:a.default()}},M={args:{group:{year:e,dayGroups:[],totalTasks:0,completedTasks:0},settings:a.default()}},F={args:{group:s(e-1,8,4,.8),settings:a.default()}},P={args:{group:s(e+1,6,3,.1),settings:a.default()}},O={args:{group:s(e,5,3,.5),settings:a.default()},play:async({canvasElement:c,step:o})=>{const n=$(c);await o("Find year header",async()=>{const r=n.getByText(e.toString());y(r).toBeInTheDocument()}),await o("Click to collapse year section",async()=>{const r=n.getByRole("button",{name:new RegExp(`^Collapse ${e},`)});await U.click(r),await j(500),y(r).toHaveAttribute("aria-expanded","false")}),await o("Click again to expand",async()=>{const r=n.getByRole("button",{name:new RegExp(`^Expand ${e},`)});await U.click(r),await j(500),y(r).toHaveAttribute("aria-expanded","true")})}},H={args:{group:s(e,5,4,.75),settings:a.default()},play:async({canvasElement:c,step:o})=>{const n=$(c);await o("Verify progress text displays correctly",async()=>{const r=n.getByText(/\//,{exact:!1});y(r).toBeInTheDocument()}),await o("Verify summary text displays",async()=>{const r=n.getByText(/unfinished tasks in/);y(r).toBeInTheDocument()})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 0.4),
    settings: settingsBuilder.default()
  }
}`,...i.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
    // YearSection defaults to expanded (isOpen: true)
  }
}`,...Y.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.6),
    settings: settingsBuilder.default() // ShowProgressBar: true by default
  }
}`,...T.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.6),
    settings: settingsBuilder.minimalUI() // ShowProgressBar: false
  }
}`,...w.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 1.0),
    // 100% completion
    settings: settingsBuilder.default()
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 0),
    // 0% completion
    settings: settingsBuilder.default()
  }
}`,...v.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.5),
    // 50% completion
    settings: settingsBuilder.default()
  }
}`,...E.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 30, 2, 0.3),
    // 30 days, fewer tasks per day
    settings: settingsBuilder.default()
  }
}`,...D.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 10, 1, 0.5),
    // Sparse year with 1 task per day
    settings: settingsBuilder.default()
  }
}`,...C.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 15, 8, 0.4),
    // Many tasks per day
    settings: settingsBuilder.default()
  }
}`,...A.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...G.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...b.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 1, 3, 0.3),
    settings: settingsBuilder.default()
  }
}`,...I.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      year: currentYear,
      dayGroups: [],
      totalTasks: 0,
      completedTasks: 0
    },
    settings: settingsBuilder.default()
  }
}`,...M.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear - 1, 8, 4, 0.8),
    settings: settingsBuilder.default()
  }
}`,...F.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear + 1, 6, 3, 0.1),
    settings: settingsBuilder.default()
  }
}`,...P.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 0.5),
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find year header", async () => {
      const yearHeader = canvas.getByText(currentYear.toString());
      expect(yearHeader).toBeInTheDocument();
    });
    await step("Click to collapse year section", async () => {
      const collapseButton = canvas.getByRole("button", {
        name: new RegExp(\`^Collapse \${currentYear},\`)
      });
      await userEvent.click(collapseButton);
      await delay(500); // Wait for collapse animation
      expect(collapseButton).toHaveAttribute("aria-expanded", "false");
    });
    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button", {
        name: new RegExp(\`^Expand \${currentYear},\`)
      });
      await userEvent.click(expandButton);
      await delay(500); // Wait for expand animation
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
    });
  }
}`,...O.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.75),
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify progress text displays correctly", async () => {
      // Should show "X / Y" format
      const progressText = canvas.getByText(/\\//, {
        exact: false
      });
      expect(progressText).toBeInTheDocument();
    });
    await step("Verify summary text displays", async () => {
      // Should show "X unfinished tasks in Y active days"
      const summaryText = canvas.getByText(/unfinished tasks in/);
      expect(summaryText).toBeInTheDocument();
    });
  }
}`,...H.parameters?.docs?.source}}};const Ie=["Default","Expanded","ProgressBarVisible","ProgressBarHidden","AllTasksCompleted","NoTasksCompleted","HalfCompleted","ManyDays","FewTasksPerDay","DenseYear","DarkMode","LargeFontSize","SingleDay","EmptyYear","PastYear","FutureYear","ExpandCollapse","ProgressBarAnimation"];export{h as AllTasksCompleted,G as DarkMode,i as Default,A as DenseYear,M as EmptyYear,O as ExpandCollapse,Y as Expanded,C as FewTasksPerDay,P as FutureYear,E as HalfCompleted,b as LargeFontSize,D as ManyDays,v as NoTasksCompleted,F as PastYear,H as ProgressBarAnimation,w as ProgressBarHidden,T as ProgressBarVisible,I as SingleDay,Ie as __namedExportsOrder,be as default};
