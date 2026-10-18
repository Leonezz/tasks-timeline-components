import{j as u}from"./jsx-runtime-u17CrQMm.js";import{r as p}from"./iframe-DX6dunwq.js";import{B as $}from"./BacklogSection-Dnv2y0Mz.js";import{T as G,S as K}from"./SettingsContext-Dr2TBy9k.js";import{s as a}from"./settings-GESQiD84.js";import{t as Y}from"./tasks-CcRg1J09.js";import{e as M}from"./edge-cases-DMAB-FsE.js";import{D as E}from"./recurrence-Co3oC643.js";import{d as L}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./TaskItem-DA0AyfWo.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-B3FenB3o.js";import"./chevron-right-Bsvfh4yW.js";import"./circle-C-nGDjeH.js";import"./calendar-CXzZhQC7.js";import"./Motion-gFejr4jc.js";import"./proxy-C45Fm9tl.js";import"./date-badge-tones-sfOfQwII.js";import"./popover-sGFH9hBn.js";import"./Combination-DzmrH2IM.js";import"./usePortalContainer-DYYD4TQs.js";import"./index-DSjlBnpD.js";import"./index-BrSUwSwv.js";import"./calendar-DNv7P81Q.js";import"./button-BTuZAieA.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-BnYZTcTI.js";import"./PriorityPopover-s9xosWDc.js";import"./CategoryPopover-DhQhahfi.js";import"./MarkdownText-PLHOlyD6.js";import"./collapsible-D9M7nZ4d.js";const{expect:l,userEvent:O,within:F}=__STORYBOOK_MODULE_TEST__,Ct={title:"Sections/BacklogSection",component:$,tags:["autodocs"],args:{lazy:!1},parameters:{layout:"fullscreen"},decorators:[(i,n)=>{const r=n.args,[s,g]=p.useState(r.tasks||[]),[I,W]=p.useState(!1),[R,H]=p.useState(!1),[V,_]=p.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[P,j]=p.useState({field:"dueAt",direction:"asc",script:""}),N={tasks:s,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:e=>{g(d=>d.map(c=>c.id===e.id?e:c)),console.log("Update task:",e)},onDeleteTask:e=>{g(d=>d.filter(c=>c.id!==e)),console.log("Delete task:",e)},onAddTask:e=>{const d={id:`task-${Date.now()}`,title:e.title||"New Task",status:"todo",priority:"medium",createdAt:E.now().toISO(),...e};g(c=>[...c,d]),console.log("Add task:",d)},onEditTask:e=>console.log("Edit task:",e),onAICommand:async e=>console.log("AI command:",e)},z={settings:n.args.settings||a.default(),updateSettings:e=>console.log("Update settings:",e),isFocusMode:I,toggleFocusMode:()=>W(!I),isAiMode:R,toggleAiMode:()=>H(!R),filters:V,onFilterChange:_,sort:P,onSortChange:j,onVoiceError:e=>console.error("Voice error:",e),onOpenSettings:()=>console.log("Open settings")};return u.jsx(G,{value:N,children:u.jsx(K,{value:z,children:u.jsx("div",{className:"p-4",children:u.jsx(i,{})})})})}]},t=i=>Y.base({dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0,...i}),o={args:{tasks:[t({title:"Research new framework",priority:"medium"}),t({title:"Update dependencies",priority:"low"}),t({title:"Write blog post",priority:"medium"}),t({title:"Refactor auth module",priority:"high"}),t({title:"Review security guidelines",priority:"medium"})],settings:a.default()}},m={args:{tasks:[],settings:a.default()}},k={args:{tasks:[t({title:"Single backlog task"})],settings:a.default()}},T={args:{tasks:Array.from({length:20},(i,n)=>t({title:`Backlog task ${n+1}`})),settings:a.default()}},y={args:{tasks:[t({title:"Critical bug fix",priority:"high"}),t({title:"Security patch",priority:"high"}),t({title:"Performance issue",priority:"high"})],settings:a.default()}},f={args:{tasks:[t({title:"High priority task",priority:"high"}),t({title:"High priority task 2",priority:"high"}),t({title:"Medium priority task",priority:"medium"}),t({title:"Medium priority task 2",priority:"medium"}),t({title:"Low priority task",priority:"low"}),t({title:"Low priority task 2",priority:"low"})],settings:a.default()}},h={args:{tasks:[t({title:"Todo task 1",status:"todo"}),t({title:"Completed task 1",status:"done"}),t({title:"Todo task 2",status:"todo"}),t({title:"Completed task 2",status:"done"})],settings:a.default()}},B={args:{tasks:[t({title:"Completed task 1",status:"done"}),t({title:"Completed task 2",status:"done"}),t({title:"Completed task 3",status:"done"})],settings:a.default()}},S={args:{tasks:[t({title:"Task missing due date",dueAt:void 0,startAt:E.now().toISO()}),t({title:"Task missing all dates",dueAt:void 0,startAt:void 0})],settings:a.default()}},w={args:{tasks:[t({title:"Task missing start date",startAt:void 0,dueAt:E.now().toISO()}),t({title:"Task missing all dates",startAt:void 0,dueAt:void 0})],settings:a.groupByStartDate()}},x={args:{tasks:[t({...M.veryLongTitle}),t({title:"Normal task"}),t({...M.veryLongTitle})],settings:a.default()}},U={args:{tasks:[t({...M.manyTags}),t({title:"Normal task with few tags",tags:[{id:"1",name:"work"}]})],settings:a.default()}},v={args:{tasks:[t({...M.unicodeTitle}),t({title:"Regular English task"}),t({title:"另一个中文任务"})],settings:a.default()}},A={args:{...o.args,settings:a.darkMode()},parameters:{backgrounds:{default:"dark"}}},C={args:{...o.args,settings:a.largeFontSize()}},b={args:{...o.args},play:async({canvasElement:i,step:n})=>{const r=F(i);await n("Find backlog header",async()=>{const s=r.getByText(/Backlog \/ Undated/i);l(s).toBeInTheDocument()}),await n("Verify task count badge",async()=>{const s=r.getByText("5");l(s).toBeInTheDocument()}),await n("Click to collapse backlog section",async()=>{const s=r.getByRole("button",{name:/^Collapse backlog/});await O.click(s),await L(400),l(s).toHaveAttribute("aria-expanded","false")}),await n("Click again to expand",async()=>{const s=r.getByRole("button",{name:/^Expand backlog/});await O.click(s),await L(400),l(s).toHaveAttribute("aria-expanded","true")})}},D={args:{tasks:[t({title:"Task to complete",priority:"high"}),t({title:"Task to edit",priority:"medium"})],settings:a.default()},play:async({canvasElement:i,step:n})=>{const r=F(i);await n("Verify tasks are rendered",async()=>{const s=r.getByText("Task to complete"),g=r.getByText("Task to edit");l(s).toBeInTheDocument(),l(g).toBeInTheDocument()})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [],
    settings: settingsBuilder.default()
  }
}`,...m.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Single backlog task"
    })],
    settings: settingsBuilder.default()
  }
}`,...k.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: Array.from({
      length: 20
    }, (_, i) => createUndatedTask({
      title: \`Backlog task \${i + 1}\`
    })),
    settings: settingsBuilder.default()
  }
}`,...T.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...C.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
      const collapseButton = canvas.getByRole("button", {
        name: /^Collapse backlog/
      });
      await userEvent.click(collapseButton);
      await delay(400); // Wait for collapse animation
      expect(collapseButton).toHaveAttribute("aria-expanded", "false");
    });
    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button", {
        name: /^Expand backlog/
      });
      await userEvent.click(expandButton);
      await delay(400); // Wait for expand animation
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
    });
  }
}`,...b.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};const bt=["Default","EmptyBacklog","SingleTask","ManyTasks","AllHighPriority","MixedPriorities","WithCompletedTasks","AllCompleted","WithMissingDueDate","WithMissingStartDate","VeryLongTitles","ManyTags","UnicodeContent","DarkMode","LargeFontSize","ExpandCollapse","TaskInteractions"];export{B as AllCompleted,y as AllHighPriority,A as DarkMode,o as Default,m as EmptyBacklog,b as ExpandCollapse,C as LargeFontSize,U as ManyTags,T as ManyTasks,f as MixedPriorities,k as SingleTask,D as TaskInteractions,v as UnicodeContent,x as VeryLongTitles,h as WithCompletedTasks,S as WithMissingDueDate,w as WithMissingStartDate,bt as __namedExportsOrder,Ct as default};
