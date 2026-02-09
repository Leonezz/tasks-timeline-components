import{j as B}from"./jsx-runtime-u17CrQMm.js";import{r as m}from"./iframe-Zi-gTbRm.js";import{Y as L}from"./YearSection-CDHsPBHP.js";import{T as W,S as X}from"./SettingsContext-edzBkBLG.js";import{s as e}from"./settings-CIrEQdYf.js";import{t as K}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{D as j}from"./datetime-CoIMkCUY.js";import{d as R}from"./test-utils-BNouzmjp.js";import"./preload-helper-PPVm8Dsz.js";import"./DaySection-c7NfNYAo.js";import"./TaskItem-DlutzZB_.js";import"./rruleset-Bu4wjl4G.js";import"./Icon-C9gs-eIT.js";import"./chevron-right-DE8jUQ3_.js";import"./Motion-k78dMwTv.js";import"./proxy-B_Q68Ehr.js";import"./DateBadge-BbYH_pTq.js";import"./popover-CDk53uMp.js";import"./index-b36vaqFy.js";import"./index-YBvGyPGk.js";import"./calendar-j6Z9Oj0O.js";import"./TagBadge-B4u4uQVd.js";import"./PriorityPopover-gNwwACHj.js";import"./CategoryPopover-CY1SNkdQ.js";import"./useVoiceInput-Cs3CcRcX.js";import"./logger-CDMKXnH4.js";import"./collapsible-DaLMx4ti.js";import"./index-BcoNlowd.js";const{expect:H,userEvent:U,within:z}=__STORYBOOK_MODULE_TEST__,he={title:"Sections/YearSection",component:L,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(c,n)=>{const[o,a]=m.useState([]),[l,y]=m.useState(!1),[f,u]=m.useState(!1),[V,g]=m.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[S,_]=m.useState({field:"dueAt",direction:"asc",script:""}),k={tasks:o,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:r=>{a(p=>p.map(d=>d.id===r.id?r:d)),console.log("Update task:",r)},onDeleteTask:r=>{a(p=>p.filter(d=>d.id!==r)),console.log("Delete task:",r)},onAddTask:r=>{const p={id:`task-${Date.now()}`,title:r.title||"New Task",status:"todo",priority:"medium",createdAt:j.now().toISO(),...r};a(d=>[...d,p]),console.log("Add task:",p)},onEditTask:r=>console.log("Edit task:",r),onAICommand:async r=>console.log("AI command:",r)},N={settings:n.args.settings||e.default(),updateSettings:r=>console.log("Update settings:",r),isFocusMode:l,toggleFocusMode:()=>y(!l),isAiMode:f,toggleAiMode:()=>u(!f),filters:V,onFilterChange:g,sort:S,onSortChange:_,onVoiceError:r=>console.error("Voice error:",r),onOpenSettings:()=>console.log("Open settings")};return B.jsx(W,{value:k,children:B.jsx(X,{value:N,children:B.jsx("div",{className:"p-4",children:B.jsx(c,{})})})})}]},s=j.now().year,t=(c,n,o=3,a=.5)=>{const l=Array.from({length:n},(u,V)=>{const g=j.local(c,1,1).plus({days:V*7}),S=K.many(o,{dueAt:g.toISO()}),_=Math.floor(o*a);return S.slice(0,_).forEach(k=>{k.status="done",k.completedAt=g.toISO()}),{date:g.toISODate(),tasks:S}}),y=l.flatMap(u=>u.tasks),f=y.filter(u=>u.status==="done").length;return{year:c,dayGroups:l,totalTasks:y.length,completedTasks:f}},i={args:{group:t(s,5,3,.4),settings:e.default()}},Y={args:{...i.args}},T={args:{group:t(s,5,4,.6),settings:e.default()}},x={args:{group:t(s,5,4,.6),settings:e.minimalUI()}},w={args:{group:t(s,5,3,1),settings:e.default()}},h={args:{group:t(s,5,3,0),settings:e.default()}},D={args:{group:t(s,5,4,.5),settings:e.default()}},v={args:{group:t(s,30,2,.3),settings:e.default()}},E={args:{group:t(s,10,1,.5),settings:e.default()}},C={args:{group:t(s,15,8,.4),settings:e.default()}},G={args:{...i.args,settings:e.darkMode()},parameters:{backgrounds:{default:"dark"}}},A={args:{...i.args,settings:e.largeFontSize()}},I={args:{group:t(s,1,3,.3),settings:e.default()}},M={args:{group:{year:s,dayGroups:[],totalTasks:0,completedTasks:0},settings:e.default()}},F={args:{group:t(s-1,8,4,.8),settings:e.default()}},P={args:{group:t(s+1,6,3,.1),settings:e.default()}},b={args:{group:t(s,5,3,.5),settings:e.default()},play:async({canvasElement:c,step:n})=>{const o=z(c);await n("Find year header",async()=>{const a=o.getByText(s.toString());H(a).toBeInTheDocument()}),await n("Click to collapse year section",async()=>{const a=o.getByRole("button");await U.click(a),await R(500)}),await n("Click again to expand",async()=>{const a=o.getByRole("button");await U.click(a),await R(500)})}},O={args:{group:t(s,5,4,.75),settings:e.default()},play:async({canvasElement:c,step:n})=>{const o=z(c);await n("Verify progress text displays correctly",async()=>{const a=o.getByText(/\//,{exact:!1});H(a).toBeInTheDocument()}),await n("Verify summary text displays",async()=>{const a=o.getByText(/unfinished tasks in/);H(a).toBeInTheDocument()})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.6),
    settings: settingsBuilder.minimalUI() // ShowProgressBar: false
  }
}`,...x.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 1.0),
    // 100% completion
    settings: settingsBuilder.default()
  }
}`,...w.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 3, 0),
    // 0% completion
    settings: settingsBuilder.default()
  }
}`,...h.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.5),
    // 50% completion
    settings: settingsBuilder.default()
  }
}`,...D.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 30, 2, 0.3),
    // 30 days, fewer tasks per day
    settings: settingsBuilder.default()
  }
}`,...v.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 10, 1, 0.5),
    // Sparse year with 1 task per day
    settings: settingsBuilder.default()
  }
}`,...E.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    group: createYearGroup(currentYear, 15, 8, 0.4),
    // Many tasks per day
    settings: settingsBuilder.default()
  }
}`,...C.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...G.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...A.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
      const collapseButton = canvas.getByRole("button");
      await userEvent.click(collapseButton);
      await delay(500); // Wait for collapse animation
    });
    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button");
      await userEvent.click(expandButton);
      await delay(500); // Wait for expand animation
    });
  }
}`,...b.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};const De=["Default","Expanded","ProgressBarVisible","ProgressBarHidden","AllTasksCompleted","NoTasksCompleted","HalfCompleted","ManyDays","FewTasksPerDay","DenseYear","DarkMode","LargeFontSize","SingleDay","EmptyYear","PastYear","FutureYear","ExpandCollapse","ProgressBarAnimation"];export{w as AllTasksCompleted,G as DarkMode,i as Default,C as DenseYear,M as EmptyYear,b as ExpandCollapse,Y as Expanded,E as FewTasksPerDay,P as FutureYear,D as HalfCompleted,A as LargeFontSize,v as ManyDays,h as NoTasksCompleted,F as PastYear,O as ProgressBarAnimation,x as ProgressBarHidden,T as ProgressBarVisible,I as SingleDay,De as __namedExportsOrder,he as default};
