import{j as g}from"./jsx-runtime-u17CrQMm.js";import{R as ee,r as y}from"./iframe-Kgc_7zLZ.js";import{w as d,d as k}from"./test-utils-BNouzmjp.js";import{T as ce}from"./TaskItem-DDYIp0OZ.js";import{T as le,S as de}from"./SettingsContext-BtnD2K3E.js";import{A as pe}from"./AppContext-BcElN5Q4.js";import{D as Z}from"./datetime-CoIMkCUY.js";import{s as Q}from"./settings-CIrEQdYf.js";import{t as r}from"./tasks-D2syl_55.js";import{e as i}from"./edge-cases-CRkSQ-i-.js";import"./preload-helper-PPVm8Dsz.js";import"./rruleset-Bu4wjl4G.js";import"./Icon-By9zMJNh.js";import"./chevron-right-B-ma7AbP.js";import"./Motion-CW3vvHgC.js";import"./proxy-D_7yqafd.js";import"./DateBadge-VIrexBWK.js";import"./popover-DjtUOgMF.js";import"./index-DSe7XrAg.js";import"./index-BCiHuJZ4.js";import"./calendar-CUwZWpfv.js";import"./TagBadge-DdjIChl0.js";import"./PriorityPopover-CEwfVsCu.js";import"./CategoryPopover-DU8vkvJF.js";import"./index-Do2GVLpJ.js";const{expect:c,userEvent:l}=__STORYBOOK_MODULE_TEST__,Ue={title:"Core/TaskItem",component:ce,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{task:{name:"task",description:"The task data to display",control:{type:"object"}},dateValidation:{name:"dateValidation",description:"Date validation state for showing warnings",control:{type:"object"}}},decorators:[(s,a)=>{const[t,e]=y.useState([]),[o,p]=y.useState(!1),[h,te]=y.useState(!1),[ae,se]=y.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[ne,re]=y.useState({field:"dueAt",direction:"asc",script:""}),oe={tasks:t,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:n=>{e(u=>u.map(m=>m.id===n.id?n:m)),console.log("Update task:",n)},onDeleteTask:n=>{e(u=>u.filter(m=>m.id!==n)),console.log("Delete task:",n)},onAddTask:n=>{const u={id:`task-${Date.now()}`,title:n.title||"New Task",status:"todo",priority:"medium",createdAt:Z.now().toISO(),...n};e(m=>[...m,u]),console.log("Add task:",u)},onEditTask:n=>console.log("Edit task:",n),onAICommand:async n=>console.log("AI command:",n),onItemClick:n=>console.log("Item clicked:",n),renderTitle:a.args.renderTitle},ie={settings:a.args.settings||Q.default(),updateSettings:n=>console.log("Update settings:",n),isFocusMode:o,toggleFocusMode:()=>p(!o),isAiMode:h,toggleAiMode:()=>te(!h),filters:ae,onFilterChange:se,sort:ne,onSortChange:re,onVoiceError:n=>console.error("Voice error:",n),onOpenSettings:()=>console.log("Open settings")};return g.jsx(pe,{children:g.jsx(le,{value:oe,children:g.jsx(de,{value:ie,children:g.jsx("div",{className:"p-4 bg-white min-w-80",children:g.jsx(s,{})})})})})}]},T=r.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high"}),w={args:{task:T}},v={args:{task:r.completed({title:"Completed project setup",description:"Successfully set up the component library"})}},S={args:{task:r.highPriority({title:"Urgent: Complete critical bug fix"})}},f={args:{task:r.overdue({title:"Overdue: Submit quarterly report"})}},D={args:{task:r.withFullDescription({title:"Task with comprehensive description"})}},B={args:{task:r.withTags(3,{title:"Task with multiple tags"})}},E={args:{task:i.veryLongTitle}},b={args:{task:i.manyTags}},x={args:{task:i.noTags}},C={args:{task:i.noDescription}},I={args:{task:i.unicodeTitle}},R={args:{task:r.dueToday({title:"Due today: Review pull request"})}},A={args:{task:r.doing({title:"In Progress: Implementing new feature"})}},O={args:{task:r.scheduled({title:"Scheduled: Team planning meeting"})}},V={args:{task:r.cancelled({title:"Cancelled task example"})}},M={args:{task:r.withRecurrence({title:"Recurring: Daily standup"})}},L={args:{task:T,settings:Q.darkMode()},parameters:{backgrounds:{default:"dark"}}},P={args:{task:T,settings:Q.largeFontSize()}},U={args:{task:T,settings:Q.smallFontSize()}},N={args:{task:T},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Click on task item",async()=>{const e=t.getByText(/Complete project setup/i);await l.click(e)})}},W={args:{task:i.missingStrategyDates,dateValidation:{hasMissingDates:!0,hasInvalidDates:!1}},parameters:{docs:{description:{story:"Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy."}}}},F={args:{task:i.invalidDate,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows the 'Invalid Date' warning badge when dates have invalid format."}}}},q={args:{task:i.multipleInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated)."}}}},j={args:{task:i.mixedValidInvalidDates,dateValidation:{hasMissingDates:!1,hasInvalidDates:!0}},parameters:{docs:{description:{story:"Invalid dates take priority over missing dates - shows 'Invalid Date' badge."}}}},$={args:{task:r.base({title:"Task with all valid dates",dueAt:Z.now().plus({days:3}).toISO(),startAt:Z.now().toISO()}),dateValidation:void 0},parameters:{docs:{description:{story:"When all dates are valid and present, no warning badge is shown."}}}},z={args:{task:i.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Doing - should auto-populate startAt date."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Open status popover",async()=>{const e=t.getByRole("button",{name:/Change Status/i});await l.click(e)}),await a("Select Doing status",async()=>{await new Promise(o=>setTimeout(o,300));const e=t.getByText(/^doing$/i);await l.click(e)})}},_={args:{task:i.todoReadyForTransition},parameters:{docs:{description:{story:"Tests status transition from Todo to Scheduled - should auto-populate startAt date."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Open status popover",async()=>{const e=t.getByRole("button",{name:/Change Status/i});await l.click(e)}),await a("Select Scheduled status",async()=>{await new Promise(o=>setTimeout(o,300));const e=t.getByText(/^scheduled$/i);await l.click(e)})}},H={args:{task:r.doing({id:"doing-for-done-test",title:"In progress task for completion test"})},parameters:{docs:{description:{story:"Tests status transition to Done - should auto-populate completedAt date."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Open status popover",async()=>{const e=t.getByRole("button",{name:/Change Status/i});await l.click(e)}),await a("Select Done status",async()=>{await new Promise(o=>setTimeout(o,300));const e=t.getByText(/^done$/i);await l.click(e)})}},J={args:{task:r.doing({id:"doing-for-cancel-test",title:"In progress task for cancellation test"})},parameters:{docs:{description:{story:"Tests status transition to Cancelled - should auto-populate cancelledAt date."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Open status popover",async()=>{const e=t.getByRole("button",{name:/Change Status/i});await l.click(e)}),await a("Select Cancelled status",async()=>{await new Promise(o=>setTimeout(o,300));const e=t.getByText(/^cancelled$/i);await l.click(e)})}},X={args:{task:r.base({id:"render-title-upper",title:"Custom rendered title"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Demonstrates renderTitle callback transforming title text to uppercase."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Verify title is rendered uppercase",async()=>{await k(500);const e=t.getByText("CUSTOM RENDERED TITLE");c(e).toBeTruthy()})}},K={args:{task:r.base({id:"render-title-jsx",title:"Visit https://example.com for details"}),renderTitle:s=>{const a=/(https?:\/\/[^\s]+)/g,t=s.split(a);return ee.createElement("span",null,...t.map((e,o)=>a.test(e)?ee.createElement("a",{key:o,href:e,className:"text-blue-500 underline","data-testid":"rendered-link"},e):e))}},parameters:{docs:{description:{story:"Demonstrates renderTitle callback converting URLs into clickable links (JSX)."}}},play:async({canvasElement:s,step:a})=>{await a("Verify URL is rendered as a link",async()=>{await k(500);const t=s.querySelector("#tasks-timeline-app")?.shadowRoot;c(t).toBeTruthy();const e=t.querySelector('a[href="https://example.com"]');c(e).toBeTruthy(),c(e.tagName).toBe("A"),c(e.textContent).toBe("https://example.com")})}},Y={args:{task:r.base({id:"render-title-edit",title:"Editable title test"}),renderTitle:s=>s.toUpperCase()},parameters:{docs:{description:{story:"Verifies that renderTitle only affects read-only display — inline editing still shows the raw title string."}}},play:async({canvasElement:s,step:a})=>{const t=s.querySelector("#tasks-timeline-app")?.shadowRoot;c(t).toBeTruthy(),await a("Verify title is rendered uppercase initially",async()=>{await k(500);const o=Array.from(t.querySelectorAll("button")).find(p=>p.textContent?.trim()==="EDITABLE TITLE TEST");c(o).toBeTruthy()}),await a("Click to edit and verify raw title in input",async()=>{const o=Array.from(t.querySelectorAll("button")).find(h=>h.textContent?.trim()==="EDITABLE TITLE TEST");await l.click(o),await k(300);const p=t.querySelector("input");c(p).toBeTruthy(),c(p.value).toBe("Editable title test")})}},G={args:{task:r.base({id:"render-title-undefined",title:"Plain text fallback"})},parameters:{docs:{description:{story:"When renderTitle is not provided, title displays as plain text (default behavior)."}}},play:async({canvasElement:s,step:a})=>{const t=d(s);await a("Verify title renders as plain text",async()=>{await k(500);const e=t.getByText("Plain text fallback");c(e).toBeTruthy()})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask
  }
}`,...w.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library"
    })
  }
}`,...v.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix"
    })
  }
}`,...S.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.overdue({
      title: "Overdue: Submit quarterly report"
    })
  }
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withFullDescription({
      title: "Task with comprehensive description"
    })
  }
}`,...D.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withTags(3, {
      title: "Task with multiple tags"
    })
  }
}`,...B.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.veryLongTitle
  }
}`,...E.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.manyTags
  }
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noTags
  }
}`,...x.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.noDescription
  }
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    task: edgeCaseTasks.unicodeTitle
  }
}`,...I.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.dueToday({
      title: "Due today: Review pull request"
    })
  }
}`,...R.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.doing({
      title: "In Progress: Implementing new feature"
    })
  }
}`,...A.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.scheduled({
      title: "Scheduled: Team planning meeting"
    })
  }
}`,...O.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.cancelled({
      title: "Cancelled task example"
    })
  }
}`,...V.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup"
    })
  }
}`,...M.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...L.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.largeFontSize()
  }
}`,...P.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    settings: settingsBuilder.smallFontSize()
  }
}`,...U.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
      const shadowRoot = canvasElement.querySelector("#tasks-timeline-app")?.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const link = shadowRoot!.querySelector('a[href="https://example.com"]') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.textContent).toBe("https://example.com");
    });
  }
}`,...K.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
    const shadowRoot = canvasElement.querySelector("#tasks-timeline-app")?.shadowRoot;
    expect(shadowRoot).toBeTruthy();
    await step("Verify title is rendered uppercase initially", async () => {
      await delay(500);
      const buttons = Array.from(shadowRoot!.querySelectorAll("button")) as HTMLButtonElement[];
      const titleButton = buttons.find(b => b.textContent?.trim() === "EDITABLE TITLE TEST");
      expect(titleButton).toBeTruthy();
    });
    await step("Click to edit and verify raw title in input", async () => {
      const buttons = Array.from(shadowRoot!.querySelectorAll("button")) as HTMLButtonElement[];
      const titleButton = buttons.find(b => b.textContent?.trim() === "EDITABLE TITLE TEST")!;
      await userEvent.click(titleButton);
      await delay(300);
      // The input should contain the raw title, not the transformed one
      const input = shadowRoot!.querySelector("input") as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe("Editable title test");
    });
  }
}`,...Y.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}};const Ne=["Default","Completed","HighPriority","Overdue","WithDescription","WithTags","VeryLongTitle","ManyTags","NoTags","NoDescription","UnicodeTitle","DueToday","Doing","Scheduled","Cancelled","WithRecurrence","DarkMode","LargeFontSize","SmallFontSize","ItemClickInteraction","MissingDatesWarning","InvalidDateWarning","MultipleInvalidDates","MixedDateValidation","NoDatesNoWarning","StatusTransitionToDoing","StatusTransitionToScheduled","StatusTransitionToDone","StatusTransitionToCancelled","RenderTitleUpperCase","RenderTitleWithJSX","RenderTitleNotAppliedDuringEdit","RenderTitleUndefined"];export{V as Cancelled,v as Completed,L as DarkMode,w as Default,A as Doing,R as DueToday,S as HighPriority,F as InvalidDateWarning,N as ItemClickInteraction,P as LargeFontSize,b as ManyTags,W as MissingDatesWarning,j as MixedDateValidation,q as MultipleInvalidDates,$ as NoDatesNoWarning,C as NoDescription,x as NoTags,f as Overdue,Y as RenderTitleNotAppliedDuringEdit,G as RenderTitleUndefined,X as RenderTitleUpperCase,K as RenderTitleWithJSX,O as Scheduled,U as SmallFontSize,J as StatusTransitionToCancelled,z as StatusTransitionToDoing,H as StatusTransitionToDone,_ as StatusTransitionToScheduled,I as UnicodeTitle,E as VeryLongTitle,D as WithDescription,M as WithRecurrence,B as WithTags,Ne as __namedExportsOrder,Ue as default};
