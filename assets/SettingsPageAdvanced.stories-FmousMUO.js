import{S as z}from"./SettingsPageAdvanced-zbF5lz_t.js";import{s as e}from"./settings-BT4PNPAn.js";import"./edge-cases-Dobf_xol.js";import"./jsx-runtime-u17CrQMm.js";import"./Icon-BAebNQCR.js";import"./iframe-C10tbp61.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BSO_abFL.js";import"./Motion-CUte6zXE.js";import"./proxy-BBS9m_MC.js";import"./index-Dd6EOzwN.js";import"./tasks-BV5_RF93.js";const{expect:o,within:l}=__STORYBOOK_MODULE_TEST__,oe={title:"Settings/SettingsPageAdvanced",component:z,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{onUpdateSettings:{action:"settings-updated"}}},t=a=>console.log("Updated settings:",a),i={args:{settings:e.default(),onUpdateSettings:t,availableTags:["work","personal","urgent"]}},d={args:{...i.args,availableTags:[]}},g={args:{...i.args,availableTags:["work","personal","urgent","client","project-alpha","project-beta","bug","feature","documentation","testing"]}},u={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1}},onUpdateSettings:t,availableTags:["work","personal"]}},m={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!0,defaultMode:!1}},onUpdateSettings:t,availableTags:["work","personal"]}},c={args:{settings:e.withAI(),onUpdateSettings:t,availableTags:["work","personal"]}},S={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"test-gemini-key",model:"gemini-2-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-3-5-sonnet-20240620",baseUrl:""}}}}),onUpdateSettings:t,availableTags:["work","personal"]}},b={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2-flash",baseUrl:""},openai:{apiKey:"sk-test-openai-key",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-3-5-sonnet-20240620",baseUrl:""}}}}),onUpdateSettings:t,availableTags:["work","personal"]}},h={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"anthropic",providers:{gemini:{apiKey:"",model:"gemini-2-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"sk-ant-test-key",model:"claude-3-5-sonnet-20240620",baseUrl:""}}}}),onUpdateSettings:t,availableTags:["work","personal"]}},v={args:{settings:e.allProvidersConfigured(),onUpdateSettings:t,availableTags:["work","personal"]}},y={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2-flash",baseUrl:""},openai:{apiKey:"sk-test-key",model:"gpt-4o",baseUrl:"https://custom-api.example.com"},anthropic:{apiKey:"",model:"claude-3-5-sonnet-20240620",baseUrl:""}}}},onUpdateSettings:t,availableTags:["work","personal"]}},f={args:{settings:{...e.withAI(),totalTokenUsage:125e3},onUpdateSettings:t,availableTags:["work","personal"]}},w={args:{settings:{...e.default(),enableVoiceInput:!1},onUpdateSettings:t,availableTags:["work","personal"]}},U={args:{settings:e.withVoiceInput({voiceProvider:"browser"}),onUpdateSettings:t,availableTags:["work","personal"]}},T={args:{settings:e.withVoiceInput({voiceProvider:"gemini-whisper"}),onUpdateSettings:t,availableTags:["work","personal"]}},k={args:{...i.args,settings:{...e.default(),filters:{tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}}}},p={args:{settings:e.withFilterScript("return task.priority === 'high';"),onUpdateSettings:t,availableTags:["work","personal"]}},B={args:{settings:e.withFilterScript("return task.priority === 'high' && task.tags.some(t => t.name === 'urgent');"),onUpdateSettings:t,availableTags:["work","personal","urgent"]}},A={args:{settings:e.withFilterScript("return task.invalid syntax here"),onUpdateSettings:t,availableTags:["work","personal"]}},I={args:{settings:{...e.default(),sort:{field:"dueAt",direction:"asc",script:""}},onUpdateSettings:t,availableTags:["work","personal"]}},F={args:{settings:{...e.default(),sort:{field:"createdAt",direction:"asc",script:""}},onUpdateSettings:t,availableTags:["work","personal"]}},D={args:{settings:{...e.default(),sort:{field:"priority",direction:"desc",script:""}},onUpdateSettings:t,availableTags:["work","personal"]}},C={args:{settings:{...e.default(),sort:{field:"title",direction:"asc",script:""}},onUpdateSettings:t,availableTags:["work","personal"]}},E={args:{settings:{...e.default(),sort:{field:"dueAt",direction:"desc",script:""}},onUpdateSettings:t,availableTags:["work","personal"]}},P={args:{settings:e.withSortScript("return a.title.localeCompare(b.title);"),onUpdateSettings:t,availableTags:["work","personal"]}},x={args:{settings:e.withSortScript("const priorityOrder = { high: 3, medium: 2, low: 1 }; return priorityOrder[b.priority] - priorityOrder[a.priority];"),onUpdateSettings:t,availableTags:["work","personal"]}},K={args:{settings:{...e.default(),filters:{...e.default().filters,tags:["work","urgent"]}},onUpdateSettings:t,availableTags:["work","personal","urgent","client"]}},V={args:{settings:{...e.default(),filters:{...e.default().filters,tags:["work","personal","urgent"]}},onUpdateSettings:t,availableTags:["work","personal","urgent"]}},G={args:{...i.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find Enable AI toggle",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(0)})}},O={args:{...c.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find AI provider buttons",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(2)})}},R={args:{...c.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find API key input",async()=>{const r=s.getAllByDisplayValue("");o(r.length).toBeGreaterThan(0)})}},M={args:{...i.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find Voice Input toggle",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(0)})}},W={args:{...g.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find tag filter buttons",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(5)})}},_={args:{...i.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find Script Filter toggle",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(0)})}},L={args:{...p.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find filter script textarea",async()=>{const r=s.getAllByRole("textbox");o(r.length).toBeGreaterThan(0)})}},j={args:{...i.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find sort field selector",async()=>{const r=s.getAllByRole("combobox");o(r.length).toBeGreaterThan(0)})}},H={args:{...i.args},play:async({canvasElement:a,step:n})=>{const s=l(a);await n("Find sort direction button",async()=>{const r=s.getAllByRole("button");o(r.length).toBeGreaterThan(0)})}},N={args:{settings:{...e.allProvidersConfigured(),enableVoiceInput:!0,voiceProvider:"gemini-whisper",filters:{tags:["work","urgent"],categories:[],priorities:[],statuses:[],enableScript:!0,script:"return task.priority === 'high';"},sort:{field:"custom",direction:"asc",script:"return a.title.localeCompare(b.title);"},totalTokenUsage:5e5},onUpdateSettings:t,availableTags:["work","personal","urgent","client"]}},Y={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1},enableVoiceInput:!1,filters:{tags:[],categories:[],priorities:[],statuses:[],enableScript:!1,script:""}},onUpdateSettings:t,availableTags:[]}},q={args:{settings:e.withFilterScript(`// This is a very long filter script with multiple lines
const isHighPriority = task.priority === 'high';
const isUrgent = task.tags.some(t => t.name === 'urgent');
const isDueSoon = task.dueAt && new Date(task.dueAt) < new Date(Date.now() + 86400000);
return isHighPriority || (isUrgent && isDueSoon);`),onUpdateSettings:t,availableTags:["work","personal","urgent"]}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"]
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableTags: []
  }
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    availableTags: ["work", "personal", "urgent", "client", "project-alpha", "project-beta", "bug", "feature", "documentation", "testing"]
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: true,
        defaultMode: false
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...c.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "gemini",
        providers: {
          gemini: {
            apiKey: "test-gemini-key",
            model: "gemini-2-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "",
            model: "claude-3-5-sonnet-20240620",
            baseUrl: ""
          }
        }
      }
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...S.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai",
        providers: {
          gemini: {
            apiKey: "",
            model: "gemini-2-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "sk-test-openai-key",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "",
            model: "claude-3-5-sonnet-20240620",
            baseUrl: ""
          }
        }
      }
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "anthropic",
        providers: {
          gemini: {
            apiKey: "",
            model: "gemini-2-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "sk-ant-test-key",
            model: "claude-3-5-sonnet-20240620",
            baseUrl: ""
          }
        }
      }
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...v.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai",
        providers: {
          gemini: {
            apiKey: "",
            model: "gemini-2-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "sk-test-key",
            model: "gpt-4o",
            baseUrl: "https://custom-api.example.com"
          },
          anthropic: {
            apiKey: "",
            model: "claude-3-5-sonnet-20240620",
            baseUrl: ""
          }
        }
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      totalTokenUsage: 125000
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...f.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      enableVoiceInput: false
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...w.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withVoiceInput({
      voiceProvider: "browser"
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...U.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withVoiceInput({
      voiceProvider: "gemini-whisper"
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...T.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    settings: {
      ...settingsBuilder.default(),
      filters: {
        tags: [],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: false,
        script: ""
      }
    }
  }
}`,...k.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withFilterScript("return task.priority === 'high';"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...p.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withFilterScript("return task.priority === 'high' && task.tags.some(t => t.name === 'urgent');"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"]
  }
}`,...B.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withFilterScript("return task.invalid syntax here"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...A.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "dueAt",
        direction: "asc",
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...I.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "createdAt",
        direction: "asc",
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...F.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "priority",
        direction: "desc",
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...D.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "title",
        direction: "asc",
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...C.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "dueAt",
        direction: "desc",
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...E.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withSortScript("return a.title.localeCompare(b.title);"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...P.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withSortScript("const priorityOrder = { high: 3, medium: 2, low: 1 }; return priorityOrder[b.priority] - priorityOrder[a.priority];"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"]
  }
}`,...x.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      filters: {
        ...settingsBuilder.default().filters,
        tags: ["work", "urgent"]
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent", "client"]
  }
}`,...K.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      filters: {
        ...settingsBuilder.default().filters,
        tags: ["work", "personal", "urgent"]
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"]
  }
}`,...V.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Enable AI toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...G.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    ...AIEnabledDefaultOn.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find AI provider buttons", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have Gemini, OpenAI, Anthropic buttons
      expect(buttons.length).toBeGreaterThan(2);
    });
  }
}`,...O.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    ...AIEnabledDefaultOn.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find API key input", async () => {
      const inputs = canvas.getAllByDisplayValue("");
      // Should have password input for API key
      expect(inputs.length).toBeGreaterThan(0);
    });
  }
}`,...R.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Voice Input toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...M.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    ...ManyTags.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find tag filter buttons", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have buttons for each tag
      expect(buttons.length).toBeGreaterThan(5);
    });
  }
}`,...W.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find Script Filter toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,..._.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    ...FilterScriptEnabled.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find filter script textarea", async () => {
      const textareas = canvas.getAllByRole("textbox");
      // Should have textarea for script
      expect(textareas.length).toBeGreaterThan(0);
    });
  }
}`,...L.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find sort field selector", async () => {
      const selects = canvas.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  }
}`,...j.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Find sort direction button", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have ASC/DESC button
      expect(buttons.length).toBeGreaterThan(0);
    });
  }
}`,...H.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.allProvidersConfigured(),
      enableVoiceInput: true,
      voiceProvider: "gemini-whisper",
      filters: {
        tags: ["work", "urgent"],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: true,
        script: "return task.priority === 'high';"
      },
      sort: {
        field: "custom",
        direction: "asc",
        script: "return a.title.localeCompare(b.title);"
      },
      totalTokenUsage: 500000
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent", "client"]
  }
}`,...N.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      },
      enableVoiceInput: false,
      filters: {
        tags: [],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: false,
        script: ""
      }
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: []
  }
}`,...Y.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withFilterScript("// This is a very long filter script with multiple lines\\n" + "const isHighPriority = task.priority === 'high';\\n" + "const isUrgent = task.tags.some(t => t.name === 'urgent');\\n" + "const isDueSoon = task.dueAt && new Date(task.dueAt) < new Date(Date.now() + 86400000);\\n" + "return isHighPriority || (isUrgent && isDueSoon);"),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"]
  }
}`,...q.parameters?.docs?.source}}};const le=["Default","NoTags","ManyTags","AIDisabled","AIEnabledDefaultOff","AIEnabledDefaultOn","GeminiProvider","OpenAIProvider","AnthropicProvider","AllProvidersConfigured","WithCustomBaseURL","WithTokenUsage","VoiceInputDisabled","VoiceInputBrowser","VoiceInputGemini","FilterScriptDisabled","FilterScriptEnabled","ComplexFilterScript","FilterScriptWithError","SortByDueDate","SortByCreatedDate","SortByPriority","SortByTitle","SortDescending","CustomSortScript","ComplexSortScript","WithSelectedTags","AllTagsSelected","ToggleAIEnabled","SwitchAIProvider","EnterAPIKey","ToggleVoiceInput","SelectTagFilter","EnableFilterScript","TypeFilterScript","ChangeSortField","ToggleSortDirection","AllFeaturesEnabled","AllFeaturesDisabled","VeryLongScript"];export{u as AIDisabled,m as AIEnabledDefaultOff,c as AIEnabledDefaultOn,Y as AllFeaturesDisabled,N as AllFeaturesEnabled,v as AllProvidersConfigured,V as AllTagsSelected,h as AnthropicProvider,j as ChangeSortField,B as ComplexFilterScript,x as ComplexSortScript,P as CustomSortScript,i as Default,_ as EnableFilterScript,R as EnterAPIKey,k as FilterScriptDisabled,p as FilterScriptEnabled,A as FilterScriptWithError,S as GeminiProvider,g as ManyTags,d as NoTags,b as OpenAIProvider,W as SelectTagFilter,F as SortByCreatedDate,I as SortByDueDate,D as SortByPriority,C as SortByTitle,E as SortDescending,O as SwitchAIProvider,G as ToggleAIEnabled,H as ToggleSortDirection,M as ToggleVoiceInput,L as TypeFilterScript,q as VeryLongScript,U as VoiceInputBrowser,w as VoiceInputDisabled,T as VoiceInputGemini,y as WithCustomBaseURL,K as WithSelectedTags,f as WithTokenUsage,le as __namedExportsOrder,oe as default};
