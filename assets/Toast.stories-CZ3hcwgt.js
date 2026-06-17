import{T as v}from"./Toast-C4YoXu00.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-CyaewoAb.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-DxYb8sxz.js";import"./chevron-right-To5XSQqf.js";import"./rruleset-Bu4wjl4G.js";import"./Motion-D8Z3ROwb.js";import"./proxy-DIIW-Zsn.js";import"./MarkdownText-Cbd24QkI.js";import"./index-giDN1A9D.js";const F={title:"UI/Toast",component:v,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onDismiss:{action:"dismissed"},onToggleExpand:{action:"toggle-expand"}}},e=s=>console.log("Dismiss toast:",s),t={args:{toast:{id:"1",variant:"success",title:"Success!",description:"Your task has been created successfully.",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},n={args:{toast:{id:"2",variant:"error",title:"Error",description:"Failed to save task. Please try again.",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},i={args:{toast:{id:"3",variant:"info",title:"Information",description:"Your tasks are being synced to the cloud.",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},a={args:{toast:{id:"warn-1",variant:"warning",title:"Attention Required",description:"3 tasks are overdue.",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},o={args:{toast:{id:"4",variant:"success",title:"Task Created",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},r={args:{toast:{id:"5",variant:"info",title:"Sync Complete",description:"All your tasks have been successfully synchronized with your other devices and cloud storage.",interaction:{kind:"dismiss"},timeout:4e3},onDismiss:e}},l={args:{toast:{id:"body-1",variant:"info",title:"Today's Plan",description:"5 tasks for today",body:"You have 3 high-priority tasks that need attention. Consider focusing on the project deadline first, then handling the bug reports.",interaction:{kind:"dismiss"},timeout:null},onDismiss:e}},d={args:{toast:{id:"confirm-1",variant:"info",title:'Delete "Fix login bug"?',description:"This action cannot be undone.",interaction:{kind:"confirm",onConfirm:()=>console.log("Confirmed!"),onCancel:()=>console.log("Cancelled!")},timeout:null},onDismiss:e}},c={args:{toast:{id:"confirm-2",variant:"warning",title:"Update 5 tasks?",description:"This will apply changes to all matching tasks.",interaction:{kind:"confirm",onConfirm:()=>console.log("Confirmed!"),onCancel:()=>console.log("Cancelled!"),confirmLabel:"Update All",cancelLabel:"Cancel"},timeout:null},onDismiss:e}},m={args:{toast:{id:"select-1",variant:"info",title:"Choose a category",interaction:{kind:"select",options:[{label:"Work",value:"work"},{label:"Personal",value:"personal"},{label:"Health",value:"health"}],onSelect:s=>console.log("Selected:",s),onCancel:()=>console.log("Cancelled!")},timeout:null},onDismiss:e}},u={args:{toast:{id:"detail-text-1",variant:"success",title:"Batch Update Complete",description:"3 tasks updated",detail:[{type:"text",content:"Changed priority to high for 3 tasks matching your filter criteria. All tasks were updated successfully."}],interaction:{kind:"dismiss"},timeout:8e3},onDismiss:e,isExpanded:!0,onToggleExpand:s=>console.log("Toggle expand:",s)}},p={args:{toast:{id:"detail-tasks-1",variant:"info",title:"Found 3 tasks",detail:[{type:"task-list",label:"Search Results",tasks:[{id:"1",title:"Fix login bug",status:"overdue",priority:"high",tags:[]},{id:"2",title:"Update API docs",status:"todo",priority:"medium",tags:[]},{id:"3",title:"Deploy v2.0",status:"scheduled",priority:"high",tags:[]}]}],interaction:{kind:"dismiss"},timeout:8e3},onDismiss:e,isExpanded:!0,onToggleExpand:s=>console.log("Toggle expand:",s)}},g={args:{toast:{id:"detail-stats-1",variant:"info",title:"Task Statistics",description:"25 total tasks",detail:[{type:"stats",data:{total:25,byStatus:{done:10,todo:5,doing:3,overdue:4,scheduled:2,unplanned:1},byPriority:{high:8,medium:12,low:5}}}],interaction:{kind:"dismiss"},timeout:8e3},onDismiss:e,isExpanded:!0,onToggleExpand:s=>console.log("Toggle expand:",s)}},h={args:{toast:{id:"detail-kv-1",variant:"success",title:"Task Created",description:"New task added successfully",detail:[{type:"key-value",entries:[{key:"Title",value:"Fix login bug"},{key:"Priority",value:"High"},{key:"Due",value:"Tomorrow"},{key:"Category",value:"Work"}]}],interaction:{kind:"dismiss"},timeout:6e3},onDismiss:e,isExpanded:!0,onToggleExpand:s=>console.log("Toggle expand:",s)}},k={args:{toast:{id:"collapsed-1",variant:"info",title:"Found 5 tasks",description:"Click to expand details",detail:[{type:"task-list",label:"Results",tasks:[{id:"1",title:"Task One",status:"todo",priority:"high",tags:[]},{id:"2",title:"Task Two",status:"doing",priority:"medium",tags:[]}]}],interaction:{kind:"dismiss"},timeout:null},onDismiss:e,isExpanded:!1,onToggleExpand:s=>console.log("Toggle expand:",s)}},y={args:{toast:{id:"prompt-1",variant:"info",title:"What should we name this category?",interaction:{kind:"prompt",onSubmit:s=>console.log("Submitted:",s),onCancel:()=>console.log("Cancelled"),placeholder:"Enter category name..."},timeout:null},onDismiss:e}},D={args:{toast:{id:"prompt-2",variant:"info",title:"What priority should this task have?",interaction:{kind:"prompt",onSubmit:s=>console.log("Submitted:",s),onCancel:()=>console.log("Cancelled")},timeout:null},onDismiss:e}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "1",
      variant: "success",
      title: "Success!",
      description: "Your task has been created successfully.",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "2",
      variant: "error",
      title: "Error",
      description: "Failed to save task. Please try again.",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "3",
      variant: "info",
      title: "Information",
      description: "Your tasks are being synced to the cloud.",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "warn-1",
      variant: "warning",
      title: "Attention Required",
      description: "3 tasks are overdue.",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "4",
      variant: "success",
      title: "Task Created",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "5",
      variant: "info",
      title: "Sync Complete",
      description: "All your tasks have been successfully synchronized with your other devices and cloud storage.",
      interaction: {
        kind: "dismiss"
      },
      timeout: 4000
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "body-1",
      variant: "info",
      title: "Today's Plan",
      description: "5 tasks for today",
      body: "You have 3 high-priority tasks that need attention. Consider focusing on the project deadline first, then handling the bug reports.",
      interaction: {
        kind: "dismiss"
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "confirm-1",
      variant: "info",
      title: 'Delete "Fix login bug"?',
      description: "This action cannot be undone.",
      interaction: {
        kind: "confirm",
        onConfirm: () => console.log("Confirmed!"),
        onCancel: () => console.log("Cancelled!")
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "confirm-2",
      variant: "warning",
      title: "Update 5 tasks?",
      description: "This will apply changes to all matching tasks.",
      interaction: {
        kind: "confirm",
        onConfirm: () => console.log("Confirmed!"),
        onCancel: () => console.log("Cancelled!"),
        confirmLabel: "Update All",
        cancelLabel: "Cancel"
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "select-1",
      variant: "info",
      title: "Choose a category",
      interaction: {
        kind: "select",
        options: [{
          label: "Work",
          value: "work"
        }, {
          label: "Personal",
          value: "personal"
        }, {
          label: "Health",
          value: "health"
        }],
        onSelect: (value: string) => console.log("Selected:", value),
        onCancel: () => console.log("Cancelled!")
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "detail-text-1",
      variant: "success",
      title: "Batch Update Complete",
      description: "3 tasks updated",
      detail: [{
        type: "text",
        content: "Changed priority to high for 3 tasks matching your filter criteria. All tasks were updated successfully."
      }],
      interaction: {
        kind: "dismiss"
      },
      timeout: 8000
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id)
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "detail-tasks-1",
      variant: "info",
      title: "Found 3 tasks",
      detail: [{
        type: "task-list",
        label: "Search Results",
        tasks: [{
          id: "1",
          title: "Fix login bug",
          status: "overdue",
          priority: "high",
          tags: []
        }, {
          id: "2",
          title: "Update API docs",
          status: "todo",
          priority: "medium",
          tags: []
        }, {
          id: "3",
          title: "Deploy v2.0",
          status: "scheduled",
          priority: "high",
          tags: []
        }]
      }],
      interaction: {
        kind: "dismiss"
      },
      timeout: 8000
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id)
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "detail-stats-1",
      variant: "info",
      title: "Task Statistics",
      description: "25 total tasks",
      detail: [{
        type: "stats",
        data: {
          total: 25,
          byStatus: {
            done: 10,
            todo: 5,
            doing: 3,
            overdue: 4,
            scheduled: 2,
            unplanned: 1
          },
          byPriority: {
            high: 8,
            medium: 12,
            low: 5
          }
        }
      }],
      interaction: {
        kind: "dismiss"
      },
      timeout: 8000
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id)
  }
}`,...g.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "detail-kv-1",
      variant: "success",
      title: "Task Created",
      description: "New task added successfully",
      detail: [{
        type: "key-value",
        entries: [{
          key: "Title",
          value: "Fix login bug"
        }, {
          key: "Priority",
          value: "High"
        }, {
          key: "Due",
          value: "Tomorrow"
        }, {
          key: "Category",
          value: "Work"
        }]
      }],
      interaction: {
        kind: "dismiss"
      },
      timeout: 6000
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id)
  }
}`,...h.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "collapsed-1",
      variant: "info",
      title: "Found 5 tasks",
      description: "Click to expand details",
      detail: [{
        type: "task-list",
        label: "Results",
        tasks: [{
          id: "1",
          title: "Task One",
          status: "todo",
          priority: "high",
          tags: []
        }, {
          id: "2",
          title: "Task Two",
          status: "doing",
          priority: "medium",
          tags: []
        }]
      }],
      interaction: {
        kind: "dismiss"
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: false,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id)
  }
}`,...k.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "prompt-1",
      variant: "info",
      title: "What should we name this category?",
      interaction: {
        kind: "prompt",
        onSubmit: (text: string) => console.log("Submitted:", text),
        onCancel: () => console.log("Cancelled"),
        placeholder: "Enter category name..."
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...y.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "prompt-2",
      variant: "info",
      title: "What priority should this task have?",
      interaction: {
        kind: "prompt",
        onSubmit: (text: string) => console.log("Submitted:", text),
        onCancel: () => console.log("Cancelled")
      },
      timeout: null
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...D.parameters?.docs?.source}}};const A=["Success","Error","Info","Warning","WithoutDescription","LongDescription","WithBody","WithConfirm","WithConfirmCustomLabels","WithSelect","WithTextDetail","WithTaskListDetail","WithStatsDetail","WithKeyValueDetail","CollapsedWithDetail","WithPrompt","WithPromptNoPlaceholder"];export{k as CollapsedWithDetail,n as Error,i as Info,r as LongDescription,t as Success,a as Warning,l as WithBody,d as WithConfirm,c as WithConfirmCustomLabels,h as WithKeyValueDetail,y as WithPrompt,D as WithPromptNoPlaceholder,m as WithSelect,g as WithStatsDetail,p as WithTaskListDetail,u as WithTextDetail,o as WithoutDescription,A as __namedExportsOrder,F as default};
