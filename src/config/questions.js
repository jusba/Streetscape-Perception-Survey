// questions.js
import { getRandomImages } from "./streetImages.js";

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
export function buildSurveyForLexicon(lex) {
  // DEMOGRAPHICS (unchanged — customize as you like)
  const demographicQuestions = [
    {
      name: "gender",
      title: "What is your gender identity?",
      type: "radiogroup",
      choices: ["Female", "Male", "Other", "Prefer not to say"],
      isRequired: false,
    },
    {
      name: "age",
      title: "What is your age group?",
      type: "radiogroup",
      choices: [
        "Under 18",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65 or older",
      ],
      isRequired: false,
    },
    { name: "home_country", title: "Where are you from? (Country)", type: "text", isRequired: false },
    { name: "current_country", title: "Where are you currently living? (Country)", type: "text", isRequired: false },
    {
      name: "income",
      title: "What is your household monthly income level?",
      type: "radiogroup",
      choices: [
        "Less than €2500",
        "€2501 - €3500",
        "€3501 - €4500",
        "€4501 - €6000",
        "Over €6000",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "education",
      title: "What is your highest level of education?",
      type: "radiogroup",
      choices: [
        "Secondary education",
        "Upper secondary education",
        "Trade/technical/vocational training",
        "Bachelor's degree",
        "Master's degree",
        "Doctoral degree",
        "Other",
      ],
      isRequired: false,
    },
    {
      type: "image",
      name: "intro_image",
      imageLink: "nature.png",
      imageFit: "contain",
      imageHeight: "auto",
      imageWidth: "auto",
      showBanner: false,
    },
    {
      name: "outdoor_activity",
      title:
        "Do you consider yourself part of nature? From the picture above, choose which corresponds best to your relationship with nature.",
      type: "radiogroup",
      choicesLayout: "horizontal",
      colCount: 7,
      choices: ["A", "B", "C", "D", "E", "F", "G"],
      isRequired: false,
    },
  ];

  const feedbackQuestions = [
    {
      name: "background",
      title: "How clear was the background of the survey and the description of consent given?",
      type: "radiogroup",
      choices: [
        "Very unclear",
        "Somewhat unclear",
        "Neither clear nor unclear",
        "Somewhat clear",
        "Very clear",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "instructions",
      title: "How clear were the instructions of the survey?",
      type: "radiogroup",
      choices: [
        "Very unclear",
        "Somewhat unclear",
        "Neither clear nor unclear",
        "Somewhat clear",
        "Very clear",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "rating_ease",
      title: "How easy was the rating platform to use?",
      type: "radiogroup",
      choices: [
        "Very difficult",
        "Somewhat difficult",
        "Neither difficult nor easy",
        "Somewhat easy",
        "Very easy",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "length_feel",
      title: "How did you feel about the length of the survey?",
      type: "radiogroup",
      choices: [
        "Too long",
        "Somewhat long",
        "Neither long nor short",
        "Somewhat short",
        "Too short",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "benefits",
      title: "Is it clear to you what the benefits of the survey are?",
      type: "radiogroup",
      choices: [
        "Very unclear",
        "Somewhat unclear",
        "Neither clear nor unclear",
        "Somewhat clear",
        "Very clear",
        "Prefer not to say",
      ],
      isRequired: false,
    },
    {
      name: "open_feedback",
      title:
        "Open feedback or any additional comments and remarks regarding the previous questions?",
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
          html: `
            <img src="into_image.png" alt="banner image" />
            <h2>Welcome to the Street ${lex.greenLabel} Survey</h2>
            <b>Before you begin, please read the following information:</b>
            <p>This study, conducted by the Digital Geography Lab of the University of Helsinki, is part of the GREENTRAVEL project (2023–2027) funded by the European Research Council (ERC, 101044906). It explores the use of street view images to capture the importance of ${lex.greenLabel.toLowerCase()} in people’s perception of street environments. The findings are expected to inform transportation and green infrastructure planning.</p>
            <b>You can read more here:</b>
            <p></p>
            <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel">GREENTRAVEL</a>
            <p></p>
            <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab">Digital Geography Lab</a>
            <p></p>
            <a href="https://www.helsinki.fi/en">University of Helsinki</a>
            <p>The survey comprises of four parts. It should take approximately 10–15 minutes to complete.</p>
            <p>We will collect, analyze, publish, and store your data confidentially and anonymously under the EU GDPR. Full notice: <a href="https://a3s.fi/swift/v1/AUTH_b76bb3a5f80349d9acabe9cd285f7497/survey_elements/Survey_Privacy_Notice_English.pdf">Data and privacy notice</a></p>
            <p>Questions? Email the responsible researcher Jussi Torkko (jussi.torkko[at]helsinki.fi)</p>
            <h5>By continuing, you confirm: (1) you understand the purpose, (2) participation is voluntary, and (3) you are at least 18 years old.</h5>
          `,
        },
      ],
    },
    {
      name: "instructionsPage",
      elements: [
        {
          type: "html",
          name: "infoText",
          html: `
            <h2>Instructions</h2>
            <p>In the first part you’ll answer a few background questions. Then you will rate a series of street images.</p>
            <p>You will be shown different images. <b>Consider the scene as it appears in the picture (do not imagine other seasons or conditions).</b> Please answer the following for each image:</p>
            <p><b>${lex.greenLabel}:</b>
              <i>How much ${lex.greenLabel.toLowerCase()} do you see in the image, based on your own estimation?</i>
              <br/>${lex.greenMin} … ${lex.greenMax}</p>
            <p><b>Pleasantness:</b>
              <i>How pleasant is the image as a whole to you?</i>
              <br/>1 = Very unpleasant … 7 = Very pleasant</p>
            <p>After answering both questions, the next image will appear automatically.</p>
            <p>Click the first image to open the rating window. You may also rate with the keyboard; Backspace clears your last selection. Press F11 to toggle full screen.</p>
            <img src="rating_instructions.png" alt="instruction image" />
            <p><strong>To complete the survey, please rate images for around 10 minutes. After that you will answer some feedback questions and can finish.</strong></p>
          `,
        },
      ],
    },
    {
      name: "demographics",
      title: "Part 1: Background Information (Optional)",
      description: "Please tell us a bit about yourself.",
      elements: demographicQuestions,
    },
    {
      name: "comfort_loop_page",
      title: `${lex.greenLabel} rating`,
      elements: [
        {
          type: "html",
          name: "while_rating_instructions",
          html: `
            <p>Please rate images for the requested time. Click an image to start rating. You can also use the keyboard; Backspace corrects the last rating. Press F11 to enter/exit full screen. Press Finish whenever you want to stop.</p>
            <ul style="list-style:none;padding-left:0;">
              <li><b>${lex.greenLabel}:</b> How much ${lex.greenLabel.toLowerCase()} do you see?</li>
              <li><b>Pleasantness:</b> How pleasant do you find the scene as a whole?</li>
            </ul>
          `,
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
            // Ratings (values the participant sets)
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

            // Image shown
            {
              type: "image",
              name: "image",
              imageLink: "",
              imageFit: "contain",
              imageHeight: "auto",
              imageWidth: "auto",
            },

            // Inline counter (optional)
            {
              type: "html",
              name: "n",
              title: "<p>Image {panelIndex}.</p>",
            },

            // The image URL (stored)
            {
              type: "text",
              name: "imageUrl",
              visible: false,
              clearIfInvisible: "none",
            },

            // --- Hidden timestamp fields (saved with each panel/image) ---
            { type: "text", name: "image_loaded_at",    visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "lightbox_opened_at", visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "green_rated_at",     visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "pleasant_rated_at",  visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "both_rated_at",      visible: false, readOnly: true, clearIfInvisible: "none" },
            { type: "text", name: "dwell_ms",           visible: false, readOnly: true, clearIfInvisible: "none" },
            // ----------------------------------------------------------------
          ],
        },
      ],
    },
    {
      name: "feedback",
      title: "Survey feedback",
      description:
        "Please tell us briefly how you felt while completing the survey. All questions are optional and can be skipped.",
      elements: feedbackQuestions,
    },
  ];

  // FINAL SURVEY JSON
  return {
    title: `Urban ${lex.greenLabel} Survey`,
    description:
      "This survey helps us understand how people perceive different street environments. Your responses will help improve urban design.",
    firstPageIsStarted: false,
    startSurveyText: "Start Survey",
    pages: surveyPages,
    showQuestionNumbers: "off",
    showProgressBar: "aboveheader",
    progressBarType: "questions",
    autoGrowComment: true,
    completedHtml: `
      <h3>Thank you for your participation!</h3>
      <h4>
        If you have any questions, you can contact the responsible researcher at
        <b>jussi.torkko[at]helsinki.fi</b>.
      </h4>
      <h4>
        <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel" style="color:#16a34a;">
          Click here to be redirected to the GREENTRAVEL project website.
        </a>
      </h4>
    `,
  };
}
