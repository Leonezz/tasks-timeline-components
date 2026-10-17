import{j as D}from"./jsx-runtime-u17CrQMm.js";import{D as se,a as g}from"./date-badge-tones-CqR66kco.js";import{A as ce}from"./AppContext-SrkG8hzT.js";import{c as ie}from"./tslib.es6-C44cpxNM.js";import{D as B}from"./recurrence-Co3oC643.js";import{t as Z}from"./tasks-CcRg1J09.js";import"./edge-cases-DMAB-FsE.js";import{w as l,d as i,e as T,a as de}from"./test-utils-BjL_0stX.js";import"./iframe-DZazhMmd.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-g5MVMxEO.js";import"./chevron-right-Cri6jyFi.js";import"./calendar-Cmr1cyWC.js";import"./circle-DDRLbMmN.js";import"./chevron-left-BLaTK1Ra.js";import"./Motion-Ba_Df5rY.js";import"./proxy-CgUC1axK.js";import"./popover-Dj8_k19a.js";import"./Combination-BgwXw_pz.js";import"./usePortalContainer-BjvVFpRl.js";import"./index-ChRTMkvB.js";import"./index-BvO_gj8L.js";import"./calendar-bQeqPaKd.js";import"./button-Bgl0Jb_g.js";import"./calendar-focus-CA-83E3R.js";import"./index-DrBVBWl1.js";const{expect:t,fn:v,userEvent:r,waitFor:te,within:ae}=__STORYBOOK_MODULE_TEST__,Pe={title:"UI/DateBadge",component:se,tags:["autodocs"],parameters:{layout:"centered",a11y:{test:"error"}},argTypes:{onUpdate:{action:"task-updated"}},decorators:[(s,{parameters:n})=>D.jsx(ce,{theme:n.theme,children:D.jsx("div",{className:"p-4 bg-slate-50 min-w-50",children:D.jsx(s,{})})})]},d=B.now(),le=d.plus({days:1}),S=d.minus({days:1}),ue=Z.base({id:"1",title:"Sample Task",dueAt:d.toISODate()}),$=s=>console.log("Updated task:",s),re=s=>s.setLocale("en-US").toFormat("MMMM yyyy"),m=s=>ie("flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border",s),oe=m("border-slate-100 bg-slate-50 text-slate-500"),c={args:{task:ue,onUpdate:$,type:"dueDate",date:d.toISODate(),label:"Today",icon:"Calendar",className:m(g.due)}},k={args:{...c.args,date:le.toISODate(),label:"Tomorrow"}},E={args:{...c.args,date:S.toISODate(),label:S.toFormat("MMM d"),className:m(g.overdue)}},x={args:{...c.args,date:void 0,label:"No date",className:oe}},p={args:{task:Z.base({startAt:d.toISO()}),onUpdate:$,type:"startAt",date:d.toISO(),label:"Today 9:00 AM",icon:"PlayCircle",className:m(g.start)}},C={args:{...p.args,date:d.set({hour:14,minute:30}).toISO(),label:"Today 2:30 PM"}},w={args:{...p.args,date:void 0,label:"No start",className:oe}},y={args:{task:Z.base({createdAt:S.toISO()}),onUpdate:$,type:"createdAt",date:S.toISO(),label:"Yesterday 3:45 PM",icon:"Plus",className:m(g.created)}},A={args:{...y.args,date:d.toISO(),label:"Today 9:00 AM"}},b={args:{task:Z.completed({completedAt:d.toISO()}),onUpdate:$,type:"completedAt",date:d.toISO(),label:"Today 4:20 PM",icon:"CheckCircle2",className:m(g.completed)}},f={args:{...b.args,date:S.toISO(),label:"Yesterday 11:15 AM"}},h={args:{...c.args,prefix:"DUE: "}},I={args:{...p.args,prefix:"START: "}},M={args:{...c.args},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Open date picker popover",async()=>{const a=e.getByRole("button");await r.click(a),await i(200)}),await n("Verify calendar is visible without a time field",async()=>{t(e.getByText(re(d))).toBeInTheDocument(),t(e.queryByText("Time")).not.toBeInTheDocument()})}},O={args:{...p.args},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Open datetime picker popover",async()=>{const a=e.getByRole("button");await r.click(a),await i(200)}),await n("Verify calendar and time field are visible",async()=>{t(e.getByText(re(d))).toBeInTheDocument();const a=e.getByDisplayValue(d.toFormat("HH:mm"));t(a).toHaveAttribute("type","time")})}},R={args:{...c.args,date:"2026-03-10",label:"Mar 10",onUpdate:v()},play:async({args:s,canvasElement:n,step:e})=>{const a=l(n);await e("Open date picker",async()=>{const o=a.getByTitle("Change due date");await r.click(o),await i(200)}),await e("Pick a new date",async()=>{const o=a.getByRole("gridcell",{name:"Tuesday, March 10, 2026"}),u=a.getByRole("gridcell",{name:"Friday, March 20, 2026"});t(o).toHaveAttribute("aria-selected","true"),t(u).not.toHaveAttribute("aria-selected"),await r.click(u),await i(100),t(u).toHaveAttribute("aria-selected","true"),t(o).not.toHaveAttribute("aria-selected")}),await e("Save new date",async()=>{const o=a.getByRole("button",{name:/Save/i});await r.click(o),await i(100),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({dueAt:"2026-03-20"}))})}},H={args:{...p.args,date:B.local(2026,3,10,9,30).toISO(),label:"Mar 10 9:30 AM",onUpdate:v()},play:async({args:s,canvasElement:n,step:e})=>{const a=l(n);await e("Open datetime picker",async()=>{const o=a.getByTitle("Change start date");await r.click(o),await i(200)}),await e("Pick a new date and time",async()=>{await r.click(a.getByRole("gridcell",{name:"Friday, March 20, 2026"}));const o=a.getByLabelText("Time");t(o).toHaveValue("09:30"),await r.clear(o),await r.type(o,"10:00"),await i(100)}),await e("Save new datetime",async()=>{const o=a.getByRole("button",{name:/Save/i});await r.click(o),await i(100),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({startAt:B.local(2026,3,20,10,0).toISO()}))})}},U={args:{...c.args,date:"2026-03-10",label:"Mar 10",onUpdate:v()},play:async({args:s,canvasElement:n,step:e})=>{const a=l(n);await e("Open date picker",async()=>{const o=a.getByTitle("Change due date");await r.click(o),await i(200)}),await e("Deselect the current date",async()=>{const o=a.getByRole("gridcell",{name:"Tuesday, March 10, 2026"});t(o).toHaveAttribute("aria-selected","true"),await r.click(o),await i(100),t(o).not.toHaveAttribute("aria-selected")}),await e("Save empty date (removes date)",async()=>{const o=a.getByRole("button",{name:/Save/i});await r.click(o),await i(100),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({dueAt:""}))})}},N={args:{...c.args,label:"A very long date label that might overflow the badge container"}},F={args:{...c.args,label:""}},P={args:{...c.args,date:"invalid-date-string",label:"Invalid"}},W={args:{...c.args,date:B.local(2099,12,31).toISODate(),label:"Dec 31, 2099"}},j={args:{...y.args,date:B.local(2e3,1,1).toISO(),label:"Jan 1, 2000"}},_={args:{...c.args},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Tab to badge button",async()=>{const a=e.getByRole("button");a.focus(),t(a).toHaveFocus()}),await n("Press Enter to open popover",async()=>{await r.keyboard("{Enter}"),await i(200);const a=e.getByRole("button",{name:"Save due date"});t(a).toBeInTheDocument()})}},L={args:{...c.args,date:"2026-03-10",label:"Mar 10",onUpdate:v()},play:async({args:s,canvasElement:n,step:e})=>{const a=l(n);await e("Enter opens the calendar on the selected day",async()=>{a.getByTitle("Change due date").focus(),await r.keyboard("{Enter}");const o=await a.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await te(()=>t(o).toHaveFocus())}),await e("Arrow keys move to another day",async()=>{await r.keyboard("{ArrowDown}{ArrowRight}"),t(a.getByRole("gridcell",{name:"Wednesday, March 18, 2026"})).toHaveFocus()}),await e("Enter picks it",async()=>{await r.keyboard("{Enter}"),t(a.getByRole("gridcell",{name:"Wednesday, March 18, 2026"})).toHaveAttribute("aria-selected","true"),await r.click(a.getByRole("button",{name:"Save due date"})),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({dueAt:"2026-03-18"}))})}},V={args:{...c.args,date:"2026-03-10",label:"Mar 10",onUpdate:v()},play:async({args:s,canvasElement:n})=>{const e=l(n);e.getByTitle("Change due date").focus(),await r.keyboard("{Enter}");const a=await e.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await te(()=>t(a).toHaveFocus()),await r.keyboard("{Enter}"),t(a).toHaveAttribute("aria-selected","true"),await r.tab(),await r.tab(),t(e.getByRole("button",{name:"Save due date"})).toHaveFocus(),await r.keyboard("{Enter}"),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({dueAt:"2026-03-10"}))}},G={args:{...c.args,date:"2026-03-10",label:"Mar 10",onUpdate:v()},play:async({args:s,canvasElement:n})=>{const e=l(n);e.getByTitle("Change due date").focus(),await r.keyboard("{Enter}");const a=await e.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await te(()=>t(a).toHaveFocus()),await r.keyboard("{Delete}"),t(a).not.toHaveAttribute("aria-selected"),await r.click(e.getByRole("button",{name:"Save due date"})),t(s.onUpdate).toHaveBeenCalledWith(t.objectContaining({dueAt:""}))}},K={args:{...c.args},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Verify button names the field, task and date",async()=>{const a=e.getByRole("button",{name:"Change due date for Sample Task. Current due date: Today"});t(a).toHaveAttribute("title","Change due date")})}},Y={args:{...h.args},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Prefix is shown but not repeated in the name",async()=>{const a=e.getByRole("button",{name:"Change due date for Sample Task. Current due date: Today"});t(a).toHaveTextContent("DUE: Today")})}},q={args:{...c.args,date:"2026-03-10",label:"Mar 10"},play:async({canvasElement:s,step:n})=>{const e=l(s);await n("Open date picker on the selected month",async()=>{await r.click(e.getByTitle("Change due date")),await i(200),t(e.getByText("March 2026")).toBeInTheDocument()}),await n("Go to the next month",async()=>{await r.click(e.getByRole("button",{name:"Next month"})),t(e.getByText("April 2026")).toBeInTheDocument()}),await n("Go back two months",async()=>{const a=e.getByRole("button",{name:"Previous month"});await r.click(a),await r.click(a),t(e.getByText("February 2026")).toBeInTheDocument()})}},ne=[...Object.entries(g).map(([s,n])=>({...p.args,label:s,className:m(n)})),w.args],ee=s=>({parameters:{theme:s},render:()=>D.jsx("div",{className:"flex flex-col items-start gap-2",children:ne.map(n=>D.jsx(se,{...n},n.label))}),play:async({canvasElement:n,step:e})=>{const a=ae(n),o=a.getAllByRole("button",{name:/^Change /});await e("Badge labels meet WCAG AA (4.5:1)",async()=>{t(o).toHaveLength(ne.length);for(const u of o)await T(u)}),await e("The popover is named by its heading",async()=>{await r.click(o[0]);const u=await a.findByRole("dialog",{name:"Change start date"});await de(ae(u).getByText("Change start date"))}),await e("Its heading, Time label and Save button meet AA",async()=>{const u=ae(a.getByRole("dialog"));await T(u.getByText("Change start date")),await T(u.getByText("Time")),await T(u.getByRole("button",{name:"Save start date"}))})}}),J=ee("light"),z=ee("dark"),Q=ee("midnight"),X=ee("coffee");c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    onUpdate: handleUpdate,
    type: "dueDate",
    date: today.toISODate()!,
    label: "Today",
    icon: "Calendar",
    // Due today or tomorrow
    className: badgeClass(DATE_BADGE_TONES.due)
  }
}`,...c.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: tomorrow.toISODate()!,
    label: "Tomorrow"
  }
}`,...k.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: yesterday.toISODate()!,
    label: yesterday.toFormat("MMM d"),
    className: badgeClass(DATE_BADGE_TONES.overdue)
  }
}`,...E.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: undefined,
    label: "No date",
    className: emptyBadgeClass
  }
}`,...x.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      startAt: today.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "startAt",
    date: today.toISO()!,
    label: "Today 9:00 AM",
    icon: "PlayCircle",
    className: badgeClass(DATE_BADGE_TONES.start)
  }
}`,...p.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    date: today.set({
      hour: 14,
      minute: 30
    }).toISO()!,
    label: "Today 2:30 PM"
  }
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    date: undefined,
    label: "No start",
    className: emptyBadgeClass
  }
}`,...w.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      createdAt: yesterday.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "createdAt",
    date: yesterday.toISO()!,
    label: "Yesterday 3:45 PM",
    icon: "Plus",
    className: badgeClass(DATE_BADGE_TONES.created)
  }
}`,...y.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...CreatedDate.args,
    date: today.toISO()!,
    label: "Today 9:00 AM"
  }
}`,...A.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      completedAt: today.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "completedAt",
    date: today.toISO()!,
    label: "Today 4:20 PM",
    icon: "CheckCircle2",
    className: badgeClass(DATE_BADGE_TONES.completed)
  }
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...CompletedDate.args,
    date: yesterday.toISO()!,
    label: "Yesterday 11:15 AM"
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    prefix: "DUE: "
  }
}`,...h.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    prefix: "START: "
  }
}`,...I.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify calendar is visible without a time field", async () => {
      expect(canvas.getByText(calendarMonth(today))).toBeInTheDocument();
      expect(canvas.queryByText("Time")).not.toBeInTheDocument();
    });
  }
}`,...M.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open datetime picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify calendar and time field are visible", async () => {
      expect(canvas.getByText(calendarMonth(today))).toBeInTheDocument();
      const timeInput = canvas.getByDisplayValue(today.toFormat("HH:mm"));
      expect(timeInput).toHaveAttribute("type", "time");
    });
  }
}`,...O.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker", async () => {
      const button = canvas.getByTitle("Change due date");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Pick a new date", async () => {
      const current = canvas.getByRole("gridcell", {
          name: "Tuesday, March 10, 2026"
        }),
        next = canvas.getByRole("gridcell", {
          name: "Friday, March 20, 2026"
        });
      expect(current).toHaveAttribute("aria-selected", "true");
      expect(next).not.toHaveAttribute("aria-selected");
      await userEvent.click(next);
      await delay(100);
      expect(next).toHaveAttribute("aria-selected", "true");
      expect(current).not.toHaveAttribute("aria-selected");
    });
    await step("Save new date", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        dueAt: "2026-03-20"
      }));
    });
  }
}`,...R.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    date: DateTime.local(2026, 3, 10, 9, 30).toISO()!,
    label: "Mar 10 9:30 AM",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open datetime picker", async () => {
      const button = canvas.getByTitle("Change start date");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Pick a new date and time", async () => {
      await userEvent.click(canvas.getByRole("gridcell", {
        name: "Friday, March 20, 2026"
      }));
      const timeInput = canvas.getByLabelText("Time");
      expect(timeInput).toHaveValue("09:30");
      await userEvent.clear(timeInput);
      await userEvent.type(timeInput, "10:00");
      await delay(100);
    });
    await step("Save new datetime", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        startAt: DateTime.local(2026, 3, 20, 10, 0).toISO()
      }));
    });
  }
}`,...H.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker", async () => {
      const button = canvas.getByTitle("Change due date");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Deselect the current date", async () => {
      // Calendar's onSelect takes Date | undefined, like react-day-picker's
      // single mode: clicking the selected day again clears the selection
      const day = canvas.getByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      expect(day).toHaveAttribute("aria-selected", "true");
      await userEvent.click(day);
      await delay(100);
      expect(day).not.toHaveAttribute("aria-selected");
    });
    await step("Save empty date (removes date)", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        dueAt: ""
      }));
    });
  }
}`,...U.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    label: "A very long date label that might overflow the badge container"
  }
}`,...N.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    label: ""
  }
}`,...F.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "invalid-date-string",
    label: "Invalid"
  }
}`,...P.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: DateTime.local(2099, 12, 31).toISODate()!,
    label: "Dec 31, 2099"
  }
}`,...W.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    ...CreatedDate.args,
    date: DateTime.local(2000, 1, 1).toISO()!,
    label: "Jan 1, 2000"
  }
}`,...j.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Tab to badge button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const saveButton = canvas.getByRole("button", {
        name: "Save due date"
      });
      expect(saveButton).toBeInTheDocument();
    });
  }
}`,..._.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Enter opens the calendar on the selected day", async () => {
      canvas.getByTitle("Change due date").focus();
      await userEvent.keyboard("{Enter}");
      const selected = await canvas.findByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      await waitFor(() => expect(selected).toHaveFocus());
    });
    await step("Arrow keys move to another day", async () => {
      await userEvent.keyboard("{ArrowDown}{ArrowRight}");
      expect(canvas.getByRole("gridcell", {
        name: "Wednesday, March 18, 2026"
      })).toHaveFocus();
    });
    await step("Enter picks it", async () => {
      await userEvent.keyboard("{Enter}");
      expect(canvas.getByRole("gridcell", {
        name: "Wednesday, March 18, 2026"
      })).toHaveAttribute("aria-selected", "true");
      await userEvent.click(canvas.getByRole("button", {
        name: "Save due date"
      }));
      expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        dueAt: "2026-03-18"
      }));
    });
  }
}`,...L.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = withinShadow(canvasElement);
    canvas.getByTitle("Change due date").focus();
    await userEvent.keyboard("{Enter}");
    const selected = await canvas.findByRole("gridcell", {
      name: "Tuesday, March 10, 2026"
    });
    await waitFor(() => expect(selected).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    expect(selected).toHaveAttribute("aria-selected", "true");
    // Past Today to Save
    await userEvent.tab();
    await userEvent.tab();
    expect(canvas.getByRole("button", {
      name: "Save due date"
    })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      dueAt: "2026-03-10"
    }));
  }
}`,...V.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn()
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = withinShadow(canvasElement);
    canvas.getByTitle("Change due date").focus();
    await userEvent.keyboard("{Enter}");
    const selected = await canvas.findByRole("gridcell", {
      name: "Tuesday, March 10, 2026"
    });
    await waitFor(() => expect(selected).toHaveFocus());
    await userEvent.keyboard("{Delete}");
    expect(selected).not.toHaveAttribute("aria-selected");
    await userEvent.click(canvas.getByRole("button", {
      name: "Save due date"
    }));
    expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
      dueAt: ""
    }));
  }
}`,...G.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify button names the field, task and date", async () => {
      // Same pattern as the category and priority badges
      const button = canvas.getByRole("button", {
        name: "Change due date for Sample Task. Current due date: Today"
      });
      expect(button).toHaveAttribute("title", "Change due date");
    });
  }
}`,...K.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    ...WithPrefix.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Prefix is shown but not repeated in the name", async () => {
      const button = canvas.getByRole("button", {
        name: "Change due date for Sample Task. Current due date: Today"
      });
      expect(button).toHaveTextContent("DUE: Today");
    });
  }
}`,...Y.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker on the selected month", async () => {
      await userEvent.click(canvas.getByTitle("Change due date"));
      await delay(200);
      expect(canvas.getByText("March 2026")).toBeInTheDocument();
    });
    await step("Go to the next month", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Next month"
      }));
      expect(canvas.getByText("April 2026")).toBeInTheDocument();
    });
    await step("Go back two months", async () => {
      const previous = canvas.getByRole("button", {
        name: "Previous month"
      });
      await userEvent.click(previous);
      await userEvent.click(previous);
      expect(canvas.getByText("February 2026")).toBeInTheDocument();
    });
  }
}`,...q.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:'themedBadgesStory("light")',...J.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:'themedBadgesStory("dark")',...z.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:'themedBadgesStory("midnight")',...Q.parameters?.docs?.source}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:'themedBadgesStory("coffee")',...X.parameters?.docs?.source}}};const We=["DueDate","DueTomorrow","Overdue","NoDueDate","StartDate","StartDateWithTime","NoStartDate","CreatedDate","CreatedToday","CompletedDate","CompletedYesterday","WithPrefix","WithPrefixStartDate","DateOnlyInput","DateTimeInput","ChangeDueDate","ChangeStartDate","ClearDate","VeryLongLabel","EmptyLabel","InvalidDate","FarFutureDate","FarPastDate","KeyboardNavigation","KeyboardPicksADay","EnterTwiceKeepsTheDate","DeleteClearsTheDate","AriaLabels","PrefixNotInAriaLabel","MonthNavigation","LightTheme","DarkTheme","MidnightTheme","CoffeeTheme"];export{K as AriaLabels,R as ChangeDueDate,H as ChangeStartDate,U as ClearDate,X as CoffeeTheme,b as CompletedDate,f as CompletedYesterday,y as CreatedDate,A as CreatedToday,z as DarkTheme,M as DateOnlyInput,O as DateTimeInput,G as DeleteClearsTheDate,c as DueDate,k as DueTomorrow,F as EmptyLabel,V as EnterTwiceKeepsTheDate,W as FarFutureDate,j as FarPastDate,P as InvalidDate,_ as KeyboardNavigation,L as KeyboardPicksADay,J as LightTheme,Q as MidnightTheme,q as MonthNavigation,x as NoDueDate,w as NoStartDate,E as Overdue,Y as PrefixNotInAriaLabel,p as StartDate,C as StartDateWithTime,N as VeryLongLabel,h as WithPrefix,I as WithPrefixStartDate,We as __namedExportsOrder,Pe as default};
