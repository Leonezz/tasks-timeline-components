import{j as y}from"./jsx-runtime-u17CrQMm.js";import{r as j}from"./iframe-C21N2aj2.js";import{D as c}from"./recurrence-B2fS74Tu.js";import{A as I}from"./AppContext-BGpZXZLM.js";import{C as N}from"./calendar-CzXhjbeg.js";import{c as O,e as u}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./tslib.es6-C44cpxNM.js";import"./index-B7dtx8Vx.js";import"./usePortalContainer-BOxnJgF2.js";import"./button-B7wt63wB.js";import"./chevron-right-CdDqbhPo.js";const{expect:t,fn:M,userEvent:i,waitFor:L,within:d}=__STORYBOOK_MODULE_TEST__,ae={title:"UI/Calendar",component:N,parameters:{layout:"centered",a11y:{test:"error"}},tags:["autodocs"]},m=({selected:e,onSelect:o,...n})=>{const[r,a]=j.useState(e);return y.jsx(N,{...n,selected:r,onSelect:s=>{a(s),o?.(s)}})},g=e=>e.setLocale("en-US").toFormat("cccc, LLLL d, yyyy"),C=e=>e.setLocale("en-US").toFormat("LLLL yyyy"),h=e=>d(e).getAllByRole("gridcell").filter(o=>o.tabIndex>=0),v={render:e=>y.jsx(m,{...e}),args:{mode:"single"}},A={render:e=>y.jsx(m,{...e}),args:{mode:"single",selected:new Date(2026,2,10),initialFocus:!0,onSelect:M()},play:async({args:e,canvasElement:o,step:n})=>{const r=d(o),a=async w=>{const p=r.getByRole("gridcell",{name:g(w)});await L(()=>t(p).toHaveFocus()),t(h(o)).toEqual([p]),t(r.getByRole("grid",{name:C(w)})).toBeInTheDocument()},s=w=>i.keyboard(w);await n("The selected day is the only Tab stop",async()=>{const w=r.getByRole("gridcell",{name:"Tuesday, March 10, 2026"});t(w).toHaveAttribute("aria-selected","true"),t(h(o)).toEqual([w])}),await n("initialFocus focuses it as the calendar opens",async()=>{await a(c.local(2026,3,10))}),await n("Arrow keys move by a day and by a week",async()=>{await s("{ArrowRight}"),await a(c.local(2026,3,11)),await s("{ArrowDown}"),await a(c.local(2026,3,18)),await s("{ArrowLeft}"),await a(c.local(2026,3,17)),await s("{ArrowUp}"),await a(c.local(2026,3,10))}),await n("Home and End go to the start and end of the week",async()=>{await s("{Home}"),await a(c.local(2026,3,8)),await s("{End}"),await a(c.local(2026,3,14))}),await n("Page Up and Page Down change the month",async()=>{await s("{PageDown}"),await a(c.local(2026,4,14)),await s("{PageUp}"),await a(c.local(2026,3,14))}),await n("With Shift they change the year",async()=>{await s("{Shift>}{PageDown}{/Shift}"),await a(c.local(2027,3,14)),await s("{Shift>}{PageUp}{/Shift}"),await a(c.local(2026,3,14))}),await n("Arrow keys cross into the next month and back",async()=>{await s("{ArrowDown}{ArrowDown}{ArrowRight}"),await a(c.local(2026,3,29)),await s("{ArrowDown}"),await a(c.local(2026,4,5)),await s("{ArrowUp}"),await a(c.local(2026,3,29))}),await n("...and into the previous month",async()=>{await s("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}"),await a(c.local(2026,3,1)),await s("{ArrowLeft}"),await a(c.local(2026,2,28))}),await n("Enter picks the focused day",async()=>{await s("{Enter}"),t(e.onSelect).toHaveBeenLastCalledWith(new Date(2026,1,28)),t(r.getByRole("gridcell",{name:"Saturday, February 28, 2026"})).toHaveAttribute("aria-selected","true")}),await n("So does Space",async()=>{await s("{ArrowRight}"),await a(c.local(2026,3,1)),await s(" "),t(e.onSelect).toHaveBeenLastCalledWith(new Date(2026,2,1)),t(r.getByRole("gridcell",{name:"Sunday, March 1, 2026"})).toHaveAttribute("aria-selected","true")})}},S={render:e=>y.jsx(m,{...e}),args:{mode:"single",selected:new Date(2026,2,10),initialFocus:!0,onSelect:M()},play:async({args:e,canvasElement:o,step:n})=>{const a=d(o).getByRole("gridcell",{name:"Tuesday, March 10, 2026"});await n("Enter on the selected day keeps it",async()=>{await L(()=>t(a).toHaveFocus()),await i.keyboard("{Enter}"),t(e.onSelect).toHaveBeenLastCalledWith(new Date(2026,2,10)),t(a).toHaveAttribute("aria-selected","true")}),await n("So does Space",async()=>{await i.keyboard(" "),t(e.onSelect).toHaveBeenLastCalledWith(new Date(2026,2,10)),t(a).toHaveAttribute("aria-selected","true")}),await n("Delete on another day clears nothing",async()=>{await i.keyboard("{ArrowRight}{Delete}{ArrowLeft}"),t(a).toHaveFocus(),t(e.onSelect).toHaveBeenLastCalledWith(new Date(2026,2,10)),t(a).toHaveAttribute("aria-selected","true")}),await n("Delete on the selected day clears it",async()=>{await i.keyboard("{Delete}"),t(e.onSelect).toHaveBeenLastCalledWith(void 0),t(a).not.toHaveAttribute("aria-selected")}),await n("So does Backspace",async()=>{await i.keyboard("{Enter}"),t(a).toHaveAttribute("aria-selected","true"),await i.keyboard("{Backspace}"),t(e.onSelect).toHaveBeenLastCalledWith(void 0),t(a).not.toHaveAttribute("aria-selected")}),await n("A click on the selected day still clears it",async()=>{await i.click(a),t(a).toHaveAttribute("aria-selected","true"),await i.click(a),t(e.onSelect).toHaveBeenLastCalledWith(void 0),t(a).not.toHaveAttribute("aria-selected")})}},x={render:e=>y.jsx(m,{...e}),args:{mode:"single",selected:new Date(2026,2,31)},play:async({canvasElement:e})=>{const o=d(e),n=a=>o.getByRole("gridcell",{name:a});await i.click(n("Wednesday, April 1, 2026")),t(o.getByRole("grid",{name:"April 2026"})).toBeInTheDocument();const r=n("Wednesday, April 1, 2026");t(r).toHaveAttribute("aria-selected","true"),t(h(e)).toEqual([r]),await L(()=>t(r).toHaveFocus()),await i.keyboard("{ArrowRight}"),t(n("Thursday, April 2, 2026")).toHaveFocus()}},b={render:e=>y.jsx(m,{...e}),args:{mode:"single"},play:async({canvasElement:e,step:o})=>{const n=d(e),r=c.now();await o("Today, in the current month",async()=>{t(h(e)).toEqual([n.getByRole("gridcell",{name:g(r)})])}),await o("The 1st, in another month",async()=>{await i.click(n.getByRole("button",{name:"Next month"}));const a=r.plus({months:1}).startOf("month");t(n.getByRole("grid",{name:C(a)})).toBeInTheDocument(),t(h(e)).toEqual([n.getByRole("gridcell",{name:g(a)})])})}},D={render:e=>y.jsx(m,{...e}),args:{mode:"single",selected:new Date(2020,2,10)},play:async({canvasElement:e})=>{const o=d(e);await i.click(o.getByRole("button",{name:"Next month"})),t(o.getByRole("grid",{name:"April 2020"})).toBeInTheDocument(),t(h(e)).toEqual([o.getByRole("gridcell",{name:"Wednesday, April 1, 2020"})])}},B={render:e=>y.jsx(m,{...e}),args:{mode:"single",selected:new Date(2026,2,10)},play:async({canvasElement:e})=>{const o=d(e).getByRole("grid",{name:"March 2026"}),n=d(o).getAllByRole("row"),r=d(n[0]).getAllByRole("columnheader");t(r.map(a=>a.getAttribute("aria-label"))).toEqual(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]),t(n).toHaveLength(6);for(const a of n.slice(1))t(d(a).getAllByRole("gridcell")).toHaveLength(7)}},F=e=>c.fromFormat(e.getAttribute("aria-label")??"","cccc, LLLL d, yyyy",{locale:"en-US"}),U=()=>{const e=c.now().startOf("day");return e.set({day:e.day===1?2:1})},R=e=>({render:o=>y.jsx(m,{...o,selected:U().toJSDate()}),args:{mode:"single"},decorators:[o=>y.jsx(I,{theme:e,children:y.jsx(o,{})})],play:async({canvasElement:o,step:n})=>{const r=d(o),a=c.now(),s=()=>r.getAllByRole("gridcell"),w=l=>F(l).hasSame(a,"month"),p=s().find(l=>w(l)&&!F(l).hasSame(a,"day")&&l.getAttribute("aria-selected")!=="true");if(!p)throw new Error("No day of the month is neither today nor selected");const q=O(p);await n("Days of the month meet WCAG AA (4.5:1)",async()=>{await u(p)}),await n("Today meets AA",async()=>{await u(r.getByRole("gridcell",{name:g(a)}))}),await n("The selected day meets AA",async()=>{const l=r.getByRole("gridcell",{name:g(U())});t(l).toHaveAttribute("aria-selected","true"),await u(l)}),await n("Days of other months are muted but meet AA",async()=>{const l=s().every(w);l&&await i.click(r.getByRole("button",{name:"Next month"}));const W=l?a.plus({months:1}):a,H=s().find(P=>!F(P).hasSame(W,"month"));if(!H)throw new Error(`No day outside ${C(W)} is shown`);await u(H),t(O(H)).toBeLessThan(q),l&&await i.click(r.getByRole("button",{name:"Previous month"}))}),await n("Weekday names and the Today button meet AA",async()=>{for(const l of r.getAllByRole("columnheader"))await u(l);await u(r.getByRole("button",{name:"Today"}))})}}),T=R("light"),f=R("dark"),k=R("midnight"),E=R("coffee");v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single"
  }
}`,...v.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 10),
    initialFocus: true,
    onSelect: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    /** Expects focus, and the only tab stop, on \`date\`, shown in its month. */
    const expectFocusOn = async (date: DateTime) => {
      const day = canvas.getByRole("gridcell", {
        name: dayName(date)
      });
      await waitFor(() => expect(day).toHaveFocus());
      expect(tabStops(canvasElement)).toEqual([day]);
      expect(canvas.getByRole("grid", {
        name: monthName(date)
      })).toBeInTheDocument();
    };
    const press = (keys: string) => userEvent.keyboard(keys);
    await step("The selected day is the only Tab stop", async () => {
      const selected = canvas.getByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(tabStops(canvasElement)).toEqual([selected]);
    });
    await step("initialFocus focuses it as the calendar opens", async () => {
      await expectFocusOn(DateTime.local(2026, 3, 10));
    });
    await step("Arrow keys move by a day and by a week", async () => {
      await press("{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 11));
      await press("{ArrowDown}");
      await expectFocusOn(DateTime.local(2026, 3, 18));
      await press("{ArrowLeft}");
      await expectFocusOn(DateTime.local(2026, 3, 17));
      await press("{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 10));
    });
    await step("Home and End go to the start and end of the week", async () => {
      await press("{Home}");
      await expectFocusOn(DateTime.local(2026, 3, 8));
      await press("{End}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });
    await step("Page Up and Page Down change the month", async () => {
      await press("{PageDown}");
      await expectFocusOn(DateTime.local(2026, 4, 14));
      await press("{PageUp}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });
    await step("With Shift they change the year", async () => {
      await press("{Shift>}{PageDown}{/Shift}");
      await expectFocusOn(DateTime.local(2027, 3, 14));
      await press("{Shift>}{PageUp}{/Shift}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });
    await step("Arrow keys cross into the next month and back", async () => {
      await press("{ArrowDown}{ArrowDown}{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 29));
      await press("{ArrowDown}");
      await expectFocusOn(DateTime.local(2026, 4, 5));
      await press("{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 29));
    });
    await step("...and into the previous month", async () => {
      await press("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 1));
      await press("{ArrowLeft}");
      await expectFocusOn(DateTime.local(2026, 2, 28));
    });
    await step("Enter picks the focused day", async () => {
      await press("{Enter}");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 1, 28));
      expect(canvas.getByRole("gridcell", {
        name: "Saturday, February 28, 2026"
      })).toHaveAttribute("aria-selected", "true");
    });
    await step("So does Space", async () => {
      await press("{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 1));
      await press(" ");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
      expect(canvas.getByRole("gridcell", {
        name: "Sunday, March 1, 2026"
      })).toHaveAttribute("aria-selected", "true");
    });
  }
}`,...A.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 10),
    initialFocus: true,
    onSelect: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const day = canvas.getByRole("gridcell", {
      name: "Tuesday, March 10, 2026"
    });
    await step("Enter on the selected day keeps it", async () => {
      await waitFor(() => expect(day).toHaveFocus());
      await userEvent.keyboard("{Enter}");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 2, 10));
      expect(day).toHaveAttribute("aria-selected", "true");
    });
    await step("So does Space", async () => {
      await userEvent.keyboard(" ");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 2, 10));
      expect(day).toHaveAttribute("aria-selected", "true");
    });
    await step("Delete on another day clears nothing", async () => {
      await userEvent.keyboard("{ArrowRight}{Delete}{ArrowLeft}");
      expect(day).toHaveFocus();
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 2, 10));
      expect(day).toHaveAttribute("aria-selected", "true");
    });
    await step("Delete on the selected day clears it", async () => {
      await userEvent.keyboard("{Delete}");
      expect(args.onSelect).toHaveBeenLastCalledWith(undefined);
      expect(day).not.toHaveAttribute("aria-selected");
    });
    await step("So does Backspace", async () => {
      await userEvent.keyboard("{Enter}");
      expect(day).toHaveAttribute("aria-selected", "true");
      await userEvent.keyboard("{Backspace}");
      expect(args.onSelect).toHaveBeenLastCalledWith(undefined);
      expect(day).not.toHaveAttribute("aria-selected");
    });
    await step("A click on the selected day still clears it", async () => {
      await userEvent.click(day);
      expect(day).toHaveAttribute("aria-selected", "true");
      await userEvent.click(day);
      expect(args.onSelect).toHaveBeenLastCalledWith(undefined);
      expect(day).not.toHaveAttribute("aria-selected");
    });
  }
}`,...S.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 31)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dayNamed = (name: string) => canvas.getByRole("gridcell", {
      name
    });
    await userEvent.click(dayNamed("Wednesday, April 1, 2026"));
    expect(canvas.getByRole("grid", {
      name: "April 2026"
    })).toBeInTheDocument();
    const clicked = dayNamed("Wednesday, April 1, 2026");
    expect(clicked).toHaveAttribute("aria-selected", "true");
    expect(tabStops(canvasElement)).toEqual([clicked]);
    await waitFor(() => expect(clicked).toHaveFocus());
    await userEvent.keyboard("{ArrowRight}");
    expect(dayNamed("Thursday, April 2, 2026")).toHaveFocus();
  }
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const today = DateTime.now();
    await step("Today, in the current month", async () => {
      expect(tabStops(canvasElement)).toEqual([canvas.getByRole("gridcell", {
        name: dayName(today)
      })]);
    });
    await step("The 1st, in another month", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Next month"
      }));
      const next = today.plus({
        months: 1
      }).startOf("month");
      expect(canvas.getByRole("grid", {
        name: monthName(next)
      })).toBeInTheDocument();
      expect(tabStops(canvasElement)).toEqual([canvas.getByRole("gridcell", {
        name: dayName(next)
      })]);
    });
  }
}`,...b.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2020, 2, 10)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Next month"
    }));
    expect(canvas.getByRole("grid", {
      name: "April 2020"
    })).toBeInTheDocument();
    expect(tabStops(canvasElement)).toEqual([canvas.getByRole("gridcell", {
      name: "Wednesday, April 1, 2020"
    })]);
  }
}`,...D.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 10)
  },
  play: async ({
    canvasElement
  }) => {
    const grid = within(canvasElement).getByRole("grid", {
      name: "March 2026"
    });
    const rows = within(grid).getAllByRole("row");
    const headers = within(rows[0]).getAllByRole("columnheader");
    expect(headers.map(header => header.getAttribute("aria-label"))).toEqual(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    // March 1 to April 4, 2026: five weeks
    expect(rows).toHaveLength(6);
    for (const week of rows.slice(1)) {
      expect(within(week).getAllByRole("gridcell")).toHaveLength(7);
    }
  }
}`,...B.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:'themedCalendarStory("light")',...T.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:'themedCalendarStory("dark")',...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:'themedCalendarStory("midnight")',...k.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:'themedCalendarStory("coffee")',...E.parameters?.docs?.source}}};const te=["Default","KeyboardNavigation","KeyboardKeepsAndClearsTheSelection","ClickADayOutsideTheMonth","TabStopWithoutSelection","TabStopWithSelectionInAnotherMonth","GridSemantics","LightTheme","DarkTheme","MidnightTheme","CoffeeTheme"];export{x as ClickADayOutsideTheMonth,E as CoffeeTheme,f as DarkTheme,v as Default,B as GridSemantics,S as KeyboardKeepsAndClearsTheSelection,A as KeyboardNavigation,T as LightTheme,k as MidnightTheme,D as TabStopWithSelectionInAnotherMonth,b as TabStopWithoutSelection,te as __namedExportsOrder,ae as default};
