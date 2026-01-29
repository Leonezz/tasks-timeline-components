import{j as A}from"./jsx-runtime-u17CrQMm.js";import{T as N}from"./TaskEditModal-V__ARYRI.js";import{t}from"./tasks-BV5_RF93.js";import"./edge-cases-Dobf_xol.js";import{d as j}from"./test-utils-BNouzmjp.js";import{R as o}from"./index-goBt61iM.js";import"./iframe-KW6RtBM2.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-CFZCLKt0.js";import"./calendar-BTs5a-KE.js";import"./popover-DUPQEFUd.js";import"./index-CuxhDgIS.js";import"./index-BH6JDbuJ.js";import"./index-6uNkXKNh.js";import"./proxy-B9VYbwnC.js";const{expect:p,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,se={title:"Core/TaskEditModal",component:N,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onSave:{action:"saved"},onClose:{action:"closed"}},decorators:[r=>A.jsx("div",{className:"w-full h-screen flex items-center justify-center bg-slate-50",children:A.jsx(r,{})})]},V=t.base({id:"1",title:"Complete project setup",description:"Set up the component library configuration and build system",priority:"high",category:"Work",tags:[{id:"1",name:"work"},{id:"2",name:"setup"}]}),i=r=>console.log("Save task:",r),c=()=>console.log("Close modal"),e={args:{isOpen:!0,task:V,onSave:i,onClose:c,availableCategories:["Work","Personal","Shopping","Health"]}},g={args:{isOpen:!1,task:V,onSave:i,onClose:c,availableCategories:["Work","Personal"]}},d={args:{isOpen:!0,task:null,onSave:i,onClose:c,availableCategories:["Work","Personal","Shopping"]}},m={args:{isOpen:!0,task:t.base({title:"Complete quarterly report",description:"Compile and analyze Q4 2024 performance metrics for executive review",priority:"high",category:"Work",tags:[{id:"1",name:"reporting"},{id:"2",name:"quarterly"},{id:"3",name:"urgent"}]}),onSave:i,onClose:c,availableCategories:["Work","Personal","Shopping","Health"]}},y={args:{isOpen:!0,task:t.base({title:"Minimal task",description:"",category:void 0,tags:[]}),onSave:i,onClose:c,availableCategories:["Work","Personal"]}},v={args:{...e.args,task:t.highPriority({title:"Critical bug fix required"})}},k={args:{...e.args,task:t.mediumPriority({title:"Regular task"})}},h={args:{...e.args,task:t.lowPriority({title:"Nice to have task"})}},w={args:{isOpen:!0,task:t.withRecurrence({title:"Daily standup",isRecurring:!0,recurringInterval:new o({freq:o.DAILY,interval:1}).toString()}),onSave:i,onClose:c,availableCategories:["Work"]}},C={args:{isOpen:!0,task:t.withRecurrence({title:"Weekly team meeting",isRecurring:!0,recurringInterval:new o({freq:o.WEEKLY,interval:1,byweekday:[o.MO,o.WE,o.FR]}).toString()}),onSave:i,onClose:c,availableCategories:["Work"]}},S={args:{isOpen:!0,task:t.withRecurrence({title:"Monthly report",isRecurring:!0,recurringInterval:new o({freq:o.MONTHLY,interval:1,bymonthday:[1]}).toString()}),onSave:i,onClose:c,availableCategories:["Work"]}},b={args:{isOpen:!0,task:t.withRecurrence({title:"Annual performance review",isRecurring:!0,recurringInterval:new o({freq:o.YEARLY,interval:1,bymonth:[12],bymonthday:[31]}).toString()}),onSave:i,onClose:c,availableCategories:["Work"]}},R={args:{isOpen:!0,task:t.withRecurrence({title:"Task with limited recurrence",isRecurring:!0,recurringInterval:new o({freq:o.WEEKLY,interval:1,until:new Date(2025,11,31)}).toString()}),onSave:i,onClose:c,availableCategories:["Work"]}},T={args:{...e.args,task:t.completed({title:"Completed task to edit"})}},f={args:{...e.args,task:t.overdue({title:"Overdue task needs attention"})}},B={args:{...e.args,task:t.scheduled({title:"Scheduled for future"})}},E={args:{...e.args,task:t.base({title:`${"A".repeat(200)} very long title that should wrap properly`})}},D={args:{...e.args,task:t.base({title:"Task with long description",description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(50)})}},W={args:{...e.args,task:t.withTags(15,{title:"Task with many tags"})}},O={args:{...e.args,availableCategories:["Work","Personal","Shopping","Health","Finance","Education","Home","Travel","Fitness","Hobbies","Social","Family","Career","Projects","Ideas"]}},x={args:{...e.args,availableCategories:[]}},I={args:{...e.args,task:t.base({title:"🎉 Unicode test: 日本語 中文 العربية 🚀",description:"Testing emoji and international characters: 你好世界 مرحبا بك ハロー・ワールド",category:"測試"})}},P={args:{...e.args,task:t.base({title:""})},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Try to save without title",async()=>{const a=s.getByRole("button",{name:/save/i});await l.click(a),await j(100)})}},M={args:{...e.args},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Find title input",async()=>{const a=s.getByDisplayValue(/Complete project setup/i);p(a).toBeInTheDocument()}),await n("Clear and type new title",async()=>{const a=s.getByDisplayValue(/Complete project setup/i);await l.clear(a),await l.type(a,"New task title"),await j(100),p(a).toHaveValue("New task title")})}},F={args:{...e.args},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Find priority selector",async()=>{const a=s.getAllByRole("radio");p(a.length).toBeGreaterThan(0)})}},L={args:{...e.args},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Find recurrence checkbox",async()=>{const a=s.getByRole("checkbox",{name:/recurring/i});p(a).toBeInTheDocument()}),await n("Toggle recurrence on",async()=>{const a=s.getByRole("checkbox",{name:/recurring/i});await l.click(a),await j(200)})}},q={args:{...e.args},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Find category selector",async()=>{const a=s.getByText(/Work/i);p(a).toBeInTheDocument()})}},H={args:{...e.args},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Find close button",async()=>{const a=s.getAllByRole("button");p(a.length).toBeGreaterThan(0)})}},Y={args:{...e.args,task:t.base({title:"Task to save",description:"This task will be saved"})},play:async({canvasElement:r,step:n})=>{const s=u(r);await n("Modify title",async()=>{const a=s.getByDisplayValue(/Task to save/i);await l.clear(a),await l.type(a,"Modified task title")}),await n("Click save button",async()=>{const a=s.getByRole("button",{name:/save/i});await l.click(a),await j(100)})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"]
  }
}`,...e.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: false,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"]
  }
}`,...g.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: null,
    // Creating new task from scratch
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping"]
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Complete quarterly report",
      description: "Compile and analyze Q4 2024 performance metrics for executive review",
      priority: "high",
      category: "Work",
      tags: [{
        id: "1",
        name: "reporting"
      }, {
        id: "2",
        name: "quarterly"
      }, {
        id: "3",
        name: "urgent"
      }]
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"]
  }
}`,...m.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Minimal task",
      description: "",
      category: undefined,
      tags: []
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"]
  }
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.highPriority({
      title: "Critical bug fix required"
    })
  }
}`,...v.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.mediumPriority({
      title: "Regular task"
    })
  }
}`,...k.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.lowPriority({
      title: "Nice to have task"
    })
  }
}`,...h.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Daily standup",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.DAILY,
        interval: 1
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...w.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Weekly team meeting",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: [RRule.MO, RRule.WE, RRule.FR]
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...C.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Monthly report",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: [1] // First day of month
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...S.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Annual performance review",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.YEARLY,
        interval: 1,
        bymonth: [12],
        // December
        bymonthday: [31] // Last day
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...b.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Task with limited recurrence",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        until: new Date(2025, 11, 31) // End on Dec 31, 2025
      }).toString()
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"]
  }
}`,...R.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.completed({
      title: "Completed task to edit"
    })
  }
}`,...T.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.overdue({
      title: "Overdue task needs attention"
    })
  }
}`,...f.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.scheduled({
      title: "Scheduled for future"
    })
  }
}`,...B.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: \`\${"A".repeat(200)} very long title that should wrap properly\`
    })
  }
}`,...E.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task with long description",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(50)
    })
  }
}`,...D.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.withTags(15, {
      title: "Task with many tags"
    })
  }
}`,...W.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: ["Work", "Personal", "Shopping", "Health", "Finance", "Education", "Home", "Travel", "Fitness", "Hobbies", "Social", "Family", "Career", "Projects", "Ideas"]
  }
}`,...O.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableCategories: []
  }
}`,...x.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "🎉 Unicode test: 日本語 中文 العربية 🚀",
      description: "Testing emoji and international characters: 你好世界 مرحبا بك ハロー・ワールド",
      category: "測試"
    })
  }
}`,...I.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: ""
    })
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Try to save without title", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /save/i
      });
      await userEvent.click(saveButton);
      // Form should prevent submission or show error
      await delay(100);
    });
  }
}`,...P.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find title input", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      expect(titleInput).toBeInTheDocument();
    });
    await step("Clear and type new title", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "New task title");
      await delay(100);
      expect(titleInput).toHaveValue("New task title");
    });
  }
}`,...M.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find priority selector", async () => {
      // Priority is typically a select or radio group
      const priorityElements = canvas.getAllByRole("radio");
      expect(priorityElements.length).toBeGreaterThan(0);
    });
  }
}`,...F.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find recurrence checkbox", async () => {
      const recurrenceCheckbox = canvas.getByRole("checkbox", {
        name: /recurring/i
      });
      expect(recurrenceCheckbox).toBeInTheDocument();
    });
    await step("Toggle recurrence on", async () => {
      const recurrenceCheckbox = canvas.getByRole("checkbox", {
        name: /recurring/i
      });
      await userEvent.click(recurrenceCheckbox);
      await delay(200);
    });
  }
}`,...L.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find category selector", async () => {
      // Category is typically a select or button that opens popover
      const categoryButton = canvas.getByText(/Work/i);
      expect(categoryButton).toBeInTheDocument();
    });
  }
}`,...q.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find close button", async () => {
      const closeButtons = canvas.getAllByRole("button");
      // Should have at least one close button (X or Cancel)
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
}`,...H.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task to save",
      description: "This task will be saved"
    })
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Modify title", async () => {
      const titleInput = canvas.getByDisplayValue(/Task to save/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Modified task title");
    });
    await step("Click save button", async () => {
      const saveButton = canvas.getByRole("button", {
        name: /save/i
      });
      await userEvent.click(saveButton);
      await delay(100);
      // OnSave should be called
    });
  }
}`,...Y.parameters?.docs?.source}}};const oe=["Default","Closed","NewTask","AllFieldsFilled","MinimalTask","HighPriority","MediumPriority","LowPriority","WithDailyRecurrence","WithWeeklyRecurrence","WithMonthlyRecurrence","WithYearlyRecurrence","WithRecurrenceEndDate","CompletedTask","OverdueTask","ScheduledTask","VeryLongTitle","VeryLongDescription","ManyTags","ManyCategories","NoCategories","UnicodeContent","FormValidation","EditTitle","ChangePriority","ToggleRecurrence","SelectCategory","CloseModal","SaveTask"];export{m as AllFieldsFilled,F as ChangePriority,H as CloseModal,g as Closed,T as CompletedTask,e as Default,M as EditTitle,P as FormValidation,v as HighPriority,h as LowPriority,O as ManyCategories,W as ManyTags,k as MediumPriority,y as MinimalTask,d as NewTask,x as NoCategories,f as OverdueTask,Y as SaveTask,B as ScheduledTask,q as SelectCategory,L as ToggleRecurrence,I as UnicodeContent,D as VeryLongDescription,E as VeryLongTitle,w as WithDailyRecurrence,S as WithMonthlyRecurrence,R as WithRecurrenceEndDate,C as WithWeeklyRecurrence,b as WithYearlyRecurrence,oe as __namedExportsOrder,se as default};
