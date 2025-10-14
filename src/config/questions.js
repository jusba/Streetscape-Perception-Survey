import { type } from '@testing-library/user-event/dist/type/index.js';
import { getRandomImages } from './streetImages.js';

// ========================================
// 📚 CITATION
// ========================================
// This survey platform was initially developed for:
// Yang, S., Chong, A., Liu, P., & Biljecki, F. (2025). 
// Thermal comfort in sight: Thermal affordance and its visual assessment for sustainable streetscape design. 
// Building and Environment, 112569. Elsevier.
//
// If you use this platform in your research, please consider citing the above paper.

// Extensive modifications were done by Jussi Torkko for the greenery survey

// ========================================
// 🔧 SURVEY CONFIGURATION GUIDE
// ========================================
// This file defines all survey questions and structure.
// Follow the instructions below to customize your survey.

// ========================================
// 📸 IMAGE GENERATION CONFIGURATION
// ========================================
// This function pre-generates random images for each question to ensure consistency.
// Each participant sees the same set of images throughout their survey session.

const generateQuestionImages = () => {
  //const questionImages = {
    // 🔧 PERCEPTION QUESTIONS (Part 2)
    // Format: question_name: getRandomImages("question_name", number_of_images)
  //  safety_perception: getRandomImages("safety_perception", 2),           // 2 images, choose 1
  //  attractiveness_perception: getRandomImages("attractiveness_perception", 2), // 2 images, choose 1
  //  walkability_perception: getRandomImages("walkability_perception", 2),       // 2 images, choose 1
  //  liveliness_perception: getRandomImages("liveliness_perception", 4),         // 4 images, choose 1
  //  relaxation_perception: getRandomImages("relaxation_perception", 4),         // 4 images, choose 1
  //  cleanliness_perception: getRandomImages("cleanliness_perception", 4),       // 4 images, choose 1
    
    // 🔧 OTHER QUESTIONS (Parts 3-6)
    // Each shows 1 random image alongside the question
  //  comfort_rating: getRandomImages("comfort_rating", 1),     // Part 3: Rating scale
  //  street_elements: getRandomImages("street_elements", 1),   // Part 4: Checkbox elements
  //  feature_ranking: getRandomImages("feature_ranking", 1),   // Part 5: Ranking
  //  open_feedback: getRandomImages("open_feedback", 1)        // Part 6: Text feedback
    
    // 🔧 TO ADD NEW IMAGE QUESTIONS:
    // 1. Add a new line here: your_question_name: getRandomImages("your_question_name", count),
    // 2. Use displayedImages.your_question_name in the question definition below
  //};


  const questionImages = {

    comfort_rating: getRandomImages("comfort_rating", 50)     // Part 3: Rating scale

  };

  console.log(questionImages)
  return questionImages;
};

// Store all displayed images for this survey session
export const displayedImages = generateQuestionImages();

// ========================================
// 👥 DEMOGRAPHIC QUESTIONS (PART 1)
// ========================================
// All demographic questions are OPTIONAL and can be skipped by participants.
// 🔧 TO CUSTOMIZE: Edit the questions below or add/remove questions as needed.

