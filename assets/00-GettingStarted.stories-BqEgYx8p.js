import{j as n}from"./jsx-runtime-u17CrQMm.js";const e={title:"00-Introduction/Getting Started",parameters:{layout:"centered"}},i={render:()=>n.jsxs("div",{className:"prose max-w-2xl",children:[n.jsx("h1",{children:"Tasks Timeline Component Library"}),n.jsx("h2",{children:"Welcome! 👋"}),n.jsx("p",{children:"This is a comprehensive React component library for building task management and timeline visualization applications."}),n.jsx("h2",{children:"📦 Available Components"}),n.jsxs("ul",{children:[n.jsxs("li",{children:[n.jsx("strong",{children:"TaskItem"})," - Individual task display with status, priority, and actions"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"TodoList"})," - Main container for displaying tasks with grouping"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"InputBar"})," - Create/edit tasks with AI support"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"DaySection"})," - Tasks grouped by day"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"YearSection"})," - Tasks grouped by year"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"BacklogSection"})," - Unscheduled tasks view"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"TaskEditModal"})," - Comprehensive task editor"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"SettingsModal"})," - App configuration interface"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"HelpModal"})," - User guidance and documentation"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"Toast"})," - Notification system"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"Icon"})," - Lucide icon wrapper"]})]}),n.jsx("h2",{children:"🎣 Available Hooks"}),n.jsxs("ul",{children:[n.jsxs("li",{children:[n.jsx("strong",{children:"useTaskFiltering"})," - Filter tasks by status, priority, category, tags"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"useTaskStats"})," - Calculate task statistics"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"useAIAgent"})," - AI integration (Gemini, OpenAI, Anthropic)"]}),n.jsxs("li",{children:[n.jsx("strong",{children:"useVoiceInput"})," - Browser voice input handling"]})]}),n.jsx("h2",{children:"🚀 Quick Start"}),n.jsx("pre",{children:n.jsx("code",{children:`import { TaskItem, Icon } from '@tasks-timeline/component-library';

export function MyApp() {
  return (
    <TaskItem 
      task={task} 
      settings={settings}
      onStatusChange={handleStatusChange}
    />
  );
}`})}),n.jsx("h2",{children:"🎨 Features"}),n.jsxs("ul",{children:[n.jsx("li",{children:"✅ Fully typed with TypeScript"}),n.jsx("li",{children:"✅ Dark mode support"}),n.jsx("li",{children:"✅ AI-powered task suggestions"}),n.jsx("li",{children:"✅ Voice input integration"}),n.jsx("li",{children:"✅ Recurrence rule support"}),n.jsx("li",{children:"✅ Custom filtering and sorting"}),n.jsx("li",{children:"✅ Responsive design"}),n.jsx("li",{children:"✅ Production-ready"})]}),n.jsx("h2",{children:"📚 Explore"}),n.jsx("p",{children:"Check out the components and hooks in the sidebar to see live examples and documentation."})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="prose max-w-2xl">
      <h1>Tasks Timeline Component Library</h1>

      <h2>Welcome! 👋</h2>
      <p>
        This is a comprehensive React component library for building task
        management and timeline visualization applications.
      </p>

      <h2>📦 Available Components</h2>
      <ul>
        <li>
          <strong>TaskItem</strong> - Individual task display with status,
          priority, and actions
        </li>
        <li>
          <strong>TodoList</strong> - Main container for displaying tasks with
          grouping
        </li>
        <li>
          <strong>InputBar</strong> - Create/edit tasks with AI support
        </li>
        <li>
          <strong>DaySection</strong> - Tasks grouped by day
        </li>
        <li>
          <strong>YearSection</strong> - Tasks grouped by year
        </li>
        <li>
          <strong>BacklogSection</strong> - Unscheduled tasks view
        </li>
        <li>
          <strong>TaskEditModal</strong> - Comprehensive task editor
        </li>
        <li>
          <strong>SettingsModal</strong> - App configuration interface
        </li>
        <li>
          <strong>HelpModal</strong> - User guidance and documentation
        </li>
        <li>
          <strong>Toast</strong> - Notification system
        </li>
        <li>
          <strong>Icon</strong> - Lucide icon wrapper
        </li>
      </ul>

      <h2>🎣 Available Hooks</h2>
      <ul>
        <li>
          <strong>useTaskFiltering</strong> - Filter tasks by status, priority,
          category, tags
        </li>
        <li>
          <strong>useTaskStats</strong> - Calculate task statistics
        </li>
        <li>
          <strong>useAIAgent</strong> - AI integration (Gemini, OpenAI,
          Anthropic)
        </li>
        <li>
          <strong>useVoiceInput</strong> - Browser voice input handling
        </li>
      </ul>

      <h2>🚀 Quick Start</h2>
      <pre>
        <code>{\`import { TaskItem, Icon } from '@tasks-timeline/component-library';

export function MyApp() {
  return (
    <TaskItem 
      task={task} 
      settings={settings}
      onStatusChange={handleStatusChange}
    />
  );
}\`}</code>
      </pre>

      <h2>🎨 Features</h2>
      <ul>
        <li>✅ Fully typed with TypeScript</li>
        <li>✅ Dark mode support</li>
        <li>✅ AI-powered task suggestions</li>
        <li>✅ Voice input integration</li>
        <li>✅ Recurrence rule support</li>
        <li>✅ Custom filtering and sorting</li>
        <li>✅ Responsive design</li>
        <li>✅ Production-ready</li>
      </ul>

      <h2>📚 Explore</h2>
      <p>
        Check out the components and hooks in the sidebar to see live examples
        and documentation.
      </p>
    </div>
}`,...i.parameters?.docs?.source}}};const t=["Overview"];export{i as Overview,t as __namedExportsOrder,e as default};
