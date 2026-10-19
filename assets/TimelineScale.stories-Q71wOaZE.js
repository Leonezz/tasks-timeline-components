import{j as M}from"./jsx-runtime-u17CrQMm.js";import{r as N}from"./iframe-C21N2aj2.js";import{a as g}from"./TodoList-Bd8CpOMp.js";import{P as v,m as C,w as E,p as A,a as q,e as f,s as D,b as F,f as w,g as L,d as u}from"./plugin-host-actions-aeeCJBpD.js";import"./preload-helper-PPVm8Dsz.js";import"./recurrence-B2fS74Tu.js";import"./tslib.es6-C44cpxNM.js";import"./YearSection-D8iTL7DI.js";import"./DaySection-t1zvpuwx.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./date-badge-tones-BqdO1g17.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./SettingsContext-CD1KsnZl.js";import"./MarkdownText-TCFLTl49.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";import"./BacklogSection-DVWonrCe.js";import"./client-C5FZv-xr.js";import"./TasksTimelineApp-B5_hYe1E.js";import"./InputBar-DKsCmbhE.js";import"./SettingsModal-DT27vNU-.js";import"./SettingsPage-CJM924R6.js";import"./SettingsPageGeneral-B1a1UQUd.js";import"./SettingsPageAI-D3fty8rz.js";import"./index-BWgloZmU.js";import"./index-B7dtx8Vx.js";import"./TaskEditModal-DRq-RfgX.js";import"./date-picker-D0ppNIJs.js";import"./Toast-CsSt665s.js";import"./AppContext-BGpZXZLM.js";const P=o=>{let s=o>>>0;return()=>{s=s+1831565813>>>0;let t=s;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}},V=["low","medium","high"],T=["work","home","read","idea","errand","study","health"],j=["Inbox.md","Projects/Work.md","Areas/Home.md","Daily/2026.md"],U=(o={})=>{const{count:s=2e3,seed:t=777}=o,a=P(t),e=i=>i[Math.floor(a()*i.length)],r=i=>g(-Math.floor(a()*i));return Array.from({length:s},(i,c)=>{const n={id:`m${c}`,title:a()<.15?`Long **markdown** title number ${c} with [[link]] and \`code\` that wraps on narrow panes and keeps going for a while`:`Mixed task ${c}`,status:"todo",priority:e(V),category:e(j),tags:Array.from(new Set([e(T),e(T)])).map((d,m)=>({id:`mt${c}-${m}`,name:d}))},l=a();return l<.35?n:l<.65?{...n,createdAt:r(720)}:l<.82?{...n,createdAt:g(-200),dueAt:g(Math.floor(a()*180)-90)}:l<.88?{...n,status:"doing",startAt:r(20)}:l<.92?{...n,startAt:g(Math.floor(a()*30)+1)}:{...n,status:a()<.8?"done":"cancelled",createdAt:g(-100),completedAt:r(90)}})},{expect:p}=__STORYBOOK_MODULE_TEST__,x=U({count:2e3}),R=60,G=[F,u("Doing"),u("Doing"),u("Due & OD"),u("Due & OD"),w,w,q,w,w,D,u("Unplanned"),u("Unplanned")],H=o=>o.shadowRoot.querySelectorAll("[data-day-section]").length,O=o=>{const s=o.host.getBoundingClientRect(),t=o.shadowRoot.querySelector(".sticky.top-0"),a=Math.max(s.top,t?.getBoundingClientRect().bottom??0);return[...o.shadowRoot.querySelectorAll("[data-lazy-placeholder]")].map(e=>e.getBoundingClientRect()).filter(e=>e.height>0&&Math.min(e.bottom,s.bottom)-Math.max(e.top,a)>0)},$=async o=>{let s=performance.now(),t=0,a=0;const e=r=>{t=Math.max(t,r-s),s=r,a=requestAnimationFrame(e)};a=requestAnimationFrame(e);try{await o()}finally{cancelAnimationFrame(a)}return Math.round(t)},_=(o,s)=>({render:()=>M.jsx("div",{"data-testid":"scale-stage"}),play:async({canvasElement:t})=>{const a=t.querySelector('[data-testid="scale-stage"]'),e=C(a,{tasks:x,width:o,height:s}),r=[],i=[],c=n=>{const l=H(e),d=O(e);r.push(`${n}: ${l} day sections`),l>R&&i.push(`${n}: ${l} day sections mounted (limit ${R})`),d.length>0&&i.push(`${n}: ${d.length} placeholder(s) in view, first at ${Math.round(d[0].top-e.host.getBoundingClientRect().top)} px`),i.push(...e.monitor.errors.map(m=>`${n}: ${m}`))};try{const n=await $(()=>E(e));r.push(`load: longest frame ${n} ms`),c("load");for(const[l,d]of G.entries()){const m=`step ${l+1} (${L(d)})`,I=await $(async()=>{A(e,d),await f(500)});r.push(`${m}: longest frame ${I} ms`),c(m)}}finally{console.info(`[timeline scale, React ${N.version}, ${o}x${s}]
${r.join(`
`)}`),e.unmount()}p(i).toEqual([])}}),Vt={title:"Core/TimelineScale",component:v,args:{tasks:x,width:1396,height:1e3},parameters:{layout:"fullscreen",a11y:{test:"off"}}},h={},S=_(1396,1e3),B=_(420,1150),W=o=>{const s=o.host.getBoundingClientRect();return[...o.shadowRoot.querySelectorAll("[data-timeline-body] [data-day-section]")].find(t=>{const a=t.getBoundingClientRect();return a.top>s.top+200&&a.bottom<s.bottom})},k=(o,s)=>o.shadowRoot.querySelector(`[data-timeline-body] [data-day-section="${s}"]`),b=o=>o.querySelector("button[aria-expanded]")?.getAttribute("aria-expanded")==="true",y={render:()=>M.jsx("div",{"data-testid":"scale-stage"}),play:async({canvasElement:o})=>{const s=o.querySelector('[data-testid="scale-stage"]'),t=C(s,{tasks:x,width:1396,height:1e3});try{await E(t),A(t,q),await f(300);const a=W(t),e=a.getAttribute("data-day-section");p(b(a)).toBe(!0),a.querySelector("button[aria-expanded]").click(),await f(500),p(b(k(t,e))).toBe(!1);const r=t.host.scrollTop,i=k(t,e).getBoundingClientRect().top-t.host.getBoundingClientRect().top;A(t,D),await f(300),p(k(t,e)).toBeNull(),t.host.scrollTop=r,await f(300);const c=k(t,e);p(c).not.toBeNull(),p(b(c)).toBe(!1),p(Math.abs(c.getBoundingClientRect().top-t.host.getBoundingClientRect().top-i)).toBeLessThan(2),p(O(t)).toEqual([]),p(t.monitor.errors).toEqual([])}finally{t.unmount()}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:"{}",...h.parameters?.docs?.source},description:{story:"The 2000-task vault at 1396x1000, for manual checks.",...h.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:"scaleStory(1396, 1000)",...S.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:"scaleStory(420, 1150)",...B.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div data-testid="scale-stage" />,
  play: async ({
    canvasElement
  }) => {
    const stage = canvasElement.querySelector<HTMLElement>('[data-testid="scale-stage"]')!;
    const app = mountPluginApp(stage, {
      tasks: BIG_VAULT,
      width: 1396,
      height: 1000
    });
    try {
      await waitForTasks(app);
      perform(app, scrollMiddle);
      await settle(300);
      const section = dayInView(app)!,
        date = section.getAttribute("data-day-section")!;
      expect(isOpen(section)).toBe(true);
      section.querySelector<HTMLButtonElement>("button[aria-expanded]")!.click();
      await settle(500);
      expect(isOpen(daySection(app, date)!)).toBe(false);
      const scrolledTo = app.host.scrollTop,
        offset = daySection(app, date)!.getBoundingClientRect().top - app.host.getBoundingClientRect().top;
      perform(app, scrollBottom);
      await settle(300);
      expect(daySection(app, date)).toBeNull(); // its chunk unmounted

      app.host.scrollTop = scrolledTo;
      await settle(300);
      const back = daySection(app, date);
      expect(back).not.toBeNull();
      expect(isOpen(back!)).toBe(false);
      // Back where it was: its chunk's placeholder had its measured height
      expect(Math.abs(back!.getBoundingClientRect().top - app.host.getBoundingClientRect().top - offset)).toBeLessThan(2);
      expect(placeholdersInView(app)).toEqual([]);
      expect(app.monitor.errors).toEqual([]);
    } finally {
      app.unmount();
    }
  }
}`,...y.parameters?.docs?.source},description:{story:`A day section the user collapsed stays collapsed after scrolling far
enough that its chunk unmounts, and back.`,...y.parameters?.docs?.description}}};const jt=["Default","Wide","Narrow","CollapsedDayStaysCollapsed"];export{y as CollapsedDayStaysCollapsed,h as Default,B as Narrow,S as Wide,jt as __namedExportsOrder,Vt as default};
