import{j as e}from"./jsx-runtime-u17CrQMm.js";import{T as d}from"./TaskItem-D3AwZpwj.js";import{A as l}from"./AppContext-lZWvOUO0.js";import{t as a}from"./tasks-D2syl_55.js";import"./edge-cases-CRkSQ-i-.js";import{D as t}from"./datetime-CoIMkCUY.js";import"./iframe-MqrkKuKk.js";import"./preload-helper-PPVm8Dsz.js";import"./index-goBt61iM.js";import"./Icon-vyFwuaK4.js";import"./chevron-right-ByMWbQtw.js";import"./Motion-BeGSOOVP.js";import"./proxy-BsFmiW0h.js";import"./DateBadge-J6cUNxmw.js";import"./popover-CQz9xRHp.js";import"./index-0RUQiWIL.js";import"./index-BD2EFwuE.js";import"./calendar-DKwpadDL.js";import"./TagBadge-DBuU23h0.js";import"./PriorityPopover-B2WTDur4.js";import"./CategoryPopover-YClKO7Wx.js";import"./SettingsContext-jASy5Yni.js";import"./index-d7kFXdI-.js";const M={title:"Core/TaskItem Compact Mode",component:d,tags:["autodocs"],parameters:{layout:"padded",viewport:{viewports:{ultraNarrow320:{name:"320px (Compact)",styles:{width:"320px",height:"568px"}},narrow350:{name:"350px (Compact)",styles:{width:"350px",height:"667px"}},narrow380:{name:"380px (Timeline Shows)",styles:{width:"380px",height:"667px"}},mobile400:{name:"400px (Full Mobile)",styles:{width:"400px",height:"667px"}}},defaultViewport:"narrow350"}},decorators:[s=>e.jsx(l,{children:e.jsx("div",{className:"bg-slate-50 min-h-screen p-2",children:e.jsx(s,{})})})]},n={onUpdate:s=>console.log("Update:",s),onDelete:s=>console.log("Delete:",s),onEdit:s=>console.log("Edit:",s)},i={args:{task:a.base({id:"1",title:"Task in compact mode with timeline preserved",dueAt:t.now().plus({days:1}).toISODate(),startAt:t.now().toISODate(),priority:"high",category:"Work",tags:[{id:"1",name:"urgent"}],description:"Notice: Timeline remains visible for editing access!"}),...n},parameters:{viewport:{defaultViewport:"narrow350"}}},o={args:{task:a.base({id:"2",title:"Task with full badges at 400px width",dueAt:t.now().plus({days:1}).toISODate(),createdAt:t.now().minus({days:3}).toISO(),priority:"low",category:"Personal"}),...n},parameters:{viewport:{defaultViewport:"mobile400"}}},r={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{task:a.base({id:"1",title:"Short task",priority:"high"}),...n}),e.jsx(d,{task:a.base({id:"2",title:"Medium length task with some badges",dueAt:t.now().toISODate(),priority:"medium",category:"Work"}),...n}),e.jsx(d,{task:a.base({id:"3",title:"Very long task title that demonstrates text truncation",dueAt:t.now().plus({days:1}).toISODate(),startAt:t.now().toISODate(),priority:"high",category:"Personal",tags:[{id:"1",name:"urgent"},{id:"2",name:"important"}]}),...n})]}),parameters:{viewport:{defaultViewport:"narrow350"}}},p={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded p-3 text-xs",children:[e.jsx("h3",{className:"font-bold mb-2",children:"Current Breakpoint Info"}),e.jsxs("ul",{className:"space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"< 400px:"})," Compact - Small badges, timeline visible"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"400px-639px:"})," Full mobile - All badges visible"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"640px+:"})," Desktop - Maximum spacing"]})]})]}),e.jsx(d,{task:a.base({id:"demo",title:"Resize viewport to see responsive changes!",dueAt:t.now().plus({days:1}).toISODate(),startAt:t.now().toISODate(),createdAt:t.now().minus({days:2}).toISO(),priority:"high",category:"Demo",tags:[{id:"1",name:"responsive"}]}),...n})]}),parameters:{viewport:{defaultViewport:"narrow350"}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...i.parameters?.docs?.source},description:{story:`Compact Mode Demonstration (< 400px)

At narrow widths (< 400px), the layout optimizations include:
- Timeline column REMAINS VISIBLE (important for task editing)
- Badges are smaller (h-4.5 instead of h-5)
- Tighter gaps (gap-1 instead of gap-1.5)
- Created date badge is hidden
- Reduced padding (px-1.5 instead of px-2)
- InputBar header uses compact spacing

This makes the UI usable even at 350px width while keeping timeline access!`,...i.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
    }),
    ...mockHandlers
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile400"
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`Full Mobile at 400px

At 400px and above, badges become full size (h-5).
Timeline remains visible at all widths.`,...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <TaskItem task={taskBuilder.base({
      id: "1",
      title: "Short task",
      priority: "high"
    })} {...mockHandlers} />
      <TaskItem task={taskBuilder.base({
      id: "2",
      title: "Medium length task with some badges",
      dueAt: DateTime.now().toISODate()!,
      priority: "medium",
      category: "Work"
    })} {...mockHandlers} />
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
    })} {...mockHandlers} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...r.parameters?.docs?.source},description:{story:`Multiple Tasks - Compact Comparison

Shows how multiple tasks look in compact mode.
Switch between viewports to see progressive enhancement:
- 350px: Compact with timeline visible
- 400px: Full badges
- 640px+: Desktop spacing`,...r.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
    })} {...mockHandlers} />
    </div>,
  parameters: {
    viewport: {
      defaultViewport: "narrow350"
    }
  }
}`,...p.parameters?.docs?.source},description:{story:`Responsive Breakpoints Visualization

This story helps you understand the responsive breakpoints:

1. < 400px: Compact mode (timeline visible, smallest badges)
2. 400px - 639px: Full mobile (all badges, larger size)
3. 640px+: Desktop mode (largest spacing)

Timeline remains visible at ALL widths for editing access.
Use the viewport toolbar to switch between sizes and see the transitions!`,...p.parameters?.docs?.description}}};const z=["CompactMode350px","FullBadgesAt400px","MultipleTasksCompact","BreakpointVisualization"];export{p as BreakpointVisualization,i as CompactMode350px,o as FullBadgesAt400px,r as MultipleTasksCompact,z as __namedExportsOrder,M as default};
