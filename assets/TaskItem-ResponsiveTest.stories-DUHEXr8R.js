import{j as t}from"./jsx-runtime-u17CrQMm.js";import{T as d}from"./TaskItem-C3OP4Dl6.js";import{A as m}from"./AppContext-BGpZXZLM.js";import{T as g,S as c}from"./SettingsContext-CD1KsnZl.js";import{s as u}from"./settings-GESQiD84.js";import{t as a}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{D as o}from"./recurrence-B2fS74Tu.js";import"./iframe-C21N2aj2.js";import"./preload-helper-PPVm8Dsz.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";import"./index-B7dtx8Vx.js";const h={tasks:[],availableCategories:["Work","Personal"],availableTags:["urgent","important"],onUpdateTask:e=>console.log("Update:",e),onDeleteTask:e=>console.log("Delete:",e),onAddTask:e=>console.log("Add:",e),onEditTask:e=>console.log("Edit:",e),onAICommand:async e=>console.log("AI command:",e)},w={settings:u.default(),updateSettings:e=>console.log("Update settings:",e),isFocusMode:!1,toggleFocusMode:()=>console.log("Toggle focus mode"),isAiMode:!1,toggleAiMode:()=>console.log("Toggle AI mode"),filters:{tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""},onFilterChange:e=>console.log("Filter change:",e),sort:{field:"dueAt",direction:"asc",script:""},onSortChange:e=>console.log("Sort change:",e),onVoiceError:e=>console.error("Voice error:",e)},J={title:"Core/TaskItem Responsive Tests",component:d,tags:["autodocs"],parameters:{layout:"padded",viewport:{viewports:{ultraNarrow:{name:"Ultra Narrow (320px) - Compact Mode",styles:{width:"320px",height:"568px"}},narrow:{name:"Narrow (380px) - Timeline Appears",styles:{width:"380px",height:"667px"}},mobile:{name:"Mobile (400px) - Full Mobile",styles:{width:"400px",height:"667px"}},tablet:{name:"Tablet (640px - sm breakpoint)",styles:{width:"640px",height:"1024px"}},desktop:{name:"Desktop (1024px)",styles:{width:"1024px",height:"768px"}}},defaultViewport:"ultraNarrow"}},decorators:[e=>t.jsx(m,{children:t.jsx(g,{value:h,children:t.jsx(c,{value:w,children:t.jsx("div",{className:"bg-slate-50 min-h-screen p-4",children:t.jsx("div",{className:"max-w-4xl mx-auto",children:t.jsx(e,{})})})})})})]},s={args:{task:a.base({id:"1",title:"This is an extremely long task title that demonstrates text truncation on narrow viewports instead of wrapping and breaking the layout",dueAt:o.now().plus({days:1}).toISODate(),priority:"high",category:"Work",tags:[{id:"1",name:"urgent"},{id:"2",name:"important"}],description:"This task has a very long title to test responsive truncation behavior at narrow viewport widths."})},parameters:{viewport:{defaultViewport:"mobile"}}},n={args:{task:a.base({id:"2",title:"Task with many metadata badges",dueAt:o.now().toISODate(),startAt:o.now().minus({days:1}).toISODate(),createdAt:o.now().minus({days:7}).toISO(),priority:"high",category:"Very Long Category Name",tags:[{id:"1",name:"tag-one"},{id:"2",name:"tag-two"},{id:"3",name:"very-long-tag-name"}]})},parameters:{viewport:{defaultViewport:"mobile"}}},r={args:{task:a.base({id:"3",title:"This is an extremely long task title that demonstrates responsive behavior at the sm: breakpoint (640px)",dueAt:o.now().plus({days:2}).toISODate(),priority:"medium"})},parameters:{viewport:{defaultViewport:"tablet"}}},i={args:{task:a.base({id:"4",title:"This is an extremely long task title that demonstrates desktop responsive behavior with full spacing",dueAt:o.now().plus({days:3}).toISODate(),priority:"low",category:"Personal"})},parameters:{viewport:{defaultViewport:"desktop"}}},l={render:()=>t.jsxs("div",{className:"space-y-2",children:[t.jsx(d,{task:a.base({id:"1",title:"Short title",priority:"high"})}),t.jsx(d,{task:a.base({id:"2",title:"Medium length title that is somewhat longer",priority:"medium"})}),t.jsx(d,{task:a.base({id:"3",title:"Very long title that will definitely need to truncate on narrow viewports to prevent layout breaking",priority:"low",category:"Work",tags:[{id:"1",name:"urgent"}]})}),t.jsx(d,{task:a.base({id:"4",title:"Another extremely long task title with many badges to test wrapping behavior",dueAt:o.now().toISODate(),startAt:o.now().minus({days:1}).toISODate(),priority:"high",category:"Personal",tags:[{id:"1",name:"tag1"},{id:"2",name:"tag2"}]})})]}),parameters:{viewport:{defaultViewport:"mobile"}}},p={args:{task:a.base({id:"5",title:"Task with long badge labels",dueAt:"2026-12-31T23:59:59.999Z",category:"Very Long Category Name That Should Truncate",tags:[{id:"1",name:"extremely-long-tag-name-that-should-truncate"}]})},parameters:{viewport:{defaultViewport:"mobile"}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...s.parameters?.docs?.source},description:{story:`Long Title Test - Mobile (320px)

This demonstrates the fix for issue #12.
The title should truncate cleanly with ellipsis (...) instead of wrapping.

Test at different viewport sizes using the viewport toolbar:
- Mobile (320px): Title should truncate, tight spacing
- Tablet (640px): Spacing increases at sm: breakpoint
- Desktop (1024px): Full spacing`,...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...n.parameters?.docs?.source},description:{story:`Multiple Badges Test - Mobile

Tests how badges wrap and display at narrow widths.
Badges should wrap cleanly without overlapping.`,...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "3",
      title: "This is an extremely long task title that demonstrates responsive behavior at the sm: breakpoint (640px)",
      dueAt: DateTime.now().plus({
        days: 2
      }).toISODate()!,
      priority: "medium"
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet"
    }
  }
}`,...r.parameters?.docs?.source},description:{story:`Long Title - Tablet (640px - sm: breakpoint)