export const demographicQuestions = [
  // 🔧 AGE QUESTION - Multiple choice
  // TO MODIFY: Change age ranges in the choices array
  {
    name: "gender",
    title: "What is your gender identity?",
    type: "radiogroup",
    choices: [
      "Female",
      "Male", 
      "Other",
      "Prefer not to say"
    ],
    isRequired: false // Keep false to make optional
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
      "65 or older"
    ],
    isRequired: false // Keep false to make optional
  },
  
  // 🔧 LOCATION QUESTION - Text input
  // TO MODIFY: Change the title text or make it more specific
  {
    name: "location",
    title: "Where are you from? (Country)",
    type: "text", // Use "text" for single line, "comment" for multi-line
    isRequired: false
  },
  {
    name: "location",
    title: "Where are you currently living? (Country)",
    type: "text", // Use "text" for single line, "comment" for multi-line
    isRequired: false
  },
  
  // 🔧 INCOME QUESTION - Multiple choice
  // TO MODIFY: Adjust income ranges for your target population/currency
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
      "Prefer not to say"
    ],
    isRequired: false
  },
  
  // 🔧 EDUCATION QUESTION - Multiple choice
  // TO MODIFY: Adjust education levels for your region's system
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
      "Other"
    ],
    isRequired: false
  },
  
  // 🔧 OUTDOOR ACTIVITY QUESTION - Multiple choice
  // TO MODIFY: Change to any frequency-based question relevant to your research

  {
    type: "image",
    name: "intro_image",
    imageLink: "nature.png",              // you set this in code
    imageFit: "contain",
    imageHeight: "auto",
    imageWidth: "auto",
    showBanner: false
  },
  {
    name: "outdoor_activity",
    title: "Do you consider yourself part of nature? From the picture above, choose which corresponds best to your relationship with nature.",
    type: "radiogroup",
    choicesLayout:"horizontal",
    colCount:7,
    choices: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G"

    ],
    isRequired: false
  }
  
  // 🔧 TO ADD NEW DEMOGRAPHIC QUESTIONS:
  // Copy the format above and add new questions here.
  // Remember to add a comma after the previous question!
  
  // Example of adding a new question:
  // {
  //   name: "your_question_name",
  //   title: "Your question text?",
  //   type: "radiogroup", // or "text", "comment", "checkbox"
  //   choices: ["Option 1", "Option 2", "Option 3"], // only for radiogroup/checkbox
  //   isRequired: false
  // }
];

export const feedbackQuestions = [
  // 🔧 AGE QUESTION - Multiple choice
  // TO MODIFY: Change age ranges in the choices array

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
      "Prefer not to say"
    ],
    isRequired: false
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
      "Prefer not to say"
    ],
    isRequired: false
  },

  {
    name: "rating",
    title: "How easy was the rating platform to use?",
    type: "radiogroup", 
    choices: [
      "Very difficult",
      "Somewhat difficult",
      "Neither diffucult nor easy", 
      "Somewhat easy",
      "Very easy",
      "Prefer not to say"
    ],
    isRequired: false
  },

  {
    name: "rating",
    title: "How did I feel about the lenght of the survey?",
    type: "radiogroup", 
    choices: [
      "Too long",
      "Somewhat long",
      "Neither long nor short", 
      "Somewhat short",
      "Too short",
      "Prefer not to say"
    ],
    isRequired: false
  },


  {
    name: "benefits",
    title: "Is it clear to me what the benefits of the survey are?",
    type: "radiogroup", 
    choices: [
      "Very unclear",
      "Somewhat unclear",
      "Neither clear nor unclear", 
      "Somewhat clear",
      "Very clear",
      "Prefer not to say"
    ],
    isRequired: false
  },

  {
    name: "location",
    title: "Open feedback or any additional comments and remarks regarding the previous questions?",
    type: "comment", // Use "text" for single line, "comment" for multi-line
    isRequired: false
  },
  
  // 🔧 TO ADD NEW DEMOGRAPHIC QUESTIONS:
  // Copy the format above and add new questions here.
  // Remember to add a comma after the previous question!
  
  // Example of adding a new question:
  // {
  //   name: "your_question_name",
  //   title: "Your question text?",
  //   type: "radiogroup", // or "text", "comment", "checkbox"
  //   choices: ["Option 1", "Option 2", "Option 3"], // only for radiogroup/checkbox
  //   isRequired: false
  // }
];

// ========================================
// 📋 MAIN SURVEY STRUCTURE
// ========================================
// The survey is organized into 6 parts (pages). Each page contains multiple questions.
// 🔧 TO CUSTOMIZE: Modify the pages below or add/remove pages as needed.

