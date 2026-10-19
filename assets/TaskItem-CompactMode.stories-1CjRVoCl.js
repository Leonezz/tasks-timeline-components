import{j as e}from"./jsx-runtime-u17CrQMm.js";import{T as l}from"./TaskItem-C3OP4Dl6.js";import{A as p}from"./AppContext-BGpZXZLM.js";import{T as d,S as m}from"./SettingsContext-CD1KsnZl.js";import{s as c}from"./settings-GESQiD84.js";import{t as a}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{D as s}from"./recurrence-B2fS74Tu.js";import"./iframe-C21N2aj2.js";import"./preload-helper-PPVm8Dsz.js";import"./tslib.es6-C44cpxNM.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./MarkdownText-TCFLTl49.js";import"./index-B7dtx8Vx.js";const g={tasks:[],availableCategories:["Work","Personal","Demo"],availableTags:["urgent","important","responsive"],onUpdateTask:t=>console.log("Update:",t),onDeleteTask:t=>console.log("Delete:",t),onAddTask:t=>console.log("Add:",t),onEditTask:t=>console.log("Edit:",t),onAICommand:async t=>console.log("AI command:",t)},u={settings:c.default(),updateSettings:t=>console.log("Update settings:",t),isFocusMode:!1,toggleFocusMode:()=>console.log("Toggle focus mode"),isAiMode:!1,toggleAiMode:()=>console.log("Toggle AI mode"),filters:{tags:{include:[],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""},onFilterChange:t=>console.log("Filter change:",t),sort:{field:"dueAt",direction:"asc",script:""},onSortChange:t=>console.log("Sort change:",t),onVoiceError:t=>console.error("Voice error:",t)},H={title:"Core/TaskItem Compact Mode",component:l,tags:["autodocs"],parameters:{layout:"padded",viewport:{viewports:{ultraNarrow320:{name:"320px (Compact)",styles:{width:"320px",height:"568px"}},narrow350:{name:"350px (Compact)",styles:{width:"350px",height:"667px"}},narrow380:{name:"380px (Timeline Shows)",styles:{width:"380px",height:"667px"}},mobile400:{name:"400px (Full Mobile)",styles:{width:"400px",height:"667px"}}},defaultViewport:"narrow350"}},decorators:[t=>e.jsx(p,{children:e.jsx(d,{value:g,children:e.jsx(m,{value:u,children:e.jsx("div",{className:"bg-slate-50 min-h-screen p-2",children:e.jsx(t,{})})})})})]},o={args:{task:a.base({id:"1",title:"Task in compact mode with timeline preserved",dueAt:s.now().plus({days:1}).toISODate(),startAt:s.now().toISODate(),priority:"high",category:"Work",tags:[{id:"1",name:"urgent"}],description:"Notice: Timeline remains visible for editing access!"})},parameters:{viewport:{defaultViewport:"narrow350"}}},i={args:{task:a.base({id:"2",title:"Task with full badges at 400px width",dueAt:s.now().plus({days:1}).toISODate(),createdAt:s.now().minus({days:3}).toISO(),priority:"low",category:"Personal"})},parameters:{viewport:{defaultViewport:"mobile400"}}},n={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(l,{task:a.base({id:"1",title:"Short task",priority:"high"})}),e.jsx(l,{task:a.base({id:"2",title:"Medium length task with some badges",dueAt:s.now().toISODate(),priority:"medium",category:"Work"})}),e.jsx(l,{task:a.base({id:"3",title:"Very long task title that demonstrates text truncation",dueAt:s.now().plus({days:1}).toISODate(),startAt:s.now().toISODate(),priority:"high",category:"Personal",tags:[{id:"1",name:"urgent"},{id:"2",name:"important"}]})})]}),parameters:{viewport:{defaultViewport:"narrow350"}}},r={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded p-3 text-xs",children:[e.jsx("h3",{className:"font-bold mb-2",children:"Current Breakpoint Info"}),e.jsxs("ul",{className:"space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"< 400px:"})," Compact - Small badges, timeline visible"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"400px-639px:"})," Full mobile - All badges visible"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"640px+:"})," Desktop - Maximum spacing"]})]})]}),e.jsx(l,{task:a.base({id:"demo",title:"Resize viewport to see responsive changes!",dueAt:s.now().plus({days:1}).toISODate(),startAt:s.now().toISODate(),createdAt:s.now().minus({days:2}).toISO(),priority:"high",category:"Demo",tags:[{id:"1",name:"responsive"}]})})]}),parameters:{viewport:{defaultViewport:"narrow350"}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "1",
      title: "Task in compact mode with timeline preserved",
      dueAt: DateTime.now().plus({
        days: 1
      }).toISODate()!,
      startAt: DateTime.now().toISODate()!,
      priority: "high",
      category: "Work",
      tags: [{
        id: "1",
        name: "urgent"
      }],
      description: "Notice: Timeline remains visible for editing access!"
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`Compact Mode Demonstration (< 400px)

At narrow widths (< 400px), the layout optimizations include:
- Timeline column REMAINS VISIBLE (important for task editing)
- Badges are smaller (h-4.5 instead of h-5)
- Tighter gaps (gap-1 instead of gap-1.5)
- Created date badge is hidden
- Reduced padding (px-1.5 instead of px-2)
- InputBar header uses compact spacing

This makes the UI usable even at 350px width while keeping timeline access!`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    task: taskBuilder.base({
      id: "2",
      title: "Task with full badges at 400px width",
      dueAt: DateTime.now().plus({
        days: 1
      }).toISODate()!,
      createdAt: DateTime.now().minus({
        days: 3
      }).toISO()!,
      priority: "low",
      category: "Personal"
    })
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile400"
    }
  }
}`,...i.parameters?.docs?.source},description:{story:`Full Mobile at 400px

