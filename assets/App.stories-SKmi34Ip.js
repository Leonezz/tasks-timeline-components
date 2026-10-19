import{T as H}from"./TasksTimelineApp-B5_hYe1E.js";import{w as p,d as k}from"./test-utils-BjL_0stX.js";import{t as N}from"./tasks-CE8nCgSO.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-C21N2aj2.js";import"./preload-helper-PPVm8Dsz.js";import"./TodoList-Bd8CpOMp.js";import"./recurrence-B2fS74Tu.js";import"./tslib.es6-C44cpxNM.js";import"./YearSection-D8iTL7DI.js";import"./DaySection-t1zvpuwx.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./SettingsContext-CD1KsnZl.js";import"./MarkdownText-TCFLTl49.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";import"./BacklogSection-DVWonrCe.js";import"./InputBar-DKsCmbhE.js";import"./SettingsModal-DT27vNU-.js";import"./SettingsPage-CJM924R6.js";import"./SettingsPageGeneral-B1a1UQUd.js";import"./SettingsPageAI-D3fty8rz.js";import"./index-BWgloZmU.js";import"./index-B7dtx8Vx.js";import"./TaskEditModal-DRq-RfgX.js";import"./date-picker-D0ppNIJs.js";import"./Toast-CsSt665s.js";import"./AppContext-BGpZXZLM.js";const{expect:c,fn:x,userEvent:l,waitFor:F,within:G}=__STORYBOOK_MODULE_TEST__,Oe={title:"Core/TasksTimelineApp",component:H,tags:["autodocs"],parameters:{layout:"fullscreen"},argTypes:{onItemClick:{action:"item-clicked"},onTaskAdded:{action:"task-added"},onTaskUpdated:{action:"task-updated"},onTaskDeleted:{action:"task-deleted"}}},s=N.mixed(10),r=e=>console.log("Clicked item:",e),o=e=>console.log("Task added:",e),d=(e,n)=>console.log("Task updated:",e,"Previous:",n),i=(e,n)=>console.log("Task deleted:",e,"Previous:",n),T={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r}},h={args:{...T.args},play:async({canvasElement:e,step:n})=>{const t=G(e),[a]=await t.findAllByRole("button",{name:/^Change status for /});await n("Open the editor from the row's status menu",async()=>{a.focus(),await l.keyboard("{Enter}"),(await t.findByRole("button",{name:/^Edit details for /})).focus(),await l.keyboard("{Enter}"),await t.findByRole("dialog",{name:"Edit Task"})}),await n("Escape returns focus to the row's status button",async()=>{await l.keyboard("{Escape}"),await F(()=>c(t.queryByRole("dialog",{name:"Edit Task"})).toBeNull()),await F(()=>c(document.activeElement).toBe(a))})}},y={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Verify app is rendered",async()=>{await k(500);const a=t.queryAllByRole("textbox");c(a.length).toBeGreaterThan(0)})}},g={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,className:"custom-app-class",onItemClick:r}},w={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,apiKey:"test-gemini-api-key",onItemClick:r}},v={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,systemInDarkMode:!0,onItemClick:r},parameters:{backgrounds:{default:"dark"}}},A={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,systemInDarkMode:!1,onItemClick:r},parameters:{backgrounds:{default:"light"}}},W={name:"first-run-memory",loadSettings:async()=>null,saveSettings:async()=>{}},O=()=>new Response(JSON.stringify({candidates:[{content:{role:"model",parts:[{text:"Hello"}]},finishReason:"STOP",index:0}]}),{status:200,headers:{"content-type":"application/json"}}),m={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,apiKey:"test-gemini-api-key",settingsRepository:W,aiFetch:x(async()=>O())},play:async({args:e,canvasElement:n,step:t})=>{const a=p(n);await t("Open the AI settings",async()=>{await l.click(await a.findByRole("button",{name:"Open settings and docs"})),await l.click(await a.findByRole("button",{name:"AI"}))}),await t("Test the connection through aiFetch",async()=>{await l.click(await a.findByRole("button",{name:/test connection/i})),await c(await a.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"'),await c(e.aiFetch).toHaveBeenCalledOnce()})}},u={args:{...m.args,aiFetch:x(async()=>O()),voiceRuntime:{browserSpeechSupported:!1}},play:async({args:e,canvasElement:n,step:t})=>{const a=p(n);await t("Open the AI settings",async()=>{await l.click(await a.findByRole("button",{name:"Open settings and docs"})),await l.click(await a.findByRole("button",{name:"AI"}))}),await t("voiceRuntime disables the Browser voice provider",async()=>{await c(await a.findByRole("button",{name:"Use Browser voice provider"})).toBeDisabled(),await c(a.getByText(/speech recognition isn.t available here/i)).toBeInTheDocument(),await c(a.getByRole("button",{name:"Use OpenAI voice provider"})).toBeEnabled()}),await t("Test Connection still goes through aiFetch",async()=>{await l.click(await a.findByRole("button",{name:/test connection/i})),await c(await a.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"'),await c(e.aiFetch).toHaveBeenCalledOnce()})}},b={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Find and click settings button",async()=>{await k(500);const a=t.getAllByRole("button");c(a.length).toBeGreaterThan(0)})}},B={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Find Focus mode toggle",async()=>{await k(500);const a=t.getAllByRole("button");c(a.length).toBeGreaterThan(0)})}},C={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Find status filter buttons",async()=>{await k(500);const a=t.getAllByRole("button");c(a.length).toBeGreaterThan(3)})}},I={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Find input bar",async()=>{await k(500);const a=t.queryAllByRole("textbox");c(a.length).toBeGreaterThan(0)})}},f={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Verify scrollable content",async()=>{await k(500);const a=t.queryAllByRole("button");c(a.length).toBeGreaterThan(0)})}},D={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r},play:async({canvasElement:e,step:n})=>{const t=p(e);await n("Verify dashboard stats are visible",async()=>{await k(500);const a=t.getAllByRole("button");c(a.length).toBeGreaterThan(3)})}},R={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i}},S={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,apiKey:"",onItemClick:r}},U={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,onItemClick:r,renderTitle:e=>e.toUpperCase()}},E={args:{tasks:s,onTaskAdded:o,onTaskUpdated:d,onTaskDeleted:i,className:"very-long-custom-class-name-that-might-cause-issues-but-should-still-work",onItemClick:r}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  }
}`,...T.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...App.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const [statusButton] = await canvas.findAllByRole("button", {
      name: /^Change status for /
    });
    await step("Open the editor from the row's status menu", async () => {
      statusButton.focus();
      await userEvent.keyboard("{Enter}");
      const edit = await canvas.findByRole("button", {
        name: /^Edit details for /
      });
      edit.focus();
      await userEvent.keyboard("{Enter}");
      await canvas.findByRole("dialog", {
        name: "Edit Task"
      });
    });
    await step("Escape returns focus to the row's status button", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.queryByRole("dialog", {
        name: "Edit Task"
      })).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(statusButton));
    });
  }
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify app is rendered", async () => {
      await delay(500);
      // Should have input bar
      const inputs = canvas.queryAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });
  }
}`,...y.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className: "custom-app-class",
    onItemClick: handleItemClick
  }
}`,...g.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "test-gemini-api-key",
    onItemClick: handleItemClick
  }
}`,...w.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: true,
    onItemClick: handleItemClick
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...v.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: false,
    onItemClick: handleItemClick
  },
  parameters: {
    backgrounds: {
      default: "light"
    }
  }
}`,...A.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "test-gemini-api-key",
    settingsRepository: firstRunSettingsRepository,
    aiFetch: fn<typeof fetch>(async () => geminiHelloResponse())
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open the AI settings", async () => {
      await userEvent.click(await canvas.findByRole("button", {
        name: "Open settings and docs"
      }));
      await userEvent.click(await canvas.findByRole("button", {
        name: "AI"
      }));
    });
    await step("Test the connection through aiFetch", async () => {
      await userEvent.click(await canvas.findByRole("button", {
        name: /test connection/i
      }));
      await expect(await canvas.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"');
      await expect(args.aiFetch).toHaveBeenCalledOnce();
    });
  }
}`,...m.parameters?.docs?.source},description:{story:'Settings "Test Connection" in the app goes through the `aiFetch` prop.',...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...TestConnectionWithAIFetch.args,
    aiFetch: fn<typeof fetch>(async () => geminiHelloResponse()),
    voiceRuntime: {
      browserSpeechSupported: false
    }
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open the AI settings", async () => {
      await userEvent.click(await canvas.findByRole("button", {
        name: "Open settings and docs"
      }));
      await userEvent.click(await canvas.findByRole("button", {
        name: "AI"
      }));
    });
    await step("voiceRuntime disables the Browser voice provider", async () => {
      await expect(await canvas.findByRole("button", {
        name: "Use Browser voice provider"
      })).toBeDisabled();
      await expect(canvas.getByText(/speech recognition isn.t available here/i)).toBeInTheDocument();
      await expect(canvas.getByRole("button", {
        name: "Use OpenAI voice provider"
      })).toBeEnabled();
    });
    await step("Test Connection still goes through aiFetch", async () => {
      await userEvent.click(await canvas.findByRole("button", {
        name: /test connection/i
      }));
      await expect(await canvas.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"');
      await expect(args.aiFetch).toHaveBeenCalledOnce();
    });
  }
}`,...u.parameters?.docs?.source},description:{story:'The app hands both host runtime props to Settings → AI: `voiceRuntime`\ndisables the Browser voice provider, and "Test Connection" still goes\nthrough `aiFetch`.',...u.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find and click settings button", async () => {
      await delay(500); // Wait for app to initialize
      const buttons = canvas.getAllByRole("button");
      // Settings button should be among the buttons
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...b.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find Focus mode toggle", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should have Focus button
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...B.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find status filter buttons", async () => {
      await delay(500);
      // Should have To Do, Unplanned, Due & OD, Doing buttons
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(3);
    });
  }
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find input bar", async () => {
      await delay(500);
      const inputs = canvas.queryAllByRole("textbox");
      // Should have task input field
      expect(inputs.length).toBeGreaterThan(0);
    });
  }
}`,...I.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify scrollable content", async () => {
      await delay(500);
      // App should render with buttons and input
      const buttons = canvas.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify dashboard stats are visible", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should show stat cards (To Do, Unplanned, Due & OD, Doing)
      expect(buttons.length).toBeGreaterThan(3);
    });
  }
}`,...D.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted
    // OnItemClick is optional, should work without it
  }
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "",
    onItemClick: handleItemClick
  }
}`,...S.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick,
    renderTitle: (title: string) => title.toUpperCase()
  }
}`,...U.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className: "very-long-custom-class-name-that-might-cause-issues-but-should-still-work",
    onItemClick: handleItemClick
  }
}`,...E.parameters?.docs?.source}}};const He=["App","EditorReturnsFocusToTaskRow","WithItemClick","WithCustomClassName","WithAPIKey","SystemDarkMode","SystemLightMode","TestConnectionWithAIFetch","SettingsWithVoiceRuntimeAndAIFetch","OpenSettings","ToggleFocusMode","FilterByStatus","AddNewTask","ScrollTasks","ViewTaskStats","NoOnItemClick","EmptyAPIKey","WithCustomRenderTitle","VeryLongClassName"];export{I as AddNewTask,T as App,h as EditorReturnsFocusToTaskRow,S as EmptyAPIKey,C as FilterByStatus,R as NoOnItemClick,b as OpenSettings,f as ScrollTasks,u as SettingsWithVoiceRuntimeAndAIFetch,v as SystemDarkMode,A as SystemLightMode,m as TestConnectionWithAIFetch,B as ToggleFocusMode,E as VeryLongClassName,D as ViewTaskStats,w as WithAPIKey,g as WithCustomClassName,U as WithCustomRenderTitle,y as WithItemClick,He as __namedExportsOrder,Oe as default};
