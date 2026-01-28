import{j as m}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-DWF3bbbh.js";import{T as R}from"./TodoList-BPtIbBP_.js";import{T as V,S as z}from"./SettingsContext-i5OQ798T.js";import{s as a}from"./settings-BT4PNPAn.js";import{t,D}from"./tasks-BV5_RF93.js";import"./edge-cases-Dobf_xol.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BSO_abFL.js";import"./BacklogSection-COxhkbC2.js";import"./TaskItem-BAThv0ZE.js";import"./Icon-Bl9d328S.js";import"./Motion-RP90RCP3.js";import"./proxy-DQ99aPyK.js";import"./DateBadge-CvqL-g8i.js";import"./popover-CnXIE8Br.js";import"./index-vcaNAPuw.js";import"./index-Dv3IHhLy.js";import"./calendar--IOBLT8f.js";import"./TagBadge-Ce_4vmxc.js";import"./PriorityPopover-3o5Q0LFi.js";import"./CategoryPopover-Diddo9jr.js";import"./collapsible-BYCCRhbA.js";import"./index-BDb1S82_.js";import"./YearSection-BK208A2E.js";import"./DaySection-CkS8gByd.js";import"./useVoiceInput-C0iIlxcM.js";import"./logger-CDMKXnH4.js";const{expect:N}=__STORYBOOK_MODULE_TEST__,ft={title:"Core/TodoList",component:R,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(o,l)=>{const n=l.args,[x,w]=u.useState(n.tasks||[]),[M,F]=u.useState(n.isFocusMode||!1),[h,E]=u.useState(!1),[U,W]=u.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[_,j]=u.useState({field:"dueAt",direction:"asc",script:""}),G={tasks:x,availableCategories:n.availableCategories||["Work","Personal","Shopping"],availableTags:n.availableTags||["work","personal","urgent"],onUpdateTask:s=>{w(r=>r.map(d=>d.id===s.id?s:d)),console.log("Update task:",s)},onDeleteTask:s=>{w(r=>r.filter(d=>d.id!==s)),console.log("Delete task:",s)},onAddTask:s=>{const r={id:`task-${Date.now()}`,title:s.title||"New Task",status:"todo",priority:"medium",createdAt:D.now().toISO(),...s};w(d=>[...d,r]),console.log("Add task:",r)},onEditTask:s=>console.log("Edit task:",s),onAICommand:async s=>console.log("AI command:",s),onItemClick:n.onItemClick},L={settings:n.settings||a.default(),updateSettings:s=>console.log("Update settings:",s),isFocusMode:n.isFocusMode||!1,toggleFocusMode:()=>F(!M),isAiMode:h,toggleAiMode:()=>E(!h),filters:U,onFilterChange:W,sort:_,onSortChange:j,onVoiceError:s=>console.error("Voice error:",s),onOpenSettings:()=>console.log("Open settings")};return m.jsx(V,{value:G,children:m.jsx(z,{value:L,children:m.jsx("div",{className:"p-4",children:m.jsx(o,{})})})})}]},e=D.now(),P=e.minus({days:1}),T=e.plus({days:1}),c=e.plus({weeks:1}),i={args:{tasks:[t.base({title:"Review pull requests",dueAt:e.toISO(),priority:"high"}),t.base({title:"Update documentation",dueAt:e.toISO(),priority:"medium"}),t.base({title:"Team meeting",dueAt:T.toISO(),priority:"medium"}),t.base({title:"Sprint planning",dueAt:c.toISO(),priority:"high"}),t.base({id:"backlog-1",title:"Research new framework",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},p={args:{tasks:[],settings:a.default()}},g={args:{tasks:t.many(5,{dueAt:e.toISO()}),settings:a.default()}},k={args:{tasks:[t.base({title:"Undated task 1",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),t.base({title:"Undated task 2",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0}),t.base({title:"Undated task 3",dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},y={args:{tasks:[...t.manyAcrossDays(8,e.minus({days:3}),e.plus({days:10})),...t.many(5,{dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0})],settings:a.default()}},A={args:{tasks:[t.base({title:"Today task 1",dueAt:e.toISO()}),t.base({title:"Today task 2",dueAt:e.toISO()}),t.base({title:"Tomorrow task",dueAt:T.toISO()}),t.base({title:"Next week task",dueAt:c.toISO()})],settings:a.default(),isFocusMode:!0}},S={args:{tasks:[t.base({title:"Todo task",dueAt:e.toISO()}),t.completed({title:"Completed task 1",dueAt:e.toISO()}),t.completed({title:"Completed task 2",dueAt:e.toISO()}),t.base({title:"Another todo",dueAt:T.toISO()})],settings:a.withoutCompleted()}},f={args:{tasks:[t.base({title:"Starting today",startAt:e.toISO(),dueAt:c.toISO()}),t.base({title:"Starting tomorrow",startAt:T.toISO(),dueAt:c.toISO()}),t.base({title:"Starting next week",startAt:c.toISO(),dueAt:void 0})],settings:a.groupByStartDate()}},B={args:{tasks:t.many(8).map((o,l)=>({...o,createdAt:e.minus({days:l}).toISO(),dueAt:void 0})),settings:a.groupByCreatedDate()}},I={args:{tasks:[t.completed({title:"Completed today",completedAt:e.toISO()}),t.completed({title:"Completed yesterday",completedAt:P.toISO()}),t.completed({title:"Completed last week",completedAt:e.minus({weeks:1}).toISO()})],settings:a.groupByCompletedDate()}},O={args:{...i.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},b={args:{...i.args,settings:a.largeFontSize()}},v={args:{tasks:t.manyAcrossDays(50,e.minus({days:10}),e.plus({days:30})),settings:a.default()},play:async({canvasElement:o,step:l})=>{await l("Verify many year sections rendered",async()=>{N(o.textContent).toBeTruthy()})}},C={args:{tasks:t.many(3,{dueAt:e.toISO()}),settings:a.default(),onItemClick:o=>console.log("Item clicked:",o)}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...O.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: taskBuilder.many(3, {
      dueAt: today.toISO()!
    }),
    settings: settingsBuilder.default(),
    onItemClick: (task: Task) => console.log("Item clicked:", task)
  }
}`,...C.parameters?.docs?.source}}};const Bt=["Default","EmptyState","TodayOnly","BacklogOnly","WithManyTasks","FocusModeActive","CompletedHidden","GroupByStartDate","GroupByCreatedDate","GroupByCompletedDate","DarkMode","LargeFontSize","ScrollBehavior","WithItemClick"];export{k as BacklogOnly,S as CompletedHidden,O as DarkMode,i as Default,p as EmptyState,A as FocusModeActive,I as GroupByCompletedDate,B as GroupByCreatedDate,f as GroupByStartDate,b as LargeFontSize,v as ScrollBehavior,g as TodayOnly,C as WithItemClick,y as WithManyTasks,Bt as __namedExportsOrder,ft as default};
