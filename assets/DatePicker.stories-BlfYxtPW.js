import{j as e}from"./jsx-runtime-u17CrQMm.js";import{r as P}from"./iframe-DZazhMmd.js";import{A as R}from"./AppContext-SrkG8hzT.js";import{D as M}from"./date-picker-CmYbLQEh.js";import{D as l}from"./recurrence-Co3oC643.js";import{e as F,a as A}from"./test-utils-BjL_0stX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DrBVBWl1.js";import"./usePortalContainer-BjvVFpRl.js";import"./calendar-bQeqPaKd.js";import"./tslib.es6-C44cpxNM.js";import"./button-Bgl0Jb_g.js";import"./chevron-left-BLaTK1Ra.js";import"./chevron-right-Cri6jyFi.js";import"./calendar-focus-CA-83E3R.js";import"./popover-Dj8_k19a.js";import"./Combination-BgwXw_pz.js";import"./index-ChRTMkvB.js";import"./index-BvO_gj8L.js";import"./calendar-Cmr1cyWC.js";const{expect:r,userEvent:c,waitFor:y,within:i}=__STORYBOOK_MODULE_TEST__,$={title:"UI/DatePicker",component:M,parameters:{layout:"centered",a11y:{test:"error"}},tags:["autodocs"]};function m({showTime:a=!1,initialValue:n}){const[t,o]=P.useState(n||"");return e.jsxs("div",{className:"space-y-4 w-[400px]",children:[e.jsx(M,{value:t,onChange:o,showTime:a,placeholder:a?"Pick date and time":"Pick a date"}),e.jsxs("div",{className:"p-4 bg-slate-100 rounded-lg space-y-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Selected value:"})," ",e.jsx("code",{className:"bg-white px-2 py-1 rounded",children:t||"(none)"})]}),t&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Format:"})," ",t.includes("T")?"ISO DateTime":"ISO Date (YYYY-MM-DD)"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Parsed:"})," ",l.fromISO(t).toLocaleString(a?l.DATETIME_MED:l.DATE_MED)]})]})]})]})}const u={render:()=>e.jsx(m,{showTime:!1}),play:async({canvasElement:a})=>{const n=i(a),t=i(a.ownerDocument.body);await c.click(n.getByRole("button",{name:"Pick a date"}));const o=await t.findByRole("gridcell",{name:l.now().setLocale("en-US").toFormat("cccc, LLLL d, yyyy")});await y(()=>r(o).toHaveFocus())}},h={render:()=>e.jsx(m,{showTime:!0}),play:async({canvasElement:a,step:n})=>{const t=i(a),o=i(a.ownerDocument.body);await n("Open the picker",async()=>{await c.click(t.getByRole("button",{name:"Pick date and time"}))}),await n("Time field is labelled",async()=>{const s=await o.findByLabelText("Time");r(s).toHaveAttribute("type","time"),r(s).toHaveValue("00:00")})}},g={render:()=>e.jsx(m,{showTime:!1,initialValue:"2026-02-05"}),play:async({canvasElement:a,step:n})=>{const t=i(a),o=i(a.ownerDocument.body);await n("Open the picker",async()=>{await c.click(t.getByRole("button",{name:l.fromISO("2026-02-05").toFormat("MMM dd, yyyy")}))}),await n("Days are named by full date and expose selection",async()=>{const s=await o.findByRole("gridcell",{name:"Thursday, February 5, 2026"});r(s).toHaveAttribute("aria-selected","true"),r(o.getByRole("gridcell",{name:"Friday, February 6, 2026"})).not.toHaveAttribute("aria-selected")})}},w={render:()=>e.jsx(m,{showTime:!1,initialValue:"2026-02-05"}),play:async({canvasElement:a,step:n})=>{const t=i(a),o=i(a.ownerDocument.body),s=t.getByRole("button",{name:l.fromISO("2026-02-05").toFormat("MMM dd, yyyy")});await n("Enter opens the calendar on the selected day",async()=>{s.focus(),await c.keyboard("{Enter}");const d=await o.findByRole("gridcell",{name:"Thursday, February 5, 2026"});await y(()=>r(d).toHaveFocus())}),await n("Arrow keys move into the previous month",async()=>{await c.keyboard("{ArrowUp}"),r(o.getByRole("gridcell",{name:"Thursday, January 29, 2026"})).toHaveFocus(),r(o.getByRole("grid",{name:"January 2026"})).toBeInTheDocument(),await c.keyboard("{ArrowRight}"),r(o.getByRole("gridcell",{name:"Friday, January 30, 2026"})).toHaveFocus()}),await n("Enter picks the day and closes the calendar",async()=>{await c.keyboard("{Enter}"),r(t.getByText("2026-01-30")).toBeInTheDocument(),await y(()=>r(o.queryByRole("grid")).toBeNull()),await y(()=>r(s).toHaveFocus()),r(s).toHaveTextContent(l.fromISO("2026-01-30").toFormat("MMM dd, yyyy"))})}},v={render:()=>e.jsx(m,{showTime:!1,initialValue:"2026-03-10"}),play:async({canvasElement:a,step:n})=>{const t=i(a),o=i(a.ownerDocument.body),s=t.getByRole("button",{name:l.fromISO("2026-03-10").toFormat("MMM dd, yyyy")}),d=async p=>{s.focus(),await c.keyboard("{Enter}");const S=await o.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await y(()=>r(S).toHaveFocus()),await c.keyboard(p),await y(()=>r(o.queryByRole("grid")).toBeNull()),r(t.getByText("2026-03-10")).toBeInTheDocument(),await y(()=>r(s).toHaveFocus())};await n("Enter twice keeps the date and closes the calendar",()=>d("{Enter}")),await n("Enter and Space keep it too",()=>d(" "))}},b={render:()=>e.jsx(m,{showTime:!0,initialValue:l.local(2026,3,10,9,30).toISO()}),play:async({canvasElement:a,step:n})=>{const t=i(a),o=i(a.ownerDocument.body),s=l.local(2026,3,10,9,30).toFormat("MMM dd, yyyy HH:mm"),d=t.getByRole("button",{name:s});await n("Enter twice keeps the date and time",async()=>{d.focus(),await c.keyboard("{Enter}");const p=await o.findByRole("gridcell",{name:"Tuesday, March 10, 2026"});await y(()=>r(p).toHaveFocus()),await c.keyboard("{Enter}"),r(d).toHaveTextContent(s),r(p).toHaveAttribute("aria-selected","true"),r(p).toHaveFocus()}),await n("Delete on the selected day clears it",async()=>{await c.keyboard("{Delete}"),r(d).toHaveTextContent("Pick date and time"),r(t.getByText("(none)")).toBeInTheDocument()})}},T={render:()=>e.jsx(m,{showTime:!0,initialValue:"2026-02-05T14:30:00.000Z"})},x={render:()=>e.jsxs("div",{className:"space-y-6 w-[600px]",children:[e.jsxs("div",{className:"p-4 bg-blue-50 border border-blue-200 rounded-lg",children:[e.jsx("h3",{className:"font-bold text-blue-900 mb-2",children:"Test Instructions:"}),e.jsxs("ol",{className:"list-decimal list-inside text-sm text-blue-800 space-y-1",children:[e.jsx("li",{children:"Select February 5, 2026 in the date-only picker below"}),e.jsx("li",{children:'Verify the selected value shows as "2026-02-05" (not Jan)'}),e.jsx("li",{children:'The format should be "ISO Date (YYYY-MM-DD)", not "ISO DateTime"'}),e.jsx("li",{children:"Try dates near month boundaries (e.g., Jan 31, Mar 1)"})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"font-semibold",children:"Date-only picker (fixed):"}),e.jsx(m,{showTime:!1})]}),e.jsxs("div",{className:"p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800",children:[e.jsx("strong",{children:"Expected behavior:"}),' The selected value should always be in YYYY-MM-DD format without timezone offset. Selecting Feb 5 should save as "2026-02-05", regardless of your system timezone.']})]})},B=a=>({render:()=>e.jsx(m,{showTime:!0}),decorators:[n=>e.jsx(R,{theme:a,children:e.jsx("div",{className:"p-4",children:e.jsx(n,{})})})],play:async({canvasElement:n,step:t})=>{const o=i(n),s=o.getByRole("button",{name:"Pick date and time"});await t("The placeholder meets WCAG AA (4.5:1)",async()=>{await F(s)}),await t("The popover is named by the field it sets",async()=>{await c.click(s);const d=await o.findByRole("dialog",{name:"Pick date and time"});await A(i(d).getByText("Time"))}),await t("Its Time label meets AA",async()=>{await F(i(o.getByRole("dialog")).getByText("Time"))})}}),D=B("light"),f=B("dark"),k=B("midnight"),E=B("coffee");u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", {
      name: "Pick a date"
    }));

    // Without a date, the calendar opens on today
    const today = await page.findByRole("gridcell", {
      name: DateTime.now().setLocale("en-US").toFormat("cccc, LLLL d, yyyy")
    });
    await waitFor(() => expect(today).toHaveFocus());
  }
}`,...u.parameters?.docs?.source},description:{story:`Date-only picker (no time component)

