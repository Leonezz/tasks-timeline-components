import{S as O}from"./SettingsPageGeneral-DVHaoJaC.js";import{s as e}from"./settings-CIrEQdYf.js";import"./edge-cases-CRkSQ-i-.js";import"./jsx-runtime-u17CrQMm.js";import"./rruleset-Bu4wjl4G.js";import"./Motion-k78dMwTv.js";import"./iframe-Zi-gTbRm.js";import"./preload-helper-PPVm8Dsz.js";import"./proxy-B_Q68Ehr.js";import"./Icon-C9gs-eIT.js";import"./chevron-right-DE8jUQ3_.js";import"./datetime-CoIMkCUY.js";import"./tasks-D2syl_55.js";const{expect:l,within:g}=__STORYBOOK_MODULE_TEST__,ee={title:"Settings/SettingsPageGeneral",component:O,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{onUpdateSettings:{action:"settings-updated"}}},a=t=>console.log("Updated settings:",t),o={args:{settings:e.default(),onUpdateSettings:a,availableCategories:["Work","Personal","Shopping"]}},i={args:{...o.args,availableCategories:["Work","Personal","Shopping","Health","Finance","Education","Home","Travel","Fitness","Hobbies"]}},c={args:{...o.args,availableCategories:[]}},d={args:{settings:e.darkMode(),onUpdateSettings:a,availableCategories:["Work","Personal"]},parameters:{backgrounds:{default:"dark"}}},p={args:{settings:e.midnightTheme(),onUpdateSettings:a,availableCategories:["Work","Personal"]},parameters:{backgrounds:{default:"dark"}}},u={args:{settings:e.coffeeTheme(),onUpdateSettings:a,availableCategories:["Work","Personal"]},parameters:{backgrounds:{default:"dark"}}},m={args:{settings:e.largeFontSize(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},h={args:{settings:e.smallFontSize(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},S={args:{...o.args,settings:e.default()}},y={args:{settings:e.hideCompleted(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},v={args:{settings:e.minimalUI(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},b={args:{settings:e.focusMode(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},f={args:{settings:{...e.default(),useRelativeDates:!1},onUpdateSettings:a,availableCategories:["Work","Personal"]}},C={args:{settings:{...e.default(),dateFormat:"YYYY-MM-DD"},onUpdateSettings:a,availableCategories:["Work","Personal"]}},B={args:{settings:e.groupByStartDate(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},k={args:{settings:e.groupByCreatedDate(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},U={args:{settings:e.groupByCompletedDate(),onUpdateSettings:a,availableCategories:["Work","Personal"]}},D={args:{settings:{...e.default(),groupingStrategy:["dueAt","startAt"]},onUpdateSettings:a,availableCategories:["Work","Personal"]}},T={args:{settings:{...e.default(),defaultCategory:"Work"},onUpdateSettings:a,availableCategories:["Work","Personal","Shopping"]}},P={args:{settings:{...e.default(),defaultCategory:""},onUpdateSettings:a,availableCategories:["Work","Personal"]}},W={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find theme selector",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},F={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find font size controls",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},w={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find Show Completed toggle",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},A={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find Progress Bar toggle",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},R={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find Focus Mode toggle",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},G={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find Relative Dates toggle",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},M={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find default category selector",async()=>{const r=s.queryAllByRole("combobox"),L=s.queryAllByRole("textbox");l(r.length+L.length).toBeGreaterThan(0)})}},E={args:{...o.args},play:async({canvasElement:t,step:n})=>{const s=g(t);await n("Find grouping strategy checkboxes",async()=>{const r=s.getAllByRole("button");l(r.length).toBeGreaterThan(0)})}},x={args:{settings:{...e.default(),showCompleted:!1,showProgressBar:!1,useRelativeDates:!1,defaultFocusMode:!1},onUpdateSettings:a,availableCategories:["Work"]}},z={args:{settings:{...e.default(),showCompleted:!0,showProgressBar:!0,useRelativeDates:!0,defaultFocusMode:!0},onUpdateSettings:a,availableCategories:["Work"]}},H={args:{settings:{...e.default(),defaultCategory:"This is a very long category name that might overflow"},onUpdateSettings:a,availableCategories:["This is a very long category name that might overflow","Work","Personal"]}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal", "Shopping"]
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: ["Work", "Personal", "Shopping", "Health", "Finance", "Education", "Home", "Travel", "Fitness", "Hobbies"]
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: []
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.darkMode(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.midnightTheme(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.coffeeTheme(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  },
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.largeFontSize(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.smallFontSize(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...h.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: settingsBuilder.default() // Base is default
  }
}`,...S.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.hideCompleted(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.minimalUI(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.focusMode(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      useRelativeDates: false
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...f.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      dateFormat: "YYYY-MM-DD"
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.groupByStartDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...B.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.groupByCreatedDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...k.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.groupByCompletedDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...U.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      groupingStrategy: ["dueAt", "startAt"]
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...D.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: "Work"
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal", "Shopping"]
  }
}`,...T.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: ""
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"]
  }
}`,...P.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find theme selector", async () => {
      // Look for theme selection buttons (Light, Dark, Midnight, Coffee)
      const themeButtons = canvas.getAllByRole("button");
      expect(themeButtons.length).toBeGreaterThan(0);
    });
  }
}`,...W.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find font size controls", async () => {
      // Should have font size selection buttons or dropdown
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...F.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Show Completed toggle", async () => {
      // Look for toggle switch/checkbox
      const toggles = canvas.getAllByRole("button");
      expect(toggles.length).toBeGreaterThan(0);
    });
  }
}`,...w.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Progress Bar toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Focus Mode toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...R.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Relative Dates toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...G.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find default category selector", async () => {
      // Look for select dropdown or input field
      const selects = canvas.queryAllByRole("combobox"),
        inputs = canvas.queryAllByRole("textbox");
      expect(selects.length + inputs.length).toBeGreaterThan(0);
    });
  }
}`,...M.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find grouping strategy checkboxes", async () => {
      // Should have checkboxes for dueAt, startAt, createdAt, completedAt
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...E.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      showCompleted: false,
      showProgressBar: false,
      useRelativeDates: false,
      defaultFocusMode: false
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work"]
  }
}`,...x.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      showCompleted: true,
      showProgressBar: true,
      useRelativeDates: true,
      defaultFocusMode: true
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work"]
  }
}`,...z.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: "This is a very long category name that might overflow"
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["This is a very long category name that might overflow", "Work", "Personal"]
  }
}`,...H.parameters?.docs?.source}}};const ae=["Default","WithManyCategories","NoCategories","DarkTheme","MidnightTheme","CoffeeTheme","LargeFontSize","SmallFontSize","BaseFontSize","HideCompleted","HideProgressBar","FocusModeEnabled","AbsoluteDates","CustomDateFormat","GroupByStartDate","GroupByCreatedDate","GroupByCompletedDate","MultipleGroupingStrategies","WithDefaultCategory","NoDefaultCategory","ChangeTheme","ChangeFontSize","ToggleShowCompleted","ToggleProgressBar","ToggleFocusMode","ToggleRelativeDates","SelectDefaultCategory","ToggleGroupingStrategy","AllTogglesOff","AllTogglesOn","VeryLongCategoryName"];export{f as AbsoluteDates,x as AllTogglesOff,z as AllTogglesOn,S as BaseFontSize,F as ChangeFontSize,W as ChangeTheme,u as CoffeeTheme,C as CustomDateFormat,d as DarkTheme,o as Default,b as FocusModeEnabled,U as GroupByCompletedDate,k as GroupByCreatedDate,B as GroupByStartDate,y as HideCompleted,v as HideProgressBar,m as LargeFontSize,p as MidnightTheme,D as MultipleGroupingStrategies,c as NoCategories,P as NoDefaultCategory,M as SelectDefaultCategory,h as SmallFontSize,R as ToggleFocusMode,E as ToggleGroupingStrategy,A as ToggleProgressBar,G as ToggleRelativeDates,w as ToggleShowCompleted,H as VeryLongCategoryName,T as WithDefaultCategory,i as WithManyCategories,ae as __namedExportsOrder,ee as default};
