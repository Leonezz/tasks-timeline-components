import{S as P}from"./SettingsPageAI-DebkgK5M.js";import{s as e}from"./settings-GESQiD84.js";import"./edge-cases-CRkSQ-i-.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-CupDB_qY.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-D75OdGke.js";import"./chevron-right-WXOwjSd4.js";import"./rruleset-Bu4wjl4G.js";import"./Motion-DBfBMIEM.js";import"./proxy-BrHCr8DL.js";import"./index-BQg7cxuN.js";import"./datetime-CoIMkCUY.js";import"./tasks-D2syl_55.js";const{expect:p,userEvent:T,within:l}=__STORYBOOK_MODULE_TEST__,H={title:"Settings/SettingsPageAI",component:P,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{onUpdateSettings:{action:"settings-updated"}}},n=t=>console.log("Updated settings:",t),o={args:{settings:e.default(),onUpdateSettings:n}},d={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1}},onUpdateSettings:n}},c={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!0,defaultMode:!1}},onUpdateSettings:n}},r={args:{settings:e.withAI(),onUpdateSettings:n}},g={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"test-gemini-key",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},u={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-openai-key",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},m={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"anthropic",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"sk-ant-test-key",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:n}},v={args:{settings:e.allProvidersConfigured(),onUpdateSettings:n}},f={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-key",model:"gpt-4o",baseUrl:"https://custom-api.example.com"},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}},onUpdateSettings:n}},y={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai-compatible",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"custom-provider-key",model:"",baseUrl:""}},systemPrompt:""}},onUpdateSettings:n},play:async({canvasElement:t,step:s})=>{const a=l(t);await s("Show custom provider validation",async()=>{await T.click(a.getByRole("button",{name:/test connection/i})),await p(a.getByRole("alert")).toHaveTextContent("Custom provider base URL is required.")})}},h={args:{settings:{...e.withAI(),totalTokenUsage:125e3,tokenUsageByModel:{"gemini:gemini-2.0-flash":{inputTokens:7e4,outputTokens:3e4,totalTokens:1e5},"openai:gpt-4o":{inputTokens:15e3,outputTokens:1e4,totalTokens:25e3}}},onUpdateSettings:n}},b={args:{settings:{...e.default(),voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:n}},U={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"browser"}},onUpdateSettings:n}},S={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"openai",providers:{...e.withVoiceInput().voiceConfig.providers,openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"}}}},onUpdateSettings:n}},I={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"gemini",providers:{...e.withVoiceInput().voiceConfig.providers,gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}}},onUpdateSettings:n}},k={args:{...o.args},play:async({canvasElement:t,step:s})=>{const a=l(t);await s("Find Enable AI toggle",async()=>{const i=a.getAllByRole("button");p(i.length).toBeGreaterThan(0)})}},w={args:{...r.args},play:async({canvasElement:t,step:s})=>{const a=l(t);await s("Find AI provider buttons",async()=>{const i=a.getAllByRole("button");p(i.length).toBeGreaterThan(2)})}},A={args:{...r.args},play:async({canvasElement:t,step:s})=>{const a=l(t);await s("Find API key input",async()=>{const i=a.getAllByDisplayValue("");p(i.length).toBeGreaterThan(0)})}},C={args:{...o.args},play:async({canvasElement:t,step:s})=>{const a=l(t);await s("Find Voice Input toggle",async()=>{const i=a.getAllByRole("button");p(i.length).toBeGreaterThan(0)})}},B={args:{settings:{...e.allProvidersConfigured(),voiceConfig:{enabled:!0,activeProvider:"gemini",language:"",providers:{browser:{},openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}},totalTokenUsage:5e5,tokenUsageByModel:{"gemini:gemini-2.0-flash":{inputTokens:26e4,outputTokens:14e4,totalTokens:4e5},"anthropic:claude-sonnet-4-20250514":{inputTokens:7e4,outputTokens:3e4,totalTokens:1e5}}},onUpdateSettings:n}},K={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1},voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:n}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...r.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai-compatible",
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
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: ""
          },
          "openai-compatible": {
            apiKey: "custom-provider-key",
            model: "",
            baseUrl: ""
          }
        },
        systemPrompt: ""
      }
    },
    onUpdateSettings: handleUpdateSettings
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Show custom provider validation", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /test connection/i
      }));
      await expect(canvas.getByRole("alert")).toHaveTextContent("Custom provider base URL is required.");
    });
  }
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      totalTokenUsage: 125000,
      tokenUsageByModel: {
        "gemini:gemini-2.0-flash": {
          inputTokens: 70000,
          outputTokens: 30000,
          totalTokens: 100000
        },
        "openai:gpt-4o": {
          inputTokens: 15000,
          outputTokens: 10000,
          totalTokens: 25000
        }
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
      totalTokenUsage: 500000,
      tokenUsageByModel: {
        "gemini:gemini-2.0-flash": {
          inputTokens: 260000,
          outputTokens: 140000,
          totalTokens: 400000
        },
        "anthropic:claude-sonnet-4-20250514": {
          inputTokens: 70000,
          outputTokens: 30000,
          totalTokens: 100000
        }
      }
    },
    onUpdateSettings: handleUpdateSettings
  }
}`,...B.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};const Y=["Default","AIDisabled","AIEnabledDefaultOff","AIEnabledDefaultOn","GeminiProvider","OpenAIProvider","AnthropicProvider","AllProvidersConfigured","WithCustomBaseURL","CustomProviderValidation","WithTokenUsage","VoiceInputDisabled","VoiceInputBrowser","VoiceInputOpenAI","VoiceInputGemini","ToggleAIEnabled","SwitchAIProvider","EnterAPIKey","ToggleVoiceInput","AllFeaturesEnabled","AllFeaturesDisabled"];export{d as AIDisabled,c as AIEnabledDefaultOff,r as AIEnabledDefaultOn,K as AllFeaturesDisabled,B as AllFeaturesEnabled,v as AllProvidersConfigured,m as AnthropicProvider,y as CustomProviderValidation,o as Default,A as EnterAPIKey,g as GeminiProvider,u as OpenAIProvider,w as SwitchAIProvider,k as ToggleAIEnabled,C as ToggleVoiceInput,U as VoiceInputBrowser,b as VoiceInputDisabled,I as VoiceInputGemini,S as VoiceInputOpenAI,f as WithCustomBaseURL,h as WithTokenUsage,Y as __namedExportsOrder,H as default};