This is the default mode and the one that had the timezone bug.
When showTime is false, the picker should use toISODate() to return
a date string in YYYY-MM-DD format without timezone conversion.`,...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={true} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);
    await step("Open the picker", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Pick date and time"
      }));
    });
    await step("Time field is labelled", async () => {
      const timeInput = await page.findByLabelText("Time");
      expect(timeInput).toHaveAttribute("type", "time");
      expect(timeInput).toHaveValue("00:00");
    });
  }
}`,...h.parameters?.docs?.source},description:{story:`Date and time picker

When showTime is true, the picker includes a time input and returns
a full ISO timestamp with timezone information.`,...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);
    await step("Open the picker", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: DateTime.fromISO("2026-02-05").toFormat("MMM dd, yyyy")
      }));
    });
    await step("Days are named by full date and expose selection", async () => {
      const selected = await page.findByRole("gridcell", {
        name: "Thursday, February 5, 2026"
      });
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(page.getByRole("gridcell", {
        name: "Friday, February 6, 2026"
      })).not.toHaveAttribute("aria-selected");
    });
  }
}`,...g.parameters?.docs?.source},description:{story:`Pre-populated date-only value

Test that existing date values are displayed correctly.`,...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      trigger = canvas.getByRole("button", {
        name: DateTime.fromISO("2026-02-05").toFormat("MMM dd, yyyy")
      });
    await step("Enter opens the calendar on the selected day", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const selected = await page.findByRole("gridcell", {
        name: "Thursday, February 5, 2026"
      });
      await waitFor(() => expect(selected).toHaveFocus());
    });
    await step("Arrow keys move into the previous month", async () => {
      await userEvent.keyboard("{ArrowUp}");
      expect(page.getByRole("gridcell", {
        name: "Thursday, January 29, 2026"
      })).toHaveFocus();
      expect(page.getByRole("grid", {
        name: "January 2026"
      })).toBeInTheDocument();
      await userEvent.keyboard("{ArrowRight}");
      expect(page.getByRole("gridcell", {
        name: "Friday, January 30, 2026"
      })).toHaveFocus();
    });
    await step("Enter picks the day and closes the calendar", async () => {
      await userEvent.keyboard("{Enter}");
      expect(canvas.getByText("2026-01-30")).toBeInTheDocument();
      await waitFor(() => expect(page.queryByRole("grid")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(trigger).toHaveTextContent(DateTime.fromISO("2026-01-30").toFormat("MMM dd, yyyy"));
    });
  }
}`,...w.parameters?.docs?.source},description:{story:`Keyboard use

The calendar opens with focus on the selected day. Arrow keys move through
the days, into other months too, and Enter picks one.`,...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} initialValue="2026-03-10" />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      trigger = canvas.getByRole("button", {
        name: DateTime.fromISO("2026-03-10").toFormat("MMM dd, yyyy")
      });
    const confirmWith = async (key: string) => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const selected = await page.findByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      await waitFor(() => expect(selected).toHaveFocus());
      await userEvent.keyboard(key);
      await waitFor(() => expect(page.queryByRole("grid")).toBeNull());
      expect(canvas.getByText("2026-03-10")).toBeInTheDocument();
      await waitFor(() => expect(trigger).toHaveFocus());
    };
    await step("Enter twice keeps the date and closes the calendar", () => confirmWith("{Enter}"));
    await step("Enter and Space keep it too", () => confirmWith(" "));
  }
}`,...v.parameters?.docs?.source},description:{story:`Confirming the selected day keeps it

