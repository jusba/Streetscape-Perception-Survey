import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { surveyJson, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";

export default function App() {

  const [lightboxSrc, setLightboxSrc] = React.useState(null);

  // close overlay on Escape key
  React.useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e) => e.key === "Escape" && setLightboxSrc(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxSrc]);

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
      if (options.question.name !== "image") return;
      const img = options.htmlElement.querySelector("img");
      if (!img) return;
      img.style.cursor = "zoom-in";
      img.onclick = () => setLightboxSrc(img.src);
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
        const has = (q) =>
          q && q.value !== undefined && q.value !== null && q.value !== "";
        return { g, p, ok: has(g) && has(p) };
      };

      const handler = (sender, opt) => {
        if (opt?.question?.name !== "comfort_loop") return;
        if (!RATING_KEYS.includes(opt?.name)) return;

        const dp = opt.question; // QuestionPanelDynamicModel
        const panel = opt.panel; // PanelModel
        if (!panel) return;

        const { g, p, ok } = bothAnswered(panel);
        if (!ok) return;

        // Prevent double-advance if user tweaks after lock
        if (g.readOnly && p.readOnly) return;

        // Lock both answers
        //g.readOnly = true;
        //p.readOnly = true;

        setTimeout(() => {
          if (imageQueue.length > 0) {
            const snap = takeScrollSnapshot(); // BEFORE addPanel
            dp.addPanel();
            setTimeout(() => {
              dp.currentIndex = dp.currentIndex + 1;
              restoreScroll(snap); // AFTER index change
            }, 100);
          } else {
            setTimeout(() => m.completeLastPage(), 100);
          }
        }, 100);
      };

      // Support both event names across SurveyJS versions
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

  return (
    <>
    
    <Survey model={model} />
    
    {lightboxSrc && (
      <div
        className="lightbox-overlay"
        onClick={() => setLightboxSrc(null)}
      >
        <img
          className="lightbox-img"
          src={lightboxSrc}
          alt=""
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="lightbox-close"
          onClick={() => setLightboxSrc(null)}
        >
          ×
        </button>
      </div>
    )}


    </>
  );
}
