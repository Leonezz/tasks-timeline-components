import{j as l}from"./jsx-runtime-u17CrQMm.js";import{r as p}from"./iframe-MqrkKuKk.js";import{D as _}from"./DaySection-CFLVzADt.js";import{T as U,S as j}from"./SettingsContext-jASy5Yni.js";import{D as B}from"./datetime-CoIMkCUY.js";import{s as f}from"./settings-D_uM_jh7.js";import{t as s}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{d as V}from"./test-utils-BNouzmjp.js";import"./preload-helper-PPVm8Dsz.js";import"./TaskItem-D3AwZpwj.js";import"./index-goBt61iM.js";import"./Icon-vyFwuaK4.js";import"./chevron-right-ByMWbQtw.js";import"./Motion-BeGSOOVP.js";import"./proxy-BsFmiW0h.js";import"./DateBadge-J6cUNxmw.js";import"./popover-CQz9xRHp.js";import"./index-0RUQiWIL.js";import"./index-BD2EFwuE.js";import"./calendar-DKwpadDL.js";import"./TagBadge-DBuU23h0.js";import"./PriorityPopover-B2WTDur4.js";import"./CategoryPopover-YClKO7Wx.js";import"./useVoiceInput-BmHy1fzw.js";import"./logger-CDMKXnH4.js";import"./collapsible-IthRL6dN.js";import"./index-CD4A-hWf.js";const{expect:q,userEvent:L,within:M}=__STORYBOOK_MODULE_TEST__,ht={title:"Sections/DaySection",component:_,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(d,o)=>{const[c,a]=p.useState([]),[D,b]=p.useState(!1),[x,C]=p.useState(o.args.isAiMode||!1),[E,W]=p.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[P,G]=p.useState({field:"dueAt",direction:"asc",script:""}),F={tasks:c,availableCategories:o.args.availableCategories||["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:t=>{a(n=>n.map(i=>i.id===t.id?t:i)),console.log("Update task:",t)},onDeleteTask:t=>{a(n=>n.filter(i=>i.id!==t)),console.log("Delete task:",t)},onAddTask:t=>{const n={id:`task-${Date.now()}`,title:t.title||"New Task",status:"todo",priority:"medium",createdAt:B.now().toISO(),...t};a(i=>[...i,n]),console.log("Add task:",n)},onEditTask:t=>console.log("Edit task:",t),onAICommand:async t=>console.log("AI command:",t)},R={settings:o.args.settings||f.default(),updateSettings:t=>console.log("Update settings:",t),isFocusMode:D,toggleFocusMode:()=>b(!D),isAiMode:x,toggleAiMode:()=>C(!x),filters:E,onFilterChange:W,sort:P,onSortChange:G,onVoiceError:t=>console.error("Voice error:",t),onOpenSettings:()=>console.log("Open settings")};return l.jsx(U,{value:F,children:l.jsx(j,{value:R,children:l.jsx("div",{className:"p-4",children:l.jsx(d,{})})})})}]},e=B.now(),u=[s.base({id:"1",title:"Review pull requests",description:"Check and approve pending PRs",status:"todo",priority:"high",dueAt:e.toISO(),category:"Work",tags:[{id:"1",name:"work"}]}),s.base({id:"2",title:"Update documentation",status:"todo",priority:"medium",dueAt:e.toISO(),category:"Work",tags:[{id:"2",name:"docs"}]}),s.base({id:"3",title:"Deploy to production",status:"scheduled",priority:"high",dueAt:e.toISO(),category:"Work",tags:[{id:"3",name:"deploy"}]})],r={date:e.toISO().split("T")[0],tasks:u},m={args:{group:r}},g={args:{group:{...r,tasks:u.slice(0,1)}}},k={args:{group:{...r,tasks:s.many(12,{dueAt:e.toISO()})}}},y={args:{group:{date:e.toISO().split("T")[0],tasks:[]}}},S={args:{group:{date:e.set({weekday:6}).toISO().split("T")[0],tasks:u}}},h={args:{group:{date:e.toISO().split("T")[0],tasks:[...u,s.completed({title:"Completed task 1",dueAt:e.toISO()}),s.completed({title:"Completed task 2",dueAt:e.toISO()})]}}},O={args:{group:{date:e.toISO().split("T")[0],tasks:[s.overdue({title:"Overdue task 1",dueAt:e.toISO()}),s.overdue({title:"Overdue task 2",dueAt:e.toISO()}),...u]}}},T={args:{group:{date:e.toISO().split("T")[0],tasks:[s.highPriority({title:"High priority task",dueAt:e.toISO()}),s.mediumPriority({title:"Medium priority task",dueAt:e.toISO()}),s.lowPriority({title:"Low priority task",dueAt:e.toISO()})]}}},A={args:{group:r,settings:f.darkMode()},parameters:{backgrounds:{default:"dark"}}},I={args:{group:r,settings:f.withAI(),isAiMode:!0}},v={args:{group:r},play:async({canvasElement:d,step:o})=>{const c=M(d);await o("Find inline add task input",async()=>{const a=c.queryAllByRole("button",{name:/add/i});q(a.length).toBeGreaterThan(0)})}},w={args:{group:r},play:async({canvasElement:d,step:o})=>{const c=M(d);await o("Click task checkbox to complete",async()=>{const a=c.getAllByRole("checkbox");a.length>0&&(await L.click(a[0]),await V(100))})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup
  }
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      ...mockDayGroup,
      tasks: mockTasks.slice(0, 1)
    }
  }
}`,...g.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      ...mockDayGroup,
      tasks: taskBuilder.many(12, {
        dueAt: today.toISO()!
      })
    }
  }
}`,...k.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: []
    }
  }
}`,...y.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      date: today.set({
        weekday: 6
      }).toISO()!.split("T")[0],
      // Saturday
      tasks: mockTasks
    }
  }
}`,...S.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...A.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.withAI(),
    isAiMode: true
  }
}`,...I.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    group: mockDayGroup
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Click task checkbox to complete", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        await userEvent.click(checkboxes[0]);
        await delay(100);
      }
    });
  }
}`,...w.parameters?.docs?.source}}};const Ot=["Default","WithFewTasks","WithManyTasks","Empty","Weekend","WithCompletedTasks","WithOverdueTasks","MixedPriorities","DarkMode","AIMode","AddTaskInline","UpdateTaskStatus"];export{I as AIMode,v as AddTaskInline,A as DarkMode,m as Default,y as Empty,T as MixedPriorities,w as UpdateTaskStatus,S as Weekend,h as WithCompletedTasks,g as WithFewTasks,k as WithManyTasks,O as WithOverdueTasks,Ot as __namedExportsOrder,ht as default};
