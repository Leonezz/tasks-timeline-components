import{j as e}from"./jsx-runtime-u17CrQMm.js";import{T as m}from"./TaskItem-DFdCcC3W.js";import{A as g}from"./AppContext-MBozJVKD.js";import{t}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{D as n}from"./datetime-CoIMkCUY.js";import"./iframe-BGtqOInk.js";import"./preload-helper-PPVm8Dsz.js";import"./rruleset-Bu4wjl4G.js";import"./Icon-B2foTpRx.js";import"./chevron-right-BYj65MRz.js";import"./Motion-BTKb_TxN.js";import"./proxy-DEXR2x0b.js";import"./DateBadge-BvAEeucm.js";import"./popover-CH-wF0B1.js";import"./index-gL42gEsK.js";import"./index-DSbOtjD6.js";import"./calendar-C910y9Ol.js";import"./TagBadge-Dgc43Bxf.js";import"./PriorityPopover-Dx7L7z7o.js";import"./CategoryPopover-CHRjnc_g.js";import"./SettingsContext-DkX_1huq.js";import"./index-DXBVteFj.js";const C={title:"Core/TaskItem Responsive Tests",component:m,tags:["autodocs"],parameters:{layout:"padded",viewport:{viewports:{ultraNarrow:{name:"Ultra Narrow (320px) - Compact Mode",styles:{width:"320px",height:"568px"}},narrow:{name:"Narrow (380px) - Timeline Appears",styles:{width:"380px",height:"667px"}},mobile:{name:"Mobile (400px) - Full Mobile",styles:{width:"400px",height:"667px"}},tablet:{name:"Tablet (640px - sm breakpoint)",styles:{width:"640px",height:"1024px"}},desktop:{name:"Desktop (1024px)",styles:{width:"1024px",height:"768px"}}},defaultViewport:"ultraNarrow"}},decorators:[s=>e.jsx(g,{children:e.jsx("div",{className:"bg-slate-50 min-h-screen p-4",children:e.jsx("div",{className:"max-w-4xl mx-auto",children:e.jsx(s,{})})})})]},a={onUpdate:s=>console.log("Update:",s),onDelete:s=>console.log("Delete:",s),onEdit:s=>console.log("Edit:",s)},r={args:{task:t.base({id:"1",title:"This is an extremely long task title that demonstrates text truncation on narrow viewports instead of wrapping and breaking the layout",dueAt:n.now().plus({days:1}).toISODate(),priority:"high",category:"Work",tags:[{id:"1",name:"urgent"},{id:"2",name:"important"}],description:"This task has a very long title to test responsive truncation behavior at narrow viewport widths."}),...a},parameters:{viewport:{defaultViewport:"mobile"}}},o={args:{task:t.base({id:"2",title:"Task with many metadata badges",dueAt:n.now().toISODate(),startAt:n.now().minus({days:1}).toISODate(),createdAt:n.now().minus({days:7}).toISO(),priority:"high",category:"Very Long Category Name",tags:[{id:"1",name:"tag-one"},{id:"2",name:"tag-two"},{id:"3",name:"very-long-tag-name"}]}),...a},parameters:{viewport:{defaultViewport:"mobile"}}},i={args:{task:t.base({id:"3",title:"This is an extremely long task title that demonstrates responsive behavior at the sm: breakpoint (640px)",dueAt:n.now().plus({days:2}).toISODate(),priority:"medium"}),...a},parameters:{viewport:{defaultViewport:"tablet"}}},l={args:{task:t.base({id:"4",title:"This is an extremely long task title that demonstrates desktop responsive behavior with full spacing",dueAt:n.now().plus({days:3}).toISODate(),priority:"low",category:"Personal"}),...a},parameters:{viewport:{defaultViewport:"desktop"}}},p={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{task:t.base({id:"1",title:"Short title",priority:"high"}),...a}),e.jsx(m,{task:t.base({id:"2",title:"Medium length title that is somewhat longer",priority:"medium"}),...a}),e.jsx(m,{task:t.base({id:"3",title:"Very long title that will definitely need to truncate on narrow viewports to prevent layout breaking",priority:"low",category:"Work",tags:[{id:"1",name:"urgent"}]}),...a}),e.jsx(m,{task:t.base({id:"4",title:"Another extremely long task title with many badges to test wrapping behavior",dueAt:n.now().toISODate(),startAt:n.now().minus({days:1}).toISODate(),priority:"high",category:"Personal",tags:[{id:"1",name:"tag1"},{id:"2",name:"tag2"}]}),...a})]}),parameters:{viewport:{defaultViewport:"mobile"}}},d={args:{task:t.base({id:"5",title:"Task with long badge labels",dueAt:"2026-12-31T23:59:59.999Z",category:"Very Long Category Name That Should Truncate",tags:[{id:"1",name:"extremely-long-tag-name-that-should-truncate"}]}),...a},parameters:{viewport:{defaultViewport:"mobile"}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "1",
      title: "This is an extremely long task title that demonstrates text truncation on narrow viewports instead of wrapping and breaking the layout",
      dueAt: DateTime.now().plus({
        days: 1
      }).toISODate()!,
      priority: "high",
      category: "Work",
      tags: [{
        id: "1",
        name: "urgent"
      }, {
        id: "2",
        name: "important"
      }],
      description: "This task has a very long title to test responsive truncation behavior at narrow viewport widths."
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...r.parameters?.docs?.source},description:{story:`Long Title Test - Mobile (320px)

This demonstrates the fix for issue #12.
The title should truncate cleanly with ellipsis (...) instead of wrapping.

Test at different viewport sizes using the viewport toolbar:
- Mobile (320px): Title should truncate, tight spacing
- Tablet (640px): Spacing increases at sm: breakpoint
- Desktop (1024px): Full spacing`,...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "2",
      title: "Task with many metadata badges",
      dueAt: DateTime.now().toISODate()!,
      startAt: DateTime.now().minus({
        days: 1
      }).toISODate()!,
      createdAt: DateTime.now().minus({
        days: 7
      }).toISO()!,
      priority: "high",
      category: "Very Long Category Name",
      tags: [{
        id: "1",
        name: "tag-one"
      }, {
        id: "2",
        name: "tag-two"
      }, {
        id: "3",
        name: "very-long-tag-name"
      }]
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`Multiple Badges Test - Mobile

Tests how badges wrap and display at narrow widths.
Badges should wrap cleanly without overlapping.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "3",
      title: "This is an extremely long task title that demonstrates responsive behavior at the sm: breakpoint (640px)",
      dueAt: DateTime.now().plus({
        days: 2
      }).toISODate()!,
      priority: "medium"
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet"
    }
  }
}`,...i.parameters?.docs?.source},description:{story:`Long Title - Tablet (640px - sm: breakpoint)

At the sm: breakpoint (640px), spacing should increase:
- Gaps: 1.5 → 2
- Padding: 0.5 → 1
- Timeline: 5 → 6 units wide`,...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "4",
      title: "This is an extremely long task title that demonstrates desktop responsive behavior with full spacing",
      dueAt: DateTime.now().plus({
        days: 3
      }).toISODate()!,
      priority: "low",
      category: "Personal"
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop"
    }
  }
}`,...l.parameters?.docs?.source},description:{story:`Long Title - Desktop (1024px)

