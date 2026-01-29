import{j as p}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-z1DTTm3g.js";import{w as m}from"./test-utils-BNouzmjp.js";import{T as te}from"./TaskItem--SWjOhbO.js";import{T as ae,S as se}from"./SettingsContext-jvBEm_-X.js";import{A as ne}from"./AppContext-SqIexfeD.js";import{t as n,D as q}from"./tasks-BV5_RF93.js";import{s as L}from"./settings-BT4PNPAn.js";import{e as r}from"./edge-cases-Dobf_xol.js";import"./preload-helper-PPVm8Dsz.js";import"./index-goBt61iM.js";import"./Icon-Bbsor-py.js";import"./Motion-Chm9l1e6.js";import"./proxy-CgqjUHas.js";import"./DateBadge-CA-Wnnta.js";import"./popover-FbJICPYA.js";import"./index-BrTJYuRl.js";import"./index-Mk_yo6h_.js";import"./calendar-B27TVpNh.js";import"./TagBadge-BQnlqzFb.js";import"./PriorityPopover-hMI_8ccm.js";import"./CategoryPopover-D6ZYOu40.js";import"./index-BsWNO5MQ.js";const{userEvent:c}=__STORYBOOK_MODULE_TEST__,Oe={title:"Core/TaskItem",component:te,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{task:{name:"task",description:"The task data to display",control:{type:"object"}},dateValidation:{name:"dateValidation",description:"Date validation state for showing warnings",control:{type:"object"}}},decorators:[(o,a)=>{const[s,e]=u.useState([]),[i,K]=u.useState(!1),[H,Y]=u.useState(!1),[G,J]=u.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[Q,X]=u.useState({field:"dueAt",direction:"asc",script:""}),Z={tasks:s,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:t=>{e(d=>d.map(l=>l.id===t.id?t:l)),console.log("Update task:",t)},onDeleteTask:t=>{e(d=>d.filter(l=>l.id!==t)),console.log("Delete task:",t)},onAddTask:t=>{const d={id:`task-${Date.now()}`,title:t.title||"New Task",status:"todo",priority:"medium",createdAt:q.now().toISO(),...t};e(l=>[...l,d]),console.log("Add task:",d)},onEditTask:t=>console.log("Edit task:",t),onAICommand:async t=>console.log("AI command:",t),onItemClick:t=>console.log("Item clicked:",t)},ee={settings:a.args.settings||L.default(),updateSettings:t=>console.log("Update settings:",t),isFocusMode:i,toggleFocusMode:()=>K(!i),isAiMode:H,toggleAiMode:()=>Y(!H),filters:G,onFilterChange:J,sort:Q,onSortChange:X,onVoiceError:t=>console.error("Voice error:",t),onOpenSettings:()=>console.log("Open settings")};return p.jsx(ne,{children:p.jsx(ae,{value:Z,children:p.jsx(se,{value:ee,children:p.jsx("div",{className:"p-4 bg-white min-w-80",children:p.jsx(o,{})})})})})}]},g=n.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high"}),k={args:{task:g}},h={args:{task:n.completed({title:"Completed project setup",description:"Successfully set up the component library"})}},y={args:{task:n.highPriority({title:"Urgent: Complete critical bug fix"})}},T={args:{task:n.overdue({title:"Overdue: Submit quarterly report"})}},v={args:{task:n.withFullDescription({title:"Task with comprehensive description"})}},w={args:{task:n.withTags(3,{title:"Task with multiple tags"})}},S={args:{task:r.veryLongTitle}},D={args:{task:r.manyTags}},f={args:{task:r.noTags}},C={args:{task:r.noDescription}},B={args:{task:r.unicodeTitle}},I={args:{task:n.dueToday({title:"Due today: Review pull request"})}},b={args:{task:n.doing({title:"In Progress: Implementing new feature"})}},O={args:{task:n.scheduled({title:"Scheduled: Team planning meeting"})}},E={args:{task:n.cancelled({title:"Cancelled task example"})}},x={args:{task:n.withRecurrence({title:"Recurring: Daily standup"})}},M={args:{task:g,settings:L.darkMode()},parameters:{backgrounds:{default:"dark"}}},A={args:{task:g,settings:L.largeFontSize()}},R={args:{task:g,settings:L.smallFontSize()}},V={args:{task:g},play:async({canvasElement:o,step:a})=>{const s=m(o);await a("Click on task item",async()=>{const e=s.getByText(/Complete project setup/i);await c.click(e)})}},F={args:{task:r.missingStrategyDates,dateValidation:{hasMissingDates:!0,hasInvalidDates:!1}},parameters:{docs:{description:{story:"Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy."}}}},P={args:{task:r.invalidDate,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows the 'Invalid Date' warning badge when dates have invalid format."}}}},W={args:{task:r.multipleInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated)."}}}},j={args:{task:r.mixedValidInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Invalid dates take priority over missing dates - shows 'Invalid Date' badge."}}}},N={args:{task:n.base({title:"Task with all valid dates",dueAt:q.now().plus({days:3}).toISO(),startAt:q.now().toISO()}),dateValidation:void 0},parameters:{docs:{description:{story:"When all dates are valid and present, no warning badge is shown."}}}},$={args:{task:r.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Doing - should auto-populate startAt date."}}},play:async({canvasElement:o,step:a})=>{const s=m(o);await a("Open status popover",async()=>{const e=s.getByRole("button",{name:/Change Status/i});await c.click(e)}),await a("Select Doing status",async()=>{await new Promise(i=>setTimeout(i,300));const e=s.getByText(/^doing$/i);await c.click(e)})}},z={args:{task:r.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Scheduled - should auto-populate startAt date."}}},play:async({canvasElement:o,step:a})=>{const s=m(o);await a("Open status popover",async()=>{const e=s.getByRole("button",{name:/Change Status/i});await c.click(e)}),await a("Select Scheduled status",async()=>{await new Promise(i=>setTimeout(i,300));const e=s.getByText(/^scheduled$/i);await c.click(e)})}},U={args:{task:n.doing({id:"doing-for-done-test",title:"In progress task for completion test"})},parameters:{docs:{description:{story:"Tests status transition to Done - should auto-populate completedAt date."}}},play:async({canvasElement:o,step:a})=>{const s=m(o);await a("Open status popover",async()=>{const e=s.getByRole("button",{name:/Change Status/i});await c.click(e)}),await a("Select Done status",async()=>{await new Promise(i=>setTimeout(i,300));const e=s.getByText(/^done$/i);await c.click(e)})}},_={args:{task:n.doing({id:"doing-for-cancel-test",title:"In progress task for cancellation test"})},parameters:{docs:{description:{story:"Tests status transition to Cancelled - should auto-populate cancelledAt date."}}},play:async({canvasElement:o,step:a})=>{const s=m(o);await a("Open status popover",async()=>{const e=s.getByRole("button",{name:/Change Status/i});await c.click(e)}),await a("Select Cancelled status",async()=>{await new Promise(i=>setTimeout(i,300));const e=s.getByText(/^cancelled$/i);await c.click(e)})}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  }
}`,...k.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library"
    })
  }
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix"
    })
  }
}`,...y.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.overdue({
      title: "Overdue: Submit quarterly report"
    })
  }
}`,...T.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withFullDescription({
      title: "Task with comprehensive description"
    })
  }
}`,...v.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withTags(3, {
      title: "Task with multiple tags"
    })
  }
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.veryLongTitle
  }
}`,...S.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.manyTags
  }
}`,...D.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noTags
  }
}`,...f.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noDescription
  }
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.unicodeTitle
  }
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.dueToday({
      title: "Due today: Review pull request"
    })
  }
}`,...I.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.doing({
      title: "In Progress: Implementing new feature"
    })
  }
}`,...b.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.scheduled({
      title: "Scheduled: Team planning meeting"
    })
  }
}`,...O.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.cancelled({
      title: "Cancelled task example"
    })
  }
}`,...E.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup"
    })
  }
}`,...x.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...M.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.largeFontSize()
  }
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.smallFontSize()
  }
}`,...R.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Click on task item", async () => {
      const taskElement = canvas.getByText(/Complete project setup/i);
      await userEvent.click(taskElement);
    });
  }
}`,...V.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.missingStrategyDates,
    dateValidation: {
      hasMissingDates: true,
      hasInvalidDates: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy."
      }
    }
  }
}`,...F.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.invalidDate,
    dateValidation: {
      hasMissingDates: false,
      hasInvalidDates: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the 'Invalid Date' warning badge when dates have invalid format."
      }
    }
  }
}`,...P.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.multipleInvalidDates,
    dateValidation: {
      hasMissingDates: false,
      hasInvalidDates: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated)."
      }
    }
  }
}`,...W.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.mixedValidInvalidDates,
    dateValidation: {
      hasMissingDates: false,
      hasInvalidDates: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Invalid dates take priority over missing dates - shows 'Invalid Date' badge."
      }
    }
  }
}`,...j.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      title: "Task with all valid dates",
      dueAt: DateTime.now().plus({
        days: 3
      }).toISO()!,
      startAt: DateTime.now().toISO()!
    }),
    dateValidation: undefined
  },
  parameters: {
    docs: {
      description: {
        story: "When all dates are valid and present, no warning badge is shown."
      }
    }
  }
}`,...N.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.todoReadyForTransition
  },
  parameters: {
    docs: {
      description: {
        story: "Tests status transition from Todo to Doing - should auto-populate startAt date."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i
      });
      await userEvent.click(statusButton);
    });
    await step("Select Doing status", async () => {
      // Wait for popover animation
      await new Promise(resolve => setTimeout(resolve, 300));
      const doingOption = canvas.getByText(/^doing$/i);
      await userEvent.click(doingOption);
      // Console will log the update with auto-populated startAt
    });
  }
}`,...$.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.todoReadyForTransition
  },
  parameters: {
    docs: {
      description: {
        story: "Tests status transition from Todo to Scheduled - should auto-populate startAt date."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i
      });
      await userEvent.click(statusButton);
    });
    await step("Select Scheduled status", async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const scheduledOption = canvas.getByText(/^scheduled$/i);
      await userEvent.click(scheduledOption);
    });
  }
}`,...z.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.doing({
      id: "doing-for-done-test",
      title: "In progress task for completion test"
    })
  },
  parameters: {
    docs: {
      description: {
        story: "Tests status transition to Done - should auto-populate completedAt date."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i
      });
      await userEvent.click(statusButton);
    });
    await step("Select Done status", async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const doneOption = canvas.getByText(/^done$/i);
      await userEvent.click(doneOption);
    });
  }
}`,...U.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.doing({
      id: "doing-for-cancel-test",
      title: "In progress task for cancellation test"
    })
  },
  parameters: {
    docs: {
      description: {
        story: "Tests status transition to Cancelled - should auto-populate cancelledAt date."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i
      });
      await userEvent.click(statusButton);
    });
    await step("Select Cancelled status", async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cancelledOption = canvas.getByText(/^cancelled$/i);
      await userEvent.click(cancelledOption);
    });
  }
}`,..._.parameters?.docs?.source}}};const Ee=["Default","Completed","HighPriority","Overdue","WithDescription","WithTags","VeryLongTitle","ManyTags","NoTags","NoDescription","UnicodeTitle","DueToday","Doing","Scheduled","Cancelled","WithRecurrence","DarkMode","LargeFontSize","SmallFontSize","ItemClickInteraction","MissingDatesWarning","InvalidDateWarning","MultipleInvalidDates","MixedDateValidation","NoDatesNoWarning","StatusTransitionToDoing","StatusTransitionToScheduled","StatusTransitionToDone","StatusTransitionToCancelled"];export{E as Cancelled,h as Completed,M as DarkMode,k as Default,b as Doing,I as DueToday,y as HighPriority,P as InvalidDateWarning,V as ItemClickInteraction,A as LargeFontSize,D as ManyTags,F as MissingDatesWarning,j as MixedDateValidation,W as MultipleInvalidDates,N as NoDatesNoWarning,C as NoDescription,f as NoTags,T as Overdue,O as Scheduled,R as SmallFontSize,_ as StatusTransitionToCancelled,$ as StatusTransitionToDoing,U as StatusTransitionToDone,z as StatusTransitionToScheduled,B as UnicodeTitle,S as VeryLongTitle,v as WithDescription,x as WithRecurrence,w as WithTags,Ee as __namedExportsOrder,Oe as default};
