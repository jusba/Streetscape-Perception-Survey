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

    comfort_rating: getRandomImages("comfort_rating", 5)     // Part 3: Rating scale

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
    title: "Where are you from? (City, Country)",
    type: "text", // Use "text" for single line, "comment" for multi-line
    isRequired: false
  },
  
  // 🔧 INCOME QUESTION - Multiple choice
  // TO MODIFY: Adjust income ranges for your target population/currency
  {
    name: "income",
    title: "What is your household income level?",
    type: "radiogroup", 
    choices: [
      "Under $25,000",
      "$25,000 - $50,000",
      "$50,000 - $75,000", 
      "$75,000 - $100,000",
      "Over $100,000",
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
      "High school or less",
      "Some college",
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
    name: "outdoor_activity",
    title: "How often do you engage in outdoor activities?",
    type: "radiogroup",
    choices: [
      "Daily",
      "Several times a week",
      "Once a week",
      "Several times a month", 
      "Rarely",
      "Never"
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
        "name": "infoText",
        "html": "<h2>Welcome to This Very Serious Survey™</h2>\
                <p>Before you begin, please observe the following highly official rules:</p>\
                <ol>\
                  <li>No speed-running the survey. We have hidden Easter eggs, but only for those who take their time.</li>\
                  <li>If you don’t know an answer, make one up. Confidence is 90% of survey-taking.</li>\
                  <li>Please don’t feed the survey gremlins. They’re on a strict diet of checkboxes.</li>\
                  <li>The 'Back' button works, but it will silently judge you for being indecisive.</li>\
                  <li>If at any point you hear circus music, that’s normal. Please continue.</li>\
                </ol>\
                <p>Thank you for your cooperation.</p>\
                <p>Click <strong>Start Survey</strong> when you’re ready to begin your epic journey of multiple-choice destiny.</p>"
      }
      ]
    },
  
  {
    name: "demographics",
    title: "Part 1: Background Information (Optional)", // 🔧 Change page title here
    description: "Please tell us a bit about yourself. All questions are optional and can be skipped.", // 🔧 Change page description
    elements: demographicQuestions // Uses the demographic questions defined above
  },
  
  
  {
    name: "comfort_loop_page",
    title: "Greenery rating",
    description: "Rate as many images as you like. Press Finish whenever you want to stop.",
    elements: [
      {
        type: "paneldynamic",
        name: "comfort_loop",
        title: "Rate images",
        panelCount: 1,                  // we seed the first one; more get added in code
        minPanelCount: 0,
        maxPanelCount: 10000,           // effectively unlimited
        allowAddPanel: false,
        allowRemovePanel: false,
        renderMode: "progressTop",
        templateTitle: "Image {panelIndex}",
        templateElements: [
          {
            // 👇 0–7 scale
            type: "rating",
            name: "green",
            title: "How naturally GREEN do you see this image?",
            isRequired: false,
            rateMin: 0,
            rateMax: 7,
            rateStep: 1,
            minRateDescription: "0 = No greenery",
            maxRateDescription: "7 = Fully green"
          },
          {
            // 👇 0–7 scale
            type: "rating",
            name: "pleasant",
            title: "How PLEASANT do you see this image?",
            isRequired: false,
            rateMin: 0,
            rateMax: 7,
            rateStep: 1,
            minRateDescription: "0 = Not pleasant",
            maxRateDescription: "7 = Very pleasant"
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
            // 👇 stores the URL/ID of the image currently shown
            type: "text",
            name: "imageUrl",
            visible: false,
            clearIfInvisible: "none"
          }
          
        ]
    }
  ]
}

];
// ========================================
// 🔧 SURVEY CONFIGURATION
// ========================================
// Main survey settings and structure

export const surveyJson = {
  // 🔧 SURVEY TITLE AND DESCRIPTION
  title: "Urban Streetscape Perception Survey", // 🔧 Change main survey title
  description: "This survey helps us understand how people perceive different street environments. Your responses will help improve urban design.", // 🔧 Change survey description
  firstPageIsStarted : true,
  startSurveyText : "Start Survey",
  // 🔧 SURVEY STRUCTURE
  pages: surveyPages, // Uses the pages defined above
  
  // 🔧 DISPLAY SETTINGS - Customize survey appearance
  showQuestionNumbers: "off", // "on", "off", or "onPage" - Show question numbers
  showProgressBar: "aboveheader", // "top", "bottom", "aboveheader", "belowheader", or "off"
  progressBarType: "questions", // "pages" or "questions" - Progress calculation method
  autoGrowComment: true, // Auto-expand text areas as user types
  showPreviewBeforeComplete: "showAllQuestions" // "showAllQuestions", "showAnsweredQuestions", or "noPreview"
  
  // 🔧 ADDITIONAL SETTINGS YOU CAN ADD:
  // completedHtml: "<h3>Thank you for your participation!</h3>", // Custom completion message
  // requiredText: "*", // Symbol for required questions
  // questionErrorLocation: "bottom", // "top" or "bottom" - Where to show validation errors
  // showCompletedPage: false, // Skip the completion page
}; 