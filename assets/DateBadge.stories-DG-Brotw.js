import{j as V}from"./jsx-runtime-u17CrQMm.js";import{D as _}from"./DateBadge-BvAEeucm.js";import{A as Y}from"./AppContext-MBozJVKD.js";import{t as U}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{w as l,d as c}from"./test-utils-BNouzmjp.js";import{D as P}from"./datetime-CoIMkCUY.js";import"./iframe-BGtqOInk.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-B2foTpRx.js";import"./chevron-right-BYj65MRz.js";import"./Motion-BTKb_TxN.js";import"./proxy-DEXR2x0b.js";import"./popover-CH-wF0B1.js";import"./index-gL42gEsK.js";import"./index-DSbOtjD6.js";import"./rruleset-Bu4wjl4G.js";import"./calendar-C910y9Ol.js";import"./index-DXBVteFj.js";const{expect:i,userEvent:o}=__STORYBOOK_MODULE_TEST__,ie={title:"UI/DateBadge",component:_,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onUpdate:{action:"task-updated"}},decorators:[r=>V.jsx(Y,{children:V.jsx("div",{className:"p-4 bg-slate-50 min-w-50",children:V.jsx(r,{})})})]},s=P.now(),F=s.plus({days:1}),m=s.minus({days:1}),W=U.base({id:"1",title:"Sample Task",dueAt:s.toISODate()}),H=r=>console.log("Updated task:",r),n={args:{task:W,onUpdate:H,type:"dueDate",date:s.toISODate(),label:"Today",icon:"Calendar",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-600 bg-rose-50/80 border-rose-100/50"}},y={args:{...n.args,date:F.toISODate(),label:"Tomorrow",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-amber-600 bg-amber-50/80 border-amber-100/50"}},g={args:{...n.args,date:m.toISODate(),label:m.toFormat("MMM d"),className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-700 bg-rose-100 border-rose-200 font-bold"}},b={args:{...n.args,date:void 0,label:"No date",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100"}},d={args:{task:U.base({startAt:s.toISO()}),onUpdate:H,type:"startAt",date:s.toISO(),label:"Today 9:00 AM",icon:"PlayCircle",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-blue-600 bg-blue-50/80 border-blue-100/50"}},D={args:{...d.args,date:s.set({hour:14,minute:30}).toISO(),label:"Today 2:30 PM"}},v={args:{...d.args,date:void 0,label:"No start",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100"}},p={args:{task:U.base({createdAt:m.toISO()}),onUpdate:H,type:"createdAt",date:m.toISO(),label:"Yesterday 3:45 PM",icon:"Plus",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-500 bg-slate-50/80 border-slate-100/50"}},w={args:{...p.args,date:s.toISO(),label:"Today 9:00 AM"}},u={args:{task:U.completed({completedAt:s.toISO()}),onUpdate:H,type:"completedAt",date:s.toISO(),label:"Today 4:20 PM",icon:"CheckCircle2",className:"flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-emerald-600 bg-emerald-50/80 border-emerald-100/50"}},S={args:{...u.args,date:m.toISO(),label:"Yesterday 11:15 AM"}},x={args:{...n.args,prefix:"DUE: "}},h={args:{...d.args,prefix:"START: "}},O={args:{...n.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Open date picker popover",async()=>{const e=t.getByRole("button");await o.click(e),await c(200)}),await a("Verify date input is visible",async()=>{const e=t.getByDisplayValue(s.toISODate());i(e).toBeInTheDocument(),i(e).toHaveAttribute("type","date")})}},I={args:{...d.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Open datetime picker popover",async()=>{const e=t.getByRole("button");await o.click(e),await c(200)}),await a("Verify datetime input is visible",async()=>{const e=t.getByDisplayValue(s.toFormat("yyyy-MM-dd'T'HH:mm"));i(e).toBeInTheDocument(),i(e).toHaveAttribute("type","datetime-local")})}},B={args:{...n.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Open date picker",async()=>{const e=t.getByRole("button",{name:/Change Due Date/i});await o.click(e),await c(200)}),await a("Change date value",async()=>{const e=t.getByDisplayValue(s.toISODate());await o.clear(e),await o.type(e,F.toISODate()),await c(100)}),await a("Save new date",async()=>{const e=t.getByRole("button",{name:/Save/i});await o.click(e),await c(100)})}},T={args:{...d.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Open datetime picker",async()=>{const e=t.getByRole("button",{name:/Change Start Date/i});await o.click(e),await c(200)}),await a("Change datetime value",async()=>{const e=t.getByDisplayValue(s.toFormat("yyyy-MM-dd'T'HH:mm")),L=F.set({hour:10,minute:0});await o.clear(e),await o.type(e,L.toFormat("yyyy-MM-dd'T'HH:mm")),await c(100)}),await a("Save new datetime",async()=>{const e=t.getByRole("button",{name:/Save/i});await o.click(e),await c(100)})}},f={args:{...n.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Open date picker",async()=>{const e=t.getByRole("button");await o.click(e),await c(200)}),await a("Clear date value",async()=>{const e=t.getByDisplayValue(s.toISODate());await o.clear(e),await c(100)}),await a("Save empty date (removes date)",async()=>{const e=t.getByRole("button",{name:/Save/i});await o.click(e),await c(100)})}},k={args:{...n.args,label:"A very long date label that might overflow the badge container"}},E={args:{...n.args,label:""}},C={args:{...n.args,date:"invalid-date-string",label:"Invalid"}},A={args:{...n.args,date:P.local(2099,12,31).toISODate(),label:"Dec 31, 2099"}},M={args:{...p.args,date:P.local(2e3,1,1).toISO(),label:"Jan 1, 2000"}},N={args:{...n.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Tab to badge button",async()=>{const e=t.getByRole("button");e.focus(),i(e).toHaveFocus()}),await a("Press Enter to open popover",async()=>{await o.keyboard("{Enter}"),await c(200);const e=t.getByDisplayValue(s.toISODate());i(e).toBeInTheDocument()})}},R={args:{...n.args},play:async({canvasElement:r,step:a})=>{const t=l(r);await a("Verify button has accessible title",async()=>{const e=t.getByRole("button",{name:/Change Due Date/i});i(e).toHaveAttribute("title","Change Due Date")})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    task: defaultTask,
    onUpdate: handleUpdate,
    type: "dueDate",
    date: today.toISODate()!,
    label: "Today",
    icon: "Calendar",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-600 bg-rose-50/80 border-rose-100/50"
  }
}`,...n.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: tomorrow.toISODate()!,
    label: "Tomorrow",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-amber-600 bg-amber-50/80 border-amber-100/50"
  }
}`,...y.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: yesterday.toISODate()!,
    label: yesterday.toFormat("MMM d"),
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-700 bg-rose-100 border-rose-200 font-bold"
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: undefined,
    label: "No date",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100"
  }
}`,...b.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      startAt: today.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "startAt",
    date: today.toISO()!,
    label: "Today 9:00 AM",
    icon: "PlayCircle",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-blue-600 bg-blue-50/80 border-blue-100/50"
  }
}`,...d.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    date: today.set({
      hour: 14,
      minute: 30
    }).toISO()!,
    label: "Today 2:30 PM"
  }
}`,...D.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    date: undefined,
    label: "No start",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100"
  }
}`,...v.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      createdAt: yesterday.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "createdAt",
    date: yesterday.toISO()!,
    label: "Yesterday 3:45 PM",
    icon: "Plus",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-500 bg-slate-50/80 border-slate-100/50"
  }
}`,...p.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...CreatedDate.args,
    date: today.toISO()!,
    label: "Today 9:00 AM"
  }
}`,...w.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.completed({
      completedAt: today.toISO()!
    }),
    onUpdate: handleUpdate,
    type: "completedAt",
    date: today.toISO()!,
    label: "Today 4:20 PM",
    icon: "CheckCircle2",
    className: "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-emerald-600 bg-emerald-50/80 border-emerald-100/50"
  }
}`,...u.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...CompletedDate.args,
    date: yesterday.toISO()!,
    label: "Yesterday 11:15 AM"
  }
}`,...S.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    prefix: "DUE: "
  }
}`,...x.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args,
    prefix: "START: "
  }
}`,...h.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
    await step("Verify date input is visible", async () => {
      const dateInput = canvas.getByDisplayValue(today.toISODate()!);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });
  }
}`,...O.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
    await step("Verify datetime input is visible", async () => {
      const input = canvas.getByDisplayValue(today.toFormat("yyyy-MM-dd'T'HH:mm"));
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "datetime-local");
    });
  }
}`,...I.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Due Date/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Change date value", async () => {
      const input = canvas.getByDisplayValue(today.toISODate()!);
      await userEvent.clear(input);
      await userEvent.type(input, tomorrow.toISODate()!);
      await delay(100);
    });
    await step("Save new date", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      // OnUpdate should be called with new dueDate
    });
  }
}`,...B.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...StartDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open datetime picker", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Start Date/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Change datetime value", async () => {
      const input = canvas.getByDisplayValue(today.toFormat("yyyy-MM-dd'T'HH:mm")),
        newDateTime = tomorrow.set({
          hour: 10,
          minute: 0
        });
      await userEvent.clear(input);
      await userEvent.type(input, newDateTime.toFormat("yyyy-MM-dd'T'HH:mm"));
      await delay(100);
    });
    await step("Save new datetime", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
    });
  }
}`,...T.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open date picker", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Clear date value", async () => {
      const input = canvas.getByDisplayValue(today.toISODate()!);
      await userEvent.clear(input);
      await delay(100);
    });
    await step("Save empty date (removes date)", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /Save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      // OnUpdate should be called with empty dueDate
    });
  }
}`,...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    label: "A very long date label that might overflow the badge container"
  }
}`,...k.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    label: ""
  }
}`,...E.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: "invalid-date-string",
    label: "Invalid"
  }
}`,...C.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args,
    date: DateTime.local(2099, 12, 31).toISODate()!,
    label: "Dec 31, 2099"
  }
}`,...A.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...CreatedDate.args,
    date: DateTime.local(2000, 1, 1).toISO()!,
    label: "Jan 1, 2000"
  }
}`,...M.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
      const input = canvas.getByDisplayValue(today.toISODate()!);
      expect(input).toBeInTheDocument();
    });
  }
}`,...N.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...DueDate.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Due Date/i
      });
      expect(button).toHaveAttribute("title", "Change Due Date");
    });
  }
}`,...R.parameters?.docs?.source}}};const le=["DueDate","DueTomorrow","Overdue","NoDueDate","StartDate","StartDateWithTime","NoStartDate","CreatedDate","CreatedToday","CompletedDate","CompletedYesterday","WithPrefix","WithPrefixStartDate","DateOnlyInput","DateTimeInput","ChangeDueDate","ChangeStartDate","ClearDate","VeryLongLabel","EmptyLabel","InvalidDate","FarFutureDate","FarPastDate","KeyboardNavigation","AriaLabels"];export{R as AriaLabels,B as ChangeDueDate,T as ChangeStartDate,f as ClearDate,u as CompletedDate,S as CompletedYesterday,p as CreatedDate,w as CreatedToday,O as DateOnlyInput,I as DateTimeInput,n as DueDate,y as DueTomorrow,E as EmptyLabel,A as FarFutureDate,M as FarPastDate,C as InvalidDate,N as KeyboardNavigation,b as NoDueDate,v as NoStartDate,g as Overdue,d as StartDate,D as StartDateWithTime,k as VeryLongLabel,x as WithPrefix,h as WithPrefixStartDate,le as __namedExportsOrder,ie as default};
