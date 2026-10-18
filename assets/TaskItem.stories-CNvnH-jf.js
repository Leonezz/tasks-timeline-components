import{j as u}from"./jsx-runtime-u17CrQMm.js";import{R as de,r as h}from"./iframe-DX6dunwq.js";import{w as d,d as m,e as pe}from"./test-utils-BjL_0stX.js";import{T as me}from"./TaskItem-DA0AyfWo.js";import{T as ge,S as De,u as Be}from"./SettingsContext-Dr2TBy9k.js";import{A as be}from"./AppContext-Bn7eSJpw.js";import{D as re}from"./recurrence-Co3oC643.js";import{s as ie}from"./settings-GESQiD84.js";import{t as r}from"./tasks-CcRg1J09.js";import{e as p}from"./edge-cases-DMAB-FsE.js";import"./preload-helper-PPVm8Dsz.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-B3FenB3o.js";import"./chevron-right-Bsvfh4yW.js";import"./circle-C-nGDjeH.js";import"./calendar-CXzZhQC7.js";import"./Motion-gFejr4jc.js";import"./proxy-C45Fm9tl.js";import"./date-badge-tones-sfOfQwII.js";import"./popover-sGFH9hBn.js";import"./Combination-DzmrH2IM.js";import"./usePortalContainer-DYYD4TQs.js";import"./index-DSjlBnpD.js";import"./index-BrSUwSwv.js";import"./calendar-DNv7P81Q.js";import"./button-BTuZAieA.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-BnYZTcTI.js";import"./PriorityPopover-s9xosWDc.js";import"./CategoryPopover-DhQhahfi.js";import"./MarkdownText-PLHOlyD6.js";import"./index-DrBVBWl1.js";const{expect:o,fn:xe,spyOn:Ee,userEvent:l,within:le}=__STORYBOOK_MODULE_TEST__,rt={title:"Core/TaskItem",component:me,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{task:{name:"task",description:"The task data to display",control:{type:"object"}},dateValidation:{name:"dateValidation",description:"Date validation state for showing warnings",control:{type:"object"}}},decorators:[(s,t)=>{const[a,e]=h.useState([]),[n,c]=h.useState(!1),[T,ke]=h.useState(!1),[he,Te]=h.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[we,ve]=h.useState({field:"dueAt",direction:"asc",script:""}),fe={tasks:a,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:i=>{e(y=>y.map(k=>k.id===i.id?i:k)),console.log("Update task:",i)},onDeleteTask:i=>{e(y=>y.filter(k=>k.id!==i)),console.log("Delete task:",i)},onAddTask:i=>{const y={id:`task-${Date.now()}`,title:i.title||"New Task",status:"todo",priority:"medium",createdAt:re.now().toISO(),...i};e(k=>[...k,y]),console.log("Add task:",y)},onEditTask:i=>console.log("Edit task:",i),onAICommand:async i=>console.log("AI command:",i),onItemClick:i=>console.log("Item clicked:",i),renderTitle:t.args.renderTitle},Se={settings:t.args.settings||ie.default(),updateSettings:i=>console.log("Update settings:",i),isFocusMode:n,toggleFocusMode:()=>c(!n),isAiMode:T,toggleAiMode:()=>ke(!T),filters:he,onFilterChange:Te,sort:we,onSortChange:ve,onVoiceError:i=>console.error("Voice error:",i),onOpenSettings:()=>console.log("Open settings")};return u.jsx(be,{theme:t.parameters.theme,children:u.jsx(ge,{value:fe,children:u.jsx(De,{value:Se,children:u.jsx("div",{className:"p-4 bg-white min-w-80",children:u.jsx(s,{})})})})})}]},g=r.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high"}),v={args:{task:g}},f={args:{task:r.completed({title:"Completed project setup",description:"Successfully set up the component library"})}},S={args:{task:r.highPriority({title:"Urgent: Complete critical bug fix"})}},D={args:{task:r.overdue({title:"Overdue: Submit quarterly report"})}},B={args:{task:r.withFullDescription({title:"Task with comprehensive description"})}},b={args:{task:r.withTags(3,{title:"Task with multiple tags"})}},x={args:{task:p.veryLongTitle},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Title is truncated, not wrapped",async()=>{const e=a.getByRole("button",{name:/^Edit task title:/}),n=e.querySelector("span.inline");o(n).not.toBeNull(),o(getComputedStyle(n).whiteSpace).toBe("nowrap"),o(e.scrollWidth).toBeGreaterThan(e.clientWidth)})}},ye=({task:s,onUpdate:t})=>{const[a,e]=h.useState(s),n=Be(),c=T=>{t?.(T),e(T)};return u.jsx(ge,{value:{...n,onUpdateTask:c},children:u.jsx(me,{task:a})})},E={args:{task:r.base({id:"dup-tags",title:"Tags parsed from text",tags:[{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"}]})},render:s=>u.jsx(ye,{task:s.task}),play:async({canvasElement:s,step:t})=>{const a=d(s),e=Ee(console,"error");try{await t("Open the overflow tags popover",async()=>{await l.click(a.getByRole("button",{name:/^Show 2 more tags/})),await m(200)}),await t("Overflow tags render without duplicate keys",async()=>{o(a.getAllByRole("button",{name:/^Remove tag TODO/})).toHaveLength(2);const n=e.mock.calls.filter(c=>String(c[0]).includes("same key"));o(n).toHaveLength(0)}),await t("Removing one tag keeps the others",async()=>{await l.click(a.getAllByRole("button",{name:/^Remove tag TODO/})[0]),await m(200),o(a.getByRole("button",{name:/^Show 1 more tags/})).toBeInTheDocument()})}finally{e.mockRestore()}}},C={args:{task:p.manyTags}},O={args:{task:p.noTags}},R={args:{task:p.noDescription}},I={args:{task:p.unicodeTitle}},A={args:{task:r.dueToday({title:"Due today: Review pull request"})}},M={args:{task:r.doing({title:"In Progress: Implementing new feature"})}},V={args:{task:r.scheduled({title:"Scheduled: Team planning meeting"})}},L={args:{task:r.cancelled({title:"Cancelled task example"})}},U={args:{task:r.withRecurrence({title:"Recurring: Daily standup"})}},W={args:{task:g,settings:ie.darkMode()},parameters:{backgrounds:{default:"dark"}}},P={args:{task:g,settings:ie.largeFontSize()}},N={args:{task:g,settings:ie.smallFontSize()}},q={args:{task:g},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Click on task item",async()=>{const e=a.getByText(/Complete project setup/i);await l.click(e)})}},ue=s=>{const t=s.querySelector("svg");if(!t)throw new Error(`"${s.getAttribute("aria-label")}" renders no icon`);return t.innerHTML},$={args:{task:g},parameters:{docs:{description:{story:"The first click on Delete arms it: the label, tooltip and icon change. Lucide 1 made `Trash2` an alias of `Trash`, so the armed button shows `OctagonX`."}}},play:async({canvasElement:s,step:t})=>{const a=d(s),{title:e}=g;let n="";await t("The idle delete button shows a trash can",async()=>{const c=a.getByRole("button",{name:`Delete ${e}`});o(c).toHaveAttribute("title","Delete task"),o(c.querySelector("svg")).toHaveClass("lucide-trash"),n=ue(c)}),await t("The first click arms it with a different icon",async()=>{await l.click(a.getByRole("button",{name:`Delete ${e}`}));const c=await a.findByRole("button",{name:`Confirm delete ${e}`});o(c).toHaveAttribute("title","Click again to confirm delete"),o(c.querySelector("svg")).toHaveClass("lucide-octagon-x"),o(ue(c)).not.toBe(n)})}},w={args:{task:p.missingStrategyDates,dateValidation:{hasMissingDates:!0,hasInvalidDates:!1}},parameters:{docs:{description:{story:"Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy."}}}},ce=s=>({args:w.args,parameters:{theme:s},play:async({canvasElement:t,step:a})=>{const e=le(t);await a("The No dates label meets WCAG AA (4.5:1)",async()=>{const n=e.getByRole("img",{name:"This task has no dates set"});await pe(le(n).getByText("No dates"))}),await a("So does the medium priority label",async()=>{const n=e.getByRole("button",{name:/Current priority: medium$/});await pe(le(n).getByText("medium"))})}}),H=ce("light"),j=ce("dark"),F=ce("midnight"),z=ce("coffee"),_={args:{task:p.invalidDate,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows the 'Invalid Date' warning badge when dates have invalid format."}}}},X={args:{task:p.multipleInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated)."}}}},J={args:{task:p.mixedValidInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Invalid dates take priority over missing dates - shows 'Invalid Date' badge."}}}},K={args:{task:r.base({title:"Task with all valid dates",dueAt:re.now().plus({days:3}).toISO(),startAt:re.now().toISO()}),dateValidation:void 0},parameters:{docs:{description:{story:"When all dates are valid and present, no warning badge is shown."}}}},G={args:{task:p.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Doing - should auto-populate startAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await l.click(e)}),await t("Select Doing status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^doing$/i);await l.click(e)})}},Y={args:{task:p.todoReadyForTransition},parameters:{docs:{description:{story:"Scheduled is derived from a future start date, not picked by hand - the status menu offers only the workflow statuses."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await l.click(e)}),await t("Verify only workflow statuses are offered",async()=>{await new Promise(e=>setTimeout(e,300));for(const e of["todo","doing","done","cancelled"])o(a.getByRole("button",{name:new RegExp(`status to ${e}$`)})).toBeInTheDocument();o(a.queryByRole("button",{name:/status to scheduled$/})).not.toBeInTheDocument()})}},Q={args:{task:r.doing({id:"doing-for-done-test",title:"In progress task for completion test"})},parameters:{docs:{description:{story:"Tests status transition to Done - should auto-populate completedAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await l.click(e)}),await t("Select Done status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^done$/i);await l.click(e)})}},Z={args:{task:r.doing({id:"doing-for-cancel-test",title:"In progress task for cancellation test"})},parameters:{docs:{description:{story:"Tests status transition to Cancelled - should auto-populate cancelledAt date."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Open status popover",async()=>{const e=a.getByRole("button",{name:/Change Status/i});await l.click(e)}),await t("Select Cancelled status",async()=>{await new Promise(n=>setTimeout(n,300));const e=a.getByText(/^cancelled$/i);await l.click(e)})}},ee=xe(),te={args:{task:r.cancelled({id:"cancelled-for-reopen-test",title:"Cancelled task to reopen",cancelledAt:re.now().toISO()??void 0})},parameters:{docs:{description:{story:"Reopening a cancelled task clears its cancelledAt date, as Obsidian Tasks does, so its task line loses the ❌ date."}}},render:s=>u.jsx(ye,{task:s.task,onUpdate:ee}),play:async({canvasElement:s,step:t})=>{const a=d(s);ee.mockClear(),await t("Open status popover",async()=>{await l.click(a.getByRole("button",{name:/Change Status/i}))}),await t("Select Todo status",async()=>{await m(300),await l.click(a.getByRole("button",{name:/status to todo$/}))}),await t("The reopened task has no cancelled date",async()=>{o(ee).toHaveBeenCalledOnce();const[e]=ee.mock.calls[0];o(e.status).toBe("todo"),o(e.cancelledAt).toBeUndefined()})}},ae={args:{task:r.base({id:"render-title-upper",title:"Custom rendered title"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Demonstrates renderTitle callback transforming title text to uppercase."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Verify title is rendered uppercase",async()=>{await m(500);const e=a.getByText("CUSTOM RENDERED TITLE");o(e).toBeTruthy()})}},se={args:{task:r.base({id:"render-title-jsx",title:"Visit https://example.com for details"}),renderTitle:s=>{const t=/(https?:\/\/[^\s]+)/g,a=s.split(t);return de.createElement("span",null,...a.map((e,n)=>t.test(e)?de.createElement("a",{key:n,href:e,className:"text-blue-500 underline","data-testid":"rendered-link"},e):e))}},parameters:{docs:{description:{story:"Demonstrates renderTitle callback converting URLs into clickable links (JSX)."}}},play:async({canvasElement:s,step:t})=>{await t("Verify URL is rendered as a link",async()=>{await m(500);const a=s.querySelector('a[href="https://example.com"]');o(a).toBeTruthy(),o(a.tagName).toBe("A"),o(a.textContent).toBe("https://example.com")})}},ne={args:{task:r.base({id:"render-title-edit",title:"Editable title test"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Verifies that renderTitle only affects read-only display — inline editing still shows the raw title string."}}},play:async({canvasElement:s,step:t})=>{await t("Verify title is rendered uppercase initially",async()=>{await m(500);const e=Array.from(s.querySelectorAll("button")).find(n=>n.textContent?.trim()==="EDITABLE TITLE TEST");o(e).toBeTruthy()}),await t("Click to edit and verify raw title in input",async()=>{const e=Array.from(s.querySelectorAll("button")).find(c=>c.textContent?.trim()==="EDITABLE TITLE TEST");await l.click(e),await m(300);const n=s.querySelector("input");o(n).toBeTruthy(),o(n.value).toBe("Editable title test")})}},oe={args:{task:r.base({id:"render-title-undefined",title:"Plain text fallback"})},parameters:{docs:{description:{story:"When renderTitle is not provided, title displays as plain text (default behavior)."}}},play:async({canvasElement:s,step:t})=>{const a=d(s);await t("Verify title renders as plain text",async()=>{await m(500);const e=a.getByText("Plain text fallback");o(e).toBeTruthy()})}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library"
    })
  }
}`,...f.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix"
    })
  }
}`,...S.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.manyTags
  }
}`,...C.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noTags
  }
}`,...O.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.cancelled({
      title: "Cancelled task example"
    })
  }
}`,...L.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup"
    })
  }
}`,...U.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...W.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.largeFontSize()
  }
}`,...P.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.smallFontSize()
  }
}`,...N.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  },
  parameters: {
    docs: {
      description: {
        story: "The first click on Delete arms it: the label, tooltip and icon change. Lucide 1 made \`Trash2\` an alias of \`Trash\`, so the armed button shows \`OctagonX\`."
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement),
      {
        title
      } = defaultTask;
    let idlePaths = "";
    await step("The idle delete button shows a trash can", async () => {
      const button = canvas.getByRole("button", {
        name: \`Delete \${title}\`
      });
      expect(button).toHaveAttribute("title", "Delete task");
      expect(button.querySelector("svg")).toHaveClass("lucide-trash");
      idlePaths = iconPaths(button);
    });
    await step("The first click arms it with a different icon", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: \`Delete \${title}\`
      }));
      const armed = await canvas.findByRole("button", {
        name: \`Confirm delete \${title}\`
      });
      expect(armed).toHaveAttribute("title", "Click again to confirm delete");
      expect(armed.querySelector("svg")).toHaveClass("lucide-octagon-x");
      expect(iconPaths(armed)).not.toBe(idlePaths);
    });
  }
}`,...$.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:'missingDatesInTheme("light")',...H.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:'missingDatesInTheme("dark")',...j.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:'missingDatesInTheme("midnight")',...F.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:'missingDatesInTheme("coffee")',...z.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source}}};te.parameters={...te.parameters,docs:{...te.parameters?.docs,source:{originalSource:`{
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
}`,...te.parameters?.docs?.source}}};ae.parameters={...ae.parameters,docs:{...ae.parameters?.docs,source:{originalSource:`{
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
}`,...ae.parameters?.docs?.source}}};se.parameters={...se.parameters,docs:{...se.parameters?.docs,source:{originalSource:`{
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
}`,...se.parameters?.docs?.source}}};ne.parameters={...ne.parameters,docs:{...ne.parameters?.docs,source:{originalSource:`{
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
}`,...ne.parameters?.docs?.source}}};oe.parameters={...oe.parameters,docs:{...oe.parameters?.docs,source:{originalSource:`{
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
}`,...oe.parameters?.docs?.source}}};const it=["Default","Completed","HighPriority","Overdue","WithDescription","WithTags","VeryLongTitle","DuplicateTagIdsInOverflow","ManyTags","NoTags","NoDescription","UnicodeTitle","DueToday","Doing","Scheduled","Cancelled","WithRecurrence","DarkMode","LargeFontSize","SmallFontSize","ItemClickInteraction","DeleteConfirmIcon","MissingDatesWarning","MissingDatesLightTheme","MissingDatesDarkTheme","MissingDatesMidnightTheme","MissingDatesCoffeeTheme","InvalidDateWarning","MultipleInvalidDates","MixedDateValidation","NoDatesNoWarning","StatusTransitionToDoing","StatusMenuOffersWorkflowStatusesOnly","StatusTransitionToDone","StatusTransitionToCancelled","StatusTransitionReopensCancelled","RenderTitleUpperCase","RenderTitleWithJSX","RenderTitleNotAppliedDuringEdit","RenderTitleUndefined"];export{L as Cancelled,f as Completed,W as DarkMode,v as Default,$ as DeleteConfirmIcon,M as Doing,A as DueToday,E as DuplicateTagIdsInOverflow,S as HighPriority,_ as InvalidDateWarning,q as ItemClickInteraction,P as LargeFontSize,C as ManyTags,z as MissingDatesCoffeeTheme,j as MissingDatesDarkTheme,H as MissingDatesLightTheme,F as MissingDatesMidnightTheme,w as MissingDatesWarning,J as MixedDateValidation,X as MultipleInvalidDates,K as NoDatesNoWarning,R as NoDescription,O as NoTags,D as Overdue,ne as RenderTitleNotAppliedDuringEdit,oe as RenderTitleUndefined,ae as RenderTitleUpperCase,se as RenderTitleWithJSX,V as Scheduled,N as SmallFontSize,Y as StatusMenuOffersWorkflowStatusesOnly,te as StatusTransitionReopensCancelled,Z as StatusTransitionToCancelled,G as StatusTransitionToDoing,Q as StatusTransitionToDone,I as UnicodeTitle,x as VeryLongTitle,B as WithDescription,U as WithRecurrence,b as WithTags,it as __namedExportsOrder,rt as default};
