import{j as e}from"./jsx-runtime-u17CrQMm.js";import{S as l}from"./SettingsPage-8SZ33Xpw.js";import{c as p}from"./chevron-right-Bsvfh4yW.js";import"./iframe-DX6dunwq.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-B3FenB3o.js";import"./circle-C-nGDjeH.js";import"./calendar-CXzZhQC7.js";import"./tslib.es6-C44cpxNM.js";import"./recurrence-Co3oC643.js";import"./voice-providers-C_Nqj6M0.js";import"./SettingsPageGeneral-D6U-Xaor.js";import"./Motion-gFejr4jc.js";import"./proxy-C45Fm9tl.js";import"./SettingsPageAI-t0K13T6y.js";import"./index-DFedoQj1.js";import"./index-DrBVBWl1.js";const s={name:"cloud",size:24,node:[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]]};s.node;const m=p(s),{expect:d,within:u}=__STORYBOOK_MODULE_TEST__,B={title:"Settings/SettingsPage",component:l,parameters:{layout:"fullscreen"},tags:["autodocs"]},n={theme:"light",dateFormat:"MM, DD",showCompleted:!0,showProgressBar:!0,soundEnabled:!0,fontSize:"base",useRelativeDates:!0,groupingStrategy:["dueAt"],aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"",baseUrl:"",model:""},anthropic:{apiKey:"",baseUrl:"",model:""},openai:{apiKey:"",baseUrl:"",model:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}},systemPrompt:""},voiceConfig:{enabled:!0,activeProvider:"browser",language:"",providers:{browser:{},openai:{apiKey:"",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"",model:"gemini-1.5-flash"}}},defaultFocusMode:!0,totalTokenUsage:0,tokenUsageByModel:{},defaultCategory:"",filters:{tags:{include:["#"],exclude:[]},categories:{include:[],exclude:[]},priorities:{include:[],exclude:[]},statuses:{include:[],exclude:[]},enableScript:!1,script:""},sort:{field:"createdAt",direction:"asc",script:""}},t={args:{settings:n,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0}},g=[{id:"host-settings",label:"Host app",icon:"Wrench",content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Host application settings"}),e.jsx("p",{className:"text-slate-600 mb-4",children:"This tab is injected by the host application. It can contain any React content."}),e.jsxs("div",{className:"bg-slate-100 rounded-lg p-4",children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Custom setting"}),e.jsx("input",{type:"text",placeholder:"Enter value...",className:"w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"})]})]})},{id:"sync-settings",label:"Sync",icon:m,content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Sync settings"}),e.jsx("p",{className:"text-slate-600",children:"Configure cloud synchronization options here."})]})}],a={args:{settings:n,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0,customTabs:g},play:async({canvasElement:o})=>{const i=u(o);for(const r of["Host app","Sync"]){const c=i.getByRole("button",{name:r});await d(c.querySelector("svg")).toBeInTheDocument()}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    settings,
    onUpdateSettings: () => {},
    availableCategories: [],
    availableTags: [],
    inSeperatePage: true
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    settings,
    onUpdateSettings: () => {},
    availableCategories: [],
    availableTags: [],
    inSeperatePage: true,
    customTabs
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    for (const name of ["Host app", "Sync"]) {
      const tab = canvas.getByRole("button", {
        name
      });
      await expect(tab.querySelector("svg")).toBeInTheDocument();
    }
  }
}`,...a.parameters?.docs?.source}}};const K=["Default","WithCustomTabs"];export{t as Default,a as WithCustomTabs,K as __namedExportsOrder,B as default};
