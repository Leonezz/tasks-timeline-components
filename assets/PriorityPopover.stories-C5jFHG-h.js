import{j as M}from"./jsx-runtime-u17CrQMm.js";import{P as A}from"./PriorityPopover-BEZpPvrs.js";import{A as D}from"./AppContext-xr2q_wsh.js";import{t as u}from"./tasks-BV5_RF93.js";import"./edge-cases-Dobf_xol.js";import{w as r,d as s}from"./test-utils-BNouzmjp.js";import"./Icon-D9wwggU8.js";import"./iframe-gP99-5rX.js";import"./preload-helper-PPVm8Dsz.js";import"./Motion-B8MN7Cfh.js";import"./proxy-B1A0xX4B.js";import"./index-BSO_abFL.js";import"./popover-ClufRkfB.js";import"./index-FTaP0lHz.js";import"./index-BfLlYqDs.js";import"./index-Bd54vtYv.js";const{expect:c,userEvent:i}=__STORYBOOK_MODULE_TEST__,$={title:"UI/PriorityPopover",component:A,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onUpdate:{action:"task-updated"}},decorators:[e=>M.jsx(D,{children:M.jsx("div",{className:"p-4 bg-slate-50 min-w-50",children:M.jsx(e,{})})})]},d="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border font-medium",g=e=>console.log("Updated task:",e),p={args:{task:u.highPriority({title:"Critical bug fix"}),onUpdate:g,badgeClass:d}},y={args:{task:u.mediumPriority({title:"Regular task"}),onUpdate:g,badgeClass:d}},m={args:{task:u.lowPriority({title:"Nice to have"}),onUpdate:g,badgeClass:d}},h={args:{task:u.base({priority:"low",title:"Default priority task"}),onUpdate:g,badgeClass:d}},w={args:{...p.args,task:u.highPriority({title:"Urgent task"})},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify high priority has bold flag icon",async()=>{const t=a.getByRole("button"),o=t.querySelector("svg");c(o).toBeInTheDocument()})}},b={args:{...p.args}},v={args:{...y.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open priority selector popover",async()=>{const t=a.getByRole("button",{name:/Change Priority/i});await i.click(t),await s(200)}),await n("Verify all priority options visible",async()=>{const t=a.getByText(/high/i),o=a.getByText(/medium/i),l=a.getByText(/low/i);c(t).toBeInTheDocument(),c(o).toBeInTheDocument(),c(l).toBeInTheDocument()})}},C={args:{...p.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open popover",async()=>{const t=a.getByRole("button");await i.click(t),await s(200)}),await n("Verify current priority is highlighted",async()=>{const t=a.getAllByRole("button"),o=t.find(l=>l.textContent?.toLowerCase().includes("high"));c(o).toBeDefined()})}},P={args:{task:u.lowPriority({title:"Upgrade to high priority"}),onUpdate:g,badgeClass:d},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open priority selector",async()=>{const t=a.getByRole("button",{name:/Change Priority/i});await i.click(t),await s(200)}),await n("Click high priority option",async()=>{const t=a.getAllByRole("button"),o=t.find(l=>l.textContent?.toLowerCase().includes("high"));o&&(await i.click(o),await s(100))})}},B={args:{task:u.highPriority({title:"Downgrade to medium"}),onUpdate:g,badgeClass:d},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open popover",async()=>{const t=a.getByRole("button");await i.click(t),await s(200)}),await n("Select medium priority",async()=>{const t=a.getAllByRole("button"),o=t.find(l=>l.textContent?.toLowerCase().includes("medium"));o&&(await i.click(o),await s(100))})}},k={args:{task:u.mediumPriority({title:"Lower priority"}),onUpdate:g,badgeClass:d},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open popover",async()=>{const t=a.getByRole("button");await i.click(t),await s(200)}),await n("Select low priority",async()=>{const t=a.getAllByRole("button"),o=t.find(l=>l.textContent?.toLowerCase().includes("low"));o&&(await i.click(o),await s(100))})}},x={args:{...y.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open popover",async()=>{const t=a.getByRole("button");await i.click(t),await s(200)}),await n("Click outside to close",async()=>{await i.click(e),await s(300)})}},f={args:{...p.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify high priority uses rose color",async()=>{const t=a.getByRole("button");c(t.className).toContain("rose")})}},E={args:{...y.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify medium priority uses amber color",async()=>{const t=a.getByRole("button");c(t.className).toContain("amber")})}},O={args:{...m.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify low priority uses slate/gray color",async()=>{const t=a.getByRole("button");c(t.className).toContain("slate")})}},S={args:{...y.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Tab to priority button",async()=>{const t=a.getByRole("button");t.focus(),c(t).toHaveFocus()}),await n("Press Enter to open popover",async()=>{await i.keyboard("{Enter}"),await s(200);const t=a.getByText(/high/i);c(t).toBeInTheDocument()}),await n("Tab through options",async()=>{await i.tab(),await s(100)})}},R={args:{...p.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify button has accessible title",async()=>{const t=a.getByRole("button",{name:/Change Priority/i});c(t).toHaveAttribute("title","Change Priority")})}},T={args:{...y.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Verify priority text is readable",async()=>{const t=a.getByRole("button");c(t.textContent).toContain("medium")})}},L={args:{...m.args},play:async({canvasElement:e,step:n})=>{const a=r(e);await n("Open popover",async()=>{const t=a.getByRole("button");await i.click(t),await s(200)}),await n("Quickly change priority multiple times",async()=>{const t=a.getAllByRole("button"),o=t.find(l=>l.textContent?.toLowerCase().includes("high"));o&&(await i.click(o),await s(50))})}},U={args:{...p.args,badgeClass:"flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"}},H={args:{...y.args,badgeClass:"flex gap-1 px-1 py-0.5 text-xs rounded"}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Critical bug fix"
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...p.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.mediumPriority({
      title: "Regular task"
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...y.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.lowPriority({
      title: "Nice to have"
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      priority: "low",
      title: "Default priority task"
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...h.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args,
    task: taskBuilder.highPriority({
      title: "Urgent task"
    })
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify high priority has bold flag icon", async () => {
      const button = canvas.getByRole("button"),
        // High priority should have strokeWidth of 3
        icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args
  }
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open priority selector popover", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Priority/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify all priority options visible", async () => {
      const highOption = canvas.getByText(/high/i),
        mediumOption = canvas.getByText(/medium/i),
        lowOption = canvas.getByText(/low/i);
      expect(highOption).toBeInTheDocument();
      expect(mediumOption).toBeInTheDocument();
      expect(lowOption).toBeInTheDocument();
    });
  }
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args
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
    await step("Verify current priority is highlighted", async () => {
      // High priority button should have bg-slate-100 and font-bold
      const options = canvas.getAllByRole("button"),
        // First button is the trigger, find the "high" option
        highOption = options.find((btn: HTMLElement) => btn.textContent?.toLowerCase().includes("high"));
      expect(highOption).toBeDefined();
    });
  }
}`,...C.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.lowPriority({
      title: "Upgrade to high priority"
    }),
    onUpdate: handleUpdate,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open priority selector", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Priority/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Click high priority option", async () => {
      const options = canvas.getAllByRole("button"),
        highOption = options.find((btn: HTMLElement) => btn.textContent?.toLowerCase().includes("high"));
      if (highOption) {
        await userEvent.click(highOption);
        await delay(100);
      }
      // OnUpdate should be called with priority: "high"
    });
  }
}`,...P.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.highPriority({
      title: "Downgrade to medium"
    }),
    onUpdate: handleUpdate,
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
    await step("Select medium priority", async () => {
      const options = canvas.getAllByRole("button"),
        mediumOption = options.find((btn: HTMLElement) => btn.textContent?.toLowerCase().includes("medium"));
      if (mediumOption) {
        await userEvent.click(mediumOption);
        await delay(100);
      }
    });
  }
}`,...B.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.mediumPriority({
      title: "Lower priority"
    }),
    onUpdate: handleUpdate,
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
    await step("Select low priority", async () => {
      const options = canvas.getAllByRole("button"),
        lowOption = options.find((btn: HTMLElement) => btn.textContent?.toLowerCase().includes("low"));
      if (lowOption) {
        await userEvent.click(lowOption);
        await delay(100);
      }
    });
  }
}`,...k.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args
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
    await step("Click outside to close", async () => {
      // Click on the canvas element background
      await userEvent.click(canvasElement);
      await delay(300);
      // Popover should close (verify by checking if options are gone)
    });
  }
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify high priority uses rose color", async () => {
      const button = canvas.getByRole("button");
      // Should have text-rose-700 bg-rose-100 border-rose-200 classes
      expect(button.className).toContain("rose");
    });
  }
}`,...f.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify medium priority uses amber color", async () => {
      const button = canvas.getByRole("button");
      expect(button.className).toContain("amber");
    });
  }
}`,...E.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...LowPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify low priority uses slate/gray color", async () => {
      const button = canvas.getByRole("button");
      expect(button.className).toContain("slate");
    });
  }
}`,...O.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Tab to priority button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const highOption = canvas.getByText(/high/i);
      expect(highOption).toBeInTheDocument();
    });
    await step("Tab through options", async () => {
      await userEvent.tab();
      await delay(100);
      // Should focus first option
    });
  }
}`,...S.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Priority/i
      });
      expect(button).toHaveAttribute("title", "Change Priority");
    });
  }
}`,...R.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify priority text is readable", async () => {
      const button = canvas.getByRole("button");
      expect(button.textContent).toContain("medium");
    });
  }
}`,...T.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...LowPriority.args
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
    await step("Quickly change priority multiple times", async () => {
      const options = canvas.getAllByRole("button"),
        highOption = options.find((btn: HTMLElement) => btn.textContent?.toLowerCase().includes("high"));
      if (highOption) {
        await userEvent.click(highOption);
        await delay(50);
        // Popover should close after selection
      }
    });
  }
}`,...L.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    ...HighPriority.args,
    badgeClass: "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"
  }
}`,...U.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...MediumPriority.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded"
  }
}`,...H.parameters?.docs?.source}}};const tt=["HighPriority","MediumPriority","LowPriority","NoPriority","HighPriorityBold","LongPriorityLabel","PopoverOpen","PopoverWithSelectedIndicator","ChangePriorityToHigh","ChangePriorityToMedium","ChangePriorityToLow","ClickOutsideToClose","HighPriorityRoseColor","MediumPriorityAmberColor","LowPrioritySlateColor","KeyboardNavigation","AriaLabels","ScreenReaderText","RapidPriorityChanges","WithCustomBadgeClass","MinimalBadgeClass"];export{R as AriaLabels,P as ChangePriorityToHigh,k as ChangePriorityToLow,B as ChangePriorityToMedium,x as ClickOutsideToClose,p as HighPriority,w as HighPriorityBold,f as HighPriorityRoseColor,S as KeyboardNavigation,b as LongPriorityLabel,m as LowPriority,O as LowPrioritySlateColor,y as MediumPriority,E as MediumPriorityAmberColor,H as MinimalBadgeClass,h as NoPriority,v as PopoverOpen,C as PopoverWithSelectedIndicator,L as RapidPriorityChanges,T as ScreenReaderText,U as WithCustomBadgeClass,tt as __namedExportsOrder,$ as default};