At desktop widths, all responsive enhancements are active.`,...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <TaskItem task={taskBuilder.base({
      id: "1",
      title: "Short title",
      priority: "high"
    })} {...mockHandlers} />
      <TaskItem task={taskBuilder.base({
      id: "2",
      title: "Medium length title that is somewhat longer",
      priority: "medium"
    })} {...mockHandlers} />
      <TaskItem task={taskBuilder.base({
      id: "3",
      title: "Very long title that will definitely need to truncate on narrow viewports to prevent layout breaking",
      priority: "low",
      category: "Work",
      tags: [{
        id: "1",
        name: "urgent"
      }]
    })} {...mockHandlers} />
      <TaskItem task={taskBuilder.base({
      id: "4",
      title: "Another extremely long task title with many badges to test wrapping behavior",
      dueAt: DateTime.now().toISODate()!,
      startAt: DateTime.now().minus({
        days: 1
      }).toISODate()!,
      priority: "high",
      category: "Personal",
      tags: [{
        id: "1",
        name: "tag1"
      }, {
        id: "2",
        name: "tag2"
      }]
    })} {...mockHandlers} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...p.parameters?.docs?.source},description:{story:`Comparison: Multiple Tasks at Different Widths

Shows multiple tasks at once to see how the layout adapts.
Switch viewports to see responsive behavior across multiple items.`,...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "5",
      title: "Task with long badge labels",
      dueAt: "2026-12-31T23:59:59.999Z",
      category: "Very Long Category Name That Should Truncate",
      tags: [{
        id: "1",
        name: "extremely-long-tag-name-that-should-truncate"
      }]
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...d.parameters?.docs?.source},description:{story:`Badge Truncation Test

Tests that long badge labels truncate properly.`,...d.parameters?.docs?.description}}};const P=["LongTitleMobile","MultipleBadgesMobile","LongTitleTablet","LongTitleDesktop","MultipleTasksComparison","BadgeTruncationTest"];export{d as BadgeTruncationTest,l as LongTitleDesktop,r as LongTitleMobile,i as LongTitleTablet,o as MultipleBadgesMobile,p as MultipleTasksComparison,P as __namedExportsOrder,C as default};