At 400px and above, badges become full size (h-5).
Timeline remains visible at all widths.`,...i.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <TaskItem task={taskBuilder.base({
      id: "1",
      title: "Short task",
      priority: "high"
    })} />
      <TaskItem task={taskBuilder.base({
      id: "2",
      title: "Medium length task with some badges",
      dueAt: DateTime.now().toISODate()!,
      priority: "medium",
      category: "Work"
    })} />
      <TaskItem task={taskBuilder.base({
      id: "3",
      title: "Very long task title that demonstrates text truncation",
      dueAt: DateTime.now().plus({
        days: 1
      }).toISODate()!,
      startAt: DateTime.now().toISODate()!,
      priority: "high",
      category: "Personal",
      tags: [{
        id: "1",
        name: "urgent"
      }, {
        id: "2",
        name: "important"
      }]
    })} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...n.parameters?.docs?.source},description:{story:`Multiple Tasks - Compact Comparison

Shows how multiple tasks look in compact mode.
Switch between viewports to see progressive enhancement:
- 350px: Compact with timeline visible
- 400px: Full badges
- 640px+: Desktop spacing`,...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
        <h3 className="font-bold mb-2">Current Breakpoint Info</h3>
        <ul className="space-y-1">
          <li>
            <strong>{"< 400px:"}</strong> Compact - Small badges, timeline
            visible
          </li>
          <li>
            <strong>400px-639px:</strong> Full mobile - All badges visible
          </li>
          <li>
            <strong>640px+:</strong> Desktop - Maximum spacing
          </li>
        </ul>
      </div>

      <TaskItem task={taskBuilder.base({
      id: "demo",
      title: "Resize viewport to see responsive changes!",
      dueAt: DateTime.now().plus({
        days: 1
      }).toISODate()!,
      startAt: DateTime.now().toISODate()!,
      createdAt: DateTime.now().minus({
        days: 2
      }).toISO()!,
      priority: "high",
      category: "Demo",
      tags: [{
        id: "1",
        name: "responsive"
      }]
    })} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...r.parameters?.docs?.source},description:{story:`Responsive Breakpoints Visualization

This story helps you understand the responsive breakpoints:

1. < 400px: Compact mode (timeline visible, smallest badges)
2. 400px - 639px: Full mobile (all badges, larger size)
3. 640px+: Desktop mode (largest spacing)

Timeline remains visible at ALL widths for editing access.
Use the viewport toolbar to switch between sizes and see the transitions!`,...r.parameters?.docs?.description}}};const J=["CompactMode350px","FullBadgesAt400px","MultipleTasksCompact","BreakpointVisualization"];export{r as BreakpointVisualization,o as CompactMode350px,i as FullBadgesAt400px,n as MultipleTasksCompact,J as __namedExportsOrder,H as default};
