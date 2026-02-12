import{T as i}from"./Toast-BYNB5E_m.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-Kgc_7zLZ.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-By9zMJNh.js";import"./chevron-right-B-ma7AbP.js";import"./rruleset-Bu4wjl4G.js";import"./Motion-CW3vvHgC.js";import"./proxy-D_7yqafd.js";const h={title:"UI/Toast",component:i,tags:["autodocs"],parameters:{layout:"centered"}},s=n=>console.log("Dismiss toast:",n),e={args:{toast:{id:"1",type:"success",title:"Success!",description:"Your task has been created successfully."},onDismiss:s}},t={args:{toast:{id:"2",type:"error",title:"Error",description:"Failed to save task. Please try again."},onDismiss:s}},o={args:{toast:{id:"3",type:"info",title:"Information",description:"Your tasks are being synced to the cloud."},onDismiss:s}},r={args:{toast:{id:"4",type:"success",title:"Task Created"},onDismiss:s}},a={args:{toast:{id:"5",type:"info",title:"Sync Complete",description:"All your tasks have been successfully synchronized with your other devices and cloud storage."},onDismiss:s}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "1",
      type: "success",
      title: "Success!",
      description: "Your task has been created successfully."
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "2",
      type: "error",
      title: "Error",
      description: "Failed to save task. Please try again."
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "3",
      type: "info",
      title: "Information",
      description: "Your tasks are being synced to the cloud."
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "4",
      type: "success",
      title: "Task Created"
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    toast: {
      id: "5",
      type: "info",
      title: "Sync Complete",
      description: "All your tasks have been successfully synchronized with your other devices and cloud storage."
    } as ToastMessage,
    onDismiss: handleDismiss
  }
}`,...a.parameters?.docs?.source}}};const f=["Success","Error","Info","WithoutDescription","LongDescription"];export{t as Error,o as Info,a as LongDescription,e as Success,r as WithoutDescription,f as __namedExportsOrder,h as default};