At the sm: breakpoint (640px), spacing should increase:
- Gaps: 1.5 → 2
- Padding: 0.5 → 1
- Timeline: 5 → 6 units wide`,...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "4",
      title: "This is an extremely long task title that demonstrates desktop responsive behavior with full spacing",
      dueAt: DateTime.now().plus({
        days: 3
      }).toISODate()!,
      priority: "low",
      category: "Personal"
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop"
    }
  }
}`,...i.parameters?.docs?.source},description:{story:`Long Title - Desktop (1024px)

At desktop widths, all responsive enhancements are active.`,...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <TaskItem task={taskBuilder.base({
      id: "1",
      title: "Short title",
      priority: "high"
    })} />
      <TaskItem task={taskBuilder.base({
      id: "2",
      title: "Medium length title that is somewhat longer",
      priority: "medium"
    })} />
      <TaskItem task={taskBuilder.base({
      id: "3",
      title: "Very long title that will definitely need to truncate on narrow viewports to prevent layout breaking",
      priority: "low",
      category: "Work",
      tags: [{
        id: "1",
        name: "urgent"
      }]
    })} />
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
    })} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...l.parameters?.docs?.source},description:{story:`Comparison: Multiple Tasks at Different Widths

Shows multiple tasks at once to see how the layout adapts.
Switch viewports to see responsive behavior across multiple items.`,...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile"
    }
  }
}`,...p.parameters?.docs?.source},description:{story:`Badge Truncation Test

Tests that long badge labels truncate properly.`,...p.parameters?.docs?.description}}};const K=["LongTitleMobile","MultipleBadgesMobile","LongTitleTablet","LongTitleDesktop","MultipleTasksComparison","BadgeTruncationTest"];export{p as BadgeTruncationTest,i as LongTitleDesktop,s as LongTitleMobile,r as LongTitleTablet,n as MultipleBadgesMobile,l as MultipleTasksComparison,K as __namedExportsOrder,J as default};
