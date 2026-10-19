import{j as d}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-C21N2aj2.js";import{B as P}from"./BacklogSection-DVWonrCe.js";import{T as $,S as ee,u as te}from"./SettingsContext-CD1KsnZl.js";import{s as i}from"./settings-GESQiD84.js";import{t as ae}from"./tasks-CE8nCgSO.js";import{e as N}from"./edge-cases-DWLiX98P.js";import{D as q}from"./recurrence-B2fS74Tu.js";import{d as V}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./tslib.es6-C44cpxNM.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";const{expect:o,userEvent:c,waitFor:j,within:f}=__STORYBOOK_MODULE_TEST__,je={title:"Sections/BacklogSection",component:P,tags:["autodocs"],args:{lazy:!1,defaultOpen:!0},parameters:{layout:"fullscreen"},decorators:[(n,a)=>{const t=a.args,[s,g]=u.useState(t.tasks||[]),[l,T]=u.useState(!1),[m,_]=u.useState(!1),[z,Y]=u.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[J,Q]=u.useState({field:"dueAt",direction:"asc",script:""}),X={tasks:s,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:r=>{g(k=>k.map(y=>y.id===r.id?r:y)),console.log("Update task:",r)},onDeleteTask:r=>{g(k=>k.filter(y=>y.id!==r)),console.log("Delete task:",r)},onAddTask:r=>{const k={id:`task-${Date.now()}`,title:r.title||"New Task",status:"todo",priority:"medium",createdAt:q.now().toISO(),...r};g(y=>[...y,k]),console.log("Add task:",k)},onEditTask:r=>console.log("Edit task:",r),onAICommand:async r=>console.log("AI command:",r)},Z={settings:a.args.settings||i.default(),updateSettings:r=>console.log("Update settings:",r),isFocusMode:l,toggleFocusMode:()=>T(!l),isAiMode:m,toggleAiMode:()=>_(!m),filters:z,onFilterChange:Y,sort:J,onSortChange:Q,onVoiceError:r=>console.error("Voice error:",r),onOpenSettings:()=>console.log("Open settings")};return d.jsx($,{value:X,children:d.jsx(ee,{value:Z,children:d.jsx("div",{className:"p-4",children:d.jsx(n,{})})})})}]},e=n=>ae.base({dueAt:void 0,startAt:void 0,createdAt:void 0,completedAt:void 0,...n}),p={args:{tasks:[e({title:"Research new framework",priority:"medium"}),e({title:"Update dependencies",priority:"low"}),e({title:"Write blog post",priority:"medium"}),e({title:"Refactor auth module",priority:"high"}),e({title:"Review security guidelines",priority:"medium"})],settings:i.default()}},B={args:{tasks:[],settings:i.default()}},v={args:{tasks:[e({title:"Single backlog task"})],settings:i.default()}},x={args:{tasks:Array.from({length:20},(n,a)=>e({title:`Backlog task ${a+1}`})),settings:i.default()}},S={args:{tasks:[e({title:"Critical bug fix",priority:"high"}),e({title:"Security patch",priority:"high"}),e({title:"Performance issue",priority:"high"})],settings:i.default()}},b={args:{tasks:[e({title:"High priority task",priority:"high"}),e({title:"High priority task 2",priority:"high"}),e({title:"Medium priority task",priority:"medium"}),e({title:"Medium priority task 2",priority:"medium"}),e({title:"Low priority task",priority:"low"}),e({title:"Low priority task 2",priority:"low"})],settings:i.default()}},E={args:{tasks:[e({title:"Todo task 1",status:"todo"}),e({title:"Completed task 1",status:"done"}),e({title:"Todo task 2",status:"todo"}),e({title:"Completed task 2",status:"done"})],settings:i.default()}},C={args:{tasks:[e({title:"Completed task 1",status:"done"}),e({title:"Completed task 2",status:"done"}),e({title:"Completed task 3",status:"done"})],settings:i.default()}},U={args:{tasks:[e({title:"Task missing due date",dueAt:void 0,startAt:q.now().toISO()}),e({title:"Task missing all dates",dueAt:void 0,startAt:void 0})],settings:i.default()}},A={args:{tasks:[e({title:"Task missing start date",startAt:void 0,dueAt:q.now().toISO()}),e({title:"Task missing all dates",startAt:void 0,dueAt:void 0})],settings:i.groupByStartDate()}},R={args:{tasks:[e({...N.veryLongTitle}),e({title:"Normal task"}),e({...N.veryLongTitle})],settings:i.default()}},D={args:{tasks:[e({...N.manyTags}),e({title:"Normal task with few tags",tags:[{id:"1",name:"work"}]})],settings:i.default()}},I={args:{tasks:[e({...N.unicodeTitle}),e({title:"Regular English task"}),e({title:"另一个中文任务"})],settings:i.default()}},M={args:{...p.args,settings:i.darkMode()},parameters:{backgrounds:{default:"dark"}}},H={args:{...p.args,settings:i.largeFontSize()}},O={args:{...p.args,defaultOpen:!1},play:async({canvasElement:n,step:a})=>{const t=f(n);await a("Find backlog header",async()=>{const s=t.getByText(/Backlog \/ Undated/i);o(s).toBeInTheDocument()}),await a("Verify task count badge",async()=>{const s=t.getByText("5");o(s).toBeInTheDocument()}),await a("Starts collapsed, with no rows mounted",async()=>{const s=t.getByRole("button",{name:/^Expand backlog/});o(s).toHaveAttribute("aria-expanded","false"),o(t.queryByText("Research new framework")).toBeNull()}),await a("Click to expand",async()=>{const s=t.getByRole("button",{name:/^Expand backlog/});await c.click(s),await V(400),o(s).toHaveAttribute("aria-expanded","true"),o(t.getByText("Research new framework")).toBeInTheDocument()}),await a("Click again to collapse",async()=>{const s=t.getByRole("button",{name:/^Collapse backlog/});await c.click(s),await V(400),o(s).toHaveAttribute("aria-expanded","false"),o(t.queryByText("Research new framework")).toBeNull()})}},se=({tasks:n})=>{const[a,t]=u.useState(!1),[s,g]=u.useState(!0);return d.jsxs("div",{children:[d.jsx("button",{type:"button",onClick:()=>g(l=>!l),children:"Toggle section"}),s&&d.jsx(P,{tasks:n,lazy:!1,open:a,onOpenChange:t})]})},L={args:{...p.args},render:n=>d.jsx(se,{tasks:n.tasks}),play:async({canvasElement:n,step:a})=>{const t=f(n);await a("Expand, unmount and remount: stays expanded",async()=>{await c.click(t.getByRole("button",{name:/^Expand backlog/})),await c.click(t.getByRole("button",{name:"Toggle section"})),o(t.queryByRole("button",{name:/backlog/})).toBeNull(),await c.click(t.getByRole("button",{name:"Toggle section"})),o(t.getByRole("button",{name:/^Collapse backlog/})).toHaveAttribute("aria-expanded","true")}),await a("Collapse, unmount and remount: stays collapsed",async()=>{await c.click(t.getByRole("button",{name:/^Collapse backlog/})),await c.click(t.getByRole("button",{name:"Toggle section"})),await c.click(t.getByRole("button",{name:"Toggle section"})),o(t.getByRole("button",{name:/^Expand backlog/})).toHaveAttribute("aria-expanded","false")})}},F={args:{tasks:[e({title:"Task to complete",priority:"high"}),e({title:"Task to edit",priority:"medium"})],settings:i.default()},play:async({canvasElement:n,step:a})=>{const t=f(n);await a("Verify tasks are rendered",async()=>{const s=t.getByText("Task to complete"),g=t.getByText("Task to edit");o(s).toBeInTheDocument(),o(g).toBeInTheDocument()})}},W="backlog-story:remove-task",ne=Array.from({length:30},(n,a)=>e({id:`r${a}`,title:`Undated ${a+1}`})),K=({lazy:n})=>{const a=te(),[t,s]=u.useState(ne);u.useEffect(()=>{const l=T=>{const m=T.detail;s(_=>_.filter(z=>z.id!==m))};return window.addEventListener(W,l),()=>window.removeEventListener(W,l)},[]);const g=u.useMemo(()=>({...a,tasks:t,onUpdateTask:l=>s(T=>T.map(m=>m.id===l.id?l:m))}),[a,t]);return d.jsx($,{value:g,children:d.jsx(P,{tasks:t,lazy:n,defaultOpen:!0})})},G=async n=>{const a=f(n),t=await j(()=>a.getByRole("button",{name:"Edit Undated 26"}),{timeout:3e3});await c.click(t);const s=a.getByRole("textbox",{name:"Edit title for Undated 26"});await c.type(s," EDITED"),o(s).toHaveFocus(),window.dispatchEvent(new CustomEvent(W,{detail:"r0"})),await j(()=>o(a.queryByRole("button",{name:"Edit task title: Undated 1"})).toBeNull()),await V(400),o(s.isConnected).toBe(!0),o(s).toHaveValue("Undated 26 EDITED"),o(s).toHaveFocus(),await c.keyboard("{Enter}"),await j(()=>o(a.getByRole("button",{name:"Edit task title: Undated 26 EDITED"})).toBeInTheDocument())},h={args:{tasks:[]},render:()=>d.jsx(K,{lazy:!1}),play:async({canvasElement:n})=>G(n)},w={args:{tasks:[]},render:()=>d.jsx(K,{lazy:!0}),play:async({canvasElement:n})=>{await j(()=>o(f(n).getByRole("button",{name:/^Collapse backlog/})).toBeInTheDocument()),window.scrollTo(0,document.documentElement.scrollHeight),await G(n)}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [],
    settings: settingsBuilder.default()
  }
}`,...B.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: [createUndatedTask({
      title: "Single backlog task"
    })],
    settings: settingsBuilder.default()
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: Array.from({
      length: 20
    }, (_, i) => createUndatedTask({
      title: \`Backlog task \${i + 1}\`
    })),
    settings: settingsBuilder.default()
  }
}`,...x.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...M.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize()
  }
}`,...H.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    defaultOpen: false
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
    await step("Starts collapsed, with no rows mounted", async () => {
      const expandButton = canvas.getByRole("button", {
        name: /^Expand backlog/
      });
      expect(expandButton).toHaveAttribute("aria-expanded", "false");
      expect(canvas.queryByText("Research new framework")).toBeNull();
    });
    await step("Click to expand", async () => {
      const expandButton = canvas.getByRole("button", {
        name: /^Expand backlog/
      });
      await userEvent.click(expandButton);
      await delay(400); // Wait for expand animation
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      expect(canvas.getByText("Research new framework")).toBeInTheDocument();
    });
    await step("Click again to collapse", async () => {
      const collapseButton = canvas.getByRole("button", {
        name: /^Collapse backlog/
      });
      await userEvent.click(collapseButton);
      await delay(400); // Wait for collapse animation
      expect(collapseButton).toHaveAttribute("aria-expanded", "false");
      expect(canvas.queryByText("Research new framework")).toBeNull();
    });
  }
}`,...O.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  render: args => <ControlledBacklog tasks={args.tasks} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Expand, unmount and remount: stays expanded", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /^Expand backlog/
      }));
      await userEvent.click(canvas.getByRole("button", {
        name: "Toggle section"
      }));
      expect(canvas.queryByRole("button", {
        name: /backlog/
      })).toBeNull();
      await userEvent.click(canvas.getByRole("button", {
        name: "Toggle section"
      }));
      expect(canvas.getByRole("button", {
        name: /^Collapse backlog/
      })).toHaveAttribute("aria-expanded", "true");
    });
    await step("Collapse, unmount and remount: stays collapsed", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /^Collapse backlog/
      }));
      await userEvent.click(canvas.getByRole("button", {
        name: "Toggle section"
      }));
      await userEvent.click(canvas.getByRole("button", {
        name: "Toggle section"
      }));
      expect(canvas.getByRole("button", {
        name: /^Expand backlog/
      })).toHaveAttribute("aria-expanded", "false");
    });
  }
}`,...L.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: []
  },
  render: () => <ShiftingBacklog lazy={false} />,
  play: async ({
    canvasElement
  }) => expectEditSurvivesShift(canvasElement)
}`,...h.parameters?.docs?.source},description:{story:`An inline title edit survives a row moving into another chunk of 25 (here
a task above it disappears while the user is typing).`,...h.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: []
  },
  render: () => <ShiftingBacklog lazy />,
  play: async ({
    canvasElement
  }) => {
    // Bring the end of the list into view so the second chunk mounts
    await waitFor(() => expect(within(canvasElement).getByRole("button", {
      name: /^Collapse backlog/
    })).toBeInTheDocument());
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expectEditSurvivesShift(canvasElement);
  }
}`,...w.parameters?.docs?.source},description:{story:"The same with lazy chunks, as the timeline renders the backlog.",...w.parameters?.docs?.description}}};const Ne=["Default","EmptyBacklog","SingleTask","ManyTasks","AllHighPriority","MixedPriorities","WithCompletedTasks","AllCompleted","WithMissingDueDate","WithMissingStartDate","VeryLongTitles","ManyTags","UnicodeContent","DarkMode","LargeFontSize","ExpandCollapse","ControlledOpenState","TaskInteractions","EditSurvivesChunkShift","EditSurvivesChunkShiftLazy"];export{C as AllCompleted,S as AllHighPriority,L as ControlledOpenState,M as DarkMode,p as Default,h as EditSurvivesChunkShift,w as EditSurvivesChunkShiftLazy,B as EmptyBacklog,O as ExpandCollapse,H as LargeFontSize,D as ManyTags,x as ManyTasks,b as MixedPriorities,v as SingleTask,F as TaskInteractions,I as UnicodeContent,R as VeryLongTitles,E as WithCompletedTasks,U as WithMissingDueDate,A as WithMissingStartDate,Ne as __namedExportsOrder,je as default};
