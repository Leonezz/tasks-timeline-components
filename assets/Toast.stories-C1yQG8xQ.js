import{T as i}from"./Toast-CFTm_6na.js";import"./jsx-runtime-u17CrQMm.js";import"./iframe-KW6RtBM2.js";import"./preload-helper-PPVm8Dsz.js";import"./Icon-CFZCLKt0.js";import"./index-goBt61iM.js";import"./Motion-DxXHqm4t.js";import"./proxy-B9VYbwnC.js";const D={title:"UI/Toast",component:i,tags:["autodocs"],parameters:{layout:"centered"}},s=n=>console.log("Dismiss toast:",n),e={args:{toast:{id:"1",type:"success",title:"Success!",description:"Your task has been created successfully."},onDismiss:s}},t={args:{toast:{id:"2",type:"error",title:"Error",description:"Failed to save task. Please try again."},onDismiss:s}},o={args:{toast:{id:"3",type:"info",title:"Information",description:"Your tasks are being synced to the cloud."},onDismiss:s}},r={args:{toast:{id:"4",type:"success",title:"Task Created"},onDismiss:s}},a={args:{toast:{id:"5",type:"info",title:"Sync Complete",description:"All your tasks have been successfully synchronized with your other devices and cloud storage."},onDismiss:s}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const h=["Success","Error","Info","WithoutDescription","LongDescription"];export{t as Error,o as Info,a as LongDescription,e as Success,r as WithoutDescription,h as __namedExportsOrder,D as default};
