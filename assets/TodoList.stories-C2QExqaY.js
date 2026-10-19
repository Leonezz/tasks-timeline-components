import{j as m}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-C21N2aj2.js";import{T as R}from"./TodoList-Bd8CpOMp.js";import{T as q,S as P}from"./SettingsContext-CD1KsnZl.js";import{s as a}from"./settings-GESQiD84.js";import{t as e}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{D as F}from"./recurrence-B2fS74Tu.js";import"./preload-helper-PPVm8Dsz.js";import"./YearSection-D8iTL7DI.js";import"./DaySection-t1zvpuwx.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";import"./BacklogSection-DVWonrCe.js";const{expect:x}=__STORYBOOK_MODULE_TEST__,xe={title:"Core/TodoList",component:R,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(o,n)=>{const r=n.args,[E,D]=u.useState(r.tasks||[]),[W,z]=u.useState(r.isFocusMode||!1),[M,L]=u.useState(!1),[U,V]=u.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[_,N]=u.useState({field:"dueAt",direction:"asc",script:""}),j={tasks:E,availableCategories:r.availableCategories||["Work","Personal","Shopping"],availableTags:r.availableTags||["work","personal","urgent"],onUpdateTask:s=>{D(d=>d.map(i=>i.id===s.id?s:i)),console.log("Update task:",s)},onDeleteTask:s=>{D(d=>d.filter(i=>i.id!==s)),console.log("Delete task:",s)},onAddTask:s=>{const d={id:`task-${Date.now()}`,title:s.title||"New Task",status:"todo",priority:"medium",createdAt:F.now().toISO(),...s};D(i=>[...i,d]),console.log("Add task:",d)},onEditTask:s=>console.log("Edit task:",s),onAICommand:async s=>console.log("AI command:",s),onItemClick:r.onItemClick},G={settings:r.settings||a.default(),updateSettings:s=>console.log("Update settings:",s),isFocusMode:r.isFocusMode||!1,toggleFocusMode:()=>z(!W),isAiMode:M,toggleAiMode:()=>L(!M),filters:U,onFilterChange:V,sort:_,onSortChange:N,onVoiceError:s=>console.error("Voice error:",s),onOpenSettings:()=>console.log("Open settings")};return m.jsx(q,{value:j,children:m.jsx(P,{value:G,children:m.jsx("div",{className:"p-4",children:m.jsx(o,{})})})})}]},t=F.now(),H=t.minus({days:1}),C=t.plus({days:1}),c=t.plus({weeks:1}),l={args:{tasks:[e.base({title:"Review pull requests",dueAt:t.toISO(),priority:"high"}),e.base({title:"Update documentation",dueAt:t.toISO(),priority:"medium"}),e.base({title:"Team meeting",dueAt:C.toISO(),priority:"medium"}),e.base({title:"Sprint planning",dueAt:c.toISO(),priority:"high"}),e.base({id:"backlog-1",title:"Research new framework",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},p={args:{tasks:[],settings:a.default()}},g={args:{tasks:e.many(5,{dueAt:t.toISO()}),settings:a.default()}},k={args:{tasks:[e.base({title:"Undated task 1",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),e.base({title:"Undated task 2",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),e.base({title:"Undated task 3",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},y={args:{tasks:[...e.manyAcrossDays(8,t.minus({days:3}),t.plus({days:10})),...e.many(5,{dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},A={args:{tasks:[e.base({title:"Today task 1",dueAt:t.toISO()}),e.base({title:"Today task 2",dueAt:t.toISO()}),e.base({title:"Tomorrow task",dueAt:C.toISO()}),e.base({title:"Next week task",dueAt:c.toISO()})],settings:a.default(),isFocusMode:!0}},S={args:{tasks:[e.base({title:"Todo task",dueAt:t.toISO()}),e.completed({title:"Completed task 1",dueAt:t.toISO()}),e.completed({title:"Completed task 2",dueAt:t.toISO()}),e.base({title:"Another todo",dueAt:C.toISO()})],settings:a.withoutCompleted()}},f={args:{tasks:[e.base({title:"Starting today",startAt:t.toISO(),dueAt:c.toISO()}),e.base({title:"Starting tomorrow",startAt:C.toISO(),dueAt:c.toISO()}),e.base({title:"Starting next week",startAt:c.toISO(),dueAt:void 0})],settings:a.groupByStartDate()}},B={args:{tasks:e.many(8).map((o,n)=>({...o,createdAt:t.minus({days:n}).toISO(),dueAt:void 0})),settings:a.groupByCreatedDate()}},h={args:{tasks:[e.completed({title:"Completed today",completedAt:t.toISO()}),e.completed({title:"Completed yesterday",completedAt:H.toISO()}),e.completed({title:"Completed last week",completedAt:t.minus({weeks:1}).toISO()})],settings:a.groupByCompletedDate()}},I={args:{...l.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},O={args:{...l.args,settings:a.largeFontSize()}},v={args:{tasks:e.manyAcrossDays(50,t.minus({days:10}),t.plus({days:30})),settings:a.default()},play:async({canvasElement:o,step:n})=>{await n("Verify many year sections rendered",async()=>{x(o.textContent).toBeTruthy()})}},b={args:{tasks:e.many(3,{dueAt:t.toISO()}),settings:a.default(),onItemClick:o=>console.log("Item clicked:",o)}},w={args:{tasks:[...e.manyAcrossDays(500,t.minus({months:3}),t.plus({months:3})),...e.many(50,{dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()},parameters:{docs:{description:{story:"550 tasks across 6 months plus backlog. DaySections use IntersectionObserver-based lazy rendering — only sections near the viewport render their TaskItems. Scroll to verify smooth performance."}}},play:async({canvasElement:o,step:n})=>{await n("Verify initial render has content without rendering all tasks",async()=>{x(o.textContent).toBeTruthy();const r=o.querySelectorAll('[class*="group relative"]');x(r.length).toBeLessThan(550)})}},T={args:{tasks:e.manyAcrossDays(300,t.minus({months:1}),t.plus({months:2})),settings:a.default()},parameters:{docs:{description:{story:"300 dated tasks with no backlog. Verifies lazy rendering works for timeline sections only."}}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [
    // Today tasks
    taskBuilder.base({
      title: "Review pull requests",
      dueAt: today.toISO()!,
      priority: "high"
    }), taskBuilder.base({
      title: "Update documentation",
      dueAt: today.toISO()!,
      priority: "medium"
    }),
    // Future tasks
    taskBuilder.base({
      title: "Team meeting",
      dueAt: tomorrow.toISO()!,
      priority: "medium"
    }), taskBuilder.base({
      title: "Sprint planning",
      dueAt: nextWeek.toISO()!,
      priority: "high"
    }),
    // Backlog (no dates)
    taskBuilder.base({
      id: "backlog-1",
      title: "Research new framework",
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    })],
    settings: settingsBuilder.default()
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [],
    settings: settingsBuilder.default()
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.many(5, {
      dueAt: today.toISO()!
    }),
    settings: settingsBuilder.default()
  }
}`,...g.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [taskBuilder.base({
      title: "Undated task 1",
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    }), taskBuilder.base({
      title: "Undated task 2",
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    }), taskBuilder.base({
      title: "Undated task 3",
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    })],
    settings: settingsBuilder.default()
  }
}`,...k.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [
    // 20+ tasks across multiple dates
    ...taskBuilder.manyAcrossDays(8, today.minus({
      days: 3
    }), today.plus({
      days: 10
    })), ...taskBuilder.many(5, {
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    })],
    settings: settingsBuilder.default()
  }
}`,...y.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [taskBuilder.base({
      title: "Today task 1",
      dueAt: today.toISO()!
    }), taskBuilder.base({
      title: "Today task 2",
      dueAt: today.toISO()!
    }), taskBuilder.base({
      title: "Tomorrow task",
      dueAt: tomorrow.toISO()!
    }), taskBuilder.base({
      title: "Next week task",
      dueAt: nextWeek.toISO()!
    })],
    settings: settingsBuilder.default(),
    isFocusMode: true
  }
}`,...A.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [taskBuilder.base({
      title: "Todo task",
      dueAt: today.toISO()!
    }), taskBuilder.completed({
      title: "Completed task 1",
      dueAt: today.toISO()!
    }), taskBuilder.completed({
      title: "Completed task 2",
      dueAt: today.toISO()!
    }), taskBuilder.base({
      title: "Another todo",
      dueAt: tomorrow.toISO()!
    })],
    settings: settingsBuilder.withoutCompleted()
  }
}`,...S.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [taskBuilder.base({
      title: "Starting today",
      startAt: today.toISO()!,
      dueAt: nextWeek.toISO()!
    }), taskBuilder.base({
      title: "Starting tomorrow",
      startAt: tomorrow.toISO()!,
      dueAt: nextWeek.toISO()!
    }), taskBuilder.base({
      title: "Starting next week",
      startAt: nextWeek.toISO()!,
      dueAt: undefined
    })],
    settings: settingsBuilder.groupByStartDate()
  }
}`,...f.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.many(8).map((task, i) => ({
      ...task,
      createdAt: today.minus({
        days: i
      }).toISO()!,
      dueAt: undefined
    })),
    settings: settingsBuilder.groupByCreatedDate()
  }
}`,...B.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [taskBuilder.completed({
      title: "Completed today",
      completedAt: today.toISO()!
    }), taskBuilder.completed({
      title: "Completed yesterday",
      completedAt: yesterday.toISO()!
    }), taskBuilder.completed({
      title: "Completed last week",
      completedAt: today.minus({
        weeks: 1
      }).toISO()!
    })],
    settings: settingsBuilder.groupByCompletedDate()
  }
}`,...h.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...I.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...O.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.manyAcrossDays(50, today.minus({
      days: 10
    }), today.plus({
      days: 30
    })),
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Verify many year sections rendered", async () => {
      // TodoList should have year sections
      // At minimum, should have content rendered
      expect(canvasElement.textContent).toBeTruthy();
    });
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.many(3, {
      dueAt: today.toISO()!
    }),
    settings: settingsBuilder.default(),
    onItemClick: (task: Task) => console.log("Item clicked:", task)
  }
}`,...b.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [
    // 500 tasks across 6 months — tests lazy rendering of off-screen sections
    ...taskBuilder.manyAcrossDays(500, today.minus({
      months: 3
    }), today.plus({
      months: 3
    })),
    // 50 backlog tasks
    ...taskBuilder.many(50, {
      dueAt: undefined,
      startAt: undefined,
      createdAt: undefined,
      completedAt: undefined
    })],
    settings: settingsBuilder.default()
  },
  parameters: {
    docs: {
      description: {
        story: "550 tasks across 6 months plus backlog. DaySections use IntersectionObserver-based lazy rendering — only sections near the viewport render their TaskItems. Scroll to verify smooth performance."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Verify initial render has content without rendering all tasks", async () => {
      // The page should render without hanging
      expect(canvasElement.textContent).toBeTruthy();
      // Not all 550 tasks should be in the DOM at once
      const taskItems = canvasElement.querySelectorAll('[class*="group relative"]');
      // With lazy rendering, only visible sections render tasks
      // We expect far fewer than 550 task DOM nodes
      expect(taskItems.length).toBeLessThan(550);
    });
  }
}`,...w.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.manyAcrossDays(300, today.minus({
      months: 1
    }), today.plus({
      months: 2
    })),
    settings: settingsBuilder.default()
  },
  parameters: {
    docs: {
      description: {
        story: "300 dated tasks with no backlog. Verifies lazy rendering works for timeline sections only."
      }
    }
  }
}`,...T.parameters?.docs?.source}}};const Me=["Default","EmptyState","TodayOnly","BacklogOnly","WithManyTasks","FocusModeActive","CompletedHidden","GroupByStartDate","GroupByCreatedDate","GroupByCompletedDate","DarkMode","LargeFontSize","ScrollBehavior","WithItemClick","LargeDatasetVirtualized","LargeDatasetNoBacklog"];export{k as BacklogOnly,S as CompletedHidden,I as DarkMode,l as Default,p as EmptyState,A as FocusModeActive,h as GroupByCompletedDate,B as GroupByCreatedDate,f as GroupByStartDate,T as LargeDatasetNoBacklog,w as LargeDatasetVirtualized,O as LargeFontSize,v as ScrollBehavior,g as TodayOnly,b as WithItemClick,y as WithManyTasks,Me as __namedExportsOrder,xe as default};