The calendar opens on the selected day, so Enter or Space right away picks
it again instead of clearing it, as a click on it would.`,...v.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={true} initialValue={DateTime.local(2026, 3, 10, 9, 30).toISO()!} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      label = DateTime.local(2026, 3, 10, 9, 30).toFormat("MMM dd, yyyy HH:mm"),
      trigger = canvas.getByRole("button", {
        name: label
      });
    await step("Enter twice keeps the date and time", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const selected = await page.findByRole("gridcell", {
        name: "Tuesday, March 10, 2026"
      });
      await waitFor(() => expect(selected).toHaveFocus());
      await userEvent.keyboard("{Enter}");
      expect(trigger).toHaveTextContent(label);
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(selected).toHaveFocus();
    });
    await step("Delete on the selected day clears it", async () => {
      await userEvent.keyboard("{Delete}");
      expect(trigger).toHaveTextContent("Pick date and time");
      expect(canvas.getByText("(none)")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source},description:{story:`Keyboard use with a time

Enter on the selected day keeps the date and time, and the calendar stays
open to set the time. Delete (or Backspace) on the selected day clears it.`,...b.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={true} initialValue="2026-02-05T14:30:00.000Z" />
}`,...T.parameters?.docs?.source},description:{story:`Pre-populated datetime value

Test that existing datetime values are displayed correctly.`,...T.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6 w-[600px]">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Select February 5, 2026 in the date-only picker below</li>
          <li>Verify the selected value shows as "2026-02-05" (not Jan)</li>
          <li>
            The format should be "ISO Date (YYYY-MM-DD)", not "ISO DateTime"
          </li>
          <li>Try dates near month boundaries (e.g., Jan 31, Mar 1)</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Date-only picker (fixed):</h4>
        <DatePickerDemo showTime={false} />
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Expected behavior:</strong> The selected value should always be
        in YYYY-MM-DD format without timezone offset. Selecting Feb 5 should
        save as "2026-02-05", regardless of your system timezone.
      </div>
    </div>
}`,...x.parameters?.docs?.source},description:{story:`Timezone consistency test

