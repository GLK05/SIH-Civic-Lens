# CivicLens: Report, Track, Resolve

CivicLens is a modern, responsive web application designed to empower citizens by providing a direct channel to report civic issues to local authorities. From potholes and broken streetlights to illegal dumping, users can quickly submit reports with photos and precise locations. Administrators have access to a comprehensive dashboard to manage, track, and resolve these issues efficiently.

The application leverages AI to provide insights, check for duplicate reports, and estimate resolution times, creating a smarter and more transparent civic engagement process.

## ✨ Key Features

- **📱 User-Friendly Reporting**: Citizens can easily submit detailed reports with categories, descriptions, images, and geolocation.
- **🗺️ Interactive Live Map**: View all reported issues on a real-time map, color-coded by their current status.
- **📊 Citizen Dashboard**: Users can track the status of their submitted reports from "Pending" to "Resolved".
- **⚙️ Admin Management Dashboard**: A powerful interface for administrators to view all reports, update their status, assign workers, and add internal notes.
- **🧠 AI-Powered Insights**:
  - **Overall Analysis**: Admins can get an AI-generated summary of all reports, highlighting urgent issues and common themes.
  - **Duplicate Detection**: AI checks for potentially duplicate reports during submission to reduce redundancy.
  - **Estimated Time to Resolution (ETR)**: Users receive an AI-based estimate for how long an issue might take to resolve.
  - **AI Geocoding**: Converts user-entered addresses into precise map coordinates.
- **🌐 Offline Support**: Reports submitted while offline are saved locally and automatically synced when an internet connection is restored.
- **🎨 Responsive & Themed**: A clean, mobile-first design with both light and dark modes for a comfortable viewing experience on any device.
- **🔔 Real-time Updates**: The live map and report lists update in real-time as new issues are submitted or statuses are changed.

## 🚀 Tech Stack

- **Frontend**: React, JavaScript (ESM), Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Mapping**: Leaflet.js & Leaflet.markercluster
- **Offline Storage**: IndexedDB

## 🏁 Getting Started

### Prerequisites

You need a simple local web server to run the project. If you have Node.js installed, you can use the `serve` package.

- [Node.js](https://nodejs.org/) (which includes `npx`)

### API Key Configuration

Before running the application, you need to configure API keys for **Supabase** and the **Google Gemini API**. Please follow the specific instructions in the "Running Locally" and "Deployment to Netlify" sections below.

- **Supabase Keys:** You will need your Project URL and public anon key from your Supabase project's **Settings > API** page.
- **Google Gemini API Key:** You can obtain an API key from [Google AI Studio](https://aistudio.google.com/).

## 💻 Running Locally

The application is designed to run without a complex build setup.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/civic-lens.git
    cd civic-lens
    ```

2.  **Configure Supabase Keys**
    - Open the `supabase/client.js` file.
    - Replace the placeholder values for `supabaseUrl` and `supabaseAnonKey` with your actual Supabase Project URL and public anon key.

3.  **Configure Gemini API Key**
    The application code expects the Gemini API key to be available as `process.env.API_KEY`, which doesn't exist in the browser. To make it work locally:
    
    a. Create a new file in the project's root directory named `dev-config.js`.
    
    b. Add the following code to `dev-config.js`, replacing `'YOUR_GEMINI_API_KEY'` with your actual key:
       ```javascript
       // dev-config.js
       window.process = {
         env: {
           API_KEY: 'YOUR_GEMINI_API_KEY'
         }
       };
       ```
    c. In `index.html`, add a script tag to include this file **before** the main application script (`index.js`).
       ```html
       <!-- index.html -->
       <body class="bg-background text-foreground">
         <div id="root"></div>
         <!-- Add this line for local development ONLY -->
         <script src="dev-config.js"></script> 
         <script type="module" src="index.js"></script>
         <!-- ... other scripts ... -->
       </body>
       ```
    d. **IMPORTANT:** Add `dev-config.js` to your `.gitignore` file. This is a critical step to ensure you never commit your secret API key to version control.
       ```
       # .gitignore
       dev-config.js
       ```

4.  **Run the Local Server**
    Navigate to the project's root directory in your terminal and run a simple local server.
    ```bash
    npx serve
    ```
    This will serve the files, usually at `http://localhost:3000`.

## 🚀 Deployment to Netlify

Follow these steps to deploy your site and correctly configure the API keys for the live environment.

1.  **Push to a Git Provider**
    Make sure your project is pushed to a repository on GitHub, GitLab, or Bitbucket.

2.  **Create a New Site on Netlify**
    Log in to Netlify and create a new site by linking it to your Git repository.

3.  **Set Build Configuration**
    In the Netlify UI for your new site, go to **Site settings > Build & deploy**:
    - **Build command:** Leave this **BLANK**.
    - **Publish directory:** Set this to `.` (the root of your project).

4.  **Add API Keys as Environment Variables**
    This is the secure way to store your secret keys in production.
    - Go to **Site settings > Build & deploy > Environment**.
    - Click **"Edit variables"** and add the following three variables:
      - **Key:** `API_KEY`, **Value:** Your Google Gemini API key.
      - **Key:** `SUPABASE_URL`, **Value:** Your Supabase Project URL.
      - **Key:** `SUPABASE_ANON_KEY`, **Value:** Your Supabase public anon key.
    - Click **Save**.

5.  **Inject Keys into the Site (Crucial Step)**
    This step securely makes the environment variables you just set available to the browser code on your live site.
    - Go to **Site settings > Build & deploy > Post processing > Snippet injection**.
    - Click **"Add snippet"**.
    - Set **Inject snippet** to **Before `</head>`**.
    - Paste the following code into the **HTML** box:
      ```html
      <script>
        // Inject Gemini API Key
        window.process = {
          env: {
            API_KEY: '{{env.API_KEY}}'
          }
        };
        // Inject Supabase Config
        window.SUPABASE_CONFIG = {
          url: '{{env.SUPABASE_URL}}',
          anonKey: '{{env.SUPABASE_ANON_KEY}}'
        };
      </script>
      ```
    - Click **Save**.

6.  **Deploy**
    Trigger a new deploy from the "Deploys" tab in Netlify. The snippet will now safely inject your keys into the page, allowing the live application to connect to Supabase and the Gemini API.

## 📁 Project Structure
```
.
├── components/         # Reusable React components
│   ├── ui/             # Generic UI components (Button, Card, Input)
│   └── ...
├── pages/              # Top-level page components for each view
├── services/           # API logic, database interactions, and AI calls
├── supabase/           # Supabase client configuration
├── index.html          # The main HTML entry point
├── index.js            # The main React application entry point
├── App.js              # Root component with routing logic
├── types.js            # Core type definitions (as const objects)
└── README.md           # This file
```

## License

This project is licensed under the MIT License.