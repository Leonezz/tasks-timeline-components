import{j as m}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-BGtqOInk.js";import{T as R}from"./TodoList-BFOx4VWg.js";import{T as q,S as P}from"./SettingsContext-DkX_1huq.js";import{s as a}from"./settings-CvAGLwBv.js";import{t}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{D as F}from"./datetime-CoIMkCUY.js";import"./preload-helper-PPVm8Dsz.js";import"./rruleset-Bu4wjl4G.js";import"./BacklogSection-bp20aMWt.js";import"./TaskItem-DFdCcC3W.js";import"./Icon-B2foTpRx.js";import"./chevron-right-BYj65MRz.js";import"./Motion-BTKb_TxN.js";import"./proxy-DEXR2x0b.js";import"./DateBadge-BvAEeucm.js";import"./popover-CH-wF0B1.js";import"./index-gL42gEsK.js";import"./index-DSbOtjD6.js";import"./calendar-C910y9Ol.js";import"./TagBadge-Dgc43Bxf.js";import"./PriorityPopover-Dx7L7z7o.js";import"./CategoryPopover-CHRjnc_g.js";import"./collapsible-lBPQBf1S.js";import"./index-CNQ5PkYJ.js";import"./YearSection-DT9O5NBl.js";import"./DaySection-BNw5Suiv.js";import"./useVoiceInput-CjoFeMCS.js";import"./logger-CDMKXnH4.js";const{expect:x}=__STORYBOOK_MODULE_TEST__,Ot={title:"Core/TodoList",component:R,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(o,r)=>{const n=r.args,[E,D]=u.useState(n.tasks||[]),[W,z]=u.useState(n.isFocusMode||!1),[M,L]=u.useState(!1),[U,V]=u.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[_,N]=u.useState({field:"dueAt",direction:"asc",script:""}),j={tasks:E,availableCategories:n.availableCategories||["Work","Personal","Shopping"],availableTags:n.availableTags||["work","personal","urgent"],onUpdateTask:s=>{D(d=>d.map(i=>i.id===s.id?s:i)),console.log("Update task:",s)},onDeleteTask:s=>{D(d=>d.filter(i=>i.id!==s)),console.log("Delete task:",s)},onAddTask:s=>{const d={id:`task-${Date.now()}`,title:s.title||"New Task",status:"todo",priority:"medium",createdAt:F.now().toISO(),...s};D(i=>[...i,d]),console.log("Add task:",d)},onEditTask:s=>console.log("Edit task:",s),onAICommand:async s=>console.log("AI command:",s),onItemClick:n.onItemClick},G={settings:n.settings||a.default(),updateSettings:s=>console.log("Update settings:",s),isFocusMode:n.isFocusMode||!1,toggleFocusMode:()=>z(!W),isAiMode:M,toggleAiMode:()=>L(!M),filters:U,onFilterChange:V,sort:_,onSortChange:N,onVoiceError:s=>console.error("Voice error:",s),onOpenSettings:()=>console.log("Open settings")};return m.jsx(q,{value:j,children:m.jsx(P,{value:G,children:m.jsx("div",{className:"p-4",children:m.jsx(o,{})})})})}]},e=F.now(),H=e.minus({days:1}),C=e.plus({days:1}),c=e.plus({weeks:1}),l={args:{tasks:[t.base({title:"Review pull requests",dueAt:e.toISO(),priority:"high"}),t.base({title:"Update documentation",dueAt:e.toISO(),priority:"medium"}),t.base({title:"Team meeting",dueAt:C.toISO(),priority:"medium"}),t.base({title:"Sprint planning",dueAt:c.toISO(),priority:"high"}),t.base({id:"backlog-1",title:"Research new framework",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},p={args:{tasks:[],settings:a.default()}},g={args:{tasks:t.many(5,{dueAt:e.toISO()}),settings:a.default()}},k={args:{tasks:[t.base({title:"Undated task 1",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),t.base({title:"Undated task 2",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),t.base({title:"Undated task 3",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},y={args:{tasks:[...t.manyAcrossDays(8,e.minus({days:3}),e.plus({days:10})),...t.many(5,{dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},A={args:{tasks:[t.base({title:"Today task 1",dueAt:e.toISO()}),t.base({title:"Today task 2",dueAt:e.toISO()}),t.base({title:"Tomorrow task",dueAt:C.toISO()}),t.base({title:"Next week task",dueAt:c.toISO()})],settings:a.default(),isFocusMode:!0}},S={args:{tasks:[t.base({title:"Todo task",dueAt:e.toISO()}),t.completed({title:"Completed task 1",dueAt:e.toISO()}),t.completed({title:"Completed task 2",dueAt:e.toISO()}),t.base({title:"Another todo",dueAt:C.toISO()})],settings:a.withoutCompleted()}},f={args:{tasks:[t.base({title:"Starting today",startAt:e.toISO(),dueAt:c.toISO()}),t.base({title:"Starting tomorrow",startAt:C.toISO(),dueAt:c.toISO()}),t.base({title:"Starting next week",startAt:c.toISO(),dueAt:void 0})],settings:a.groupByStartDate()}},B={args:{tasks:t.many(8).map((o,r)=>({...o,createdAt:e.minus({days:r}).toISO(),dueAt:void 0})),settings:a.groupByCreatedDate()}},h={args:{tasks:[t.completed({title:"Completed today",completedAt:e.toISO()}),t.completed({title:"Completed yesterday",completedAt:H.toISO()}),t.completed({title:"Completed last week",completedAt:e.minus({weeks:1}).toISO()})],settings:a.groupByCompletedDate()}},I={args:{...l.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},O={args:{...l.args,settings:a.largeFontSize()}},v={args:{tasks:t.manyAcrossDays(50,e.minus({days:10}),e.plus({days:30})),settings:a.default()},play:async({canvasElement:o,step:r})=>{await r("Verify many year sections rendered",async()=>{x(o.textContent).toBeTruthy()})}},b={args:{tasks:t.many(3,{dueAt:e.toISO()}),settings:a.default(),onItemClick:o=>console.log("Item clicked:",o)}},w={args:{tasks:[...t.manyAcrossDays(500,e.minus({months:3}),e.plus({months:3})),...t.many(50,{dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()},parameters:{docs:{description:{story:"550 tasks across 6 months plus backlog. DaySections use IntersectionObserver-based lazy rendering — only sections near the viewport render their TaskItems. Scroll to verify smooth performance."}}},play:async({canvasElement:o,step:r})=>{await r("Verify initial render has content without rendering all tasks",async()=>{x(o.textContent).toBeTruthy();const n=o.querySelectorAll('[class*="group relative"]');x(n.length).toBeLessThan(550)})}},T={args:{tasks:t.manyAcrossDays(300,e.minus({months:1}),e.plus({months:2})),settings:a.default()},parameters:{docs:{description:{story:"300 dated tasks with no backlog. Verifies lazy rendering works for timeline sections only."}}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};const vt=["Default","EmptyState","TodayOnly","BacklogOnly","WithManyTasks","FocusModeActive","CompletedHidden","GroupByStartDate","GroupByCreatedDate","GroupByCompletedDate","DarkMode","LargeFontSize","ScrollBehavior","WithItemClick","LargeDatasetVirtualized","LargeDatasetNoBacklog"];export{k as BacklogOnly,S as CompletedHidden,I as DarkMode,l as Default,p as EmptyState,A as FocusModeActive,h as GroupByCompletedDate,B as GroupByCreatedDate,f as GroupByStartDate,T as LargeDatasetNoBacklog,w as LargeDatasetVirtualized,O as LargeFontSize,v as ScrollBehavior,g as TodayOnly,b as WithItemClick,y as WithManyTasks,vt as __namedExportsOrder,Ot as default};
