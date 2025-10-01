import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { surveyJson, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";

function KeyboardRatings({ model, lightbox }) {
  React.useEffect(() => {
    if (!model) return;

    const getActivePanel = () => {
      if (lightbox?.panel) return lightbox.panel; // popup open → use it
      const dp = model.getQuestionByName("comfort_loop");
      if (!dp) return null;
      return dp.panels?.[dp.currentIndex] ?? null; // page mode → current panel
    };

    const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
    const setVal = (q, val) => {
      if (!q || q.readOnly) return;
      q.value = val; // SurveyJS will emit value change
    };

    const onKeyDown = (e) => {
      // Ignore typing in inputs/areas/contenteditables and with modifiers
      const t = e.target;
      const tag = (t?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const panel = getActivePanel();
      if (!panel) return;

      const qG = panel.getQuestionByName("green");
      const qP = panel.getQuestionByName("pleasant");

      // Undo: Backspace clears Pleasantness first, then Greenery
      if (e.key === "Backspace") {
        if (hasVal(qP)) qP.value = null;
        else if (hasVal(qG)) qG.value = null;
        e.preventDefault();
        return;
      }

      // Map number keys 1..7 (top row & numpad)
      let val = null;
      if (e.key >= "1" && e.key <= "7") val = parseInt(e.key, 10);
      else if (/^Numpad[1-7]$/.test(e.code)) val = parseInt(e.code.replace("Numpad", ""), 10);
      if (val == null) return;

      // First number press → Greenery, second → Pleasantness
      const target = !hasVal(qG) ? qG : !hasVal(qP) ? qP : null;
      if (!target) return;

      setVal(target, val);
      e.preventDefault();
    };

    // capture phase so nothing upstream can swallow it
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [model, lightbox]);

  return null; // no UI
}


function PopupRatings({ panel }) {
  const [, force] = React.useState(0);

  const getQ = React.useCallback(
    (name) => panel?.getQuestionByName(name),
    [panel]
  );

  const qGreen = getQ("green");
  const qPleasant = getQ("pleasant");
  const choices = [1, 2, 3, 4, 5, 6, 7];

  const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
  const isSelected = (q, n) => String(q?.value) === String(n);

  const setVal = (q, val) => {
    if (!q || q.readOnly) return;
    q.value = val;         // update SurveyJS value
    force((x) => x + 1);   // ensure our UI reflects it immediately
  };

  // Re-render when SurveyJS tells us values changed (mouse clicks / programmatic)
  React.useEffect(() => {
    if (!panel) return;
    const s = panel.survey;
    const RATING_KEYS = new Set(["green", "pleasant"]);

    const onValueChanged = (_sender, opt) => {
      if (RATING_KEYS.has(opt?.name)) force((x) => x + 1);
    };

    const onDP = (_sender, opt) => {
      const isDP = opt?.question?.name === "comfort_loop";
      const isThisPanel = opt?.panel === panel;
      if (!isDP || !isThisPanel) return;
      if (RATING_KEYS.has(opt?.name)) force((x) => x + 1);
    };

    s.onValueChanged.add(onValueChanged);
    if (s.onDynamicPanelValueChanged) s.onDynamicPanelValueChanged.add(onDP);
    else if (s.onDynamicPanelItemValueChanged) s.onDynamicPanelItemValueChanged.add(onDP);

    return () => {
      s.onValueChanged.remove(onValueChanged);
      if (s.onDynamicPanelValueChanged) s.onDynamicPanelValueChanged.remove(onDP);
      else if (s.onDynamicPanelItemValueChanged) s.onDynamicPanelItemValueChanged.remove(onDP);
    };
  }, [panel]);

  const hasGreen = hasVal(qGreen);
  const hasPleasant = hasVal(qPleasant);
  const awaitingPleasant = hasGreen && !hasPleasant;
  const awaitingGreen = hasPleasant && !hasGreen;

  return (
    <div
      className={[
        "rating-group",
        awaitingPleasant ? "awaiting-pleasant" : "",
        awaitingGreen ? "awaiting-green" : "",
      ].join(" ").trim()}
    >
      {/* GREEN */}
      <div className="rating-row rating-row--green">
        <div className="rating-label">Green</div>
        <div className="rating-left-label">1 = Not green at all</div>
        <div className="rating-buttons-and-right">
          <div className="rating-buttons">
            {choices.map((n) => (
              <button
                key={`g-${n}`}
                type="button"
                className={isSelected(qGreen, n) ? "active" : ""}
                aria-pressed={isSelected(qGreen, n)}
                onClick={() => setVal(qGreen, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="rating-right-label">7 = Completely green</div>
        </div>
      </div>

      {/* PLEASANT */}
      <div className="rating-row rating-row--pleasant">
        <div className="rating-label">Pleasant</div>
        <div className="rating-left-label">1 = Very unpleasant</div>
        <div className="rating-buttons-and-right">
          <div className="rating-buttons">
            {choices.map((n) => (
              <button
                key={`p-${n}`}
                type="button"
                className={isSelected(qPleasant, n) ? "active" : ""}
                aria-pressed={isSelected(qPleasant, n)}
                onClick={() => setVal(qPleasant, n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="rating-right-label">7 = Very pleasant</div>
        </div>
      </div>
    </div>
  );
}




const preloaded = new Set();
const MAX_TRACKED = 64;
const preload = (url) => {
  if (!url || preloaded.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  preloaded.add(url);
  if (preloaded.size > MAX_TRACKED) {
    const first = preloaded.values().next().value;
    preloaded.delete(first);
  }
};



export default function App() {


    // --- dwell-time control (2s after image load) ---
  const MIN_DWELL_MS = 2000;

  // when each panel's <img> actually finished loading
  const imageLoadedAtRef = React.useRef(new WeakMap());

  // if we already queued an auto-advance for the current panel
  const pendingAdvanceRef = React.useRef(null);

  // whether the current panel is waiting to auto-advance as soon as dwell is satisfied
  const waitingForDwellAdvanceRef = React.useRef(new WeakMap());

  const [lightbox, setLightbox] = React.useState(null); 

  const [lightboxLoaded, setLightboxLoaded] = React.useState(false);
  React.useEffect(() => {
    // reset fade-in whenever the image src changes
    setLightboxLoaded(false);
  }, [lightbox?.src]);
// shape: { src: string, panel: PanelModel }
  const lightboxRef = React.useRef(null);
  React.useEffect(() => {
    lightboxRef.current = lightbox;
  }, [lightbox]);

  const cameFromPrevRef = React.useRef(false);


  const openLightboxForPanel = React.useCallback((panel) => {
    if (!panel) return;
    const imgQ = panel.getQuestionByName("image");
    const src = imgQ?.imageLink || "";
    if (src) setLightbox({ src, panel });
  }, []);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const model = React.useMemo(() => {
    const m = new Model(surveyJson);

    // === Apply theme + survey config ===
    m.applyTheme(themeJson);
    m.title = surveyConfig.title;
    m.description = surveyConfig.description;
    m.logo = surveyConfig.logo;
    m.logoPosition = surveyConfig.logoPosition;
    Object.keys(surveyConfig.settings).forEach(
      (key) => (m[key] = surveyConfig.settings[key])
    );
    m.focusFirstQuestionAutomatic = false;
    m.previewText = "Finish survey";
    m.showPreviewBeforeComplete = false; 

    // Per-page "Next" button labeling
    const defaultNext = m.pageNextText || "Next";
    m.completeText = "Finish survey";  

    const setNextLabel = () => {
      const name = m.currentPage?.name;
      if (name === "introPage") {
        m.pageNextText = "I agree"
      } else if (name === "consentPage") {
        m.pageNextText = "Accept";
      } else if (name === "instructionsPage") {
        m.pageNextText = "Start survey";
      } else if (name === "demographics") {
        m.pageNextText = "Continue to rating";
      } else if (name === "comfort_loop_page") {
        m.pageNextText = "Finish rating";
      } else {
        m.pageNextText = defaultNext; // e.g. "Next"
      }
    };

    setNextLabel();
    m.onCurrentPageChanged.add(setNextLabel);

    // === Build image queue from displayedImages ===
    const pool = (displayedImages?.comfort_rating ?? [])
      .map((x, i) => {
        const url = x?.imageLink || x?.image || "";
        if (!url) console.warn("[images] empty url at index", i, x);
        return url;
      })
      .filter(Boolean);

    const imageQueue = [...pool];

    /* --- PRELOADER --- */
      const preloaded = new Set();
      const preload = (url) => {
        if (!url || preloaded.has(url)) return;
        const img = new Image();
        img.decoding = "async";      // hint: decode off main thread
        img.src = url;               // start fetching
        preloaded.add(url);

        // optional: also add a <link rel="preload"> hint
        try {
          if (!document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = url;
            document.head.appendChild(link);
          }
        } catch (_) {}
      };

      const preloadNext = (n = 2) => {
        // peek the next n images in the queue without shifting
        for (let i = 0; i < n && i < imageQueue.length; i++) {
          preload(imageQueue[i]);
        }
      };
      m.__preloadNext = preloadNext;

      preloadNext(2);

      /* --- /PRELOADER --- */

    const nextImage = () => {
      const url = imageQueue.length ? imageQueue.shift() : "";
      return url;
    };

    m.onAfterRenderQuestion.add((sender, options) => {
      if (options.question.name !== "image") return;

      const img = options.htmlElement.querySelector("img");
      if (!img) return;

      const panel = options.question.parent; // PanelModel for this item
      img.style.cursor = "zoom-in";
      img.onclick = () => openLightboxForPanel(panel);

      // --- Dwell: stamp "loaded at" for this panel, once the <img> actually loads ---
      const markLoaded = () => {
        // record load time (once)
        if (!imageLoadedAtRef.current.get(panel)) {
          imageLoadedAtRef.current.set(panel, performance.now());
        }

        // If user already finished both ratings and we're waiting to auto-advance,
        // reschedule the auto-advance to fire 2s after *now* (the true load time).
        if (waitingForDwellAdvanceRef.current.get(panel)) {
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          pendingAdvanceRef.current = setTimeout(() => {
            const dpNow = sender.getQuestionByName("comfort_loop");
            const cur = dpNow?.panels[dpNow.currentIndex];
            if (cur === panel && waitingForDwellAdvanceRef.current.get(panel)) {
              waitingForDwellAdvanceRef.current.delete(panel);
              // do the same move-forward logic you already have (we call a helper below)
              doAdvanceFromPanel(panel);
            }
          }, MIN_DWELL_MS);
        }
      };

      if (img.complete) markLoaded();
      else img.addEventListener("load", markLoaded, { once: true });
    });


    // === Seed first panel once ===
    m.onAfterRenderSurvey.add((sender) => {
      const dp = sender.getQuestionByName("comfort_loop");
      if (!dp || !dp.panels.length) return;

      const first = dp.panels[0];
      const hidden = first.getQuestionByName("imageUrl");
      if (hidden?.value) return; // already seeded (StrictMode, preview, etc.)

      const url = nextImage();

      const imgQ = first.getQuestionByName("image");
      if (imgQ) {
        imgQ.imageLink = url;
        imgQ.locImageLink?.onChanged?.();
      }
      if (hidden) hidden.value = url;
      preloadNext(2);
    });

    // === Seed every newly added panel ===
    m.onDynamicPanelAdded.add((sender, opt) => {
      if (opt.question.name !== "comfort_loop") return;
      const panel = opt.panel;
      const url = nextImage();
      const imgQ = panel.getQuestionByName("image");
      if (imgQ) {
        imgQ.imageLink = url;
        imgQ.locImageLink?.onChanged?.();
      }
      const hidden = panel.getQuestionByName("imageUrl");
      if (hidden) hidden.value = url;
      preloadNext(2);
    });

    // === Scroll helpers ===
    const getActiveScroller = () => {
      const candidates = [
        document.querySelector(".sd-body__page"),
        document.querySelector(".sd-page"),
        document.querySelector(".sd-body"),
        document.scrollingElement,
        document.documentElement,
        document.body,
      ].filter(Boolean);

      for (const el of candidates) {
        const style = getComputedStyle(el);
        const scrollable =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 1;
        if (scrollable) return el;
      }
      return window; // fallback
    };

    const takeScrollSnapshot = () => {
      const scroller = getActiveScroller();
      return scroller === window
        ? { scroller, y: window.scrollY }
        : { scroller, y: scroller.scrollTop };
    };

    const restoreScroll = ({ scroller, y }) => {
      const currentY = scroller === window ? window.scrollY : scroller.scrollTop;
      if (y === 0 && currentY === 0) return;
      const doScroll = () => {
        if (scroller === window) window.scrollTo({ top: y, behavior: "auto" });
        else scroller.scrollTo({ top: y, behavior: "auto" });
      };
      requestAnimationFrame(() => {
        doScroll();
        requestAnimationFrame(doScroll);
      });
    };

    const doAdvanceFromPanel = (panel) => {
      const dp = m.getQuestionByName("comfort_loop");
      const wasOpen = !!lightboxRef.current;
      const hasExistingNext = dp.currentIndex < dp.panels.length - 1;

      if (cameFromPrevRef.current && hasExistingNext) {
        const snap = takeScrollSnapshot();
        dp.currentIndex = dp.currentIndex + 1;

        if (wasOpen) {
          const nextPanel = dp.panels[dp.currentIndex];
          const imgQ = nextPanel.getQuestionByName("image");
          const src = imgQ?.imageLink || "";
          if (src) setLightbox({ src, panel: nextPanel });
        }

        restoreScroll(snap);
        cameFromPrevRef.current = false;
        return;
      }

      if (imageQueue.length > 0) {
        m.__preloadNext?.(2);
        const snap = takeScrollSnapshot();
        dp.addPanel();
        setTimeout(() => {
          dp.currentIndex = dp.currentIndex + 1;
          const nextPanel = dp.panels[dp.currentIndex];
          if (wasOpen) {
            const imgQ = nextPanel.getQuestionByName("image");
            const src = imgQ?.imageLink || "";
            if (src) setLightbox({ src, panel: nextPanel });
          }
          restoreScroll(snap);
        }, 100);
      } else {
        setTimeout(() => {
          m.completeLastPage();
          setLightbox(null);
        }, 100);
      }
    };



    // === Advance only after BOTH ratings are answered ===
    const hookDynamic = (m, { imageQueue, takeScrollSnapshot, restoreScroll }) => {
      const RATING_KEYS = ["green", "pleasant"];

      const bothAnswered = (panel) => {
        const g = panel.getQuestionByName("green");
        const p = panel.getQuestionByName("pleasant");
        const has = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
        return { g, p, ok: has(g) && has(p) };
      };

      const handler = (sender, opt) => {
        if (opt?.question?.name !== "comfort_loop") return;
        if (!RATING_KEYS.includes(opt?.name)) return;

        const dp = opt.question;
        const panel = opt.panel;
        if (!panel) return;

        const { ok } = bothAnswered(panel);
        if (!ok) {
          // user cleared/edited → cancel pending move
          waitingForDwellAdvanceRef.current.delete(panel);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        // both answered → check how long since this panel's image loaded
        const loadedAt = imageLoadedAtRef.current.get(panel);

        // If we don't yet know the load time, wait for the true <img> load (step 2 sets it)
        if (!loadedAt) {
          waitingForDwellAdvanceRef.current.set(panel, true);
          // If something had been queued for an earlier panel, cancel it
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const elapsed = performance.now() - loadedAt;
        const remaining = Math.max(0, MIN_DWELL_MS - elapsed);

        waitingForDwellAdvanceRef.current.set(panel, true);
        if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);

        pendingAdvanceRef.current = setTimeout(() => {
          const cur = dp.panels[dp.currentIndex];
          if (cur === panel && waitingForDwellAdvanceRef.current.get(panel)) {
            waitingForDwellAdvanceRef.current.delete(panel);
            doAdvanceFromPanel(panel);
          }
        }, remaining);
      };


      if (m.onDynamicPanelValueChanged) {
        m.onDynamicPanelValueChanged.add(handler);
      } else {
        m.onDynamicPanelItemValueChanged.add(handler);
      }
    };


    hookDynamic(m, { imageQueue, takeScrollSnapshot, restoreScroll });

    // === Save completion handler ===
    m.onComplete.add(async (survey) => {
      const responses = survey.data;
      const completeData = {
        responses,
        displayed_images: displayedImages,
        survey_metadata: {
          completion_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          survey_version: "1.0",
        },
      };
      const result = await saveSurveyResponse(completeData);
      if (result.success) {
        alert("Thank you for completing the survey! Your responses have been saved.");
      } else {
        console.error("Failed to save survey response:", result.error);
        alert("There was an error saving your responses. Please try again.");
      }
    });
    

    return m;
  }, []);

  const goPrev = React.useCallback(() => {
    const dp = model.getQuestionByName("comfort_loop");
    if (!dp || dp.currentIndex <= 0) return;
    cameFromPrevRef.current = true; // mark that we went back
    dp.currentIndex = dp.currentIndex - 1;
    openLightboxForPanel(dp.panels[dp.currentIndex]);
    model.__preloadNext?.(2);
  }, [model, openLightboxForPanel]);

  // NEXT: prefer existing next; if none, let the rating handler create it
  const goNext = React.useCallback(() => {
    const dp = model.getQuestionByName("comfort_loop");
    if (!dp) return;
    const hasNext = dp.currentIndex < dp.panels.length - 1;
    if (hasNext) {
      dp.currentIndex = dp.currentIndex + 1;
      openLightboxForPanel(dp.panels[dp.currentIndex]);
      cameFromPrevRef.current = false;
      model.__preloadNext?.(2); // reset
    } else {
      // No next yet — close; the rating handler will add the next panel on completion
      setLightbox(null);
    }
  }, [model, openLightboxForPanel]);

    const canGoPrev = (() => {
      const dp = model.getQuestionByName("comfort_loop");
      return !!dp && dp.currentIndex > 0;
    })();

    React.useEffect(() => {
      return () => {
        if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
      };
    }, []);


  return (
    <>
    
    <Survey model={model} />
    <KeyboardRatings model={model} lightbox={lightbox} />

    {lightbox && (
      <div
        className="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        onClick={() => setLightbox(null)}
      >
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <div className={`lightbox-media ${lightboxLoaded ? "is-loaded" : ""}`}>
            <img
              className="lightbox-img"
              src={lightbox.src}
              alt=""
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLightboxLoaded(true)}
            />
          </div>

          <PopupRatings panel={lightbox.panel} />

          <div className="lightbox-actions">
            <button
              className="lightbox-prev"
              onClick={goPrev}
              disabled={(() => {
                const dp = model.getQuestionByName("comfort_loop");
                return !dp || dp.currentIndex <= 0;
              })()}
              aria-label="Previous image"
            >
              ← Previous
            </button>

            <button
              className="lightbox-next"
              onClick={goNext}
              aria-label="Next image"
            >
              Next →
            </button>

            <button
              className="lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

        </div>
      </div>
    )}



    </>
  );
}


