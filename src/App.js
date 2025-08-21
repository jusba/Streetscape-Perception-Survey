import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { surveyJson, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";

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

    // 3) Add next panel when the current panel gets a rating
    // 3) Add next panel when the current panel's rating changes
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
            dp.addPanel(); // triggers onDynamicPanelAdded
            setTimeout(() => {
              dp.currentIndex = dp.currentIndex + 1; // skips validation
            }, 100); // slight delay to ensure panel is ready
          } else {
            setTimeout(() => sender.tryComplete(), 100);
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

    return m;
  }, []);

  return <Survey model={model} />;
}
