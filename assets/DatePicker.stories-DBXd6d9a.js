import{j as e}from"./jsx-runtime-u17CrQMm.js";import{r as p}from"./iframe-BGtqOInk.js";import{D as c}from"./date-picker-CdjFAMNN.js";import{D as l}from"./datetime-CoIMkCUY.js";import"./preload-helper-PPVm8Dsz.js";import"./calendar-C910y9Ol.js";import"./rruleset-Bu4wjl4G.js";import"./popover-CH-wF0B1.js";import"./index-gL42gEsK.js";import"./index-DSbOtjD6.js";import"./chevron-right-BYj65MRz.js";const Y={title:"UI/DatePicker",component:c,parameters:{layout:"centered"},tags:["autodocs"]};function i({showTime:d=!1,initialValue:m}){const[s,u]=p.useState(m||"");return e.jsxs("div",{className:"space-y-4 w-[400px]",children:[e.jsx(c,{value:s,onChange:u,showTime:d,placeholder:d?"Pick date and time":"Pick a date"}),e.jsxs("div",{className:"p-4 bg-slate-100 rounded-lg space-y-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Selected value:"})," ",e.jsx("code",{className:"bg-white px-2 py-1 rounded",children:s||"(none)"})]}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Format:"})," ",s.includes("T")?"ISO DateTime":"ISO Date (YYYY-MM-DD)"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Parsed:"})," ",l.fromISO(s).toLocaleString(d?l.DATETIME_MED:l.DATE_MED)]})]})]})]})}const t={render:()=>e.jsx(i,{showTime:!1})},r={render:()=>e.jsx(i,{showTime:!0})},a={render:()=>e.jsx(i,{showTime:!1,initialValue:"2026-02-05"})},n={render:()=>e.jsx(i,{showTime:!0,initialValue:"2026-02-05T14:30:00.000Z"})},o={render:()=>e.jsxs("div",{className:"space-y-6 w-[600px]",children:[e.jsxs("div",{className:"p-4 bg-blue-50 border border-blue-200 rounded-lg",children:[e.jsx("h3",{className:"font-bold text-blue-900 mb-2",children:"Test Instructions:"}),e.jsxs("ol",{className:"list-decimal list-inside text-sm text-blue-800 space-y-1",children:[e.jsx("li",{children:"Select February 5, 2026 in the date-only picker below"}),e.jsx("li",{children:'Verify the selected value shows as "2026-02-05" (not Jan)'}),e.jsx("li",{children:'The format should be "ISO Date (YYYY-MM-DD)", not "ISO DateTime"'}),e.jsx("li",{children:"Try dates near month boundaries (e.g., Jan 31, Mar 1)"})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"font-semibold",children:"Date-only picker (fixed):"}),e.jsx(i,{showTime:!1})]}),e.jsxs("div",{className:"p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800",children:[e.jsx("strong",{children:"Expected behavior:"}),' The selected value should always be in YYYY-MM-DD format without timezone offset. Selecting Feb 5 should save as "2026-02-05", regardless of your system timezone.']})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} />
}`,...t.parameters?.docs?.source},description:{story:`Date-only picker (no time component)

This is the default mode and the one that had the timezone bug.
When showTime is false, the picker should use toISODate() to return
a date string in YYYY-MM-DD format without timezone conversion.`,...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={true} />
}`,...r.parameters?.docs?.source},description:{story:`Date and time picker

When showTime is true, the picker includes a time input and returns
a full ISO timestamp with timezone information.`,...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />
}`,...a.parameters?.docs?.source},description:{story:`Pre-populated date-only value

Test that existing date values are displayed correctly.`,...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <DatePickerDemo showTime={true} initialValue="2026-02-05T14:30:00.000Z" />
}`,...n.parameters?.docs?.source},description:{story:`Pre-populated datetime value

Test that existing datetime values are displayed correctly.`,...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source},description:{story:`Timezone consistency test

This story helps verify the fix for issue #13 where selecting Feb 5
would sometimes save as Jan 5 due to timezone conversion issues.

The bug was in date-picker.tsx always using toISO() which includes
timezone conversion, even when showTime was false. The fix uses
toISODate() for date-only mode, which returns YYYY-MM-DD without
timezone conversion.`,...o.parameters?.docs?.description}}};const S=["DateOnly","DateAndTime","PrePopulatedDate","PrePopulatedDateAndTime","TimezoneConsistencyTest"];export{r as DateAndTime,t as DateOnly,a as PrePopulatedDate,n as PrePopulatedDateAndTime,o as TimezoneConsistencyTest,S as __namedExportsOrder,Y as default};
