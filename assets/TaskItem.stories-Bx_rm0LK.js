import{j as p}from"./jsx-runtime-u17CrQMm.js";import{R as le,r as k}from"./iframe-DZazhMmd.js";import{w as d,d as u,e as de}from"./test-utils-BjL_0stX.js";import{T as pe}from"./TaskItem-DW6lxZCQ.js";import{T as ue,S as Se,u as fe}from"./SettingsContext-CjSrKuve.js";import{A as De}from"./AppContext-SrkG8hzT.js";import{D as re}from"./recurrence-Co3oC643.js";import{s as oe}from"./settings-GESQiD84.js";import{t as r}from"./tasks-CcRg1J09.js";import{e as l}from"./edge-cases-DMAB-FsE.js";import"./preload-helper-PPVm8Dsz.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-g5MVMxEO.js";import"./chevron-right-Cri6jyFi.js";import"./calendar-Cmr1cyWC.js";import"./circle-DDRLbMmN.js";import"./chevron-left-BLaTK1Ra.js";import"./Motion-Ba_Df5rY.js";import"./proxy-CgUC1axK.js";import"./date-badge-tones-CqR66kco.js";import"./popover-Dj8_k19a.js";import"./Combination-BgwXw_pz.js";import"./usePortalContainer-BjvVFpRl.js";import"./index-ChRTMkvB.js";import"./index-BvO_gj8L.js";import"./calendar-bQeqPaKd.js";import"./button-Bgl0Jb_g.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-F6rb5FkA.js";import"./PriorityPopover-CFkSyZqx.js";import"./CategoryPopover-Sjb1CCU2.js";import"./MarkdownText-Bez6-UJU.js";import"./index-DrBVBWl1.js";const{expect:i,fn:Be,spyOn:be,userEvent:c,within:ce}=__STORYBOOK_MODULE_TEST__,rt={title:"Core/TaskItem",component:pe,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{task:{name:"task",description:"The task data to display",control:{type:"object"}},dateValidation:{name:"dateValidation",description:"Date validation state for showing warnings",control:{type:"object"}}},decorators:[(s,t)=>{const[a,e]=k.useState([]),[n,m]=k.useState(!1),[T,ge]=k.useState(!1),[ye,ke]=k.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[Te,he]=k.useState({field:"dueAt",direction:"asc",script:""}),we={tasks:a,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:o=>{e(g=>g.map(y=>y.id===o.id?o:y)),console.log("Update task:",o)},onDeleteTask:o=>{e(g=>g.filter(y=>y.id!==o)),console.log("Delete task:",o)},onAddTask:o=>{const g={id:`task-${Date.now()}`,title:o.title||"New Task",status:"todo",priority:"medium",createdAt:re.now().toISO(),...o};e(y=>[...y,g]),console.log("Add task:",g)},onEditTask:o=>console.log("Edit task:",o),onAICommand:async o=>console.log("AI command:",o),onItemClick:o=>console.log("Item clicked:",o),renderTitle:t.args.renderTitle},ve={settings:t.args.settings||oe.default(),updateSettings:o=>console.log("Update settings:",o),isFocusMode:n,toggleFocusMode:()=>m(!n),isAiMode:T,toggleAiMode:()=>ge(!T),filters:ye,onFilterChange:ke,sort:Te,onSortChange:he,onVoiceError:o=>console.error("Voice error:",o),onOpenSettings:()=>console.log("Open settings")};return p.jsx(De,{theme:t.parameters.theme,children:p.jsx(ue,{value:we,children:p.jsx(Se,{value:ve,children:p.jsx("div",{className:"p-4 bg-white min-w-80",children:p.jsx(s,{})})})})})}]},w=r.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high"}),v={args:{task:w}},S={args:{task:r.completed({title:"Completed project setup",description:"Successfully set up the component library"})}},f={args:{task:r.highPriority({title:"Urgent: Complete critical bug fix"})}},D={args:{task:r.overdue({title:"Overdue: Submit quarterly report"})}},B={args:{task:r.withFullDescription({title:"Task with comprehensive description"})}},b={args:{task:r.withTags(3,{title:"Task with multiple tags"})}},E={args:{task:l.veryLongTitle},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Title is truncated, not wrapped",async()=>{const e=a.getByRole("button",{name:/^Edit task title:/}),n=e.querySelector("span.inline");i(n).not.toBeNull(),i(getComputedStyle(n).whiteSpace).toBe("nowrap"),i(e.scrollWidth).toBeGreaterThan(e.clientWidth)})}},me=({task:s,onUpdate:t})=>{const[a,e]=k.useState(s),n=fe(),m=T=>{t?.(T),e(T)};return p.jsx(ue,{value:{...n,onUpdateTask:m},children:p.jsx(pe,{task:a})})},x={args:{task:r.base({id:"dup-tags",title:"Tags parsed from text",tags:[{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"}]})},render:s=>p.jsx(me,{task:s.task}),play:async({canvasElement:s,step:t})=>{const a=d(s),e=be(console,"error");try{await t("Open the overflow tags popover",async()=>{await c.click(a.getByRole("button",{name:/^Show 2 more tags/})),await u(200)}),await t("Overflow tags render without duplicate keys",async()=>{i(a.getAllByRole("button",{name:/^Remove tag TODO/})).toHaveLength(2);const n=e.mock.calls.filter(m=>String(m[0]).includes("same key"));i(n).toHaveLength(0)}),await t("Removing one tag keeps the others",async()=>{await c.click(a.getAllByRole("button",{name:/^Remove tag TODO/})[0]),await u(200),i(a.getByRole("button",{name:/^Show 1 more tags/})).toBeInTheDocument()})}finally{e.mockRestore()}}},O={args:{task:l.manyTags}},C={args:{task:l.noTags}},R={args:{task:l.noDescription}},I={args:{task:l.unicodeTitle}},A={args:{task:r.dueToday({title:"Due today: Review pull request"})}},M={args:{task:r.doing({title:"In Progress: Implementing new feature"})}},V={args:{task:r.scheduled({title:"Scheduled: Team planning meeting"})}},U={args:{task:r.cancelled({title:"Cancelled task example"})}},L={args:{task:r.withRecurrence({title:"Recurring: Daily standup"})}},W={args:{task:w,settings:oe.darkMode()},parameters:{backgrounds:{default:"dark"}}},N={args:{task:w,settings:oe.largeFontSize()}},P={args:{task:w,settings:oe.smallFontSize()}},j={args:{task:w},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Click on task item",async()=>{const e=a.getByText(/Complete project setup/i);await c.click(e)})}},h={args:{task:l.missingStrategyDates,dateValidation:{hasMissingDates:!0,hasInvalidDates:!1}},parameters:{docs:{description:{story:"Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy."}}}},ie=s=>({args:h.args,parameters:{theme:s},play:async({canvasElement:t,step:a})=>{const e=ce(t);await a("The No dates label meets WCAG AA (4.5:1)",async()=>{const n=e.getByRole("img",{name:"This task has no dates set"});await de(ce(n).getByText("No dates"))}),await a("So does the medium priority label",async()=>{const n=e.getByRole("button",{name:/Current priority: medium$/});await de(ce(n).getByText("medium"))})}}),F=ie("light"),q=ie("dark"),$=ie("midnight"),H=ie("coffee"),z={args:{task:l.invalidDate,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows the 'Invalid Date' warning badge when dates have invalid format."}}}},_={args:{task:l.multipleInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated)."}}}},J={args:{task:l.mixedValidInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Invalid dates take priority over missing dates - shows 'Invalid Date' badge."}}}},K={args:{task:r.base({title:"Task with all valid dates",dueAt:re.now().plus({days:3}).toISO(),startAt:re.now().toISO()}),dateValidation:void 0},parameters:{docs:{description:{story:"When all dates are valid and present, no warning badge is shown."}}}},X={args:{task:l.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Doing - should auto-populate startAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await c.click(e)}),await t("Select Doing status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^doing$/i);await c.click(e)})}},G={args:{task:l.todoReadyForTransition},parameters:{docs:{description:{story:"Scheduled is derived from a future start date, not picked by hand - the status menu offers only the workflow statuses."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await c.click(e)}),await t("Verify only workflow statuses are offered",async()=>{await new Promise(e=>setTimeout(e,300));for(const e of["todo","doing","done","cancelled"])i(a.getByRole("button",{name:new RegExp(`status to ${e}$`)})).toBeInTheDocument();i(a.queryByRole("button",{name:/status to scheduled$/})).not.toBeInTheDocument()})}},Y={args:{task:r.doing({id:"doing-for-done-test",title:"In progress task for completion test"})},parameters:{docs:{description:{story:"Tests status transition to Done - should auto-populate completedAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await c.click(e)}),await t("Select Done status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^done$/i);await c.click(e)})}},Q={args:{task:r.doing({id:"doing-for-cancel-test",title:"In progress task for cancellation test"})},parameters:{docs:{description:{story:"Tests status transition to Cancelled - should auto-populate cancelledAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await c.click(e)}),await t("Select Cancelled status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^cancelled$/i);await c.click(e)})}},Z=Be(),ee={args:{task:r.cancelled({id:"cancelled-for-reopen-test",title:"Cancelled task to reopen",cancelledAt:re.now().toISO()??void 0})},parameters:{docs:{description:{story:"Reopening a cancelled task clears its cancelledAt date, as Obsidian Tasks does, so its task line loses the ❌ date."}}},render:s=>p.jsx(me,{task:s.task,onUpdate:Z}),play:async({canvasElement:s,step:t})=>{const a=d(s);Z.mockClear(),await t("Open status popover",async()=>{await c.click(a.getByRole("button",{name:/Change Status/i}))}),await t("Select Todo status",async()=>{await u(300),await c.click(a.getByRole("button",{name:/status to todo$/}))}),await t("The reopened task has no cancelled date",async()=>{i(Z).toHaveBeenCalledOnce();const[e]=Z.mock.calls[0];i(e.status).toBe("todo"),i(e.cancelledAt).toBeUndefined()})}},te={args:{task:r.base({id:"render-title-upper",title:"Custom rendered title"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Demonstrates renderTitle callback transforming title text to uppercase."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Verify title is rendered uppercase",async()=>{await u(500);const e=a.getByText("CUSTOM RENDERED TITLE");i(e).toBeTruthy()})}},ae={args:{task:r.base({id:"render-title-jsx",title:"Visit https://example.com for details"}),renderTitle:s=>{const t=/(https?:\/\/[^\s]+)/g,a=s.split(t);return le.createElement("span",null,...a.map((e,n)=>t.test(e)?le.createElement("a",{key:n,href:e,className:"text-blue-500 underline","data-testid":"rendered-link"},e):e))}},parameters:{docs:{description:{story:"Demonstrates renderTitle callback converting URLs into clickable links (JSX)."}}},play:async({canvasElement:s,step:t})=>{await t("Verify URL is rendered as a link",async()=>{await u(500);const a=s.querySelector('a[href="https://example.com"]');i(a).toBeTruthy(),i(a.tagName).toBe("A"),i(a.textContent).toBe("https://example.com")})}},se={args:{task:r.base({id:"render-title-edit",title:"Editable title test"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Verifies that renderTitle only affects read-only display — inline editing still shows the raw title string."}}},play:async({canvasElement:s,step:t})=>{await t("Verify title is rendered uppercase initially",async()=>{await u(500);const e=Array.from(s.querySelectorAll("button")).find(n=>n.textContent?.trim()==="EDITABLE TITLE TEST");i(e).toBeTruthy()}),await t("Click to edit and verify raw title in input",async()=>{const e=Array.from(s.querySelectorAll("button")).find(m=>m.textContent?.trim()==="EDITABLE TITLE TEST");await c.click(e),await u(300);const n=s.querySelector("input");i(n).toBeTruthy(),i(n.value).toBe("Editable title test")})}},ne={args:{task:r.base({id:"render-title-undefined",title:"Plain text fallback"})},parameters:{docs:{description:{story:"When renderTitle is not provided, title displays as plain text (default behavior)."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Verify title renders as plain text",async()=>{await u(500);const e=a.getByText("Plain text fallback");i(e).toBeTruthy()})}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  }
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library"
    })
  }
}`,...S.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix"
    })
  }
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.overdue({
      title: "Overdue: Submit quarterly report"
    })
  }
}`,...D.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withFullDescription({
      title: "Task with comprehensive description"
    })
  }
}`,...B.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withTags(3, {
      title: "Task with multiple tags"
    })
  }
}`,...b.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.veryLongTitle
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Title is truncated, not wrapped", async () => {
      const titleButton = canvas.getByRole("button", {
        name: /^Edit task title:/
      });
      const titleText = titleButton.querySelector("span.inline");
      expect(titleText).not.toBeNull();
      expect(getComputedStyle(titleText as Element).whiteSpace).toBe("nowrap");
      expect(titleButton.scrollWidth).toBeGreaterThan(titleButton.clientWidth);
    });
  }
}`,...E.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "dup-tags",
      title: "Tags parsed from text",
      tags: [{
        id: "#TODO",
        name: "TODO"
      }, {
        id: "#TODO",
        name: "TODO"
      }, {
        id: "#TODO",
        name: "TODO"
      }, {
        id: "#TODO",
        name: "TODO"
      }]
    })
  },
  render: args => <StatefulTaskItem task={args.task} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    const consoleError = spyOn(console, "error");
    try {
      await step("Open the overflow tags popover", async () => {
        await userEvent.click(canvas.getByRole("button", {
          name: /^Show 2 more tags/
        }));
        await delay(200);
      });
      await step("Overflow tags render without duplicate keys", async () => {
        expect(canvas.getAllByRole("button", {
          name: /^Remove tag TODO/
        })).toHaveLength(2);
        const duplicateKeyWarnings = consoleError.mock.calls.filter(call => String(call[0]).includes("same key"));
        expect(duplicateKeyWarnings).toHaveLength(0);
      });
      await step("Removing one tag keeps the others", async () => {
        await userEvent.click(canvas.getAllByRole("button", {
          name: /^Remove tag TODO/
        })[0]);
        await delay(200);
        expect(canvas.getByRole("button", {
          name: /^Show 1 more tags/
        })).toBeInTheDocument();
      });
    } finally {
      consoleError.mockRestore();
    }
  }
}`,...x.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.manyTags
  }
}`,...O.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noTags
  }
}`,...C.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noDescription
  }
}`,...R.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.unicodeTitle
  }
}`,...I.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.dueToday({
      title: "Due today: Review pull request"
    })
  }
}`,...A.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.doing({
      title: "In Progress: Implementing new feature"
    })
  }
}`,...M.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.scheduled({
      title: "Scheduled: Team planning meeting"
    })
  }
}`,...V.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.cancelled({
      title: "Cancelled task example"
    })
  }
}`,...U.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup"
    })
  }
}`,...L.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...W.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.largeFontSize()
  }
}`,...N.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.smallFontSize()
  }
}`,...P.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:'missingDatesInTheme("light")',...F.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:'missingDatesInTheme("dark")',...q.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:'missingDatesInTheme("midnight")',...$.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:'missingDatesInTheme("coffee")',...H.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.todoReadyForTransition
  },
  parameters: {
    docs: {
      description: {
        story: "Scheduled is derived from a future start date, not picked by hand - the status menu offers only the workflow statuses."
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
    await step("Verify only workflow statuses are offered", async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      for (const status of ["todo", "doing", "done", "cancelled"]) {
        expect(canvas.getByRole("button", {
          name: new RegExp(\`status to \${status}$\`)
        })).toBeInTheDocument();
      }
      expect(canvas.queryByRole("button", {
        name: /status to scheduled$/
      })).not.toBeInTheDocument();
    });
  }
}`,...G.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}};ee.parameters={...ee.parameters,docs:{...ee.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.cancelled({
      id: "cancelled-for-reopen-test",
      title: "Cancelled task to reopen",
      cancelledAt: DateTime.now().toISO() ?? undefined
    })
  },
  parameters: {
    docs: {
      description: {
        story: "Reopening a cancelled task clears its cancelledAt date, as Obsidian Tasks does, so its task line loses the ❌ date."
      }
    }
  },
  render: args => <StatefulTaskItem task={args.task} onUpdate={reopenUpdates} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    reopenUpdates.mockClear();
    await step("Open status popover", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /Change Status/i
      }));
    });
    await step("Select Todo status", async () => {
      await delay(300);
      await userEvent.click(canvas.getByRole("button", {
        name: /status to todo$/
      }));
    });
    await step("The reopened task has no cancelled date", async () => {
      expect(reopenUpdates).toHaveBeenCalledOnce();
      const [reopened] = reopenUpdates.mock.calls[0] as [Task];
      expect(reopened.status).toBe("todo");
      expect(reopened.cancelledAt).toBeUndefined();
    });
  }
}`,...ee.parameters?.docs?.source}}};te.parameters={...te.parameters,docs:{...te.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "render-title-upper",
      title: "Custom rendered title"
    }),
    renderTitle: (title: string) => title.toUpperCase()
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates renderTitle callback transforming title text to uppercase."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify title is rendered uppercase", async () => {
      await delay(500);
      const titleElement = canvas.getByText("CUSTOM RENDERED TITLE");
      expect(titleElement).toBeTruthy();
    });
  }
}`,...te.parameters?.docs?.source}}};ae.parameters={...ae.parameters,docs:{...ae.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "render-title-jsx",
      title: "Visit https://example.com for details"
    }),
    renderTitle: (title: string) => {
      const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
      const parts = title.split(urlRegex);
      return React.createElement("span", null, ...parts.map((part, i) => urlRegex.test(part) ? React.createElement("a", {
        key: i,
        href: part,
        className: "text-blue-500 underline",
        "data-testid": "rendered-link"
      }, part) : part));
    }
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates renderTitle callback converting URLs into clickable links (JSX)."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Verify URL is rendered as a link", async () => {
      await delay(500);
      const link = canvasElement.querySelector('a[href="https://example.com"]') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.textContent).toBe("https://example.com");
    });
  }
}`,...ae.parameters?.docs?.source}}};se.parameters={...se.parameters,docs:{...se.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "render-title-edit",
      title: "Editable title test"
    }),
    renderTitle: (title: string) => title.toUpperCase()
  },
  parameters: {
    docs: {
      description: {
        story: "Verifies that renderTitle only affects read-only display — inline editing still shows the raw title string."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Verify title is rendered uppercase initially", async () => {
      await delay(500);
      const buttons = Array.from(canvasElement.querySelectorAll("button")) as HTMLButtonElement[];
      const titleButton = buttons.find(b => b.textContent?.trim() === "EDITABLE TITLE TEST");
      expect(titleButton).toBeTruthy();
    });
    await step("Click to edit and verify raw title in input", async () => {
      const buttons = Array.from(canvasElement.querySelectorAll("button")) as HTMLButtonElement[];
      const titleButton = buttons.find(b => b.textContent?.trim() === "EDITABLE TITLE TEST")!;
      await userEvent.click(titleButton);
      await delay(300);
      // The input should contain the raw title, not the transformed one
      const input = canvasElement.querySelector("input") as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe("Editable title test");
    });
  }
}`,...se.parameters?.docs?.source}}};ne.parameters={...ne.parameters,docs:{...ne.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "render-title-undefined",
      title: "Plain text fallback"
    })
    // renderTitle intentionally omitted
  },
  parameters: {
    docs: {
      description: {
        story: "When renderTitle is not provided, title displays as plain text (default behavior)."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify title renders as plain text", async () => {
      await delay(500);
      const titleElement = canvas.getByText("Plain text fallback");
      expect(titleElement).toBeTruthy();
    });
  }
}`,...ne.parameters?.docs?.source}}};const ot=["Default","Completed","HighPriority","Overdue","WithDescription","WithTags","VeryLongTitle","DuplicateTagIdsInOverflow","ManyTags","NoTags","NoDescription","UnicodeTitle","DueToday","Doing","Scheduled","Cancelled","WithRecurrence","DarkMode","LargeFontSize","SmallFontSize","ItemClickInteraction","MissingDatesWarning","MissingDatesLightTheme","MissingDatesDarkTheme","MissingDatesMidnightTheme","MissingDatesCoffeeTheme","InvalidDateWarning","MultipleInvalidDates","MixedDateValidation","NoDatesNoWarning","StatusTransitionToDoing","StatusMenuOffersWorkflowStatusesOnly","StatusTransitionToDone","StatusTransitionToCancelled","StatusTransitionReopensCancelled","RenderTitleUpperCase","RenderTitleWithJSX","RenderTitleNotAppliedDuringEdit","RenderTitleUndefined"];export{U as Cancelled,S as Completed,W as DarkMode,v as Default,M as Doing,A as DueToday,x as DuplicateTagIdsInOverflow,f as HighPriority,z as InvalidDateWarning,j as ItemClickInteraction,N as LargeFontSize,O as ManyTags,H as MissingDatesCoffeeTheme,q as MissingDatesDarkTheme,F as MissingDatesLightTheme,$ as MissingDatesMidnightTheme,h as MissingDatesWarning,J as MixedDateValidation,_ as MultipleInvalidDates,K as NoDatesNoWarning,R as NoDescription,C as NoTags,D as Overdue,se as RenderTitleNotAppliedDuringEdit,ne as RenderTitleUndefined,te as RenderTitleUpperCase,ae as RenderTitleWithJSX,V as Scheduled,P as SmallFontSize,G as StatusMenuOffersWorkflowStatusesOnly,ee as StatusTransitionReopensCancelled,Q as StatusTransitionToCancelled,X as StatusTransitionToDoing,Y as StatusTransitionToDone,I as UnicodeTitle,E as VeryLongTitle,B as WithDescription,L as WithRecurrence,b as WithTags,ot as __namedExportsOrder,rt as default};
