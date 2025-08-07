Product Requirements Prompt
Product Name/Working Title: AI Display Banner Builder

One-Sentence Idea Description: An AI-powered web app that automatically generates animated HTML5 display banners from user-uploaded assets, designed for marketers who need to create ad variations quickly.

Target Audience: Marketing managers at small startups who are busy, wear multiple hats, and need to create effective ad creatives without deep design or technical knowledge.

User Journey / Flow:

User signs up or logs in.

User creates a new project and gives it a name.

Inside the project, the user is prompted to upload individual assets: a background, a logo, a product image, copy (text), and a CTA (text).

Once assets are uploaded, the user triggers the AI generation.

The AI analyzes the assets and generates a gallery of animated HTML5 banners in various standard sizes (must include 300x250, plus 3-4 other common sizes like 300x600, 728x90, 320x50, etc.).

The user can preview all the generated banners in the gallery.

The user can export each creative as a script/zip file, ready for upload to any DSP. The exported file includes tracking code to measure performance.

List of Core Features (Initial Version):

User Authentication: Secure login and registration system for individual users.

Project Management: Ability to create and name new projects.

Asset Uploader: A simple interface with distinct slots for uploading background, logo, product image, copy, and CTA.

AI Generation Engine: Core feature that takes uploaded assets and uses AI to generate multiple ad variations.

Preview Gallery: A clean gallery view to display all the AI-generated banner sizes.

Export Functionality: A button to download the final banners as a DSP-ready script/zip file.

Suggested Tools or Stack:

Authentication & Database: Supabase for user accounts and storing project data (asset links, text, etc.).

AI Model: Anthropic's Claude 3 Haiku for its cost-effective vision and reasoning capabilities.

Frontend/Animation: GSAP for creating the HTML5 banner animations.

Platform: Web App.

Vibe or Design Notes:

The UI/UX should be inspired by Canva and Figma: clean, modern, intuitive, and focused on making the creative process feel easy and powerful.

Future Feature Ideas:

Banner Editor: Allow users to make manual tweaks to the AI-generated banners (e.g., change text, adjust timing, swap colors).

Analytics Dashboard: An insights dashboard (inspired by nexD) to show the performance of different creatives based on the embedded tracking code.

Team Collaboration: Introduce team accounts, project sharing, and other collaborative features for enterprise use.
