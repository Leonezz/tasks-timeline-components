import{j as e}from"./jsx-runtime-u17CrQMm.js";import{S as o}from"./SettingsPage-Cv2u70CC.js";import"./iframe-gP99-5rX.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-D9wwggU8.js";import"./index-BSO_abFL.js";import"./SettingsPageGeneral-BHboTWXo.js";import"./Motion-B8MN7Cfh.js";import"./proxy-B1A0xX4B.js";import"./SettingsPageAdvanced-lPGyA07B.js";import"./index-D7FHYTda.js";import"./index-Bd54vtYv.js";import"./index-FTaP0lHz.js";import"./index-BfLlYqDs.js";import"./logger-CDMKXnH4.js";const y={title:"Settings/SettingsPage",component:o,parameters:{layout:"fullscreen"},tags:["autodocs"]},s={theme:"light",dateFormat:"MM, DD",showCompleted:!0,showProgressBar:!0,soundEnabled:!0,fontSize:"base",useRelativeDates:!0,groupingStrategy:["dueAt"],aiConfig:{enabled:!0,defaultMode:!0,activeProvider:"gemini",providers:{gemini:{apiKey:"",baseUrl:"",model:""},anthropic:{apiKey:"",baseUrl:"",model:""},openai:{apiKey:"",baseUrl:"",model:""}}},enableVoiceInput:!0,voiceProvider:"browser",defaultFocusMode:!0,totalTokenUsage:0,defaultCategory:"",filters:{tags:["#"],categories:[],priorities:[],statuses:[],enableScript:!1,script:""},sort:{field:"createdAt",direction:"asc",script:""}},t={args:{settings:s,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0}},r=[{id:"host-settings",label:"Host App",icon:"Plug",content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Host Application Settings"}),e.jsx("p",{className:"text-slate-600 mb-4",children:"This tab is injected by the host application. It can contain any React content."}),e.jsxs("div",{className:"bg-slate-100 rounded-lg p-4",children:[e.jsx("label",{className:"block text-sm font-medium mb-2",children:"Custom Setting"}),e.jsx("input",{type:"text",placeholder:"Enter value...",className:"w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"})]})]})},{id:"sync-settings",label:"Sync",icon:"Cloud",content:e.jsxs("div",{className:"p-6",children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Sync Settings"}),e.jsx("p",{className:"text-slate-600",children:"Configure cloud synchronization options here."})]})}],a={args:{settings:s,onUpdateSettings:()=>{},availableCategories:[],availableTags:[],inSeperatePage:!0,customTabs:r}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const j=["Default","WithCustomTabs"];export{t as Default,a as WithCustomTabs,j as __namedExportsOrder,y as default};
