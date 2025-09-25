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
    title: "Where are you living? (Country)",
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
      "Under €25,000",
      "€25,000 - €50,000",
      "€50,000 - €75,000", 
      "€75,000 - €100,000",
      "Over €100,000",
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
        "name": "instructions",
        "html": "<h2>Welcome to the greenery survey</h2>\
                <b>Before you begin, please read the following information:</b>\
                <p>This study, conducted by the Digital Geography Lab of the University of Helsinki, is part of the GREENTRAVEL project (2023-2027) funded by European Research Council. It explores the use of street view images, to capture people’s perception of street-level environments. The study is conducted with the principle of voluntary participation with prior and informed consent. The findings of the study are expected to produce useful information for urban analytics and planning. </p>\
                <p>The study will take approximately 15 minutes</p>\
                <b>You can read more information about the Lab and Project from the following sources:</b>\
                <p></p>\
                <a href='https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel'>GREENTRAVEL</a>\
                <p></p>\
                <a href='https://www.helsinki.fi/en/researchgroups/digital-geography-lab'>Digital Geography Lab</a>\
                <p></p>\
                <a href='https://www.helsinki.fi/en'>University of Helsinki</a>\
                <h4>Consent</h4>\
                <p>You are invited to take part in this research study. Before you decide to do so, it is important you understand why the research is being done and what it will involve. Please take time to read the following information carefully. Take time to decide whether or not you wish to take part. For any additional questions, you can email the responsible researcher Jussi Torkko (jussi.torkko[at]helsinki.fi)</p>\
                <b>Possible benefits, disadvantages and risks associated with the research</b>\
                <p>The study does not provide health or safety risks to participants. The data collected is anonymous and cannot be linked or traced back to the participants.</p>\
                <p>Whilst there are no immediate benefits for those people participating in the project, this research will produce larger societal benefits. The results of the project will likely inform how to design and manage streetscapes to support health, well-being and pleasant travel experiences.   </p>\
                <b>Processing of personal data and data privacy</b>\
                <p>This study will collect personal data on your socio-demographic background. All the information that we collect about you during the research will be kept strictly confidential and will be processed according to European GDPR regulations. For sharing or publishing the data as open-source, only fully anonymized data will be used. Participation in the study is voluntary. There will be no negative consequences for you if you choose not to participate in the study or if you withdraw from the study at any point. The data controller is University of Helsinki.</p>\
                <p>Results of the research will be published in international scientific journals and may be presented in international scientific conferences. You and your data will not be identified in any report or publication.</p>\
                <h5>By clicking the button Next, you comfirm that you heave read the information and give your consent.</h5>\
                "
      }
      ]
    },
  
  {
      name: "instructionsPage",
      elements: [
        {
        "type": "html",
        "name": "infoText",
        "html": "<h2>Instructions</h2>\
                <p>In the first part of the questionnaire, you will answer questions concerning your demographic characteristics. After that, you will proceed to rating images on given characteristics on a rating platform.</p>\
                <p>On the platform, you will be shown a random street image for you to observe. Please spend some time looking at the image, as there is a small delay to pace the rating. You will be presented with <b>two criteria to rate:</b></p>\
                <p><b>Greenery:</b>\
                <i>How much natural vegetation you see in the image, based on your own estimation. On the scale <b>1 (No greenery)</b> means that you do not see any vegetation in the view, while <b>7 (Full greenery)</b> means that only vegetation is visible. </i>\</p>\
                <p><b>Pleasantness:</b>\
                <i>How pleasant do you see the scene as a whole? On the scale <b>1 (Not pleasant)</b> means that you do not find the scene pleasant at all, while <b>7 (Very pleasant)</b> means that you find the scene very pleasant. </i></p>\
                <p>For each image, will select your ratings to the criteria. After rating both, there will automatically be a new image for you to rate. If you want to re-evaluate previously rated images, you can move back in the image queue by pressing the previous image button. After changing a rating, you will be automatically moved to the newest image.</p>\
                <p>You can press any of the images to enter a more focused rating window. You can see the amount of images rated on the bottom right. Feel free to use your browser's zoom function to adjust the images for comfortable viewing and rating </p>\
                <strong>To complete the survey, we ask you to rate at least 100 images. After rating the 100 images, you may end the survey and enter a raffle to win a gift card. You may also continue rating images after the initial 100, if you wish.</strong>\
                <h5>Press Start Survey to proceed to the survey</h5>\
                "

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
    description: "Rate as many images as you like. Click the image to enlarge it. Feel free to adjust the browser zoom for more comfort.\
    Press Finish whenever you want to stop.",
    elements: [
      {
        type: "paneldynamic",
        name: "comfort_loop",
        title: "Rate images",
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
            title: "Green       ",
            titleLocation: "left",
            isRequired: false,
            rateMin: 1,
            rateMax: 7,
            rateStep: 1,
            minRateDescription: "1 = Not green at all",
            maxRateDescription: "7 = Completely green"
          },
          {
            // 👇 0–7 scale
            type: "rating",
            name: "pleasant",
            title: "Pleasant",
            titleLocation: "left",
            isRequired: false,
            rateMin: 1,
            rateMax: 7,
            rateStep: 1,
            minRateDescription: "1 = Very unpleasant",
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
}

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
  showPreviewBeforeComplete: "showAllQuestions", // "showAllQuestions", "showAnsweredQuestions", or "noPreview"
  
  // 🔧 ADDITIONAL SETTINGS YOU CAN ADD:
  completedHtml: "<h3>Thank you for your participation!</h3>", // Custom completion message
  // requiredText: "*", // Symbol for required questions
  // questionErrorLocation: "bottom", // "top" or "bottom" - Where to show validation errors
  // showCompletedPage: false, // Skip the completion page
}; 