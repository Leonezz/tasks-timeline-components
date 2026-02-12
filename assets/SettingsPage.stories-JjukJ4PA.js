import{j as e}from"./jsx-runtime-u17CrQMm.js";import{S as i}from"./SettingsPage-baADrkma.js";import"./iframe-Kgc_7zLZ.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-By9zMJNh.js";import"./chevron-right-B-ma7AbP.js";import"./rruleset-Bu4wjl4G.js";import"./logger-CDMKXnH4.js";import"./SettingsPageGeneral-BQIXQKw9.js";import"./Motion-CW3vvHgC.js";import"./proxy-D_7yqafd.js";import"./SettingsPageAdvanced-D8UUueyw.js";import"./index-CWxNNgDm.js";import"./index-Do2GVLpJ.js";import"./index-DSe7XrAg.js";import"./index-BCiHuJZ4.js";const C={title:"Settings/SettingsPage",component:i,parameters:{layout:"fullscreen"},tags:["autodocs"]},s={theme:"light",dateFormat:"MM, DD",showCompleted:!0,showProgressBar:!0,soundEnabled:!0,fontSize:"base",useRelativeDates:!0,groupingStrategy:["dueAt"],aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"",baseUrl:"",model:""},anthropic:{apiKey:"",baseUrl:"",model:""},openai:{apiKey:"",baseUrl:"",model:""},"openai-compatible":{apiKey:"",model:"",baseUrl:""}}},voiceConfig:{enabled:!0,activeProvider:"browser",language:"",providers:{browser:{},openai:{apiKey:"",baseUrl:"https://api.openai.com/v1/audio/transcriptions",model:"whisper-1"},gemini:{apiKey:"",model:"gemini-1.5-flash"}}},defaultFocusMode:!0,totalTokenUsage:0,defaultCategory:"",filters:{tags:["#"],categories:[],priorities:[],statuses:[],enableScript:!1,script:""},sort:{field:"createdAt",direction:"asc",script:""}},t={args:{settings:s,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0}},o=[{id:"host-settings",label:"Host App",icon:"Plug",content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Host Application Settings"}),e.jsx("p",{className:"text-slate-600 mb-4",children:"This tab is injected by the host application. It can contain any React content."}),e.jsxs("div",{className:"bg-slate-100 rounded-lg p-4",children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Custom Setting"}),e.jsx("input",{type:"text",placeholder:"Enter value...",className:"w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"})]})]})},{id:"sync-settings",label:"Sync",icon:"Cloud",content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Sync Settings"}),e.jsx("p",{className:"text-slate-600",children:"Configure cloud synchronization options here."})]})}],a={args:{settings:s,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0,customTabs:o}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
  }
}`,...a.parameters?.docs?.source}}};const j=["Default","WithCustomTabs"];export{t as Default,a as WithCustomTabs,j as __namedExportsOrder,C as default};
