import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { surveyJson, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";


function PopupRatings({ panel }) {
  const [, force] = React.useState(0); // re-render when values change

  const qGreen = panel?.getQuestionByName("green");
  const qPleasant = panel?.getQuestionByName("pleasant");
  const choices = [1, 2, 3, 4, 5,6,7]; // adjust to your scale

  // Re-render this component when either value changes in the model
  React.useEffect(() => {
    if (!panel) return;
    const s = panel.survey;
    const handler = (sender, opt) => {
      if (opt.name === qGreen?.name || opt.name === qPleasant?.name) {
        force((x) => x + 1);
      }
    };
    s.onValueChanged.add(handler);
    return () => s.onValueChanged.remove(handler);
  }, [panel, qGreen?.name, qPleasant?.name]);

  const setVal = (q, val) => {
    if (q && !q.readOnly) q.value = val; // writes directly to SurveyJS model
  };

  return (
    <div className="rating-group">
      <div className="rating-row">
        <div className="rating-label">Green</div>
        <div className="rating-buttons">
          {choices.map((n) => (
            <button
              key={`g-${n}`}
              type="button"
              className={qGreen?.value === n ? "active" : ""}
              onClick={() => setVal(qGreen, n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="rating-row">
        <div className="rating-label">Pleasant</div>
        <div className="rating-buttons">
          {choices.map((n) => (
            <button
              key={`p-${n}`}
              type="button"
              className={qPleasant?.value === n ? "active" : ""}
              onClick={() => setVal(qPleasant, n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function App() {

  const [lightbox, setLightbox] = React.useState(null); 
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
    m.previewText = "Finish rating";

    // Per-page "Next" button labeling
    const defaultNext = m.pageNextText || "Next";

    const setNextLabel = () => {
      const name = m.currentPage?.name;
      if (name === "introPage") {
        m.pageNextText = "Next"
      } else if (name === "consentPage") {
        m.pageNextText = "Accept";
      } else if (name === "instructionsPage") {
        m.pageNextText = "Start survey";
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

    const nextImage = () => {
      const url = imageQueue.length ? imageQueue.shift() : "";
      return url;
    };

    m.onAfterRenderQuestion.add((sender, options) => {
      // only the image inside your dynamic panel
      if (options.question.name !== "image") return;

      const img = options.htmlElement.querySelector("img");
      if (!img) return;

      img.style.cursor = "zoom-in";
      const panel = options.question.parent; // PanelModel for this item
      img.onclick = () => openLightboxForPanel(panel);

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
        if (!ok) return;

        // remember if the lightbox was open
        const wasOpen = !!lightboxRef.current; 

        // close it now
        setLightbox(null);

        setTimeout(() => {
          const hasExistingNext = dp.currentIndex < dp.panels.length - 1;

          // If user came from Prev and there is an existing next panel,
          // DON'T add a new one — just move forward into it.
          if (cameFromPrevRef.current && hasExistingNext) {
            const snap = takeScrollSnapshot();
            dp.currentIndex = dp.currentIndex + 1;

            if (wasOpen) {
              const nextPanel = dp.panels[dp.currentIndex];
              openLightboxForPanel(nextPanel);
            }

            restoreScroll(snap);
            cameFromPrevRef.current = false; // reset the flag
            return;
          }

          // Otherwise, original behavior: create next only if more images remain.
          if (imageQueue.length > 0) {
            const snap = takeScrollSnapshot();
            dp.addPanel();
            setTimeout(() => {
              dp.currentIndex = dp.currentIndex + 1;
              const nextPanel = dp.panels[dp.currentIndex];
              if (wasOpen) openLightboxForPanel(nextPanel);
              restoreScroll(snap);
            }, 100);
          } else {
            // last panel
            setTimeout(() => {
              setLightbox(null);
              m.completeLastPage();
            }, 100);
          }
        }, 100);
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
  }, [model, openLightboxForPanel]);

  // NEXT: prefer existing next; if none, let the rating handler create it
  const goNext = React.useCallback(() => {
    const dp = model.getQuestionByName("comfort_loop");
    if (!dp) return;
    const hasNext = dp.currentIndex < dp.panels.length - 1;
    if (hasNext) {
      dp.currentIndex = dp.currentIndex + 1;
      openLightboxForPanel(dp.panels[dp.currentIndex]);
      cameFromPrevRef.current = false; // reset
    } else {
      // No next yet — close; the rating handler will add the next panel on completion
      setLightbox(null);
    }
  }, [model, openLightboxForPanel]);

    const canGoPrev = (() => {
      const dp = model.getQuestionByName("comfort_loop");
      return !!dp && dp.currentIndex > 0;
    })();


  return (
    <>
    
    <Survey model={model} />
    
    {lightbox && (
      <div
        className="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        onClick={() => setLightbox(null)}
      >
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img className="lightbox-img" src={lightbox.src} alt="" />

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


