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
    console.log('lol')

    // === Build image queue from displayedImages ===
    const pool = (displayedImages?.comfort_rating ?? [])
      .map((x, i) => {
        const url = x?.imageLink || x?.image || "";
        if (!url) console.warn("[images] empty url at index", i, x);
        return url;
      })
      .filter(Boolean);

    console.log("[images] initial pool size:", pool.length);
    const imageQueue = [...pool];
    console.log(imageQueue)

    const nextImage = () => {
      const url = imageQueue.length ? imageQueue.shift() : "";
      console.log("[images] nextImage() ->", url, "| remaining:", imageQueue.length);
      return url;
    };

    // 1) Seed first panel once
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

    // 2) Seed every newly added panel
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


    // 3) Add next panel when the current panel's rating changes
    const hookDynamic = (handlerName) => {
      m[handlerName].add((sender, opt) => {
        if (opt.question.name !== "comfort_loop") return;
        if (opt.name !== "rating") return;

        const dp = opt.question;     // QuestionPanelDynamicModel
        const panel = opt.panel;     // PanelModel that changed
        const v = opt.value;
        if (v === undefined || v === null || v === "") return;

        const ratingQ = panel.getQuestionByName("rating");
        if (ratingQ?.readOnly) return;

        // Commit the value and mark as read-only
        ratingQ.value = v;
        ratingQ.readOnly = true;

        // Delay navigation slightly to allow SurveyJS to process the change
        setTimeout(() => {
          if (imageQueue.length > 0) {
            const snap = takeScrollSnapshot(); // capture BEFORE addPanel()

            dp.addPanel();

            setTimeout(() => {
              dp.currentIndex = dp.currentIndex + 1;

              restoreScroll(snap); // restore AFTER index change
            }, 100);
          } else {
            setTimeout(() => m.completeLastPage(), 100);
          }
        }, 100);


        
      });
    };


    if (m.onDynamicPanelValueChanged) hookDynamic("onDynamicPanelValueChanged");
    else hookDynamic("onDynamicPanelItemValueChanged");


    // === Save completion handler ===
    m.onComplete.add(async (survey) => {
      const responses = survey.data;
      console.log(responses)
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
      // If y is 0 and we're not actually below the top, don't force a jump
      const currentY = scroller === window ? window.scrollY : scroller.scrollTop;
      if (y === 0 && currentY === 0) return;

      const doScroll = () => {
        if (scroller === window) window.scrollTo({ top: y, behavior: "auto" });
        else scroller.scrollTo({ top: y, behavior: "auto" });
      };

      // Restore over two frames to beat late reflows/focus
      requestAnimationFrame(() => {
        doScroll();
        requestAnimationFrame(doScroll);
      });
    };


    return m;
  }, []);

  return <Survey model={model} />;
}
