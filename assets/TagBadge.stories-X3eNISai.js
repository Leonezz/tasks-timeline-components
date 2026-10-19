import{j as Y}from"./jsx-runtime-u17CrQMm.js";import{T as z}from"./TagBadge-DrjbNtnQ.js";import{A as G}from"./AppContext-BGpZXZLM.js";import{t as s}from"./tasks-CE8nCgSO.js";import"./edge-cases-DWLiX98P.js";import{w as d,d as g}from"./test-utils-BjL_0stX.js";import"./Icon-DNEj_xkd.js";import"./iframe-C21N2aj2.js";import"./preload-helper-PPVm8Dsz.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./tslib.es6-C44cpxNM.js";import"./recurrence-B2fS74Tu.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./index-B7dtx8Vx.js";const{expect:m,fn:J,userEvent:i}=__STORYBOOK_MODULE_TEST__,wa={title:"UI/TagBadge",component:z,tags:["autodocs"],parameters:{layout:"centered"},args:{index:0},argTypes:{onUpdate:{action:"task-updated"}},decorators:[t=>Y.jsx(G,{children:Y.jsx("div",{className:"p-4 bg-slate-50 min-w-50",children:Y.jsx(t,{})})})]},o="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border font-medium",r=t=>console.log("Updated task:",t),c={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"}]}),onUpdate:r,badgeClass:o}},p={args:{tag:{id:"2",name:"urgent"},task:s.base({tags:[{id:"2",name:"urgent"}]}),onUpdate:r,badgeClass:o}},l={args:{tag:{id:"3",name:"personal"},task:s.base({tags:[{id:"3",name:"personal"}]}),onUpdate:r,badgeClass:o}},u={args:{tag:{id:"4",name:"project-alpha"},task:s.base({tags:[{id:"4",name:"project-alpha"}]}),onUpdate:r,badgeClass:o}},v={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},y={args:{tag:{id:"2",name:"urgent"},index:1,task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},b={args:{tag:{id:"3",name:"client"},index:2,task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"},{id:"3",name:"client"}]}),onUpdate:r,badgeClass:o}},w={args:{...c.args}},k={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Click tag to open remove popover",async()=>{const a=n.getByRole("button",{name:"work"});await i.click(a),await g(200)}),await e("Verify Remove Tag button is visible",async()=>{const a=n.getByRole("button",{name:/^Remove tag/});m(a).toBeInTheDocument()})}},h={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Hover over tag badge",async()=>{const a=n.getByRole("button");await i.hover(a),await g(200)})}},B={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"},{id:"2",name:"urgent"}]}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Click tag to open popover",async()=>{const a=n.getByRole("button",{name:"work"});await i.click(a),await g(200)}),await e("Click Remove Tag button",async()=>{const a=n.getByRole("button",{name:/^Remove tag/});await i.click(a),await g(100)})}},T={args:{tag:{id:"1",name:"work"},task:s.base({tags:[{id:"1",name:"work"}]}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await i.click(a),await g(200)}),await e("Remove the only tag",async()=>{const a=n.getByRole("button",{name:/^Remove tag/});await i.click(a),await g(100)})}},R={args:{tag:{id:"3",name:"important"},task:s.withTags(5,{title:"Task with many tags"}),onUpdate:r,badgeClass:o},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await i.click(a),await g(200)}),await e("Remove tag from array of 5",async()=>{const a=n.getByRole("button",{name:/^Remove tag/});await i.click(a),await g(100)})}},U={args:{tag:{id:"#TODO",name:"TODO"},index:1,task:s.base({title:"Tags parsed from text",tags:[{id:"#TODO",name:"TODO"},{id:"#TODO",name:"TODO"},{id:"#home",name:"home"}]}),onUpdate:J(),badgeClass:o},play:async({args:t,canvasElement:e,step:n})=>{const a=d(e);await n("Open popover",async()=>{await i.click(a.getByRole("button",{name:"TODO"})),await g(200)}),await n("Remove only this tag, not every tag sharing its id",async()=>{await i.click(a.getByRole("button",{name:/^Remove tag TODO/})),m(t.onUpdate).toHaveBeenCalledOnce(),m(t.onUpdate).toHaveBeenCalledWith(m.objectContaining({tags:[{id:"#TODO",name:"TODO"},{id:"#home",name:"home"}]}))})}},S={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await i.click(a),await g(200)}),await e("Click outside to close",async()=>{await i.click(t),await g(300)})}},O={args:{tag:{id:"1",name:"this-is-a-very-long-tag-name-that-might-overflow-the-badge"},task:s.base({tags:[{id:"1",name:"this-is-a-very-long-tag-name-that-might-overflow-the-badge"}]}),onUpdate:r,badgeClass:o}},C={args:{tag:{id:"1",name:"a"},task:s.base({tags:[{id:"1",name:"a"}]}),onUpdate:r,badgeClass:o}},x={args:{tag:{id:"1",name:"urgent work item"},task:s.base({tags:[{id:"1",name:"urgent work item"}]}),onUpdate:r,badgeClass:o}},E={args:{tag:{id:"1",name:"high-priority-task"},task:s.base({tags:[{id:"1",name:"high-priority-task"}]}),onUpdate:r,badgeClass:o}},f={args:{tag:{id:"1",name:"v2.0"},task:s.base({tags:[{id:"1",name:"v2.0"}]}),onUpdate:r,badgeClass:o}},D={args:{tag:{id:"1",name:"🔥 urgent"},task:s.base({tags:[{id:"1",name:"🔥 urgent"}]}),onUpdate:r,badgeClass:o}},H={args:{tag:{id:"1",name:"client@company"},task:s.base({tags:[{id:"1",name:"client@company"}]}),onUpdate:r,badgeClass:o}},j={args:{tag:{id:"1",name:""},task:s.base({tags:[{id:"1",name:""}]}),onUpdate:r,badgeClass:o}},N={args:{tag:{id:"999",name:"tag"},task:s.base({tags:[{id:"999",name:"tag"}]}),onUpdate:r,badgeClass:o}},I={args:{tag:{id:"550e8400-e29b-41d4-a716-446655440000",name:"uuid-tag"},task:s.base({tags:[{id:"550e8400-e29b-41d4-a716-446655440000",name:"uuid-tag"}]}),onUpdate:r,badgeClass:o}},M={args:{...c.args,badgeClass:"flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"}},P={args:{...c.args,badgeClass:"flex gap-1 px-1 py-0.5 text-xs rounded"}},W={args:{...c.args,badgeClass:"flex items-center gap-2 px-4 py-2 text-base rounded-xl border-2 font-bold"}},L={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify default blue styling",async()=>{const a=n.getByRole("button");m(a.className).toContain("blue")})}},V={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Hover to trigger rose color transition",async()=>{const a=n.getByRole("button");await i.hover(a),await g(300)})}},_={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Tab to tag badge",async()=>{const a=n.getByRole("button");a.focus(),m(a).toHaveFocus()}),await e("Press Enter to open popover",async()=>{await i.keyboard("{Enter}"),await g(200);const a=n.getByRole("button",{name:/^Remove tag/});m(a).toBeInTheDocument()})}},A={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify button has accessible title",async()=>{const a=n.getByRole("button",{name:"work"});m(a).toHaveAttribute("title","Remove tag")})}},F={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Verify tag name is readable",async()=>{const a=n.getByRole("button");m(a.textContent).toContain("work")}),await e("Open popover and verify remove text",async()=>{const a=n.getByRole("button");await i.click(a),await g(200);const q=n.getByRole("button",{name:/^Remove tag/});m(q.textContent).toContain("work")})}},K={args:{...c.args},play:async({canvasElement:t,step:e})=>{const n=d(t);await e("Open popover",async()=>{const a=n.getByRole("button");await i.click(a),await g(200)}),await e("Rapidly click remove button",async()=>{const a=n.getByRole("button",{name:/^Remove tag/});await i.click(a),await g(50)})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
    index: 1,
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
    index: 2,
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
        name: "work"
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Verify Remove Tag button is visible", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /^Remove tag/
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
        name: "work"
      });
      await userEvent.click(button);
      await delay(200);
    });
    await step("Click Remove Tag button", async () => {
      const removeButton = canvas.getByRole("button", {
        name: /^Remove tag/
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
        name: /^Remove tag/
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
        name: /^Remove tag/
      });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with 4 tags remaining
    });
  }
}`,...R.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    tag: {
      id: "#TODO",
      name: "TODO"
    },
    index: 1,
    task: taskBuilder.base({
      title: "Tags parsed from text",
      tags: [{
        id: "#TODO",
        name: "TODO"
      }, {
        id: "#TODO",
        name: "TODO"
      }, {
        id: "#home",
        name: "home"
      }]
    }),
    onUpdate: fn(),
    badgeClass
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = withinShadow(canvasElement);
    await step("Open popover", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "TODO"
      }));
      await delay(200);
    });
    await step("Remove only this tag, not every tag sharing its id", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /^Remove tag TODO/
      }));
      expect(args.onUpdate).toHaveBeenCalledOnce();
      expect(args.onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        tags: [{
          id: "#TODO",
          name: "TODO"
        }, {
          id: "#home",
          name: "home"
        }]
      }));
    });
  }
}`,...U.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2"
  }
}`,...M.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded"
  }
}`,...P.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...SingleTag.args,
    badgeClass: "flex items-center gap-2 px-4 py-2 text-base rounded-xl border-2 font-bold"
  }
}`,...W.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
        name: /^Remove tag/
      });
      expect(removeButton).toBeInTheDocument();
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
    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", {
        name: "work"
      });
      expect(button).toHaveAttribute("title", "Remove tag");
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
    await step("Verify tag name is readable", async () => {
      const button = canvas.getByRole("button");
      expect(button.textContent).toContain("work");
    });
    await step("Open popover and verify remove text", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
      const removeButton = canvas.getByRole("button", {
        name: /^Remove tag/
      });
      expect(removeButton.textContent).toContain("work");
    });
  }
}`,...F.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
        name: /^Remove tag/
      });
      await userEvent.click(removeButton);
      // Should only trigger once despite rapid clicks
      await delay(50);
    });
  }
}`,...K.parameters?.docs?.source}}};const ka=["SingleTag","UrgentTag","PersonalTag","ProjectTag","FirstOfManyTags","MiddleOfManyTags","LastOfManyTags","PopoverClosed","PopoverOpen","HoverState","RemoveTag","RemoveLastTag","RemoveFromManyTags","RemoveOneOfDuplicateIdTags","ClickOutsideToClose","VeryLongTagName","ShortTagName","TagWithSpaces","TagWithHyphens","TagWithNumbers","TagWithEmoji","TagWithSpecialChars","EmptyTagName","NumericTagId","UUIDTagId","CustomBadgeClass","MinimalBadgeClass","LargeBadgeClass","DefaultBlueColor","HoverRoseColor","KeyboardNavigation","AriaLabels","ScreenReaderText","RapidRemoveClicks"];export{A as AriaLabels,S as ClickOutsideToClose,M as CustomBadgeClass,L as DefaultBlueColor,j as EmptyTagName,v as FirstOfManyTags,V as HoverRoseColor,h as HoverState,_ as KeyboardNavigation,W as LargeBadgeClass,b as LastOfManyTags,y as MiddleOfManyTags,P as MinimalBadgeClass,N as NumericTagId,l as PersonalTag,w as PopoverClosed,k as PopoverOpen,u as ProjectTag,K as RapidRemoveClicks,R as RemoveFromManyTags,T as RemoveLastTag,U as RemoveOneOfDuplicateIdTags,B as RemoveTag,F as ScreenReaderText,C as ShortTagName,c as SingleTag,D as TagWithEmoji,E as TagWithHyphens,f as TagWithNumbers,x as TagWithSpaces,H as TagWithSpecialChars,I as UUIDTagId,p as UrgentTag,O as VeryLongTagName,ka as __namedExportsOrder,wa as default};
