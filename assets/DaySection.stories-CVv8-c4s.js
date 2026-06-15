import{j as l}from"./jsx-runtime-u17CrQMm.js";import{r as p}from"./iframe-CIjpM8u1.js";import{D as _}from"./DaySection-BNmh-hNf.js";import{T as U,S as j}from"./SettingsContext-VftslVHB.js";import{D as B}from"./datetime-CoIMkCUY.js";import{s as x}from"./settings-GESQiD84.js";import{t as s}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{d as V}from"./test-utils-BNouzmjp.js";import"./preload-helper-PPVm8Dsz.js";import"./TaskItem-yv0v8l3i.js";import"./rruleset-Bu4wjl4G.js";import"./Icon-CqmLOYJv.js";import"./chevron-right-Dkzu5Za9.js";import"./Motion-B3aeriiO.js";import"./proxy-El9xXo_1.js";import"./DateBadge-L0CLCNf0.js";import"./popover-DLQbXnaj.js";import"./index-BnKTyCDE.js";import"./index-DpuRrbSZ.js";import"./calendar-Cw6AfvCS.js";import"./TagBadge-qiMPtCwi.js";import"./PriorityPopover-B2TZK4Zf.js";import"./CategoryPopover-BLqHtmCp.js";import"./useVoiceInput-pMPrYV0S.js";import"./logger-CDMKXnH4.js";import"./collapsible-BaS8-hJE.js";const{expect:q,userEvent:L,within:M}=__STORYBOOK_MODULE_TEST__,Se={title:"Sections/DaySection",component:_,tags:["autodocs"],args:{lazy:!1},parameters:{layout:"fullscreen"},decorators:[(d,o)=>{const[c,a]=p.useState([]),[f,b]=p.useState(!1),[D,C]=p.useState(o.args.isAiMode||!1),[E,W]=p.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[P,G]=p.useState({field:"dueAt",direction:"asc",script:""}),F={tasks:c,availableCategories:o.args.availableCategories||["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:e=>{a(n=>n.map(i=>i.id===e.id?e:i)),console.log("Update task:",e)},onDeleteTask:e=>{a(n=>n.filter(i=>i.id!==e)),console.log("Delete task:",e)},onAddTask:e=>{const n={id:`task-${Date.now()}`,title:e.title||"New Task",status:"todo",priority:"medium",createdAt:B.now().toISO(),...e};a(i=>[...i,n]),console.log("Add task:",n)},onEditTask:e=>console.log("Edit task:",e),onAICommand:async e=>console.log("AI command:",e)},R={settings:o.args.settings||x.default(),updateSettings:e=>console.log("Update settings:",e),isFocusMode:f,toggleFocusMode:()=>b(!f),isAiMode:D,toggleAiMode:()=>C(!D),filters:E,onFilterChange:W,sort:P,onSortChange:G,onVoiceError:e=>console.error("Voice error:",e),onOpenSettings:()=>console.log("Open settings")};return l.jsx(U,{value:F,children:l.jsx(j,{value:R,children:l.jsx("div",{className:"p-4",children:l.jsx(d,{})})})})}]},t=B.now(),u=[s.base({id:"1",title:"Review pull requests",description:"Check and approve pending PRs",status:"todo",priority:"high",dueAt:t.toISO(),category:"Work",tags:[{id:"1",name:"work"}]}),s.base({id:"2",title:"Update documentation",status:"todo",priority:"medium",dueAt:t.toISO(),category:"Work",tags:[{id:"2",name:"docs"}]}),s.base({id:"3",title:"Deploy to production",status:"scheduled",priority:"high",dueAt:t.toISO(),category:"Work",tags:[{id:"3",name:"deploy"}]})],r={date:t.toISO().split("T")[0],tasks:u},m={args:{group:r}},g={args:{group:{...r,tasks:u.slice(0,1)}}},k={args:{group:{...r,tasks:s.many(12,{dueAt:t.toISO()})}}},y={args:{group:{date:t.toISO().split("T")[0],tasks:[]}}},S={args:{group:{date:t.set({weekday:6}).toISO().split("T")[0],tasks:u}}},h={args:{group:{date:t.toISO().split("T")[0],tasks:[...u,s.completed({title:"Completed task 1",dueAt:t.toISO()}),s.completed({title:"Completed task 2",dueAt:t.toISO()})]}}},O={args:{group:{date:t.toISO().split("T")[0],tasks:[s.overdue({title:"Overdue task 1",dueAt:t.toISO()}),s.overdue({title:"Overdue task 2",dueAt:t.toISO()}),...u]}}},T={args:{group:{date:t.toISO().split("T")[0],tasks:[s.highPriority({title:"High priority task",dueAt:t.toISO()}),s.mediumPriority({title:"Medium priority task",dueAt:t.toISO()}),s.lowPriority({title:"Low priority task",dueAt:t.toISO()})]}}},A={args:{group:r,settings:x.darkMode()},parameters:{backgrounds:{default:"dark"}}},I={args:{group:r,settings:x.withAI(),isAiMode:!0}},v={args:{group:r},play:async({canvasElement:d,step:o})=>{const c=M(d);await o("Find inline add task input",async()=>{const a=c.queryAllByRole("button",{name:/add/i});q(a.length).toBeGreaterThan(0)})}},w={args:{group:r},play:async({canvasElement:d,step:o})=>{const c=M(d);await o("Click task checkbox to complete",async()=>{const a=c.getAllByRole("checkbox");a.length>0&&(await L.click(a[0]),await V(100))})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};const he=["Default","WithFewTasks","WithManyTasks","Empty","Weekend","WithCompletedTasks","WithOverdueTasks","MixedPriorities","DarkMode","AIMode","AddTaskInline","UpdateTaskStatus"];export{I as AIMode,v as AddTaskInline,A as DarkMode,m as Default,y as Empty,T as MixedPriorities,w as UpdateTaskStatus,S as Weekend,h as WithCompletedTasks,g as WithFewTasks,k as WithManyTasks,O as WithOverdueTasks,he as __namedExportsOrder,Se as default};
