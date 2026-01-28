import{j as Q}from"./jsx-runtime-u17CrQMm.js";import{C as L}from"./CategoryPopover-DQO6iL5Q.js";import{A as M}from"./AppContext-D-Vr0qkG.js";import{t as r}from"./tasks-BV5_RF93.js";import"./edge-cases-Dobf_xol.js";import{w as p,d as o}from"./test-utils-BNouzmjp.js";import"./Icon-5YkzlUjT.js";import"./iframe-Cm6QGVzw.js";import"./preload-helper-PPVm8Dsz.js";import"./Motion-DbRBu1NO.js";import"./proxy-XOfmZ1UD.js";import"./index-BSO_abFL.js";import"./popover-BdNAdze1.js";import"./index-DCLFA_Bq.js";import"./index-Cx8h6MZ7.js";import"./index-Dx8Dkiul.js";const{expect:g,userEvent:s}=__STORYBOOK_MODULE_TEST__,oa={title:"UI/CategoryPopover",component:L,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onUpdate:{action:"task-updated"}},decorators:[n=>Q.jsx(M,{children:Q.jsx("div",{className:"p-4 bg-slate-50 min-w-[250px]",children:Q.jsx(n,{})})})]},c="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border font-medium",u=["Work","Personal","Shopping","Health","Finance"],i=n=>console.log("Updated task:",n),l={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:u,badgeClass:c}},m={args:{task:r.base({category:"Personal"}),onUpdate:i,availableCategories:u,badgeClass:c}},b={args:{task:r.base({category:"Shopping"}),onUpdate:i,availableCategories:u,badgeClass:c}},v={args:{task:r.base({category:void 0}),onUpdate:i,availableCategories:u,badgeClass:c}},w={args:{task:r.base({category:""}),onUpdate:i,availableCategories:u,badgeClass:c}},C={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:["Work","Personal","Shopping","Health","Finance","Education","Home","Travel","Fitness","Hobbies","Social","Family","Career","Projects","Ideas"],badgeClass:c}},h={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:["Work","Personal"],badgeClass:c}},k={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:[],badgeClass:c}},B={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:["Work"],badgeClass:c}},S={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open category selector popover",async()=>{const a=t.getByRole("button",{name:/Change Category/i});await s.click(a),await o(200)}),await e("Verify input field is visible and focused",async()=>{const a=t.getByPlaceholderText(/Category name/i);g(a).toBeInTheDocument(),g(a).toHaveValue("Work")}),await e("Verify suggestions are shown",async()=>{const a=t.getAllByRole("button");g(a.length).toBeGreaterThan(0)})}},E={args:{task:r.base({category:"Wor"}),onUpdate:i,availableCategories:u,badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Verify Work is suggested",async()=>{const a=t.getByPlaceholderText(/Category name/i);g(a).toHaveValue("Wor")})}},f={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:u,badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open category selector",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Clear existing value",async()=>{const a=t.getByPlaceholderText(/Category name/i);await s.clear(a),await o(100)}),await e("Type new category name",async()=>{const a=t.getByPlaceholderText(/Category name/i);await s.type(a,"New Category"),await o(100),g(a).toHaveValue("New Category")}),await e("Click Set button to save",async()=>{const a=t.getByRole("button",{name:/Set to "New Category"/i});await s.click(a),await o(100)})}},x={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:u,badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Click a suggested category",async()=>{const a=t.getAllByRole("button"),y=a.find(d=>d.textContent?.includes("Personal"));y&&(await s.click(y),await o(100))})}},U={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Type partial match",async()=>{const a=t.getByPlaceholderText(/Category name/i);await s.clear(a),await s.type(a,"Heal"),await o(100)}),await e("Verify only matching categories shown",async()=>{const a=t.getAllByRole("button"),y=a.find(d=>d.textContent?.includes("Health"));g(y).toBeDefined()})}},T={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Type new category",async()=>{const a=t.getByPlaceholderText(/Category name/i);await s.clear(a),await s.type(a,"Quick Entry"),await o(100)}),await e("Press Enter to save",async()=>{await s.keyboard("{Enter}"),await o(100)})}},P={args:{task:r.base({category:"Work"}),onUpdate:i,availableCategories:u,badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Clear category value",async()=>{const a=t.getByPlaceholderText(/Category name/i);await s.clear(a),await o(100)}),await e("Save empty category",async()=>{await s.keyboard("{Enter}"),await o(100)})}},W={args:{task:r.base({category:"This is a very long category name that might overflow"}),onUpdate:i,availableCategories:u,badgeClass:c}},A={args:{task:r.base({category:"Work/Personal 🏠"}),onUpdate:i,availableCategories:["Work/Personal 🏠","Shopping","Health"],badgeClass:c}},R={args:{task:r.base({category:"Q4 2024"}),onUpdate:i,availableCategories:["Q1 2024","Q2 2024","Q3 2024","Q4 2024"],badgeClass:c}},O={args:{task:r.base({category:"work"}),onUpdate:i,availableCategories:["Work","WORK","work","Personal"],badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Verify case-insensitive filtering",async()=>{const a=t.getByPlaceholderText(/Category name/i);g(a).toHaveValue("work")})}},H={args:{task:r.base({category:"A"}),onUpdate:i,availableCategories:["Art","Architecture","Astronomy","Athletics","Aviation","Agriculture","Archaeology","Anthropology"],badgeClass:c},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Verify max 5 suggestions shown",async()=>{const a=t.getAllByRole("button"),y=a.filter(d=>d.textContent?.match(/^[A-Z]/));g(y.length).toBeLessThanOrEqual(5)})}},V={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Tab to category button",async()=>{const a=t.getByRole("button");a.focus(),g(a).toHaveFocus()}),await e("Press Enter to open popover",async()=>{await s.keyboard("{Enter}"),await o(200);const a=t.getByPlaceholderText(/Category name/i);g(a).toBeInTheDocument()})}},N={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Open popover",async()=>{const a=t.getByRole("button");await s.click(a),await o(200)}),await e("Verify input is auto-focused",async()=>{const a=t.getByPlaceholderText(/Category name/i);g(a).toBeInTheDocument()})}},D={args:{...l.args},play:async({canvasElement:n,step:e})=>{const t=p(n);await e("Verify button has accessible title",async()=>{const a=t.getByRole("button",{name:/Change Category/i});g(a).toHaveAttribute("title","Change Category")})}},F={args:{...l.args,badgeClass:"flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"}},I={args:{...l.args,badgeClass:"flex gap-1 px-1 py-0.5 text-xs rounded"}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Personal"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...m.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Shopping"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: undefined
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...v.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: ""
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...w.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Work", "Personal", "Shopping", "Health", "Finance", "Education", "Home", "Travel", "Fitness", "Hobbies", "Social", "Family", "Career", "Projects", "Ideas"],
    badgeClass
  }
}`,...C.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Work", "Personal"],
    badgeClass
  }
}`,...h.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: [],
    badgeClass
  }
}`,...k.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Work"],
    badgeClass
  }
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open category selector popover", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Category/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify input field is visible and focused", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("Work");
    });
    await step("Verify suggestions are shown", async () => {
      // Should show categories that don't match current value
      const suggestions = canvas.getAllByRole("button");
      // At least the "Set to..." button should be present
      expect(suggestions.length).toBeGreaterThan(0);
    });
  }
}`,...S.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Wor"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify Work is suggested", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toHaveValue("Wor");
      // Should suggest "Work" as it matches
    });
  }
}`,...E.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open category selector", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Clear existing value", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await delay(100);
    });
    await step("Type new category name", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.type(input, "New Category");
      await delay(100);
      expect(input).toHaveValue("New Category");
    });
    await step("Click Set button to save", async () => {
      const setButton = canvas.getByRole("button", {
        name: /Set to "New Category"/i
      });
      await userEvent.click(setButton);
      await delay(100);
      // OnUpdate should be called with category: "New Category"
    });
  }
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Click a suggested category", async () => {
      const buttons = canvas.getAllByRole("button"),
        // Find Personal category button
        personalButton = buttons.find((btn: HTMLElement) => btn.textContent?.includes("Personal"));
      if (personalButton) {
        await userEvent.click(personalButton);
        await delay(100);
        // OnUpdate should be called with category: "Personal"
      }
    });
  }
}`,...x.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Type partial match", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await userEvent.type(input, "Heal");
      await delay(100);
    });
    await step("Verify only matching categories shown", async () => {
      // Should show "Health" in suggestions
      const buttons = canvas.getAllByRole("button"),
        healthButton = buttons.find((btn: HTMLElement) => btn.textContent?.includes("Health"));
      expect(healthButton).toBeDefined();
    });
  }
}`,...U.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Type new category", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await userEvent.type(input, "Quick Entry");
      await delay(100);
    });
    await step("Press Enter to save", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(100);
      // OnUpdate should be called with category: "Quick Entry"
    });
  }
}`,...T.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Clear category value", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await delay(100);
    });
    await step("Save empty category", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(100);
      // OnUpdate should be called with category: ""
    });
  }
}`,...P.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "This is a very long category name that might overflow"
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass
  }
}`,...W.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Work/Personal 🏠"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Work/Personal 🏠", "Shopping", "Health"],
    badgeClass
  }
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "Q4 2024"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    badgeClass
  }
}`,...R.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "work"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Work", "WORK", "work", "Personal"],
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify case-insensitive filtering", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toHaveValue("work");
      // Should filter out exact match "work" but show "Work" and "WORK"
    });
  }
}`,...O.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      category: "A"
    }),
    onUpdate: handleUpdate,
    availableCategories: ["Art", "Architecture", "Astronomy", "Athletics", "Aviation", "Agriculture", "Archaeology", "Anthropology"],
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify max 5 suggestions shown", async () => {
      const buttons = canvas.getAllByRole("button"),
        // Count buttons that are category suggestions (excluding "Set to..." button)
        suggestionButtons = buttons.filter((btn: HTMLElement) => btn.textContent?.match(/^[A-Z]/));
      expect(suggestionButtons.length).toBeLessThanOrEqual(5);
    });
  }
}`,...H.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Tab to category button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toBeInTheDocument();
    });
  }
}`,...V.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify input is auto-focused", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      // Input should have autoFocus attribute
      expect(input).toBeInTheDocument();
    });
  }
}`,...N.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Category/i
      });
      expect(button).toHaveAttribute("title", "Change Category");
    });
  }
}`,...D.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    badgeClass: "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"
  }
}`,...F.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded"
  }
}`,...I.parameters?.docs?.source}}};const ra=["Default","PersonalCategory","ShoppingCategory","NoCategory","EmptyCategory","ManyCategories","FewCategories","NoAvailableCategories","SingleCategoryAvailable","PopoverOpen","PopoverWithSuggestions","TypeNewCategory","SelectSuggestion","FilterSuggestions","EnterToSave","ClearCategory","VeryLongCategoryName","SpecialCharactersInCategory","NumbersInCategory","CaseSensitiveSuggestions","MaxSuggestionsLimit","KeyboardNavigation","AutoFocusInput","AriaLabels","CustomBadgeClass","MinimalBadgeClass"];export{D as AriaLabels,N as AutoFocusInput,O as CaseSensitiveSuggestions,P as ClearCategory,F as CustomBadgeClass,l as Default,w as EmptyCategory,T as EnterToSave,h as FewCategories,U as FilterSuggestions,V as KeyboardNavigation,C as ManyCategories,H as MaxSuggestionsLimit,I as MinimalBadgeClass,k as NoAvailableCategories,v as NoCategory,R as NumbersInCategory,m as PersonalCategory,S as PopoverOpen,E as PopoverWithSuggestions,x as SelectSuggestion,b as ShoppingCategory,B as SingleCategoryAvailable,A as SpecialCharactersInCategory,f as TypeNewCategory,W as VeryLongCategoryName,ra as __namedExportsOrder,oa as default};
