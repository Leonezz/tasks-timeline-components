import{j as I}from"./jsx-runtime-u17CrQMm.js";import{r as M}from"./iframe-C21N2aj2.js";import{T as te,D as ae}from"./TasksTimelineApp-B5_hYe1E.js";import{B as oe}from"./BacklogSection-DVWonrCe.js";import{D as ne}from"./DaySection-t1zvpuwx.js";import{Y as se}from"./YearSection-D8iTL7DI.js";import{g as re}from"./TodoList-Bd8CpOMp.js";import"./edge-cases-DWLiX98P.js";import{b as ie}from"./vault-shaped-DknCzlEr.js";import"./preload-helper-PPVm8Dsz.js";import"./InputBar-DKsCmbhE.js";import"./Icon-DNEj_xkd.js";import"./chevron-right-CdDqbhPo.js";import"./circle-BKLBRRnM.js";import"./calendar-BNek3KTD.js";import"./tslib.es6-C44cpxNM.js";import"./recurrence-B2fS74Tu.js";import"./useVoiceInput-BKp77axA.js";import"./voice-providers-C_Nqj6M0.js";import"./Motion-C-iNf3Ee.js";import"./proxy-DXqtKrn2.js";import"./SettingsContext-CD1KsnZl.js";import"./popover-DiBFMgZy.js";import"./Combination-DqTMqw8g.js";import"./usePortalContainer-BOxnJgF2.js";import"./index-DUMjRBdx.js";import"./index-BDynpePo.js";import"./SettingsModal-DT27vNU-.js";import"./SettingsPage-CJM924R6.js";import"./SettingsPageGeneral-B1a1UQUd.js";import"./SettingsPageAI-D3fty8rz.js";import"./index-BWgloZmU.js";import"./index-B7dtx8Vx.js";import"./TaskEditModal-DRq-RfgX.js";import"./date-picker-D0ppNIJs.js";import"./calendar-CzXhjbeg.js";import"./button-B7wt63wB.js";import"./calendar-focus-CA-83E3R.js";import"./Toast-CsSt665s.js";import"./MarkdownText-TCFLTl49.js";import"./AppContext-BGpZXZLM.js";import"./collapsible-DK3kTUZ1.js";import"./useLazyChunks-FmHFT08s.js";import"./TaskItem-C3OP4Dl6.js";import"./date-badge-tones-BqdO1g17.js";import"./TagBadge-DrjbNtnQ.js";import"./PriorityPopover-C-4TG93C.js";import"./CategoryPopover-BbiEWaAe.js";import"./tasks-CE8nCgSO.js";const{expect:n,waitFor:l}=__STORYBOOK_MODULE_TEST__,U=re(),V=[...ie(),{id:"today-due",title:"Due today",status:"todo",priority:"high",tags:[],dueAt:U},{id:"today-doing",title:"Started today",status:"doing",priority:"medium",tags:[],startAt:U},{id:"today-created",title:"Captured today",status:"todo",priority:"low",tags:[],createdAt:U}],z=e=>({name:"large-vault-story",loadSettings:async()=>({...ae,groupingStrategy:["dueAt"],showCompleted:!0,defaultFocusMode:e}),saveSettings:async()=>{}}),j={timeline:z(!1),focus:z(!0)},L=[],ce=(e,t,a,o,s,r)=>{L.push({actualDuration:a,commitTime:r})},le=700,_="large-vault:update-task",K=e=>window.dispatchEvent(new CustomEvent(_,{detail:e})),de=({startInFocusMode:e=!1,loadTasksLater:t=!1})=>{const[a,o]=M.useState(t?[]:V),s=r=>o(c=>c.map(i=>i.id===r.id?{...i,...r}:i));return M.useEffect(()=>{if(!t)return;const r=setTimeout(()=>o(V),500);return()=>clearTimeout(r)},[t]),M.useEffect(()=>{const r=c=>s(c.detail);return window.addEventListener(_,r),()=>window.removeEventListener(_,r)},[]),I.jsx("div",{"data-testid":"vault-pane",style:{height:le,overflowY:"auto"},children:I.jsx(M.Profiler,{id:"timeline",onRender:ce,children:I.jsx(te,{tasks:a,onTaskAdded:()=>{},onTaskUpdated:r=>s(r),onTaskDeleted:()=>{},settingsRepository:e?j.focus:j.timeline})})})},gt={title:"Core/LargeVault",component:de,parameters:{layout:"fullscreen",a11y:{test:"off"}}},ue=["To Do","Unplanned","Due & OD","Doing"],u=e=>new Promise(t=>setTimeout(t,e)),y=()=>new Promise(e=>requestAnimationFrame(e)),pe=()=>new Promise(e=>requestAnimationFrame(()=>{const t=new MessageChannel;t.port1.onmessage=()=>e(performance.now()),t.port2.postMessage(null)})),q=e=>{const t=[...e].sort((o,s)=>o-s),a=Math.floor(t.length/2);return t.length%2?t[a]:(t[a-1]+t[a])/2},$=e=>e.querySelector('[data-testid="vault-pane"]'),p=(e,t)=>{const a=[...e.querySelectorAll("button[aria-pressed]")].find(o=>o.textContent?.trim().endsWith(t));if(!a)throw new Error(`Stat card "${t}" not found`);return a},m=(e,t)=>Number.parseInt(p(e,t).textContent??"",10),d=e=>e.querySelector('button[title$="Focus Mode"]'),me=e=>e.closest("[hidden]")===null,h=e=>Number(e.getAttribute("data-task-count")),X="[data-day-section], [data-day-chunk][data-task-count]",P=e=>[...e.querySelectorAll(`${X}, [data-backlog-section]`)].filter(me).reduce((t,a)=>t+h(a),0),f=e=>e.querySelector('[data-backlog-section] button[aria-label*="backlog,"]'),Y=e=>e.querySelectorAll('[data-backlog-section] button[aria-label^="Change status for "]').length,T=async e=>{await l(()=>{n(m(e,"Unplanned")).toBeGreaterThan(500),n(f(e)).not.toBeNull()},{timeout:1e4}),await u(300)},g=async(e,t)=>{e.click(),await l(t,{timeout:1e4,interval:5}),await pe()},R={},k={play:async({canvasElement:e,step:t})=>{await T(e);for(const a of[!1,!0])await t(`Cards match the list (focus mode ${a})`,async()=>{a&&await g(d(e),()=>n(d(e).title).toBe("Turn Off Focus Mode"));for(const o of ue){const s=m(e,o);await g(p(e,o),()=>{n(p(e,o)).toHaveAttribute("aria-pressed","true"),n(P(e)).toBe(s)}),n(m(e,o)).toBe(s),await g(p(e,o),()=>n(p(e,o)).toHaveAttribute("aria-pressed","false"))}});await t("Focus mode counts only today's tasks",async()=>{n(m(e,"Due & OD")).toBe(1),n(m(e,"Doing")).toBe(1),n(m(e,"Unplanned")).toBe(1),n(m(e,"To Do")).toBe(0)})}},F={play:async({canvasElement:e})=>{await T(e);const t=[...e.querySelectorAll("[data-year-section]")];n(t.length).toBeGreaterThan(0);for(const o of t){const s=[...o.querySelectorAll(X)].reduce((r,c)=>r+h(c),0);n(h(o)).toBe(s)}const a=h(e.querySelector(`[data-day-section="${U}"]`));n(a).toBe(3)}},A={play:async({canvasElement:e,step:t})=>{await T(e);const a=r=>{const c=f(e);n(c).toHaveAttribute("aria-expanded",String(r)),r||n(Y(e)).toBe(0)},o=async()=>{for(const r of["Turn Off Focus Mode","Turn On Focus Mode"])await g(d(e),()=>n(d(e).title).toBe(r))},s=async()=>{await g(p(e,"Due & OD"),()=>n(f(e)).toBeNull()),await g(p(e,"Due & OD"),()=>n(f(e)).not.toBeNull())};await t("Starts collapsed",async()=>a(!1)),await t("Stays collapsed through focus mode and filters",async()=>{await o(),a(!1),await s(),a(!1)}),await t("Once the user expands it, stays expanded",async()=>{f(e).click(),await l(()=>a(!0)),await o(),a(!0),await s(),a(!0)})}},O=e=>{const t=e.getBoundingClientRect();return[...e.querySelectorAll("[data-lazy-placeholder]")].filter(a=>{const o=a.getBoundingClientRect();return o.height>0&&o.bottom>t.top&&o.top<t.bottom})},G=e=>{const t=e.getBoundingClientRect();return[...e.querySelectorAll("[data-timeline-body] [data-day-section]")].filter(a=>{const o=a.getBoundingClientRect();return o.height>0&&o.top<t.bottom&&o.bottom>t.top})},N=e=>e.querySelector("button[aria-expanded]")?.getAttribute("aria-expanded")==="true",B=(e,t)=>e.querySelector(`[data-timeline-body] [data-day-section="${t}"]`),W=async(e,t)=>(B(e,t)||(e.scrollTop=0,await l(()=>n(B(e,t)).not.toBeNull())),B(e,t)),H=(e,t,a)=>{e.scrollTop+=t.getBoundingClientRect().top-e.getBoundingClientRect().top-a},Z=async(e,t)=>{d(e).click(),await l(()=>n(d(e).title).toBe(t),{timeout:2e3,interval:1})},v={play:async({canvasElement:e,step:t})=>{await T(e);const a=$(e),o=a.querySelectorAll("[data-timeline-body] [data-day-section]")[1],s=o.getAttribute("data-day-section");H(a,o,100),await l(()=>n(G(a)).toContain(B(a,s))),o.querySelector("button[aria-expanded]").click(),await l(()=>n(N(o)).toBe(!1)),await u(400);const r=async()=>{const i=f(e);i.getAttribute("aria-expanded")!=="true"&&(i.click(),await l(()=>n(i).toHaveAttribute("aria-expanded","true")),await u(400)),a.scrollTop=a.scrollHeight,await l(()=>{n(Y(e)).toBeGreaterThan(0),n(a.querySelectorAll("[data-timeline-body] [data-lazy-placeholder]").length).toBeGreaterThan(0)})},c=()=>{const i=B(a,s);i&&(n(N(i)).toBe(!1),n(i.querySelectorAll('button[aria-label^="Change status for "]').length).toBe(0),n(i.querySelector("[data-lazy-placeholder]")).toBeNull())};for(let i=0;i<3;i++)await t(`Focus on, then off (round ${i+1})`,async()=>{i===1?await r():H(a,await W(a,s),100),await u(100),await g(d(e),()=>n(d(e).title).toBe("Turn Off Focus Mode")),await u(200),await Z(e,"Turn On Focus Mode"),n(O(a)).toEqual([]),c(),await y(),await y(),n(O(a)).toEqual([]),c(),H(a,await W(a,s),100),await y(),await y(),n(O(a)).toEqual([]);const x=G(a);n(x).toContain(B(a,s));for(const w of x){const S=w.getAttribute("data-day-section"),b=w.querySelectorAll('button[aria-label^="Change status for "]').length;S===s?c():(n(N(w)).toBe(!0),n(b).toBe(h(w)))}for(const w of x){const S=w.querySelector("button[aria-expanded] [style*='transform']"),b=N(w);n(S?.style.transform??"none").toMatch(b?/rotate\(90deg\)/:/none|rotate\(0deg\)/)}})}},ge=e=>{const t=[...(function*(){for(let o=e;o;o=o.parentElement)yield o})(),...e.querySelectorAll("*")];for(const a of t){const o=Object.keys(a).find(s=>s.startsWith("__reactContainer$"));if(o)return a[o].stateNode}throw new Error("No React root found around the story canvas")},J=(e,t)=>{const a=[],o=[e.current];for(;o.length;){const s=o.pop();t(s)&&a.push(s),s.sibling&&o.push(s.sibling),s.child&&o.push(s.child)}return a},we=[se,ne,oe],Q=e=>we.includes(e.type)&&e.memoizedProps?.lazy!==!1,fe=e=>{const t=e.memoizedProps??{},a=t.group;return a?.date??String(a?.year??"backlog")},ye=e=>{const t=ge(e),a=new Set(J(t,Q).map(o=>o.memoizedState));return{sectionCount:a.size,renderedSince:()=>J(t,Q).filter(o=>!a.has(o.memoizedState)).map(fe)}},he=V.find(e=>e.title==="Future due item"),C={play:async({canvasElement:e,step:t})=>{await T(e),await g(d(e),()=>n(d(e).title).toBe("Turn Off Focus Mode")),await u(300);const a=ye(e);n(a.sectionCount).toBeGreaterThan(3),await t("Stat cards",async()=>{for(const o of["true","false"])await g(p(e,"Unplanned"),()=>n(p(e,"Unplanned")).toHaveAttribute("aria-pressed",o));await u(200),n(a.renderedSince()).toEqual([])}),await t("Task updates",async()=>{K({id:"today-due",status:"done"}),await l(()=>n(m(e,"Due & OD")).toBe(0)),K({id:he.id,title:"Renamed while hidden"}),await u(300),n(a.renderedSince()).toEqual([])}),await t("Leaving focus mode shows the changes",async()=>{await Z(e,"Turn On Focus Mode"),await l(()=>n(e.querySelector('[data-timeline-body] button[aria-label="Edit task title: Renamed while hidden"]')).not.toBeNull())})}},E={play:async({canvasElement:e})=>{await T(e);const t=$(e),a=()=>{const r=f(e);t.scrollTop+=r.getBoundingClientRect().top-t.getBoundingClientRect().top-200};f(e).click(),a(),await l(()=>n(Y(e)).toBeGreaterThan(0)),await u(500);const o=[],s=[];for(let r=0;r<7;r++)for(const c of["true","false"]){a(),await u(150);const i=c==="true"?m(e,"Unplanned"):null,x=performance.now(),w=L.length;await g(p(e,"Unplanned"),()=>{n(p(e,"Unplanned")).toHaveAttribute("aria-pressed",c),i!==null?n(P(e)).toBe(i):n(P(e)).toBeGreaterThan(520)});const S=performance.now();await u(100),r>0&&(o.push(S-x),s.push(L.slice(w).reduce((b,ee)=>b+ee.actualDuration,0)))}console.log(`[perf] Unplanned card with the backlog expanded and in view (dev React): click to paint median ${q(o).toFixed(0)} ms, React render median ${q(s).toFixed(1)} ms`),n(q(s)).toBeLessThan(150),n(q(o)).toBeLessThan(400)}},D={args:{startInFocusMode:!0,loadTasksLater:!0},play:async({canvasElement:e})=>{await l(()=>{n(d(e).title).toBe("Turn Off Focus Mode"),n(m(e,"Unplanned")).toBe(1),n(e.querySelector('[role="note"]')?.textContent).toMatch(/^504 backlog tasks hidden/)},{timeout:1e4}),await u(300);const t=$(e);d(e).click(),await l(()=>n(d(e).title).toBe("Turn On Focus Mode"),{timeout:2e3,interval:1}),n(O(t)).toEqual([]),await y(),await y(),n(O(t)).toEqual([]);const a=G(t);n(a.length).toBeGreaterThan(0);for(const o of a)n(o.querySelectorAll('button[aria-label^="Change status for "]').length).toBe(h(o));n(f(e)).toHaveAttribute("aria-expanded","false")}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:"{}",...R.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    await waitForApp(canvasElement);
    for (const focusMode of [false, true]) {
      await step(\`Cards match the list (focus mode \${focusMode})\`, async () => {
        if (focusMode) {
          await clickAndSettle(getFocusButton(canvasElement), () => expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode"));
        }
        for (const label of CARD_LABELS) {
          const expected = cardNumber(canvasElement, label);
          await clickAndSettle(getCard(canvasElement, label), () => {
            expect(getCard(canvasElement, label)).toHaveAttribute("aria-pressed", "true");
            expect(shownTaskCount(canvasElement)).toBe(expected);
          });
          // The number does not change when its own card is selected
          expect(cardNumber(canvasElement, label)).toBe(expected);
          await clickAndSettle(getCard(canvasElement, label), () => expect(getCard(canvasElement, label)).toHaveAttribute("aria-pressed", "false"));
        }
      });
    }
    await step("Focus mode counts only today's tasks", async () => {
      expect(cardNumber(canvasElement, "Due & OD")).toBe(1);
      expect(cardNumber(canvasElement, "Doing")).toBe(1);
      expect(cardNumber(canvasElement, "Unplanned")).toBe(1);
      expect(cardNumber(canvasElement, "To Do")).toBe(0);
    });
  }
}`,...k.parameters?.docs?.source},description:{story:`Each card's number is the number of tasks the list shows when the card is
selected (day sections + Today + backlog), in focus mode too.`,...k.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await waitForApp(canvasElement);
    const years = [...canvasElement.querySelectorAll("[data-year-section]")];
    expect(years.length).toBeGreaterThan(0);
    for (const year of years) {
      const daysTotal = [...year.querySelectorAll(DAY_SECTIONS)].reduce((sum, day) => sum + countOf(day), 0);
      expect(countOf(year)).toBe(daysTotal);
    }
    // Today's tasks are not counted in any year
    const todayCount = countOf(canvasElement.querySelector(\`[data-day-section="\${TODAY}"]\`)!);
    expect(todayCount).toBe(3);
  }
}`,...F.parameters?.docs?.source},description:{story:"Year headers count exactly the tasks in their day sections.",...F.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    await waitForApp(canvasElement);
    const expectBacklog = (expanded: boolean) => {
      const trigger = getBacklogTrigger(canvasElement);
      expect(trigger).toHaveAttribute("aria-expanded", String(expanded));
      if (!expanded) {
        expect(backlogRows(canvasElement)).toBe(0);
      }
    };
    const toggleFocusTwice = async () => {
      for (const title of ["Turn Off Focus Mode", "Turn On Focus Mode"]) {
        await clickAndSettle(getFocusButton(canvasElement), () => expect(getFocusButton(canvasElement).title).toBe(title));
      }
    };
    const toggleUrgentTwice = async () => {
      // Due & OD hides every undated task, so the backlog unmounts meanwhile
      await clickAndSettle(getCard(canvasElement, "Due & OD"), () => expect(getBacklogTrigger(canvasElement)).toBeNull());
      await clickAndSettle(getCard(canvasElement, "Due & OD"), () => expect(getBacklogTrigger(canvasElement)).not.toBeNull());
    };
    await step("Starts collapsed", async () => expectBacklog(false));
    await step("Stays collapsed through focus mode and filters", async () => {
      await toggleFocusTwice();
      expectBacklog(false);
      await toggleUrgentTwice();
      expectBacklog(false);
    });
    await step("Once the user expands it, stays expanded", async () => {
      getBacklogTrigger(canvasElement)!.click();
      await waitFor(() => expectBacklog(true));
      await toggleFocusTwice();
      expectBacklog(true);
      await toggleUrgentTwice();
      expectBacklog(true);
    });
  }
}`,...A.parameters?.docs?.source},description:{story:"Only the user expands the backlog, and the choice survives filters and focus mode.",...A.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    await waitForApp(canvasElement);
    const pane = getPane(canvasElement);

    // Collapse a timeline section the user can see: scroll to the second one
    const second = pane.querySelectorAll<HTMLElement>("[data-timeline-body] [data-day-section]")[1],
      collapsedDate = second.getAttribute("data-day-section")!;
    scrollPaneTo(pane, second, 100);
    await waitFor(() => expect(daySectionsInView(pane)).toContain(getDaySection(pane, collapsedDate)));
    second.querySelector<HTMLButtonElement>("button[aria-expanded]")!.click();
    await waitFor(() => expect(isDayOpen(second)).toBe(false));
    await sleep(400);
    const expandBacklogAndScrollToEnd = async () => {
      const trigger = getBacklogTrigger(canvasElement)!;
      if (trigger.getAttribute("aria-expanded") !== "true") {
        trigger.click();
        await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
        await sleep(400);
      }
      pane.scrollTop = pane.scrollHeight;
      await waitFor(() => {
        expect(backlogRows(canvasElement)).toBeGreaterThan(0);
        // Day sections (or their rows) far from the view are placeholders
        expect(pane.querySelectorAll("[data-timeline-body] [data-lazy-placeholder]").length).toBeGreaterThan(0);
      });
    };
    const expectCollapsed = () => {
      const section = getDaySection(pane, collapsedDate);
      if (!section) {
        return; // far from the view: its chunk is not mounted (round 2)
      }
      expect(isDayOpen(section)).toBe(false);
      expect(section.querySelectorAll('button[aria-label^="Change status for "]').length).toBe(0);
      expect(section.querySelector("[data-lazy-placeholder]")).toBeNull();
    };
    for (let round = 0; round < 3; round++) {
      await step(\`Focus on, then off (round \${round + 1})\`, async () => {
        // Look at the collapsed section, or in round 2 at the end of the
        // expanded backlog, where the day sections are far and unmounted,
        // then hide the timeline
        if (round === 1) {
          await expandBacklogAndScrollToEnd();
        } else {
          scrollPaneTo(pane, await findTopDaySection(pane, collapsedDate), 100);
        }
        await sleep(100);
        await clickAndSettle(getFocusButton(canvasElement), () => expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode"));
        await sleep(200);
        await toggleFocus(canvasElement, "Turn On Focus Mode");
        // Already right after the commit, before the browser paints
        expect(placeholdersInView(pane)).toEqual([]);
        expectCollapsed();
        // And still within two frames of it
        await nextFrame();
        await nextFrame();
        expect(placeholdersInView(pane)).toEqual([]);
        expectCollapsed();
        // Bring it back into view: still collapsed, and the rest unchanged
        scrollPaneTo(pane, await findTopDaySection(pane, collapsedDate), 100);
        await nextFrame();
        await nextFrame();
        expect(placeholdersInView(pane)).toEqual([]);
        const inView = daySectionsInView(pane);
        expect(inView).toContain(getDaySection(pane, collapsedDate));
        for (const section of inView) {
          const date = section.getAttribute("data-day-section"),
            rows = section.querySelectorAll('button[aria-label^="Change status for "]').length;
          if (date === collapsedDate) {
            expectCollapsed();
          } else {
            expect(isDayOpen(section)).toBe(true);
            expect(rows).toBe(countOf(section));
          }
        }
        // Chevrons are already at their final angle (no replayed animation)
        for (const section of inView) {
          const chevron = section.querySelector<HTMLElement>("button[aria-expanded] [style*='transform']");
          const open = isDayOpen(section);
          expect(chevron?.style.transform ?? "none").toMatch(open ? /rotate\\(90deg\\)/ : /none|rotate\\(0deg\\)/);
        }
      });
    }
  }
}`,...v.parameters?.docs?.source},description:{story:`Leaving focus mode shows the timeline at once: sections in view have
their rows (no placeholders) by the next frame, open/closed state is
kept, and a collapsed section reserves no space.`,...v.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    await waitForApp(canvasElement);
    await clickAndSettle(getFocusButton(canvasElement), () => expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode"));
    await sleep(300);
    const tracker = trackRenders(canvasElement);
    // Only the sections near the view are mounted
    expect(tracker.sectionCount).toBeGreaterThan(3);
    await step("Stat cards", async () => {
      for (const pressed of ["true", "false"]) {
        await clickAndSettle(getCard(canvasElement, "Unplanned"), () => expect(getCard(canvasElement, "Unplanned")).toHaveAttribute("aria-pressed", pressed));
      }
      await sleep(200);
      expect(tracker.renderedSince()).toEqual([]);
    });
    await step("Task updates", async () => {
      updateHostTask({
        id: "today-due",
        status: "done"
      });
      await waitFor(() => expect(cardNumber(canvasElement, "Due & OD")).toBe(0));
      updateHostTask({
        id: FUTURE_TASK.id,
        title: "Renamed while hidden"
      });
      await sleep(300);
      expect(tracker.renderedSince()).toEqual([]);
    });
    await step("Leaving focus mode shows the changes", async () => {
      await toggleFocus(canvasElement, "Turn On Focus Mode");
      await waitFor(() => expect(canvasElement.querySelector(\`[data-timeline-body] button[aria-label="Edit task title: Renamed while hidden"]\`)).not.toBeNull());
    });
  }
}`,...C.parameters?.docs?.source},description:{story:`In focus mode the hidden timeline does no work: stat cards, filters and
task updates render only what focus mode shows. Leaving focus mode shows
the changes made meanwhile.`,...C.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await waitForApp(canvasElement);
    const pane = getPane(canvasElement),
      scrollBacklogIntoView = () => {
        const trigger = getBacklogTrigger(canvasElement)!;
        pane.scrollTop += trigger.getBoundingClientRect().top - pane.getBoundingClientRect().top - 200;
      };
    getBacklogTrigger(canvasElement)!.click();
    scrollBacklogIntoView();
    await waitFor(() => expect(backlogRows(canvasElement)).toBeGreaterThan(0));
    await sleep(500);
    const wallMs: number[] = [],
      renderMs: number[] = [];
    for (let i = 0; i < 7; i++) {
      for (const pressed of ["true", "false"] as const) {
        scrollBacklogIntoView();
        await sleep(150);
        const expected = pressed === "true" ? cardNumber(canvasElement, "Unplanned") : null,
          t0 = performance.now(),
          firstCommit = commits.length;
        await clickAndSettle(getCard(canvasElement, "Unplanned"), () => {
          expect(getCard(canvasElement, "Unplanned")).toHaveAttribute("aria-pressed", pressed);
          if (expected !== null) {
            expect(shownTaskCount(canvasElement)).toBe(expected);
          } else {
            expect(shownTaskCount(canvasElement)).toBeGreaterThan(520);
          }
        });
        const t1 = performance.now();
        await sleep(100);
        if (i > 0) {
          wallMs.push(t1 - t0);
          renderMs.push(commits.slice(firstCommit).reduce((sum, commit) => sum + commit.actualDuration, 0));
        }
      }
    }
    console.log(\`[perf] Unplanned card with the backlog expanded and in view (dev React): click to paint median \${median(wallMs).toFixed(0)} ms, React render median \${median(renderMs).toFixed(1)} ms\`);
    expect(median(renderMs)).toBeLessThan(150);
    expect(median(wallMs)).toBeLessThan(400);
  }
}`,...E.parameters?.docs?.source},description:{story:`Filtering with the expanded backlog in view stays fast. The budgets are
loose (dev-mode React in a shared CI browser); production builds are
several times faster. Before this change the same clicks took ~1.3 s.`,...E.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    startInFocusMode: true,
    loadTasksLater: true
  },
  play: async ({
    canvasElement
  }) => {
    await waitFor(() => {
      expect(getFocusButton(canvasElement).title).toBe("Turn Off Focus Mode");
      // The tasks arrived while the timeline was hidden
      expect(cardNumber(canvasElement, "Unplanned")).toBe(1);
      expect(canvasElement.querySelector('[role="note"]')?.textContent).toMatch(/^504 backlog tasks hidden/);
    }, {
      timeout: 10000
    });
    await sleep(300);
    const pane = getPane(canvasElement);
    getFocusButton(canvasElement).click();
    await waitFor(() => expect(getFocusButton(canvasElement).title).toBe("Turn On Focus Mode"), {
      timeout: 2000,
      interval: 1
    });
    // Already right after the commit, before the browser paints
    expect(placeholdersInView(pane)).toEqual([]);
    await nextFrame();
    await nextFrame();
    expect(placeholdersInView(pane)).toEqual([]);
    const inView = daySectionsInView(pane);
    expect(inView.length).toBeGreaterThan(0);
    for (const section of inView) {
      expect(section.querySelectorAll('button[aria-label^="Change status for "]').length).toBe(countOf(section));
    }
    expect(getBacklogTrigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
  }
}`,...D.parameters?.docs?.source},description:{story:`Starting in focus mode (as the plugin does: settings and tasks load after
the first render), the first time it is turned off is instant too.`,...D.parameters?.docs?.description}}};const wt=["Default","CardCountsMatchList","YearTotalsMatchSections","BacklogStaysCollapsed","FocusToggleHasNoBlankFrames","FocusModeLeavesHiddenTimelineAlone","FilterChangeStaysFast","StartsInFocusMode"];export{A as BacklogStaysCollapsed,k as CardCountsMatchList,R as Default,E as FilterChangeStaysFast,C as FocusModeLeavesHiddenTimelineAlone,v as FocusToggleHasNoBlankFrames,D as StartsInFocusMode,F as YearTotalsMatchSections,wt as __namedExportsOrder,gt as default};
