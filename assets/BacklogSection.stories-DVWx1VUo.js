import{j as u}from"./jsx-runtime-u17CrQMm.js";import{r as g}from"./iframe-gP99-5rX.js";import{B as $}from"./BacklogSection-OTgI9H0G.js";import{T as G,S as K}from"./SettingsContext-Rt9hpErf.js";import{s as a}from"./settings-BT4PNPAn.js";import{t as Y,D as E}from"./tasks-BV5_RF93.js";import{e as b}from"./edge-cases-Dobf_xol.js";import{d as L}from"./test-utils-BNouzmjp.js";import"./preload-helper-PPVm8Dsz.js";import"./TaskItem-DGy0RIYO.js";import"./index-BSO_abFL.js";import"./Icon-D9wwggU8.js";import"./Motion-B8MN7Cfh.js";import"./proxy-B1A0xX4B.js";import"./DateBadge-BcsUufk8.js";import"./popover-ClufRkfB.js";import"./index-FTaP0lHz.js";import"./index-BfLlYqDs.js";import"./calendar-B0za4MK2.js";import"./TagBadge-BVuvOrOm.js";import"./PriorityPopover-BEZpPvrs.js";import"./CategoryPopover-CvdYUW38.js";import"./collapsible-4tI_3Ztw.js";import"./index-D7FHYTda.js";const{expect:M,userEvent:O,within:F}=__STORYBOOK_MODULE_TEST__,ft={title:"Sections/BacklogSection",component:$,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(i,s)=>{const r=s.args,[n,l]=g.useState(r.tasks||[]),[I,W]=g.useState(!1),[R,V]=g.useState(!1),[_,P]=g.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[j,H]=g.useState({field:"dueAt",direction:"asc",script:""}),N={tasks:n,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:e=>{l(d=>d.map(c=>c.id===e.id?e:c)),console.log("Update task:",e)},onDeleteTask:e=>{l(d=>d.filter(c=>c.id!==e)),console.log("Delete task:",e)},onAddTask:e=>{const d={id:`task-${Date.now()}`,title:e.title||"New Task",status:"todo",priority:"medium",createdAt:E.now().toISO(),...e};l(c=>[...c,d]),console.log("Add task:",d)},onEditTask:e=>console.log("Edit task:",e),onAICommand:async e=>console.log("AI command:",e)},z={settings:s.args.settings||a.default(),updateSettings:e=>console.log("Update settings:",e),isFocusMode:I,toggleFocusMode:()=>W(!I),isAiMode:R,toggleAiMode:()=>V(!R),filters:_,onFilterChange:P,sort:j,onSortChange:H,onVoiceError:e=>console.error("Voice error:",e),onOpenSettings:()=>console.log("Open settings")};return u.jsx(G,{value:N,children:u.jsx(K,{value:z,children:u.jsx("div",{className:"p-4",children:u.jsx(i,{})})})})}]},t=i=>Y.base({dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0,...i}),o={args:{tasks:[t({title:"Research new framework",priority:"medium"}),t({title:"Update dependencies",priority:"low"}),t({title:"Write blog post",priority:"medium"}),t({title:"Refactor auth module",priority:"high"}),t({title:"Review security guidelines",priority:"medium"})],settings:a.default()}},p={args:{tasks:[],settings:a.default()}},m={args:{tasks:[t({title:"Single backlog task"})],settings:a.default()}},k={args:{tasks:Array.from({length:20},(i,s)=>t({title:`Backlog task ${s+1}`})),settings:a.default()}},T={args:{tasks:[t({title:"Critical bug fix",priority:"high"}),t({title:"Security patch",priority:"high"}),t({title:"Performance issue",priority:"high"})],settings:a.default()}},y={args:{tasks:[t({title:"High priority task",priority:"high"}),t({title:"High priority task 2",priority:"high"}),t({title:"Medium priority task",priority:"medium"}),t({title:"Medium priority task 2",priority:"medium"}),t({title:"Low priority task",priority:"low"}),t({title:"Low priority task 2",priority:"low"})],settings:a.default()}},h={args:{tasks:[t({title:"Todo task 1",status:"todo"}),t({title:"Completed task 1",status:"done"}),t({title:"Todo task 2",status:"todo"}),t({title:"Completed task 2",status:"done"})],settings:a.default()}},f={args:{tasks:[t({title:"Completed task 1",status:"done"}),t({title:"Completed task 2",status:"done"}),t({title:"Completed task 3",status:"done"})],settings:a.default()}},S={args:{tasks:[t({title:"Task missing due date",dueAt:void 0,startAt:E.now().toISO()}),t({title:"Task missing all dates",dueAt:void 0,startAt:void 0})],settings:a.default()}},B={args:{tasks:[t({title:"Task missing start date",startAt:void 0,dueAt:E.now().toISO()}),t({title:"Task missing all dates",startAt:void 0,dueAt:void 0})],settings:a.groupByStartDate()}},w={args:{tasks:[t({...b.veryLongTitle}),t({title:"Normal task"}),t({...b.veryLongTitle})],settings:a.default()}},U={args:{tasks:[t({...b.manyTags}),t({title:"Normal task with few tags",tags:[{id:"1",name:"work"}]})],settings:a.default()}},v={args:{tasks:[t({...b.unicodeTitle}),t({title:"Regular English task"}),t({title:"另一个中文任务"})],settings:a.default()}},A={args:{...o.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},x={args:{...o.args,settings:a.largeFontSize()}},C={args:{...o.args},play:async({canvasElement:i,step:s})=>{const r=F(i);await s("Find backlog header",async()=>{const n=r.getByText(/Backlog \/ Undated/i);M(n).toBeInTheDocument()}),await s("Verify task count badge",async()=>{const n=r.getByText("5");M(n).toBeInTheDocument()}),await s("Click to collapse backlog section",async()=>{const n=r.getByRole("button");await O.click(n),await L(400)}),await s("Click again to expand",async()=>{const n=r.getByRole("button");await O.click(n),await L(400)})}},D={args:{tasks:[t({title:"Task to complete",priority:"high"}),t({title:"Task to edit",priority:"medium"})],settings:a.default()},play:async({canvasElement:i,step:s})=>{const r=F(i);await s("Verify tasks are rendered",async()=>{const n=r.getByText("Task to complete"),l=r.getByText("Task to edit");M(n).toBeInTheDocument(),M(l).toBeInTheDocument()})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Research new framework",
      priority: "medium"
    }), createUndatedTask({
      title: "Update dependencies",
      priority: "low"
    }), createUndatedTask({
      title: "Write blog post",
      priority: "medium"
    }), createUndatedTask({
      title: "Refactor auth module",
      priority: "high"
    }), createUndatedTask({
      title: "Review security guidelines",
      priority: "medium"
    })],
    settings: settingsBuilder.default()
  }
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [],
    settings: settingsBuilder.default()
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Single backlog task"
    })],
    settings: settingsBuilder.default()
  }
}`,...m.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: Array.from({
      length: 20
    }, (_, i) => createUndatedTask({
      title: \`Backlog task \${i + 1}\`
    })),
    settings: settingsBuilder.default()
  }
}`,...k.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Critical bug fix",
      priority: "high"
    }), createUndatedTask({
      title: "Security patch",
      priority: "high"
    }), createUndatedTask({
      title: "Performance issue",
      priority: "high"
    })],
    settings: settingsBuilder.default()
  }
}`,...T.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "High priority task",
      priority: "high"
    }), createUndatedTask({
      title: "High priority task 2",
      priority: "high"
    }), createUndatedTask({
      title: "Medium priority task",
      priority: "medium"
    }), createUndatedTask({
      title: "Medium priority task 2",
      priority: "medium"
    }), createUndatedTask({
      title: "Low priority task",
      priority: "low"
    }), createUndatedTask({
      title: "Low priority task 2",
      priority: "low"
    })],
    settings: settingsBuilder.default()
  }
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Todo task 1",
      status: "todo"
    }), createUndatedTask({
      title: "Completed task 1",
      status: "done"
    }), createUndatedTask({
      title: "Todo task 2",
      status: "todo"
    }), createUndatedTask({
      title: "Completed task 2",
      status: "done"
    })],
    settings: settingsBuilder.default()
  }
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Completed task 1",
      status: "done"
    }), createUndatedTask({
      title: "Completed task 2",
      status: "done"
    }), createUndatedTask({
      title: "Completed task 3",
      status: "done"
    })],
    settings: settingsBuilder.default()
  }
}`,...f.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Task missing due date",
      dueAt: undefined,
      startAt: DateTime.now().toISO()!
    }), createUndatedTask({
      title: "Task missing all dates",
      dueAt: undefined,
      startAt: undefined
    })],
    settings: settingsBuilder.default() // GroupingStrategy: ["dueAt"]
  }
}`,...S.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Task missing start date",
      startAt: undefined,
      dueAt: DateTime.now().toISO()!
    }), createUndatedTask({
      title: "Task missing all dates",
      startAt: undefined,
      dueAt: undefined
    })],
    settings: settingsBuilder.groupByStartDate() // GroupingStrategy: ["startAt"]
  }
}`,...B.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      ...edgeCaseTasks.veryLongTitle
    }), createUndatedTask({
      title: "Normal task"
    }), createUndatedTask({
      ...edgeCaseTasks.veryLongTitle
    })],
    settings: settingsBuilder.default()
  }
}`,...w.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      ...edgeCaseTasks.manyTags
    }), createUndatedTask({
      title: "Normal task with few tags",
      tags: [{
        id: "1",
        name: "work"
      }]
    })],
    settings: settingsBuilder.default()
  }
}`,...U.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      ...edgeCaseTasks.unicodeTitle
    }), createUndatedTask({
      title: "Regular English task"
    }), createUndatedTask({
      title: "另一个中文任务"
    })],
    settings: settingsBuilder.default()
  }
}`,...v.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...A.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...x.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find backlog header", async () => {
      const header = canvas.getByText(/Backlog \\/ Undated/i);
      expect(header).toBeInTheDocument();
    });
    await step("Verify task count badge", async () => {
      // Should show count of tasks (e.g., "5")
      const badge = canvas.getByText("5");
      expect(badge).toBeInTheDocument();
    });
    await step("Click to collapse backlog section", async () => {
      const collapseButton = canvas.getByRole("button");
      await userEvent.click(collapseButton);
      await delay(400); // Wait for collapse animation
    });
    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button");
      await userEvent.click(expandButton);
      await delay(400); // Wait for expand animation
    });
  }
}`,...C.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Task to complete",
      priority: "high"
    }), createUndatedTask({
      title: "Task to edit",
      priority: "medium"
    })],
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Verify tasks are rendered", async () => {
      const task1 = canvas.getByText("Task to complete"),
        task2 = canvas.getByText("Task to edit");
      expect(task1).toBeInTheDocument();
      expect(task2).toBeInTheDocument();
    });
  }
}`,...D.parameters?.docs?.source}}};const St=["Default","EmptyBacklog","SingleTask","ManyTasks","AllHighPriority","MixedPriorities","WithCompletedTasks","AllCompleted","WithMissingDueDate","WithMissingStartDate","VeryLongTitles","ManyTags","UnicodeContent","DarkMode","LargeFontSize","ExpandCollapse","TaskInteractions"];export{f as AllCompleted,T as AllHighPriority,A as DarkMode,o as Default,p as EmptyBacklog,C as ExpandCollapse,x as LargeFontSize,U as ManyTags,k as ManyTasks,y as MixedPriorities,m as SingleTask,D as TaskInteractions,v as UnicodeContent,w as VeryLongTitles,h as WithCompletedTasks,S as WithMissingDueDate,B as WithMissingStartDate,St as __namedExportsOrder,ft as default};
