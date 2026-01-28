import{j as K}from"./jsx-runtime-u17CrQMm.js";import{T as q}from"./TagBadge-CoC8s14U.js";import{A as z}from"./AppContext-D-Vr0qkG.js";import{t as s}from"./tasks-BV5_RF93.js";import"./edge-cases-Dobf_xol.js";import{w as d,d as i}from"./test-utils-BNouzmjp.js";import"./Icon-5YkzlUjT.js";import"./iframe-Cm6QGVzw.js";import"./preload-helper-PPVm8Dsz.js";import"./Motion-DbRBu1NO.js";import"./proxy-XOfmZ1UD.js";import"./index-BSO_abFL.js";import"./popover-BdNAdze1.js";import"./index-DCLFA_Bq.js";import"./index-Cx8h6MZ7.js";import"./index-Dx8Dkiul.js";const{expect:m,userEvent:g}=__STORYBOOK_MODULE_TEST__,da={title:"UI/TagBadge",component:q,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{onUpdate:{action:"task-updated"}},decorators:[t=>K.jsx(z,{children:K.jsx("div",{className:"p-4 bg-slate-50 min-w-50",children:K.jsx(t,{})})})]},o="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border font-medium",r=t=>console.log("Updated task:",t),c={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"}]}),onUpdate:r,badgeClass:o}},l={args:{tag:{id:"2",name:"urgent"},task:s.base({tags:[{id:"2",name:"urgent"}]}),onUpdate:r,badgeClass:o}},p={args:{tag:{id:"3",name:"personal"},task:s.base({tags:[{id:"3",name:"personal"}]}),onUpdate:r,badgeClass:o}},u={args:{tag:{id:"4",name:"project-alpha"},task:s.base({tags:[{id:"4",name:"project-alpha"}]}),onUpdate:r,badgeClass:o}},v={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},y={args:{tag:{id:"2",name:"urgent"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},b={args:{tag:{id:"3",name:"client"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},w={args:{...c.args}},k={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Click tag to open remove popover",async()=>{const a=n.getByRole("button",{name:/Click to remove/i});await g.click(a),await i(200)}),await e("Verify Remove Tag button is visible",async()=>{const a=n.getByRole("button",{name:/Remove Tag/i});m(a).toBeInTheDocument()})}},h={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Hover over tag badge",async()=>{const a=n.getByRole("button");await g.hover(a),await i(200)})}},B={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"}]}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Click tag to open popover",async()=>{const a=n.getByRole("button",{name:/Click to remove/i});await g.click(a),await i(200)}),await e("Click Remove Tag button",async()=>{const a=n.getByRole("button",{name:/Remove Tag/i});await g.click(a),await i(100)})}},T={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"}]}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await g.click(a),await i(200)}),await e("Remove the only tag",async()=>{const a=n.getByRole("button",{name:/Remove Tag/i});await g.click(a),await i(100)})}},R={args:{tag:{id:"3",name:"important"},task:s.withTags(5,{title:"Task with many tags"}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await g.click(a),await i(200)}),await e("Remove tag from array of 5",async()=>{const a=n.getByRole("button",{name:/Remove Tag/i});await g.click(a),await i(100)})}},S={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await g.click(a),await i(200)}),await e("Click outside to close",async()=>{await g.click(t),await i(300)})}},C={args:{tag:{id:"1",name:"this-is-a-very-long-tag-name-that-might-overflow-the-badge"},task:s.base({tags:[{id:"1",name:"this-is-a-very-long-tag-name-that-might-overflow-the-badge"}]}),onUpdate:r,badgeClass:o}},U={args:{tag:{id:"1",name:"a"},task:s.base({tags:[{id:"1",name:"a"}]}),onUpdate:r,badgeClass:o}},E={args:{tag:{id:"1",name:"urgent work item"},task:s.base({tags:[{id:"1",name:"urgent work item"}]}),onUpdate:r,badgeClass:o}},x={args:{tag:{id:"1",name:"high-priority-task"},task:s.base({tags:[{id:"1",name:"high-priority-task"}]}),onUpdate:r,badgeClass:o}},f={args:{tag:{id:"1",name:"v2.0"},task:s.base({tags:[{id:"1",name:"v2.0"}]}),onUpdate:r,badgeClass:o}},O={args:{tag:{id:"1",name:"🔥 urgent"},task:s.base({tags:[{id:"1",name:"🔥 urgent"}]}),onUpdate:r,badgeClass:o}},N={args:{tag:{id:"1",name:"client@company"},task:s.base({tags:[{id:"1",name:"client@company"}]}),onUpdate:r,badgeClass:o}},H={args:{tag:{id:"1",name:""},task:s.base({tags:[{id:"1",name:""}]}),onUpdate:r,badgeClass:o}},j={args:{tag:{id:"999",name:"tag"},task:s.base({tags:[{id:"999",name:"tag"}]}),onUpdate:r,badgeClass:o}},M={args:{tag:{id:"550e8400-e29b-41d4-a716-446655440000",name:"uuid-tag"},task:s.base({tags:[{id:"550e8400-e29b-41d4-a716-446655440000",name:"uuid-tag"}]}),onUpdate:r,badgeClass:o}},P={args:{...c.args,badgeClass:"flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"}},I={args:{...c.args,badgeClass:"flex gap-1 px-1 py-0.5 text-xs rounded"}},L={args:{...c.args,badgeClass:"flex items-center gap-2 px-4 py-2 text-base rounded-xl border-2 font-bold"}},V={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify default blue styling",async()=>{const a=n.getByRole("button");m(a.className).toContain("blue")})}},W={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Hover to trigger rose color transition",async()=>{const a=n.getByRole("button");await g.hover(a),await i(300)})}},D={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Tab to tag badge",async()=>{const a=n.getByRole("button");a.focus(),m(a).toHaveFocus()}),await e("Press Enter to open popover",async()=>{await g.keyboard("{Enter}"),await i(200);const a=n.getByRole("button",{name:/Remove Tag/i});m(a).toBeInTheDocument()})}},_={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify button has accessible title",async()=>{const a=n.getByRole("button",{name:/Click to remove/i});m(a).toHaveAttribute("title","Click to remove")})}},A={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify tag name is readable",async()=>{const a=n.getByRole("button");m(a.textContent).toContain("work")}),await e("Open popover and verify remove text",async()=>{const a=n.getByRole("button");await g.click(a),await i(200);const Y=n.getByRole("button",{name:/Remove Tag/i});m(Y.textContent).toContain("Remove Tag")})}},F={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await g.click(a),await i(200)}),await e("Rapidly click remove button",async()=>{const a=n.getByRole("button",{name:/Remove Tag/i});await g.click(a),await i(50)})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "work"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "2",
      name: "urgent"
    },
    task: taskBuilder.base({
      tags: [{
        id: "2",
        name: "urgent"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "3",
      name: "personal"
    },
    task: taskBuilder.base({
      tags: [{
        id: "3",
        name: "personal"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "4",
      name: "project-alpha"
    },
    task: taskBuilder.base({
      tags: [{
        id: "4",
        name: "project-alpha"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...u.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "work"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }, {
        id: "2",
        name: "urgent"
      }, {
        id: "3",
        name: "client"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...v.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "2",
      name: "urgent"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }, {
        id: "2",
        name: "urgent"
      }, {
        id: "3",
        name: "client"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...y.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "3",
      name: "client"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }, {
        id: "2",
        name: "urgent"
      }, {
        id: "3",
        name: "client"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...b.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  }
}`,...w.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Click tag to open remove popover", async () => {
      const button = canvas.getByRole("button", {
        name: /Click to remove/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify Remove Tag button is visible", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      expect(removeButton).toBeInTheDocument();
    });
  }
}`,...k.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Hover over tag badge", async () => {
      const button = canvas.getByRole("button");
      await userEvent.hover(button);
      await delay(200);
      // Should transition to rose color on hover
    });
  }
}`,...h.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "work"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }, {
        id: "2",
        name: "urgent"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Click tag to open popover", async () => {
      const button = canvas.getByRole("button", {
        name: /Click to remove/i
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Click Remove Tag button", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with tags array without this tag
    });
  }
}`,...B.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "work"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "work"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Remove the only tag", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with empty tags array
    });
  }
}`,...T.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "3",
      name: "important"
    },
    task: taskBuilder.withTags(5, {
      title: "Task with many tags"
    }),
    onUpdate: handleUpdate,
    badgeClass
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Remove tag from array of 5", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with 4 tags remaining
    });
  }
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Click outside to close", async () => {
      await userEvent.click(canvasElement);
      await delay(300);
      // Popover should close
    });
  }
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "this-is-a-very-long-tag-name-that-might-overflow-the-badge"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "this-is-a-very-long-tag-name-that-might-overflow-the-badge"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...C.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "a"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "a"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...U.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "urgent work item"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "urgent work item"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...E.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "high-priority-task"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "high-priority-task"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "v2.0"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "v2.0"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...f.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "🔥 urgent"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "🔥 urgent"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...O.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: "client@company"
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: "client@company"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...N.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "1",
      name: ""
    },
    task: taskBuilder.base({
      tags: [{
        id: "1",
        name: ""
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...H.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "999",
      name: "tag"
    },
    task: taskBuilder.base({
      tags: [{
        id: "999",
        name: "tag"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...j.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "uuid-tag"
    },
    task: taskBuilder.base({
      tags: [{
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "uuid-tag"
      }]
    }),
    onUpdate: handleUpdate,
    badgeClass
  }
}`,...M.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"
  }
}`,...P.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded"
  }
}`,...I.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex items-center gap-2 px-4 py-2 text-base rounded-xl border-2 font-bold"
  }
}`,...L.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify default blue styling", async () => {
      const button = canvas.getByRole("button");
      // Should have text-blue-600 bg-blue-50/80 border-blue-100/50
      expect(button.className).toContain("blue");
    });
  }
}`,...V.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Hover to trigger rose color transition", async () => {
      const button = canvas.getByRole("button");
      await userEvent.hover(button);
      await delay(300);
      // Should transition to rose colors on hover
    });
  }
}`,...W.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Tab to tag badge", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      expect(removeButton).toBeInTheDocument();
    });
  }
}`,...D.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", {
        name: /Click to remove/i
      });
      expect(button).toHaveAttribute("title", "Click to remove");
    });
  }
}`,..._.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify tag name is readable", async () => {
      const button = canvas.getByRole("button");
      expect(button.textContent).toContain("work");
    });
    await step("Open popover and verify remove text", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      expect(removeButton.textContent).toContain("Remove Tag");
    });
  }
}`,...A.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });
    await step("Rapidly click remove button", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /Remove Tag/i
      });
      await userEvent.click(removeButton);
      // Should only trigger once despite rapid clicks
      await delay(50);
    });
  }
}`,...F.parameters?.docs?.source}}};const ma=["SingleTag","UrgentTag","PersonalTag","ProjectTag","FirstOfManyTags","MiddleOfManyTags","LastOfManyTags","PopoverClosed","PopoverOpen","HoverState","RemoveTag","RemoveLastTag","RemoveFromManyTags","ClickOutsideToClose","VeryLongTagName","ShortTagName","TagWithSpaces","TagWithHyphens","TagWithNumbers","TagWithEmoji","TagWithSpecialChars","EmptyTagName","NumericTagId","UUIDTagId","CustomBadgeClass","MinimalBadgeClass","LargeBadgeClass","DefaultBlueColor","HoverRoseColor","KeyboardNavigation","AriaLabels","ScreenReaderText","RapidRemoveClicks"];export{_ as AriaLabels,S as ClickOutsideToClose,P as CustomBadgeClass,V as DefaultBlueColor,H as EmptyTagName,v as FirstOfManyTags,W as HoverRoseColor,h as HoverState,D as KeyboardNavigation,L as LargeBadgeClass,b as LastOfManyTags,y as MiddleOfManyTags,I as MinimalBadgeClass,j as NumericTagId,p as PersonalTag,w as PopoverClosed,k as PopoverOpen,u as ProjectTag,F as RapidRemoveClicks,R as RemoveFromManyTags,T as RemoveLastTag,B as RemoveTag,A as ScreenReaderText,U as ShortTagName,c as SingleTag,O as TagWithEmoji,x as TagWithHyphens,f as TagWithNumbers,E as TagWithSpaces,N as TagWithSpecialChars,M as UUIDTagId,l as UrgentTag,C as VeryLongTagName,ma as __namedExportsOrder,da as default};
