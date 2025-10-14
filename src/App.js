import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { surveyJson, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";

/* OPTIONAL safety net (kept here for clarity; you can move to App.css)
   👉 Remove these rules later to show normal ratings again.
*/
const hideNormalRatingsStyle = `
.sd-question[data-name="green"],
.sd-question[data-name="pleasant"] {
  display: none !important;
}
`;

function KeyboardRatings({ model, lightbox }) {
  // Only allow 1→0 => 10 within this window
  const TEN_MS = 800;
  const stateRef = React.useRef({
    lastField: null,           // "green" | "pleasant" | null
    greenArm10Until: 0,        // timestamp until which 1→0 is valid
  });

  React.useEffect(() => {
    if (!model) return;

    const getActivePanel = () => lightbox?.panel ?? null;
    const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
    const setVal = (q, val) => { if (!q || q.readOnly) return; q.value = val; };

    const clearArm = () => { stateRef.current.greenArm10Until = 0; };

    const onKeyDown = (e) => {
      const t = e.target;
      const tag = (t?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const panel = getActivePanel();
      if (!panel) return;

      const qG = panel.getQuestionByName("green");     // 0–10
      const qP = panel.getQuestionByName("pleasant");  // 1–7
      const now = performance.now();

      // Backspace clears most-recent and disarms
      if (e.key === "Backspace") {
        clearArm();
        if (hasVal(qP)) qP.value = null;
        else if (hasVal(qG)) qG.value = null;
        e.preventDefault();
        return;
      }

      // Only number keys
      const isDigit = /^[0-9]$/.test(e.key) || /^Numpad[0-9]$/.test(e.code);
      if (!isDigit) return;
      const digit = /^[0-9]$/.test(e.key) ? e.key : e.code.replace("Numpad", "");
      const n = parseInt(digit, 10);

      // Is Greenery armed for 1→0 = 10 and still showing 1?
      const greenArmed =
        now <= stateRef.current.greenArm10Until &&
        stateRef.current.lastField === "green" &&
        String(qG?.value) === "1";

      // --- ARMED CASE: Only accept second digit 0 for 10 ---
      if (greenArmed) {
        if (digit === "0") {
          setVal(qG, 10);
          clearArm();
          stateRef.current.lastField = "green";
          e.preventDefault();
          return;
        }
        // Any other digit while armed goes to Pleasant (if empty) and does NOT change the 1
        if (!hasVal(qP) && n >= 1 && n <= 7) {
          setVal(qP, n);
          stateRef.current.lastField = "pleasant";
          e.preventDefault();
        }
        clearArm();
        return;
      }

      // --- NORMAL ROUTING ---
      // If Greenery empty, fill it first
      if (!hasVal(qG)) {
        if (digit === "1") {
          // Set 1 and arm for possible 10
          setVal(qG, 1);
          stateRef.current.greenArm10Until = now + TEN_MS;
          stateRef.current.lastField = "green";
          e.preventDefault();
          return;
        }
        // Single-digit 0–9 for greenery
        if (n >= 0 && n <= 9) {
          setVal(qG, n);
          clearArm();
          stateRef.current.lastField = "green";
          e.preventDefault();
        }
        return;
      }

      // Otherwise, fill Pleasant next
      if (!hasVal(qP)) {
        if (n >= 1 && n <= 7) {
          setVal(qP, n);
          clearArm();
          stateRef.current.lastField = "pleasant";
          e.preventDefault();
        }
        return;
      }

      // Both filled → ignore
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [model, lightbox]);

  return null;
}



function PopupRatings({ panel }) {
  const [, force] = React.useState(0);

  const getQ = React.useCallback((name) => panel?.getQuestionByName(name), [panel]);

  const qGreen = getQ("green");
  const qPleasant = getQ("pleasant");
  const choices_green = [0,1, 2, 3, 4, 5, 6, 7,8,9,10];
  const choices_pleasant = [1, 2, 3, 4, 5, 6, 7];


  const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
  const isSelected = (q, n) => String(q?.value) === String(n);

  const setVal = (q, val) => {
    if (!q || q.readOnly) return;
    q.value = val;
    force((x) => x + 1);
  };

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
        <div className="rating-scale">
          {/* header labels row */}
          <div className="scale-header">
            <span className="scale-label scale-label--min" style={{ gridColumn: '1' }}>
              0 = Not green at all
            </span>
            <span className="scale-label scale-label--mid" style={{ gridColumn: '6' }}>
              5 = Half of the view is green
            </span>
            <span className="scale-label scale-label--max" style={{ gridColumn: '11' }}>
              10 = Completely green
            </span>
          </div>

          {/* buttons row (11 columns) */}
          <div className="rating-buttons">
            {choices_green.map((n) => (
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
        </div>
      </div>


      {/* PLEASANT */}
      <div className="rating-row rating-row--pleasant">
        <div className="rating-label">Pleasant</div>
        <div className="rating-scale">
          {/* header labels row */}
          <div className="scale-header">
            <span className="scale-label scale-label--min" style={{ gridColumn: '1' }}>
              1 = Very unpleasant
            </span>
            <span className="scale-label scale-label--mid" style={{ gridColumn: '4' }}>
              4 = Neither pleasant or unpleasant
            </span>
            <span className="scale-label scale-label--max" style={{ gridColumn: '7' }}>
              7 = Very pleasant
            </span>
          </div>

          {/* buttons row (7 columns) */}
          <div className="rating-buttons">
            {choices_pleasant.map((n) => (
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
  const MIN_DWELL_MS = 2000;

  const imageLoadedAtRef = React.useRef(new WeakMap());
  const pendingAdvanceRef = React.useRef(null);
  const waitingForDwellAdvanceRef = React.useRef(new WeakMap());

  const [lightbox, setLightbox] = React.useState(null);
  const [lightboxLoaded, setLightboxLoaded] = React.useState(false);
  React.useEffect(() => setLightboxLoaded(false), [lightbox?.src]);

  const lightboxRef = React.useRef(null);
  React.useEffect(() => { lightboxRef.current = lightbox; }, [lightbox]);

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

    // Apply theme + survey config
    m.applyTheme(themeJson);
    m.title = surveyConfig.title;
    m.description = surveyConfig.description;
    m.logo = surveyConfig.logo;
    m.logoPosition = surveyConfig.logoPosition;
    Object.keys(surveyConfig.settings).forEach((key) => (m[key] = surveyConfig.settings[key]));
    m.focusFirstQuestionAutomatic = false;
    m.previewText = "Finish survey";
    m.showPreviewBeforeComplete = false;

    const defaultNext = m.pageNextText || "Next";
    m.completeText = "Finish survey";



    const setNextLabel = () => {
      const name = m.currentPage?.name;
      if (name === "introPage") m.pageNextText = "I agree";
      else if (name === "consentPage") m.pageNextText = "Accept";
      else if (name === "instructionsPage") m.pageNextText = "Start survey";
      else if (name === "demographics") m.pageNextText = "Continue to rating";
      else if (name === "comfort_loop_page") m.pageNextText = "Finish rating";
      else m.pageNextText = defaultNext;
    };
    setNextLabel();
    m.onCurrentPageChanged.add(setNextLabel);

    // Build image queue
    const pool = (displayedImages?.comfort_rating ?? [])
      .map((x, i) => {
        const url = x?.imageLink || x?.image || "";
        if (!url) console.warn("[images] empty url at index", i, x);
        return url;
      })
      .filter(Boolean);

    const imageQueue = [...pool];
    




    // Preloader
    const preloadedLocal = new Set();
    const preloadLocal = (url) => {
      if (!url || preloadedLocal.has(url)) return;
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      preloadedLocal.add(url);
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
      for (let i = 0; i < n && i < imageQueue.length; i++) {
        preloadLocal(imageQueue[i]);
      }
    };
    m.__preloadNext = preloadNext;
    preloadNext(2);

    const nextImage = () => (imageQueue.length ? imageQueue.shift() : "");

    // 🔒 Helper: hide normal-view ratings for a panel
    const hidePanelRatings = (panel) => {
      // 👉 Remove these lines later to restore normal ratings:
      const qG = panel.getQuestionByName("green");
      const qP = panel.getQuestionByName("pleasant");
      if (qG) qG.visible = false;     // <— RESTORE: set to true or remove
      if (qP) qP.visible = false;     // <— RESTORE: set to true or remove
    };

    m.onAfterRenderQuestion.add((sender, options) => {
      // Extra guard: force-hide DOM of normal-view ratings
      if (options.question.name === "green" || options.question.name === "pleasant") {
        // 👉 RESTORE later by removing the next line:
        options.htmlElement.style.display = "none";
        return;
      }

      if (options.question.name !== "image") return;

      const img = options.htmlElement.querySelector("img");
      if (!img) return;

      const panel = options.question.parent;
      hidePanelRatings(panel); // ensure ratings are hidden for this panel

      img.style.cursor = "zoom-in";
      img.onclick = () => openLightboxForPanel(panel);

      // Put a big “Click the image to start rating” banner under the image (normal view)
      const host = options.htmlElement; // question root
      const bannerIdTop = `tap-to-rate-top-${panel.id}`;
      const bannerIdBottom = `tap-to-rate-${panel.id}`;

      // Prefer the actual SurveyJS image class, fall back to <img>
      const imgEl = host.querySelector('.sd-image__image, img');
      if (imgEl) {
        const makeBanner = (id) => {
          const el = document.createElement('div');
          el.id = id;
          el.className = 'tap-to-rate-banner';
          el.textContent = 'Click the image to start rating';
          return el;
        };

        // ---- TOP banner (before the image) ----
        if (!host.querySelector(`#${bannerIdTop}`)) {
          const topBanner = makeBanner(bannerIdTop);
          // insert relative to the image’s own parent to avoid NotFoundError
          imgEl.insertAdjacentElement('beforebegin', topBanner);
        }

        // ---- BOTTOM banner (after the image) ----
        if (!host.querySelector(`#${bannerIdBottom}`)) {
          const bottomBanner = makeBanner(bannerIdBottom);
          imgEl.insertAdjacentElement('afterend', bottomBanner);
        }
      }


      // Dwell stamp
      const markLoaded = () => {
        if (!imageLoadedAtRef.current.get(panel)) {
          imageLoadedAtRef.current.set(panel, performance.now());
        }
        if (waitingForDwellAdvanceRef.current.get(panel)) {
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          pendingAdvanceRef.current = setTimeout(() => {
            const dpNow = sender.getQuestionByName("comfort_loop");
            const cur = dpNow?.panels[dpNow.currentIndex];
            if (cur === panel && waitingForDwellAdvanceRef.current.get(panel)) {
              waitingForDwellAdvanceRef.current.delete(panel);
              doAdvanceFromPanel(panel);
            }
          }, MIN_DWELL_MS);
        }
      };

      if (img.complete) markLoaded();
      else img.addEventListener("load", markLoaded, { once: true });

      if (options.question.name === "comfort_loop") {
        options.htmlElement
          .querySelectorAll(".sd-paneldynamic__footer")
          .forEach(el => (el.style.display = "none"));
      }

    });

    

    // Seed first panel
    m.onAfterRenderSurvey.add((sender) => {
      const dp = sender.getQuestionByName("comfort_loop");
      if (!dp || !dp.panels.length) return;

      const first = dp.panels[0];
      hidePanelRatings(first); // hide ratings in normal view on first panel

      const hidden = first.getQuestionByName("imageUrl");
      if (hidden?.value) return;

      const url = nextImage();
      const imgQ = first.getQuestionByName("image");
      if (imgQ) {
        imgQ.imageLink = url;
        imgQ.locImageLink?.onChanged?.();
      }
      if (hidden) hidden.value = url;
      preloadNext(2);
    });

    // Seed each new panel & hide its normal-view ratings
    m.onDynamicPanelAdded.add((sender, opt) => {
      if (opt.question.name !== "comfort_loop") return;
      const panel = opt.panel;
      hidePanelRatings(panel); // keep normal view clean

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

    // Scroll helpers
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
      return window;
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

    // Advance after both ratings + dwell
    const hookDynamic = (m) => {
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
          waitingForDwellAdvanceRef.current.delete(panel);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const loadedAt = imageLoadedAtRef.current.get(panel);
        if (!loadedAt) {
          waitingForDwellAdvanceRef.current.set(panel, true);
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

      if (m.onDynamicPanelValueChanged) m.onDynamicPanelValueChanged.add(handler);
      else m.onDynamicPanelItemValueChanged.add(handler);
    };

    hookDynamic(m);

    // Save completion
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
    cameFromPrevRef.current = true;
    dp.currentIndex = dp.currentIndex - 1;
    openLightboxForPanel(dp.panels[dp.currentIndex]);
    model.__preloadNext?.(2);
  }, [model, openLightboxForPanel]);

  const goNext = React.useCallback(() => {
    const dp = model.getQuestionByName("comfort_loop");
    if (!dp) return;
    const hasNext = dp.currentIndex < dp.panels.length - 1;
    if (hasNext) {
      dp.currentIndex = dp.currentIndex + 1;
      openLightboxForPanel(dp.panels[dp.currentIndex]);
      cameFromPrevRef.current = false;
      model.__preloadNext?.(2);
    } else {
      setLightbox(null);
    }
  }, [model, openLightboxForPanel]);

  React.useEffect(() => {
    return () => {
      if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
    };
  }, []);

  return (
    <>
      {/* Safety-net CSS to hide any stray normal-view ratings */}
      <style>{hideNormalRatingsStyle}</style>

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

            {/* ✅ Ratings are ONLY rendered inside the lightbox */}
            <PopupRatings panel={lightbox.panel} />

            {/* Top-right close button */}
            <button
              className="lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
