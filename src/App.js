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
  React.useEffect(() => {
    if (!model) return;

    // ✅ Only allow keyboard ratings while the LIGHTBOX is open
    const getActivePanel = () => lightbox?.panel ?? null;

    const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
    const setVal = (q, val) => {
      if (!q || q.readOnly) return;
      q.value = val;
    };

    const onKeyDown = (e) => {
      const t = e.target;
      const tag = (t?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const panel = getActivePanel();
      if (!panel) return; // not in lightbox: ignore keys

      const qG = panel.getQuestionByName("green");
      const qP = panel.getQuestionByName("pleasant");

      if (e.key === "Backspace") {
        if (hasVal(qP)) qP.value = null;
        else if (hasVal(qG)) qG.value = null;
        e.preventDefault();
        return;
      }

      let val = null;
      if (e.key >= "1" && e.key <= "7") val = parseInt(e.key, 10);
      else if (/^Numpad[1-7]$/.test(e.code)) val = parseInt(e.code.replace("Numpad", ""), 10);
      if (val == null) return;

      const target = !hasVal(qG) ? qG : !hasVal(qP) ? qP : null;
      if (!target) return;

      setVal(target, val);
      e.preventDefault();
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
  const choices = [1, 2, 3, 4, 5, 6, 7];

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
      const bannerId = `tap-to-rate-${panel.id}`;
      if (!host.querySelector(`#${bannerId}`)) {
        const banner = document.createElement("div");
        banner.id = bannerId;
        banner.className = "tap-to-rate-banner";
        banner.innerHTML = `Click the image to start rating`;
        host.appendChild(banner);
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

              <button className="lightbox-next" onClick={goNext} aria-label="Next image">
                Next →
              </button>

              <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
