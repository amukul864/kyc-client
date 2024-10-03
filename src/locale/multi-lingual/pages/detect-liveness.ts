const detectLivenessLocale = {
  "en-IN": {
    Heading: "Detect Liveness",
    Subheading: { Proposal_Number: "Proposal Number:" },
    Button: { Recapture_Video: "Recapture Video" },
    Values: {
      Face_Detected: "Face Detected",
      LiveLiness_Check: "Liveliness Check",
      Spoof_Detected: "Spoof Detected",
      Warning: {
        User_Not_Live: "User is not live. Please try again!",
        Brightness: "Maximize you screen's brightness",
        Lighting_Conditions:
          "Avoid very bright lighting conditions, such as direct sunlight.",
        Objects:
          "Remove sunglasses, mask, hat, or anything blocking your face.",
      },
    },
    Error: {
      Values: {
        Try_Again: "Face Doesn't Match With PhotoId! Please Try Again.",
      },
      Button: {
        Try_Again: "Try Again!",
        Upload_Id_Again: "Upload PhotoId Again",
      },
    },
  },
  "hi-IN": {
    Heading: "जीवंतता का पता लगाएं",
    Subheading: { Proposal_Number: "प्रस्ताव क्रमांक:" },
    Button: { Recapture_Video: "वीडियो दोबारा रिकॉर्ड करें" },
    Values: {
      Light_Detected: "प्रकाश का पता चला",
      Face_Detected: "चेहरे का पता लगा",
      LiveLiness_Check: "जीवंतता की जाँच",
      Spoof_Detected: "स्पूफ का पता चला",
      Warning: {
        User_Not_Live: "उपयोगकर्ता लाइव नहीं है. कृपया पुन: प्रयास करें!",
        Brightness: "अपनी स्क्रीन की चमक अधिकतम करें",
        Lighting_Conditions:
          "बहुत तेज़ रोशनी की स्थिति, जैसे सीधी धूप, से बचें।",
        Objects:
          "धूप का चश्मा, मास्क, टोपी या आपके चेहरे को अवरुद्ध करने वाली कोई भी चीज़ हटा दें।",
      },
    },
    Error: {
      Balues: {
        Try_Again: "चेहरा फोटोआईडी से मेल नहीं खाता! कृपया पुन: प्रयास करें।",
      },
      Button: {
        Try_Again: "पुनः प्रयास करें!",
        Upload_Id_Again: "फोटोआईडी दोबारा अपलोड करें",
      },
    },
  },
};

export default detectLivenessLocale;
