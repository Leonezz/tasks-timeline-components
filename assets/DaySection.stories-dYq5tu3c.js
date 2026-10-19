import{j as m}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-C21N2aj2.js";import{D as q}from"./DaySection-t1zvpuwx.js";import{T as V,S as H}from"./SettingsContext-CD1KsnZl.js";import{D as E}from"./recurrence-B2fS74Tu.js";import{s as M}from"./settings-GESQiD84.js";import{t as a}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{d as C}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";const{expect:B,fn:L,userEvent:x,within:D}=__STORYBOOK_MODULE_TEST__,Bt={title:"Sections/DaySection",component:q,tags:["autodocs"],args:{lazy:!1},parameters:{layout:"fullscreen"},decorators:[(d,s)=>{const[p,o]=u.useState([]),[l,W]=u.useState(!1),[b,R]=u.useState(s.args.isAiMode||!1),[P,U]=u.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[G,F]=u.useState({field:"dueAt",direction:"asc",script:""}),j={tasks:p,availableCategories:s.args.availableCategories||["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:t=>{o(n=>n.map(i=>i.id===t.id?t:i)),s.args.onUpdateTask?.(t),console.log("Update task:",t)},onDeleteTask:t=>{o(n=>n.filter(i=>i.id!==t)),console.log("Delete task:",t)},onAddTask:t=>{const n={id:`task-${Date.now()}`,title:t.title||"New Task",status:"todo",priority:"medium",createdAt:E.now().toISO(),...t};o(i=>[...i,n]),console.log("Add task:",n)},onEditTask:t=>console.log("Edit task:",t),onAICommand:async t=>console.log("AI command:",t)},_={settings:s.args.settings||M.default(),updateSettings:t=>console.log("Update settings:",t),isFocusMode:l,toggleFocusMode:()=>W(!l),isAiMode:b,toggleAiMode:()=>R(!b),filters:P,onFilterChange:U,sort:G,onSortChange:F,onVoiceError:t=>console.error("Voice error:",t),onOpenSettings:()=>console.log("Open settings")};return m.jsx(V,{value:j,children:m.jsx(H,{value:_,children:m.jsx("div",{className:"p-4",children:m.jsx(d,{})})})})}]},e=E.now(),c=[a.base({id:"1",title:"Review pull requests",description:"Check and approve pending PRs",status:"todo",priority:"high",dueAt:e.toISO(),category:"Work",tags:[{id:"1",name:"work"}]}),a.base({id:"2",title:"Update documentation",status:"todo",priority:"medium",dueAt:e.toISO(),category:"Work",tags:[{id:"2",name:"docs"}]}),a.base({id:"3",title:"Deploy to production",status:"scheduled",priority:"high",dueAt:e.toISO(),category:"Work",tags:[{id:"3",name:"deploy"}]})],r={date:e.toISO().split("T")[0],tasks:c},g={args:{group:r}},k={args:{group:{...r,tasks:c.slice(0,1)}}},y={args:{group:{...r,tasks:a.many(12,{dueAt:e.toISO()})}}},S={args:{group:{date:e.toISO().split("T")[0],tasks:[]}}},T={args:{group:{date:e.set({weekday:6}).toISO().split("T")[0],tasks:c}}},O={args:{group:{date:e.toISO().split("T")[0],tasks:[...c,a.completed({title:"Completed task 1",dueAt:e.toISO()}),a.completed({title:"Completed task 2",dueAt:e.toISO()})]}}},h={args:{group:{date:e.toISO().split("T")[0],tasks:[a.overdue({title:"Overdue task 1",dueAt:e.toISO()}),a.overdue({title:"Overdue task 2",dueAt:e.toISO()}),...c]}}},v={args:{group:{date:e.toISO().split("T")[0],tasks:[a.highPriority({title:"High priority task",dueAt:e.toISO()}),a.mediumPriority({title:"Medium priority task",dueAt:e.toISO()}),a.lowPriority({title:"Low priority task",dueAt:e.toISO()})]}}},I={args:{group:r,settings:M.darkMode()},parameters:{backgrounds:{default:"dark"}}},w={args:{group:r,settings:M.withAI(),isAiMode:!0}},A={args:{group:r},play:async({canvasElement:d,step:s})=>{const p=D(d);await s("Find inline add task input",async()=>{const o=p.queryAllByRole("button",{name:/add/i});B(o.length).toBeGreaterThan(0)})}},f={args:{group:r,onUpdateTask:L()},play:async({args:d,canvasElement:s,step:p})=>{const o=D(s),l=D(s.ownerDocument.body);await p("Mark task done from its status menu",async()=>{await x.click(o.getByRole("button",{name:/^Change status for Review pull requests/})),await C(300),await x.click(l.getByRole("button",{name:"Set Review pull requests status to done"})),await C(100),B(d.onUpdateTask).toHaveBeenCalledWith(B.objectContaining({id:"1",status:"done"}))})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup
  }
}`,...g.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      ...mockDayGroup,
      tasks: mockTasks.slice(0, 1)
    }
  }
}`,...k.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      ...mockDayGroup,
      tasks: taskBuilder.many(12, {
        dueAt: today.toISO()!
      })
    }
  }
}`,...y.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: []
    }
  }
}`,...S.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.set({
        weekday: 6
      }).toISO()!.split("T")[0],
      // Saturday
      tasks: mockTasks
    }
  }
}`,...T.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [...mockTasks, taskBuilder.completed({
        title: "Completed task 1",
        dueAt: today.toISO()!
      }), taskBuilder.completed({
        title: "Completed task 2",
        dueAt: today.toISO()!
      })]
    }
  }
}`,...O.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [taskBuilder.overdue({
        title: "Overdue task 1",
        dueAt: today.toISO()!
      }), taskBuilder.overdue({
        title: "Overdue task 2",
        dueAt: today.toISO()!
      }), ...mockTasks]
    }
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [taskBuilder.highPriority({
        title: "High priority task",
        dueAt: today.toISO()!
      }), taskBuilder.mediumPriority({
        title: "Medium priority task",
        dueAt: today.toISO()!
      }), taskBuilder.lowPriority({
        title: "Low priority task",
        dueAt: today.toISO()!
      })]
    }
  }
}`,...v.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...I.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.withAI(),
    isAiMode: true
  }
}`,...w.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find inline add task input", async () => {
      // DaySection has an inline add task input in each day
      const addButtons = canvas.queryAllByRole("button", {
        name: /add/i
      });
      // Verify at least one add button exists
      expect(addButtons.length).toBeGreaterThan(0);
    });
  }
}`,...A.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup,
    onUpdateTask: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);
    await step("Mark task done from its status menu", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /^Change status for Review pull requests/
      }));
      await delay(300);
      await userEvent.click(page.getByRole("button", {
        name: "Set Review pull requests status to done"
      }));
      await delay(100);
      expect(args.onUpdateTask).toHaveBeenCalledWith(expect.objectContaining({
        id: "1",
        status: "done"
      }));
    });
  }
}`,...f.parameters?.docs?.source}}};const Dt=["Default","WithFewTasks","WithManyTasks","Empty","Weekend","WithCompletedTasks","WithOverdueTasks","MixedPriorities","DarkMode","AIMode","AddTaskInline","UpdateTaskStatus"];export{w as AIMode,A as AddTaskInline,I as DarkMode,g as Default,S as Empty,v as MixedPriorities,f as UpdateTaskStatus,T as Weekend,O as WithCompletedTasks,k as WithFewTasks,y as WithManyTasks,h as WithOverdueTasks,Dt as __namedExportsOrder,Bt as default};