export const surveyPages = [
  
  // ========================================
  // 📄 PAGE 1: DEMOGRAPHIC QUESTIONS
  // ========================================
  {
      name: "introPage",
      elements: [
        {
        "type": "html",
        "name": "instructions",
        //<p>The study will take approximately 15 minutes</p>\

        "html": "<img src=into_image.png alt='banner image'>\
                <h2>Welcome to the Street Greenery Survey</h2>\
                <b>Before you begin, please read the following information:</b>\
                <p>This study, conducted by the Digital Geography Lab of the University of Helsinki, is part of the GREENTRAVEL project (2023-2027) funded by European Research Council (ERC, 101044906). It explores the use of street view images to capture the importance of greenery in people’s perception of street environments. The findings of the study are expected to produce useful information for transportation and green infrastructure planning. </p>\
                \
                <b>You can read more information about the Lab and Project from the following sources:</b>\
                <p></p>\
                <a href='https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel'>GREENTRAVEL</a>\
                <p></p>\
                <a href='https://www.helsinki.fi/en/researchgroups/digital-geography-lab'>Digital Geography Lab</a>\
                <p></p>\
                <a href='https://www.helsinki.fi/en'>University of Helsinki</a>\
                <p>The survey comprises of four parts, which include questions on your background, the rating platform, post-rating questionnaire and feedback. It should take approximately 10-15 minutes to complete.</p>\
                <p>We will collect, analyze, publish and store your data confidentially and anonymously in accordance with the General Data Protection Regulation of the European Union. To see the full data and privacy notice, please see the following link: <a href='https://a3s.fi/swift/v1/AUTH_b76bb3a5f80349d9acabe9cd285f7497/survey_elements/Survey_Privacy_Notice_English.pdf''>Data and privacy notice</a></p>\
                <p>If you have any questions regarding the survey, you can email the responsible researcher Jussi Torkko (jussi.torkko[at]helsinki.fi)</p>\
                <h5>By continuing with this survey, you are agreeing that: (1) you understand the purpose of this research, (2) your participation is voluntary and (3) you are at least 18 years of age.</h5>\
                "
      },
      ]
    },
  
  {
      name: "instructionsPage",
      elements: [
        {
        "type": "html",
        "name": "infoText",
        "html": "<h2>Instructions</h2>\
                <p>In the first part of the questionnaire, you will answer a few questions about your background. After that, you will proceed to rating different street images.</p>\
                <p>You will be shown different street images for you to observe and rate. <b>Consider the scene as it is currently in the image, do not consider how it would look like during an another period of time or conditions.</b> Please look at each image and answer the following questions:</p>\
                <p><b>Greenery:</b>\
                <i>How much natural vegetation you see in the image, based on your own estimation. Please rate on a the scale from <b>1 (Not green at all )</b> to  <b>7 (completely greenery)</b></i>\</p>\
                <p><b>Pleasantness:</b>\
                <i>How pleasant is the image as a whole to you? Please answer on a scale from <b>1 (Very unpleasant)</b> to <b>7 (Very pleasant)</b>.  </i></p>\
                <p>After answering both questions for each image, you will be automatically given another image to rate. </p>\
                <p>Press the first image to enter a more focused rating window. Feel free to press f11 to enter and return from the full-screen mode. You may also use the keyboard for rating, pressing backspace corrects previous rating</p>\
                <img src=rating_instructions.png alt='instruction image'>\
                <p></p>\
                <strong>To complete the survey, we ask you to rate images for around 10 minutes. After rating the images, you will answer some feedback and may then end the survey. </strong>\
                "
                // <strong>To complete the survey, we ask you to rate at least 100 images. After rating the 100 images, you may end the survey and enter a raffle to win a gift card. You may also continue rating images after the initial 100, if you wish.</strong>\


      }
      ]
    },

    
  
  {
    name: "demographics",
    title: "Part 1: Background Information (Optional)", // 🔧 Change page title here
    description: "Please tell us a bit about yourself.", // 🔧 Change page description
    elements: demographicQuestions // Uses the demographic questions defined above
  },
  
  {
    name: "comfort_loop_page",
    title: "Greenery rating",
    elements: [
    {
        "type": "html",
        "name": "while_rating_instructions",
        "html": "<p>We ask you to rate X amount of images. Click the image to start rating. You may also use the keyboard for rating, pressing backspace corrects previous rating. Feel free to press f11 to enter or exit the full-screen mode. Press Finish whenever you want to stop</p>\
                <ul style='list-style: none; padding-left: 0;'>\
                  <li><b>Greenery:</b> How much natural vegetation you see in the image, based on your own estimation.</li>\
                  <li><b>Pleasantness:</b> How pleasant you find the scene as a whole? </li>\
                </ul>"

      },

      {
        type: "paneldynamic",
        name: "comfort_loop",
        title: "rating",
        titleLocation: "hidden",
        panelCount: 1,                  // we seed the first one; more get added in code

        minPanelCount: 0,
        maxPanelCount: 10000,           // effectively unlimited
        allowAddPanel: false,
        allowRemovePanel: false,
        renderMode: "progressTop",
        templateElements: [
          {
            // 👇 0–7 scale
            type: "rating",
            name: "green",
            title: "Greenery",
            titleLocation: "left",
            isRequired: false,
            rateMin: 0,
            rateMax: 10,
            rateStep: 1,
            minRateDescription: "0 = Not green at all",
            maxRateDescription: "10 = Completely green",
            clearIfInvisible: "none"
          },
          {
            // 👇 0–7 scale
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
            clearIfInvisible: "none"
          },
          {
            type: "image",
            name: "image",
            imageLink: "",              // you set this in code
            imageFit: "contain",
            imageHeight: "auto",
            imageWidth: "auto"
          },
          {
            type: "html",
            name: "n",
            title: "<p>Image {panelIndex}.</p>",
            imageLink: "",              // you set this in code
            imageFit: "contain",
            imageHeight: "auto",
            imageWidth: "auto"
          },

          {
            // 👇 stores the URL/ID of the image currently shown
            type: "text",
            name: "imageUrl",
            visible: false,
            clearIfInvisible: "none"
          }
          
        ]
    }
  ]
},

{
    name: "feedback",
    title: "Survey feedback", // 🔧 Change page title here
    description: "Please tell us briefly how you felt while completing the survey. All questions are optional and can be skipped", // 🔧 Change page description
    elements: feedbackQuestions // Uses the demographic questions defined above
  },

];


