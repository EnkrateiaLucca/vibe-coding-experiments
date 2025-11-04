# Hand Gesture Controlled Summary App

This application allows you to control the level of detail in text summaries using hand gestures captured via your webcam. By raising or lowering your hand, you can dynamically adjust how detailed the AI-generated summary is.

## Features

- Webcam-based hand tracking using MediaPipe Hands
- Text summarization with Google's Gemini AI
- 5 different summary levels controlled by hand position
- Real-time gesture recognition
- Responsive design

## How to Use

1. **Setup**:
   - Open `index.html` in a modern web browser (Chrome recommended)
   - You'll need to obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - When prompted, enter your Gemini API key (it will be saved in your browser's local storage)

2. **Using the App**:
   - Paste any text you want to summarize into the text area
   - Click "Start Webcam & Summarize"
   - Grant webcam permission when prompted
   - Position your hand at different heights to control the summary level:
     - Hand raised high → Very detailed summary
     - Hand at middle position → Medium detail summary
     - Hand lowered → Brief summary

3. **Gesture Guide**:
   - The position of your wrist (specifically its Y-coordinate in the camera view) determines the summary level
   - The app divides the vertical space into 5 zones for different summary levels
   - A brief delay (debounce) prevents the summary from changing too rapidly with small hand movements

## Requirements

- Modern web browser with JavaScript ES6+ support
- Webcam access
- Internet connection (for Gemini API)
- Gemini API key

## Technical Details

- MediaPipe Hands for hand tracking and landmark detection
- Gemini 1.5 Flash model for AI text summarization
- ES6 modules for clean code organization
- Marked library for rendering Markdown in summaries

## Privacy Notes

- All webcam processing is done locally on your device
- Text is sent to Google's Gemini API for summarization
- Your API key is stored only in your browser's local storage

## Troubleshooting

- If the webcam doesn't start, make sure you've granted camera permissions
- If summarization fails, check your API key and internet connection
- For the best hand tracking, ensure good lighting and keep your hand clearly visible
- If the app becomes sluggish, try closing other tabs or applications

---

This app demonstrates how gesture recognition can be used to create intuitive interfaces for controlling AI-generated content.