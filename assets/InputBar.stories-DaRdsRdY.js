import{j as c}from"./jsx-runtime-u17CrQMm.js";import{r as u}from"./iframe-BGtqOInk.js";import{I as U}from"./InputBar-BHIS8_OU.js";import{T as _,S as j}from"./SettingsContext-DkX_1huq.js";import{A as R}from"./AppContext-MBozJVKD.js";import{D as N}from"./datetime-CoIMkCUY.js";import{s as t}from"./settings-CvAGLwBv.js";import"./edge-cases-CRkSQ-i-.js";import{w as b,d as l}from"./test-utils-BNouzmjp.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-B2foTpRx.js";import"./chevron-right-BYj65MRz.js";import"./rruleset-Bu4wjl4G.js";import"./useVoiceInput-CjoFeMCS.js";import"./logger-CDMKXnH4.js";import"./Motion-BTKb_TxN.js";import"./proxy-DEXR2x0b.js";import"./popover-CH-wF0B1.js";import"./index-gL42gEsK.js";import"./index-DSbOtjD6.js";import"./index-DXBVteFj.js";import"./tasks-D2syl_55.js";const{expect:d,userEvent:p}=__STORYBOOK_MODULE_TEST__,pe={title:"Core/InputBar",component:U,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[(r,s)=>{const[n,a]=u.useState([]),[F,O]=u.useState(!1),[M,C]=u.useState(s.args.isAiMode||!1),[W,V]=u.useState({tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}),[P,D]=u.useState({field:"dueAt",direction:"asc",script:""}),q={tasks:n,availableCategories:["Work","Personal","Shopping"],availableTags:["work","personal","urgent"],onUpdateTask:e=>{a(o=>o.map(i=>i.id===e.id?e:i)),console.log("Update task:",e)},onDeleteTask:e=>{a(o=>o.filter(i=>i.id!==e)),console.log("Delete task:",e)},onAddTask:e=>{const o={id:`task-${Date.now()}`,title:e.title||"New Task",status:"todo",priority:"medium",createdAt:N.now().toISO(),...e};a(i=>[...i,o]),console.log("Add task:",o)},onEditTask:e=>console.log("Edit task:",e),onAICommand:async e=>console.log("AI command:",e)},H={settings:s.args.settings||t.default(),updateSettings:e=>console.log("Update settings:",e),isFocusMode:F,toggleFocusMode:()=>O(!F),isAiMode:M,toggleAiMode:()=>C(!M),filters:W,onFilterChange:V,sort:P,onSortChange:D,onVoiceError:e=>console.error("Voice error:",e),onOpenSettings:()=>console.log("Open settings")};return c.jsx(R,{children:c.jsx(_,{value:q,children:c.jsx(j,{value:H,children:c.jsx("div",{className:"w-full max-w-2xl mx-auto p-4",children:c.jsx(r,{})})})})})}]},g={args:{settings:t.default()}},m={args:{settings:{...t.default(),aiConfig:{...t.default().aiConfig,enabled:!1}}}},y={args:{settings:{...t.default(),settingButtonOnInputBar:!1}}},f={args:{settings:{...t.default(),tagsFilterOnInputBar:!1}}},w={args:{settings:{...t.default(),categoriesFilterOnInputBar:!1}}},h={args:{settings:t.minimalUI()}},v={args:{settings:{...t.default(),sortOnInputBar:!1}}},B={args:{settings:{...t.minimalUI(),sortOnInputBar:!1}}},k={args:{settings:t.darkMode()},parameters:{backgrounds:{default:"dark"}}},I={args:{settings:{...t.default(),enableVoiceInput:!0,voiceProvider:"browser"}}},S={args:{settings:t.withAI(),isAiMode:!0}},T={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=b(r);await s("Type task title",async()=>{const a=n.getByPlaceholderText(/quick add/i);await p.type(a,"Buy groceries"),await l(100),d(a).toHaveValue("Buy groceries")}),await s("Submit task with Enter",async()=>{await p.keyboard("{Enter}"),await l(500);const a=n.getByPlaceholderText(/quick add/i);d(a).toHaveValue("")})}},A={args:{settings:t.withAI()},play:async({canvasElement:r,step:s})=>{const n=b(r);await s("Find AI toggle button",async()=>{const a=n.getByRole("button",{name:/ai/i});d(a).toBeInTheDocument()})}},x={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=b(r);await s("Type text",async()=>{const a=n.getByPlaceholderText(/quick add/i);await p.type(a,"Test task"),d(a).toHaveValue("Test task")}),await s("Clear with Escape",async()=>{await p.keyboard("{Escape}"),await l(100)})}},E={args:{settings:t.default()},play:async({canvasElement:r,step:s})=>{const n=b(r);await s("Tab to input and verify focus",async()=>{await l(100);const a=n.getByPlaceholderText(/quick add/i);await p.click(a),await l(50),d(a).toHaveFocus()})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default()
  }
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      }
    }
  }
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      settingButtonOnInputBar: false
    }
  }
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      tagsFilterOnInputBar: false
    }
  }
}`,...f.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      categoriesFilterOnInputBar: false
    }
  }
}`,...w.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.minimalUI()
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sortOnInputBar: false
    }
  }
}`,...v.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.minimalUI(),
      sortOnInputBar: false
    }
  }
}`,...B.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.darkMode()
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...k.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      enableVoiceInput: true,
      voiceProvider: "browser"
    }
  }
}`,...I.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    isAiMode: true
  }
}`,...S.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};const ge=["Default","WithoutAI","WithoutSetting","WithoutTagsFilter","WithoutCategoryFilter","WithoutAllFilter","WithoutSort","WithoutAllFilterAndSort","DarkMode","WithVoiceInput","AIMode","SubmitNewTask","ToggleAIMode","TypeAndClear","FocusInput"];export{S as AIMode,k as DarkMode,g as Default,E as FocusInput,T as SubmitNewTask,A as ToggleAIMode,x as TypeAndClear,I as WithVoiceInput,m as WithoutAI,h as WithoutAllFilter,B as WithoutAllFilterAndSort,w as WithoutCategoryFilter,y as WithoutSetting,v as WithoutSort,f as WithoutTagsFilter,ge as __namedExportsOrder,pe as default};
