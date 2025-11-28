// questions.js
import { getRandomImages } from "./streetImages.js";
import { t, tmpl } from "./surveyTranslations";

// ---------- Images ----------
const generateQuestionImages = () => {
  const questionImages = {
    comfort_rating: getRandomImages("comfort_rating", 150),
  };
  return questionImages;
};
export const displayedImages = generateQuestionImages();

// ---------- Survey factory (dynamic lexicon) ----------
/**
 * lex = {
 *   greenLabel, greenMin, greenMid, greenMax,
 *   tapToRate
 * }
 */
export function buildSurveyForLexicon(lex, lang = "en") {
  // DEMOGRAPHICS (unchanged — customize as you like)
  const demographicQuestions = [
    {
      name: "gender",
      title: t(lang, "q_gender_title"),
      type: "radiogroup",
      choices: t(lang, "q_gender_choices"),
      isRequired: true,
    },
    {
      name: "age",
      title: t(lang, "q_age_title"),
      type: "radiogroup",
      choices: t(lang, "q_age_choices"),
      isRequired: true,
    },
    {
      name: "home_country",
      title: t(lang, "q_home_country_title"),
      type: "text",
      isRequired: false,
    },
    {
      name: "current_country",
      title: t(lang, "q_current_country_title"),
      type: "text",
      isRequired: false,
    },
    {
      name: "income",
      title: t(lang, "q_income_title"),
      type: "radiogroup",
      choices: t(lang, "q_income_choices"),
      isRequired: true,
    },
    {
      name: "education",
      title: t(lang, "q_education_title"),
      type: "radiogroup",
      choices: t(lang, "q_education_choices"),
      isRequired: true,
    },
    {
      type: "image",
      name: "intro_image",
      imageLink: "nature.png",
      imageFit: "contain",
      imageHeight: "auto",
      imageWidth: "auto",
      showBanner: true,
    },
    {
      name: "outdoor_activity",
      title: t(lang, "q_outdoor_activity_title"),
      type: "radiogroup",
      choicesLayout: "horizontal",
      colCount: 7,
      choices: ["A", "B", "C", "D", "E", "F", "G"],
      isRequired: true,
    },
  ];


  const feedbackQuestions = [
    {
      name: "background",
      title: t(lang, "q_background_title"),
      type: "radiogroup",
      choices: t(lang, "q_background_choices"),
      isRequired: true,
    },
    {
      name: "instructions",
      title: t(lang, "q_instructions_title"),
      type: "radiogroup",
      choices: t(lang, "q_instructions_choices"),
      isRequired: true,
    },
    {
      name: "rating_ease",
      title: t(lang, "q_rating_ease_title"),
      type: "radiogroup",
      choices: t(lang, "q_rating_ease_choices"),
      isRequired: true,
    },
    {
      name: "length_feel",
      title: t(lang, "q_length_feel_title"),
      type: "radiogroup",
      choices: t(lang, "q_length_feel_choices"),
      isRequired: true,
    },
    {
      name: "benefits",
      title: t(lang, "q_benefits_title"),
      type: "radiogroup",
      choices: t(lang, "q_benefits_choices"),
      isRequired: true,
    },
    {
      name: "AI",
      title: t(lang, "q_ai_title"),
      type: "radiogroup",
      choices: [t(lang, "q_ai_choice_no")],
      showOtherItem: true,
      otherText: t(lang, "q_ai_otherText"),
      otherPlaceholder: t(lang, "q_ai_otherPlaceholder"),
      otherErrorText: t(lang, "q_ai_otherErrorText"),
      isRequired: true,
    },
    {
      name: "open_feedback",
      title: t(lang, "q_open_feedback_title"),
      type: "comment",
      isRequired: false,
    },
  ];


  // PAGES (dynamic texts use `lex`)
  const surveyPages = [
    {
      name: "introPage",
      elements: [
        {
          type: "html",
          name: "instructions",
          html: tmpl(t(lang, "intro_html"), {
            greenLabel: lex.greenLabel,
            greenLabelLower: lex.greenLabel.toLowerCase(),
          }),
        },
      ],
    },
    {
      name: "instructionsPage",
      elements: [
        {
          type: "html",
          name: "infoText",
          html: tmpl(t(lang, "instructions_html"), {
            greenLabel: lex.greenLabel,
            greenLabelLower: lex.greenLabel.toLowerCase(),
            greenMin: lex.greenMin,
            greenMax: lex.greenMax,
          }),
        },
      ],
    },
    {
      name: "demographics",
      title: t(lang, "page_demographics_title"),
      description: t(lang, "page_demographics_description"),
      elements: demographicQuestions,
    },
    {
      name: "comfort_loop_page",
      title: tmpl(t(lang, "page_comfort_title"), {
        greenLabel: lex.greenLabel,
      }),
      elements: [
        {
          type: "html",
          name: "while_rating_instructions",
          html: tmpl(t(lang, "while_rating_html"), {
            greenLabel: lex.greenLabel,
            greenLabelLower: lex.greenLabel.toLowerCase(),
          }),
        },
        {
          type: "paneldynamic",
          name: "comfort_loop",
          title: "rating",
          titleLocation: "hidden",
          panelCount: 1,
          minPanelCount: 0,
          maxPanelCount: 10000,
          allowAddPanel: false,
          allowRemovePanel: false,
          renderMode: "progressTop",
          templateElements: [
            // (keep your existing rating / image / hidden fields exactly as they are)
            {
              type: "rating",
              name: "green",
              title: lex.greenLabel,
              titleLocation: "left",
              isRequired: false,
              rateMin: 0,
              rateMax: 10,
              rateStep: 1,
              minRateDescription: lex.greenMin,
              maxRateDescription: lex.greenMax,
              clearIfInvisible: "none",
            },
            {
              type: "rating",
              name: "pleasant",
              title: "Pleasantness",
              titleLocation: "left",
              isRequired: false,
              rateMin: 1,
              rateMax: 7,
              rateStep: 1,
              minRateDescription: "1 = Very unpleasant",
              maxRateDescription: "7 = Very pleasant",
              clearIfInvisible: "none",
            },
            {
              type: "image",
              name: "image",
              imageLink: "",
              imageFit: "contain",
              imageHeight: "auto",
              imageWidth: "auto",
            },
            {
              type: "html",
              name: "n",
              title: "<p>Image {panelIndex}.</p>",
            },
            {
              type: "text",
              name: "imageUrl",
              visible: false,
              clearIfInvisible: "none",
            },
            { type: "text", name: "image_loaded_at",    visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "lightbox_opened_at", visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "green_rated_at",     visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "pleasant_rated_at",  visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "both_rated_at",      visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "dwell_ms",           visible: false, readOnly: true, clearIfInvisible: "none" },
          ],
        },
      ],
    },
    {
      name: "feedback",
      title: t(lang, "page_feedback_title"),
      description: t(lang, "page_feedback_description"),
      elements: feedbackQuestions,
    },
  ];


  // FINAL SURVEY JSON
  return {
    title: tmpl(t(lang, "survey_title"), { greenLabel: lex.greenLabel }),
    description: t(lang, "survey_description"),
    firstPageIsStarted: false,
    startSurveyText: t(lang, "survey_startSurveyText"),
    pages: surveyPages,
    showQuestionNumbers: "off",
    showProgressBar: "aboveheader",
    progressBarType: "questions",
    autoGrowComment: true,
    completedHtml: t(lang, "completed_html"),
  };
}
