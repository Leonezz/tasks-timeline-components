import{S as x}from"./SettingsPageAI-t0K13T6y.js";import{s as e}from"./settings-GESQiD84.js";import"./edge-cases-DMAB-FsE.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-DX6dunwq.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-B3FenB3o.js";import"./chevron-right-Bsvfh4yW.js";import"./circle-C-nGDjeH.js";import"./calendar-CXzZhQC7.js";import"./tslib.es6-C44cpxNM.js";import"./recurrence-Co3oC643.js";import"./voice-providers-C_Nqj6M0.js";import"./Motion-gFejr4jc.js";import"./proxy-C45Fm9tl.js";import"./index-DFedoQj1.js";import"./tasks-CcRg1J09.js";const{expect:o,fn:V,userEvent:R,within:r}=__STORYBOOK_MODULE_TEST__,$={title:"Settings/SettingsPageAI",component:x,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{onUpdateSettings:{action:"settings-updated"}}},t=a=>console.log("Updated settings:",a),c={args:{settings:e.default(),onUpdateSettings:t}},u={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1}},onUpdateSettings:t}},m={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!0,defaultMode:!1}},onUpdateSettings:t}},p={args:{settings:e.withAI(),onUpdateSettings:t}},l={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"test-gemini-key",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:t}},v={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-openai-key",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:t}},h={args:{settings:e.withAI({aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"anthropic",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"sk-ant-test-key",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}}),onUpdateSettings:t}},y={args:{settings:e.allProvidersConfigured(),onUpdateSettings:t}},f={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"sk-test-key",model:"gpt-4o",baseUrl:"https://custom-api.example.com"},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""}},onUpdateSettings:t}},b={args:{settings:{...e.withAI(),aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"openai-compatible",providers:{gemini:{apiKey:"",model:"gemini-2.0-flash",baseUrl:""},openai:{apiKey:"",model:"gpt-4o",baseUrl:""},anthropic:{apiKey:"",model:"claude-sonnet-4-20250514",baseUrl:""},"openai-compatible":{apiKey:"custom-provider-key",model:"",baseUrl:""}},systemPrompt:""}},onUpdateSettings:t},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Show custom provider validation",async()=>{await R.click(n.getByRole("button",{name:/test connection/i})),await o(n.getByRole("alert")).toHaveTextContent("Custom provider base URL is required.")})}},F={candidates:[{content:{role:"model",parts:[{text:"Hello"}]},finishReason:"STOP",index:0}],usageMetadata:{promptTokenCount:3,candidatesTokenCount:1,totalTokenCount:4}},d={args:{...l.args,aiFetch:V(async()=>new Response(JSON.stringify(F),{status:200,headers:{"content-type":"application/json"}}))},play:async({args:a,canvasElement:s,step:n})=>{const i=r(s);await n("Send the connection test through the host fetch",async()=>{await R.click(i.getByRole("button",{name:/test connection/i})),await o(await i.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"'),await o(a.aiFetch).toHaveBeenCalledOnce()})}},g={args:{...l.args,aiProviderFactory:V(async()=>({chat:async()=>({text:""}),test:async()=>({success:!0,message:"Connected through the host provider"})}))},play:async({args:a,canvasElement:s,step:n})=>{const i=r(s);await n("Test the host factory's provider",async()=>{await R.click(i.getByRole("button",{name:/test connection/i})),await o(await i.findByRole("status")).toHaveTextContent("Connected through the host provider"),await o(a.aiProviderFactory).toHaveBeenCalledWith("gemini",o.objectContaining({model:"gemini-2.0-flash"}))})}},U={args:{settings:{...e.withAI(),totalTokenUsage:125e3,tokenUsageByModel:{"gemini:gemini-2.0-flash":{inputTokens:7e4,outputTokens:3e4,totalTokens:1e5},"openai:gpt-4o":{inputTokens:15e3,outputTokens:1e4,totalTokens:25e3}}},onUpdateSettings:t}},w={args:{settings:{...e.default(),voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:t}},S={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"browser"}},onUpdateSettings:t}},B={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"openai",providers:{...e.withVoiceInput().voiceConfig.providers,openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"}}}},onUpdateSettings:t}},C={args:{settings:{...e.withVoiceInput(),voiceConfig:{...e.withVoiceInput().voiceConfig,activeProvider:"gemini",providers:{...e.withVoiceInput().voiceConfig.providers,gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}}},onUpdateSettings:t}},I={args:{settings:e.withVoiceInput(),onUpdateSettings:t,voiceRuntime:{browserSpeechSupported:!1}},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Browser provider is disabled with an explanation",async()=>{await o(n.getByRole("button",{name:"Use Browser voice provider"})).toBeDisabled(),await o(n.getByText(/speech recognition isn.t available here/i)).toBeInTheDocument()}),await s("OpenAI and Gemini stay selectable",async()=>{await o(n.getByRole("button",{name:"Use OpenAI voice provider"})).toBeEnabled(),await o(n.getByRole("button",{name:"Use Gemini voice provider"})).toBeEnabled()})}},k={args:{...c.args},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Find Enable AI toggle",async()=>{const i=n.getAllByRole("button");o(i.length).toBeGreaterThan(0)})}},A={args:{...p.args},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Find AI provider buttons",async()=>{const i=n.getAllByRole("button");o(i.length).toBeGreaterThan(2)})}},T={args:{...p.args},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Find API key input",async()=>{const i=n.getAllByDisplayValue("");o(i.length).toBeGreaterThan(0)})}},P={args:{...c.args},play:async({canvasElement:a,step:s})=>{const n=r(a);await s("Find Voice Input toggle",async()=>{const i=n.getAllByRole("button");o(i.length).toBeGreaterThan(0)})}},K={args:{settings:{...e.allProvidersConfigured(),voiceConfig:{enabled:!0,activeProvider:"gemini",language:"",providers:{browser:{},openai:{apiKey:"sk-test-key",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"AIza-test-key",model:"gemini-1.5-flash"}}},totalTokenUsage:5e5,tokenUsageByModel:{"gemini:gemini-2.0-flash":{inputTokens:26e4,outputTokens:14e4,totalTokens:4e5},"anthropic:claude-sonnet-4-20250514":{inputTokens:7e4,outputTokens:3e4,totalTokens:1e5}}},onUpdateSettings:t}},E={args:{settings:{...e.default(),aiConfig:{...e.default().aiConfig,enabled:!1},voiceConfig:{...e.default().voiceConfig,enabled:!1}},onUpdateSettings:t}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
    onUpdateSettings: handleUpdateSettings
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...p.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings
  }
}`,...y.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...GeminiProvider.args,
    aiFetch: fn<typeof fetch>(async () => new Response(JSON.stringify(geminiHelloReply), {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    }))
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Send the connection test through the host fetch", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /test connection/i
      }));
      await expect(await canvas.findByRole("status")).toHaveTextContent('Connected to gemini-2.0-flash. Response: "Hello"');
      await expect(args.aiFetch).toHaveBeenCalledOnce();
    });
  }
}`,...d.parameters?.docs?.source},description:{story:`"Test Connection" goes through the host's fetch, never the network.`,...d.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...GeminiProvider.args,
    aiProviderFactory: fn<AIProviderFactory>(async () => ({
      chat: async () => ({
        text: ""
      }),
      test: async () => ({
        success: true,
        message: "Connected through the host provider"
      })
    }))
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Test the host factory's provider", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /test connection/i
      }));
      await expect(await canvas.findByRole("status")).toHaveTextContent("Connected through the host provider");
      await expect(args.aiProviderFactory).toHaveBeenCalledWith("gemini", expect.objectContaining({
        model: "gemini-2.0-flash"
      }));
    });
  }
}`,...g.parameters?.docs?.source},description:{story:`"Test Connection" tests the provider the host's factory builds.`,...g.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    settings: settingsBuilder.withVoiceInput(),
    onUpdateSettings: handleUpdateSettings,
    voiceRuntime: {
      browserSpeechSupported: false
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Browser provider is disabled with an explanation", async () => {
      await expect(canvas.getByRole("button", {
        name: "Use Browser voice provider"
      })).toBeDisabled();
      await expect(canvas.getByText(/speech recognition isn.t available here/i)).toBeInTheDocument();
    });
    await step("OpenAI and Gemini stay selectable", async () => {
      await expect(canvas.getByRole("button", {
        name: "Use OpenAI voice provider"
      })).toBeEnabled();
      await expect(canvas.getByRole("button", {
        name: "Use Gemini voice provider"
      })).toBeEnabled();
    });
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
}`,...k.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};const ee=["Default","AIDisabled","AIEnabledDefaultOff","AIEnabledDefaultOn","GeminiProvider","OpenAIProvider","AnthropicProvider","AllProvidersConfigured","WithCustomBaseURL","CustomProviderValidation","TestConnectionWithHostFetch","TestConnectionWithHostFactory","WithTokenUsage","VoiceInputDisabled","VoiceInputBrowser","VoiceInputOpenAI","VoiceInputGemini","VoiceInputBrowserUnsupported","ToggleAIEnabled","SwitchAIProvider","EnterAPIKey","ToggleVoiceInput","AllFeaturesEnabled","AllFeaturesDisabled"];export{u as AIDisabled,m as AIEnabledDefaultOff,p as AIEnabledDefaultOn,E as AllFeaturesDisabled,K as AllFeaturesEnabled,y as AllProvidersConfigured,h as AnthropicProvider,b as CustomProviderValidation,c as Default,T as EnterAPIKey,l as GeminiProvider,v as OpenAIProvider,A as SwitchAIProvider,g as TestConnectionWithHostFactory,d as TestConnectionWithHostFetch,k as ToggleAIEnabled,P as ToggleVoiceInput,S as VoiceInputBrowser,I as VoiceInputBrowserUnsupported,w as VoiceInputDisabled,C as VoiceInputGemini,B as VoiceInputOpenAI,f as WithCustomBaseURL,U as WithTokenUsage,ee as __namedExportsOrder,$ as default};
