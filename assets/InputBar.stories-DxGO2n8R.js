import{j as d}from"./jsx-runtime-u17CrQMm.js";import{r as p}from"./iframe-C21N2aj2.js";import{I as U}from"./InputBar-DKsCmbhE.js";import{T as q,S as j}from"./SettingsContext-CD1KsnZl.js";import{A as L}from"./AppContext-BGpZXZLM.js";import{D as N}from"./recurrence-B2fS74Tu.js";import{s as t}from"./settings-GESQiD84.js";import"./edge-cases-DWLiX98P.js";import{w as g,d as u}from"./test-utils-BjL_0stX.js";import{B as G}from"./voice-providers-C_Nqj6M0.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./tslib.es6-C44cpxNM.js";import"./useVoiceInput-BKp77axA.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./index-B7dtx8Vx.js";import"./tasks-CE8nCgSO.js";const{expect:o,userEvent:l}=__STORYBOOK_MODULE_TEST__,fe={title:"Core/InputBar",component:U,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(r,s)=>{const[n,e]=p.useState([]),[V,M]=p.useState(!1),[C,O]=p.useState(s.args.isAiMode||!1),[R,W]=p.useState({tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""}),[P,H]=p.useState({field:"dueAt",direction:"asc",script:""}),_={tasks:n,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:a=>{e(i=>i.map(c=>c.id===a.id?a:c)),console.log("Update task:",a)},onDeleteTask:a=>{e(i=>i.filter(c=>c.id!==a)),console.log("Delete task:",a)},onAddTask:a=>{const i={id:`task-${Date.now()}`,title:a.title||"New Task",status:"todo",priority:"medium",createdAt:N.now().toISO(),...a};e(c=>[...c,i]),console.log("Add task:",i)},onEditTask:a=>console.log("Edit task:",a),onAICommand:async a=>console.log("AI command:",a)},D={settings:s.args.settings||t.default(),updateSettings:a=>console.log("Update settings:",a),isFocusMode:V,toggleFocusMode:()=>M(!V),isAiMode:C,toggleAiMode:()=>O(!C),filters:R,onFilterChange:W,sort:P,onSortChange:H,onVoiceError:a=>console.error("Voice error:",a),voiceRuntime:s.args.voiceRuntime,onOpenSettings:()=>console.log("Open settings")};return d.jsx(L,{children:d.jsx(q,{value:_,children:d.jsx(j,{value:D,children:d.jsx("div",{className:"w-full max-w-2xl mx-auto p-4",children:d.jsx(r,{})})})})})}]},m={args:{settings:t.default()}},y={args:{settings:{...t.default(),aiConfig:{...t.default().aiConfig,enabled:!1}}}},w={args:{settings:{...t.default(),settingButtonOnInputBar:!1}}},v={args:{settings:{...t.default(),tagsFilterOnInputBar:!1}}},f={args:{settings:{...t.default(),categoriesFilterOnInputBar:!1}}},B={args:{settings:t.minimalUI()}},S={args:{settings:{...t.default(),sortOnInputBar:!1}}},h={args:{settings:{...t.minimalUI(),sortOnInputBar:!1}}},I={args:{settings:t.darkMode()},parameters:{backgrounds:{default:"dark"}}},k={args:{settings:{...t.default(),enableVoiceInput:!0,voiceProvider:"browser"}}},A={args:{settings:t.withVoiceInput(),voiceRuntime:{browserSpeechSupported:!1}},play:async({canvasElement:r,step:s})=>{const n=g(r);await s("Voice button says to choose another provider",async()=>{const e=n.getByRole("button",{name:"Start voice input"});await o(e).toHaveAttribute("title",G)}),await s("Clicking does not start listening",async()=>{await l.click(n.getByRole("button",{name:"Start voice input"})),await u(100),await o(n.getByRole("button",{name:"Start voice input"})).toHaveAttribute("aria-pressed","false")})}},E={args:{settings:t.withAI(),isAiMode:!0}},b={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=g(r);await s("Type task title",async()=>{const e=n.getByPlaceholderText(/quick add/i);await l.type(e,"Buy groceries"),await u(100),o(e).toHaveValue("Buy groceries")}),await s("Submit task with Enter",async()=>{await l.keyboard("{Enter}"),await u(500);const e=n.getByPlaceholderText(/quick add/i);o(e).toHaveValue("")})}},T={args:{settings:t.withAI()},play:async({canvasElement:r,step:s})=>{const n=g(r);await s("Find AI toggle button",async()=>{const e=n.getByRole("button",{name:/ai/i});o(e).toBeInTheDocument()})}},x={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=g(r);await s("Type text",async()=>{const e=n.getByPlaceholderText(/quick add/i);await l.type(e,"Test task"),o(e).toHaveValue("Test task")}),await s("Clear with Escape",async()=>{await l.keyboard("{Escape}"),await u(100)})}},F={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=g(r);await s("Tab to input and verify focus",async()=>{await u(100);const e=n.getByPlaceholderText(/quick add/i);await l.click(e),await u(50),o(e).toHaveFocus()})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default()
  }
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      }
    }
  }
}`,...y.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      settingButtonOnInputBar: false
    }
  }
}`,...w.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      tagsFilterOnInputBar: false
    }
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      categoriesFilterOnInputBar: false
    }
  }
}`,...f.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.minimalUI()
  }
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sortOnInputBar: false
    }
  }
}`,...S.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.minimalUI(),
      sortOnInputBar: false
    }
  }
}`,...h.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...I.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      enableVoiceInput: true,
      voiceProvider: "browser"
    }
  }
}`,...k.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withVoiceInput(),
    voiceRuntime: {
      browserSpeechSupported: false
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Voice button says to choose another provider", async () => {
      const voiceButton = canvas.getByRole("button", {
        name: "Start voice input"
      });
      await expect(voiceButton).toHaveAttribute("title", BROWSER_SPEECH_UNAVAILABLE_MESSAGE);
    });
    await step("Clicking does not start listening", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Start voice input"
      }));
      await delay(100);
      await expect(canvas.getByRole("button", {
        name: "Start voice input"
      })).toHaveAttribute("aria-pressed", "false");
    });
  }
}`,...A.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    isAiMode: true
  }
}`,...E.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Type task title", async () => {
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.type(input, "Buy groceries");
      await delay(100);
      expect(input).toHaveValue("Buy groceries");
    });
    await step("Submit task with Enter", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(500);
      // Re-query input to get fresh value after potential re-render
      const updatedInput = canvas.getByPlaceholderText(/quick add/i);
      // Input should be cleared after submission
      expect(updatedInput).toHaveValue("");
    });
  }
}`,...b.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Find AI toggle button", async () => {
      // Look for AI mode toggle
      const aiButton = canvas.getByRole("button", {
        name: /ai/i
      });
      expect(aiButton).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Type text", async () => {
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.type(input, "Test task");
      expect(input).toHaveValue("Test task");
    });
    await step("Clear with Escape", async () => {
      await userEvent.keyboard("{Escape}");
      await delay(100);
      // Verify input behavior
    });
  }
}`,...x.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default()
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Tab to input and verify focus", async () => {
      await delay(100);
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.click(input);
      await delay(50);
      expect(input).toHaveFocus();
    });
  }
}`,...F.parameters?.docs?.source}}};const Be=["Default","WithoutAI","WithoutSetting","WithoutTagsFilter","WithoutCategoryFilter","WithoutAllFilter","WithoutSort","WithoutAllFilterAndSort","DarkMode","WithVoiceInput","VoiceInputBrowserUnsupported","AIMode","SubmitNewTask","ToggleAIMode","TypeAndClear","FocusInput"];export{E as AIMode,I as DarkMode,m as Default,F as FocusInput,b as SubmitNewTask,T as ToggleAIMode,x as TypeAndClear,A as VoiceInputBrowserUnsupported,k as WithVoiceInput,y as WithoutAI,B as WithoutAllFilter,h as WithoutAllFilterAndSort,f as WithoutCategoryFilter,w as WithoutSetting,S as WithoutSort,v as WithoutTagsFilter,Be as __namedExportsOrder,fe as default};
