import{j as a}from"./jsx-runtime-u17CrQMm.js";import{r as A,R as y}from"./iframe-C21N2aj2.js";import{E as w,r as H,u as M}from"./useLazyChunks-FmHFT08s.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,waitFor:R}=__STORYBOOK_MODULE_TEST__,_=120,l=25,g=25,k=5,f=400,T=500,b=5e3,E=({name:o,rows:e})=>{const r=Math.ceil(e/l),u=A.useMemo(()=>H(e,l),[e]),{isNear:s,markerRef:c,placeholderHeight:h}=M(u);return a.jsxs("div",{"data-list":o,children:[Array.from({length:r},(m,t)=>a.jsxs(y.Fragment,{children:[a.jsx("div",{ref:c(t),"data-chunk":t,"data-far":s(t)?void 0:"",style:{display:"flow-root",height:s(t)?void 0:h(t)}}),s(t)&&Array.from({length:Math.min(l,e-t*l)},(d,i)=>a.jsxs("div",{style:{height:_,boxSizing:"border-box",borderBottom:"1px solid #ddd"},children:[o," row ",t*l+i]},i))]},t)),a.jsx("div",{ref:c(r),style:{display:"flow-root"}})]})},x=()=>a.jsxs("div",{"data-testid":"lazy-pane",style:{height:f,width:320,overflowY:"auto",overflowAnchor:"none"},children:[a.jsx("div",{style:{height:b}}),a.jsx(E,{name:"upper",rows:g}),a.jsx(E,{name:"lower",rows:k}),a.jsx("div",{style:{height:b}})]}),I=()=>new Promise(o=>requestAnimationFrame(()=>o())),v=async o=>{for(let e=0;e<o;e++)await I()},j={title:"Core/LazyChunks",component:x,parameters:{layout:"padded",a11y:{test:"off"}}},p={play:async({canvasElement:o})=>{const e=o.querySelector('[data-testid="lazy-pane"]'),r=i=>e.querySelector(`[data-list="${i}"] [data-chunk]`),u=i=>i.getBoundingClientRect().top-e.getBoundingClientRect().top+e.scrollTop;await v(3),n(r("upper")).toHaveAttribute("data-far"),n(r("lower")).toHaveAttribute("data-far");const s=u(r("upper")),c=g*w,h=k*w,m=s+T+100;n(s+c+h).toBeGreaterThan(m+f+T);let t=null;const d=new MutationObserver(()=>{r("upper").hasAttribute("data-far")||(d.disconnect(),t=r("lower").hasAttribute("data-far"),e.scrollTop=u(r("lower"))-f-225)});d.observe(e,{subtree:!0,childList:!0,attributes:!0}),e.scrollTop=m,await R(()=>n(t).not.toBeNull(),{timeout:2e3}),n(t).toBe(!0),await v(10),n(r("upper")).not.toHaveAttribute("data-far"),n(r("lower")).not.toHaveAttribute("data-far")}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const pane = canvasElement.querySelector<HTMLElement>('[data-testid="lazy-pane"]')!,
      marker = (list: string) => pane.querySelector<HTMLElement>(\`[data-list="\${list}"] [data-chunk]\`)!,
      // Position in the scrolled content, whatever the scroll offset
      offsetOf = (element: HTMLElement) => element.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
    await frames(3);
    expect(marker("upper")).toHaveAttribute("data-far");
    expect(marker("lower")).toHaveAttribute("data-far");
    const upperTop = offsetOf(marker("upper")),
      upperEstimate = UPPER_ROWS * ESTIMATED_ITEM_HEIGHT,
      lowerEstimate = LOWER_ROWS * ESTIMATED_ITEM_HEIGHT,
      // The upper placeholder overlaps the margin, so does the lower one,
      // and the lower list's end marker is below it
      scrollTop = upperTop + MARGIN + 100;
    expect(upperTop + upperEstimate + lowerEstimate).toBeGreaterThan(scrollTop + VIEW_HEIGHT + MARGIN);
    let lowerFarAfterMount: boolean | null = null;
    const mutations = new MutationObserver(() => {
      if (marker("upper").hasAttribute("data-far")) {
        return;
      }
      // Right after the commits that mounted the upper list, before the
      // next frame
      mutations.disconnect();
      lowerFarAfterMount = marker("lower").hasAttribute("data-far");
      // The lower marker 225 px below the view: its placeholder overlaps
      // the margin, its end marker is below it, as its observer last saw
      pane.scrollTop = offsetOf(marker("lower")) - VIEW_HEIGHT - 225;
    });
    mutations.observe(pane, {
      subtree: true,
      childList: true,
      attributes: true
    });
    pane.scrollTop = scrollTop;
    await waitFor(() => expect(lowerFarAfterMount).not.toBeNull(), {
      timeout: 2000
    });
    // The scenario happened: mounting the upper list pushed the lower out
    expect(lowerFarAfterMount).toBe(true);

    // Its placeholder overlaps the margin, so it mounts within a few frames
    await frames(10);
    expect(marker("upper")).not.toHaveAttribute("data-far");
    expect(marker("lower")).not.toHaveAttribute("data-far");
  }
}`,...p.parameters?.docs?.source},description:{story:`A chunk back inside the margin mounts, even when its observer never saw
it leave.

A scroll brings both lists into the margin and both mount. The upper
list's real rows are much taller than its placeholder, so the lower
list's re-check right after that commit finds its marker far below the
margin and unmounts it again. Before the observers look again, the scroll
brings that marker back inside the margin (as fast wheel or PageDown
scrolling does in the next frame). The lower list's markers are where its
observer last saw them, so it reports nothing: the lower list stayed a
placeholder, in view, until something else re-rendered it.`,...p.parameters?.docs?.description}}};const G=["RemountsAChunkTheObserverMissed"];export{p as RemountsAChunkTheObserverMissed,G as __namedExportsOrder,j as default};