// ========================================
// 🔧 SURVEY CONFIGURATION
// ========================================
// Main survey settings and structure

export const surveyJson = {
  // 🔧 SURVEY TITLE AND DESCRIPTION
  title: "Urban Greenery Survey", // 🔧 Change main survey title
  description: "This survey helps us understand how people perceive different street environments. Your responses will help improve urban design.", // 🔧 Change survey description
  firstPageIsStarted : false,
  startSurveyText : "Start Survey",
  // 🔧 SURVEY STRUCTURE
  pages: surveyPages, // Uses the pages defined above
  
  // 🔧 DISPLAY SETTINGS - Customize survey appearance
  showQuestionNumbers: "off", // "on", "off", or "onPage" - Show question numbers
  showProgressBar: "aboveheader", // "top", "bottom", "aboveheader", "belowheader", or "off"
  progressBarType: "questions", // "pages" or "questions" - Progress calculation method
  autoGrowComment: true, // Auto-expand text areas as user types
  //showPreviewBeforeComplete: "false", // "showAllQuestions", "showAnsweredQuestions", or "noPreview"
  
  // 🔧 ADDITIONAL SETTINGS YOU CAN ADD:
completedHtml: `
    <h3>Thank you for your participation!</h3>
    <h4>
      If you have any questions, you can contact the responsible researcher at
      <b>jussi.torkko[at]helsinki.fi</b>.
    </h4>
    <h4>
      <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel"
        style="color:#16a34a;">
        Click here to be redirected to the GREENTRAVEL project website.
      </a>
    </h4>
  `                 // Custom completion message
  // requiredText: "*", // Symbol for required questions
  // questionErrorLocation: "bottom", // "top" or "bottom" - Where to show validation errors
  // showCompletedPage: false, // Skip the completion page
}; 