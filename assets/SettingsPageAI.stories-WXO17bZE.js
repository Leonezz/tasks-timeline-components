import{S as K}from"./SettingsPageAI-Bts4ur57.js";import{s as e}from"./settings-GESQiD84.js";import"./edge-cases-CRkSQ-i-.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-Bw0tN0ss.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-CcGamv2k.js";import"./chevron-right-BzJh0N8J.js";import"./rruleset-Bu4wjl4G.js";import"./Motion-D4V_KqR2.js";import"./proxy-CEdX58aT.js";import"./index-Bc-9lQUp.js";import"./datetime-CoIMkCUY.js";import"./tasks-D2syl_55.js";const{expect:B,within:P}=__STORYBOOK_MODULE_TEST__,L={title:"Settings/SettingsPageAI",component:K,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{onUpdateSettings:{action:"settings-updated"}}},n=t=>console.log("Updated settings:",t),o={args:{settings:e.default(),onUpdateSettings:n}},p={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1}},onUpdateSettings:n}},d={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!0,defaultMode:!1}},onUpdateSettings:n}},r={args:{settings:e.withAI(),onUpdateSettings:n}},l={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"test-gemini-key",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},g={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-openai-key",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},c={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"anthropic",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"sk-ant-test-key",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},u={args:{settings:e.allProvidersConfigured(),onUpdateSettings:n}},m={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-key",model:"gpt-4o",baseUrl:"https://custom-api.example.com"},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}},onUpdateSettings:n}},f={args:{settings:{...e.withAI(),totalTokenUsage:125e3},onUpdateSettings:n}},v={args:{settings:{...e.default(),voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:n}},h={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"browser"}},onUpdateSettings:n}},y={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"openai",providers:{...e.withVoiceInput().voiceConfig.providers,openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"}}}},onUpdateSettings:n}},b={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"gemini",providers:{...e.withVoiceInput().voiceConfig.providers,gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}}},onUpdateSettings:n}},U={args:{...o.args},play:async({canvasElement:t,step:a})=>{const s=P(t);await a("Find Enable AI toggle",async()=>{const i=s.getAllByRole("button");B(i.length).toBeGreaterThan(0)})}},S={args:{...r.args},play:async({canvasElement:t,step:a})=>{const s=P(t);await a("Find AI provider buttons",async()=>{const i=s.getAllByRole("button");B(i.length).toBeGreaterThan(2)})}},I={args:{...r.args},play:async({canvasElement:t,step:a})=>{const s=P(t);await a("Find API key input",async()=>{const i=s.getAllByDisplayValue("");B(i.length).toBeGreaterThan(0)})}},A={args:{...o.args},play:async({canvasElement:t,step:a})=>{const s=P(t);await a("Find Voice Input toggle",async()=>{const i=s.getAllByRole("button");B(i.length).toBeGreaterThan(0)})}},w={args:{settings:{...e.allProvidersConfigured(),voiceConfig:{enabled:!0,activeProvider:"gemini",language:"",providers:{browser:{},openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}},totalTokenUsage:5e5},onUpdateSettings:n}},C={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1},voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:n}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: true,
        defaultMode: false
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...d.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "gemini",
        providers: {
          gemini: {
            apiKey: "test-gemini-key",
            model: "gemini-2.0-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: ""
          },
          "openai-compatible": {
            apiKey: "",
            model: "",
            baseUrl: ""
          }
        },
        systemPrompt: ""
      }
    }),
    onUpdateSettings: handleUpdateSettings
  }
}`,...l.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai",
        providers: {
          gemini: {
            apiKey: "",
            model: "gemini-2.0-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "sk-test-openai-key",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: ""
          },
          "openai-compatible": {
            apiKey: "",
            model: "",
            baseUrl: ""
          }
        },
        systemPrompt: ""
      }
    }),
    onUpdateSettings: handleUpdateSettings
  }
}`,...g.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "anthropic",
        providers: {
          gemini: {
            apiKey: "",
            model: "gemini-2.0-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "",
            model: "gpt-4o",
            baseUrl: ""
          },
          anthropic: {
            apiKey: "sk-ant-test-key",
            model: "claude-sonnet-4-20250514",
            baseUrl: ""
          },
          "openai-compatible": {
            apiKey: "",
            model: "",
            baseUrl: ""
          }
        },
        systemPrompt: ""
      }
    }),
    onUpdateSettings: handleUpdateSettings
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
            model: "gemini-2.0-flash",
            baseUrl: ""
          },
          openai: {
            apiKey: "sk-test-key",
            model: "gpt-4o",
            baseUrl: "https://custom-api.example.com"
          },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: ""
          },
          "openai-compatible": {
            apiKey: "",
            model: "",
            baseUrl: ""
          }
        },
        systemPrompt: ""
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...m.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      totalTokenUsage: 125000
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...f.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      voiceConfig: {
        ...settingsBuilder.default().voiceConfig,
        enabled: false
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "browser"
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "openai",
        providers: {
          ...settingsBuilder.withVoiceInput().voiceConfig.providers,
          openai: {
            apiKey: "sk-test-key",
            baseUrl: "https://api.openai.com/v1/audio/transcriptions",
            model: "whisper-1"
          }
        }
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...y.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "gemini",
        providers: {
          ...settingsBuilder.withVoiceInput().voiceConfig.providers,
          gemini: {
            apiKey: "AIza-test-key",
            model: "gemini-1.5-flash"
          }
        }
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...b.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.allProvidersConfigured(),
      voiceConfig: {
        enabled: true,
        activeProvider: "gemini",
        language: "",
        providers: {
          browser: {},
          openai: {
            apiKey: "sk-test-key",
            baseUrl: "https://api.openai.com/v1/audio/transcriptions",
            model: "whisper-1"
          },
          gemini: {
            apiKey: "AIza-test-key",
            model: "gemini-1.5-flash"
          }
        }
      },
      totalTokenUsage: 500000
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...w.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false
      },
      voiceConfig: {
        ...settingsBuilder.default().voiceConfig,
        enabled: false
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...C.parameters?.docs?.source}}};const Y=["Default","AIDisabled","AIEnabledDefaultOff","AIEnabledDefaultOn","GeminiProvider","OpenAIProvider","AnthropicProvider","AllProvidersConfigured","WithCustomBaseURL","WithTokenUsage","VoiceInputDisabled","VoiceInputBrowser","VoiceInputOpenAI","VoiceInputGemini","ToggleAIEnabled","SwitchAIProvider","EnterAPIKey","ToggleVoiceInput","AllFeaturesEnabled","AllFeaturesDisabled"];export{p as AIDisabled,d as AIEnabledDefaultOff,r as AIEnabledDefaultOn,C as AllFeaturesDisabled,w as AllFeaturesEnabled,u as AllProvidersConfigured,c as AnthropicProvider,o as Default,I as EnterAPIKey,l as GeminiProvider,g as OpenAIProvider,S as SwitchAIProvider,U as ToggleAIEnabled,A as ToggleVoiceInput,h as VoiceInputBrowser,v as VoiceInputDisabled,b as VoiceInputGemini,y as VoiceInputOpenAI,m as WithCustomBaseURL,f as WithTokenUsage,Y as __namedExportsOrder,L as default};