This story helps verify the fix for issue #13 where selecting Feb 5
would sometimes save as Jan 5 due to timezone conversion issues.

The bug was in date-picker.tsx always using toISO() which includes
timezone conversion, even when showTime was false. The fix uses
toISODate() for date-only mode, which returns YYYY-MM-DD without
timezone conversion.`,...x.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:'themedPickerStory("light")',...D.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:'themedPickerStory("dark")',...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:'themedPickerStory("midnight")',...k.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:'themedPickerStory("coffee")',...E.parameters?.docs?.source}}};const ee=["DateOnly","DateAndTime","PrePopulatedDate","KeyboardPicksADay","EnterKeepsTheSelectedDay","KeyboardKeepsAndClearsTheDateAndTime","PrePopulatedDateAndTime","TimezoneConsistencyTest","LightTheme","DarkTheme","MidnightTheme","CoffeeTheme"];export{E as CoffeeTheme,f as DarkTheme,h as DateAndTime,u as DateOnly,v as EnterKeepsTheSelectedDay,b as KeyboardKeepsAndClearsTheDateAndTime,w as KeyboardPicksADay,D as LightTheme,k as MidnightTheme,g as PrePopulatedDate,T as PrePopulatedDateAndTime,x as TimezoneConsistencyTest,ee as __namedExportsOrder,$ as default};
