import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../supabase/client.js';
import { ReportStatus, UserRole } from '../types.js';

// Per guidelines, initialize with API_KEY from environment.
// Assuming it's available in the execution context via snippet injection or dev-config.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper Functions ---
export const sanitizeText = (text) => {
    if (!text) return text;
    // Aggressive sanitization: Instead of escaping, we remove characters known
    // to cause issues with poorly written database triggers or functions. This is
    // the most robust client-side fix when the backend cannot be changed.
    return text.replace(/['"`]/g, "");
};


// --- User Authentication ---

export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Login failed: no user data returned.');

  // Fetch role from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', data.user.id)
    .single();
  
  if (userError) throw new Error(userError.message);

  return { ...data.user, ...userData };
};

export const registerUser = async ({ name, email, password }) => {
  const sanitizedName = sanitizeText(name);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: sanitizedName,
      }
    }
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Registration failed: no user data returned.');

  // Insert into our public users table
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: data.user.id, name: sanitizedName, email, role: UserRole.Citizen }]);
  
  if (insertError) {
    console.error("Error inserting into public.users:", insertError);
    throw new Error(insertError.message);
  }

  return data.user;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const getCurrentUser = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!session?.user) return null;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', session.user.id)
    .single();

  if (userError) {
    console.warn('Could not fetch user profile:', userError.message);
    await logoutUser();
    return null;
  }
  
  return { ...session.user, ...userData };
};


// --- Reports ---

export const getReports = async (userId = null) => {
  let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (userId) {
    query = query.eq('submitted_by', userId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

const uploadReportImage = async (base64Data, fileName) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `reports/${Date.now()}-${sanitizedFileName}`;
    const { error: uploadError } = await supabase.storage.from('report-images').upload(filePath, blob);
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    
    const { data } = supabase.storage.from('report-images').getPublicUrl(filePath);
    return data.publicUrl;
};

export const submitReport = async (reportData) => {
    let imageUrl = null;
    if (reportData.image_data && reportData.image_url) {
        try {
            imageUrl = await uploadReportImage(reportData.image_data, reportData.image_url);
        } catch(err) {
            console.error(err);
            throw err;
        }
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in to submit a report.");

    // Robust check for submitted_by_name to prevent NOT NULL violation.
    const submittedByName = reportData.submitted_by_name?.trim() || user.email;
    if (!submittedByName) {
      throw new Error("Could not determine the submitter's name or email.");
    }
    
    const newReport = {
        title: sanitizeText(reportData.title),
        description: sanitizeText(reportData.description),
        category: reportData.category,
        location: reportData.location,
        image_url: imageUrl,
        submitted_by: user.id,
        submitted_by_name: sanitizeText(submittedByName),
        status: ReportStatus.Pending,
        status_history: [{ status: ReportStatus.Pending, timestamp: new Date().toISOString(), notes: null }],
        vote_count: 0,
    };
    
    const { data, error } = await supabase.from('reports').insert([newReport]).select().single();
    if (error) {
      console.error("Supabase insert error (full object):", error);
      // Provide a more specific error message based on common issues
      if (error.message.includes('violates row-level security policy')) {
           throw new Error("You don't have permission to submit this report. Please check your account.");
      }
      throw new Error(`Database Error: ${error.message}.`);
    }
    return data;
};

export const updateReportStatus = async (reportId, status, assignedTo, notes) => {
    const { data: existingReport, error: fetchError } = await supabase
        .from('reports')
        .select('status_history')
        .eq('id', reportId)
        .single();
    if (fetchError) throw new Error(fetchError.message);

    const newHistoryEntry = { status, timestamp: new Date().toISOString(), notes: notes ? sanitizeText(notes) : null };
    const updatedHistory = [...(existingReport.status_history || []), newHistoryEntry];
    
    const updateData = {
        status,
        status_history: updatedHistory,
    };

    if (assignedTo !== undefined) {
        updateData.assigned_to = assignedTo;
    }

    const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();
        
    if (error) throw new Error(error.message);
    return data;
};

// --- Gemini API Functions ---

export const getETR = async ({ title, description, category, location }) => {
  const prompt = `Based on the following civic issue report, provide a concise estimated time to resolution (ETR) like "1-2 days", "3-5 business days", or "Approximately 1 week". Do not add any extra commentary.
    Report Details:
    - Title: ${title}
    - Description: ${description}
    - Category: ${category}
    - Location: ${location}
    Estimated Time to Resolution:`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (err) {
    console.error("Gemini ETR error:", err);
    throw new Error("Failed to get an ETR from AI.");
  }
};

export const getAIReportAnalysis = async (reports) => {
  if (!reports || reports.length === 0) return "No reports available to analyze.";
  
  const reportsSummary = reports.map(r => 
    `- Title: ${r.title}\n  Category: ${r.category}\n  Status: ${r.status}\n  Location: ${r.location}\n  Upvotes: ${r.vote_count || 0}`
  ).join('\n');
  
  const prompt = `You are an AI assistant for a city's public works department. Analyze the following list of active civic issue reports. Provide a concise, well-formatted summary that includes:
    1.  **Overall Summary:** A brief overview of the current situation (e.g., number of reports, common categories).
    2.  **Key Hotspots:** Identify any geographical areas or specific types of issues that are recurring.
    3.  **Prioritization Suggestions:** Suggest 1-3 reports that might need immediate attention based on category (e.g., safety issues like damaged signs), number of upvotes, or clustering.
    Use markdown for formatting (e.g., **bold headings**, *italics*, and lists).
    Current Reports:\n${reportsSummary}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (err) {
    console.error("Gemini analysis error:", err);
    throw new Error("Failed to get AI analysis.");
  }
};

export const geocodeAddressWithGemini = async (address) => {
    const prompt = `Provide the latitude and longitude for the following address: "${address}".`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lat: { type: Type.NUMBER, description: "The latitude of the address." },
                        lon: { type: Type.NUMBER, description: "The longitude of the address." },
                    },
                    required: ["lat", "lon"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        
        if (result && typeof result.lat === 'number' && typeof result.lon === 'number') {
            return result;
        }
        return null;
    } catch (err) {
        console.error("Gemini geocoding error:", err);
        throw new Error("Failed to geocode address with AI.");
    }
};

export const checkForDuplicateReports = async (potentialReport) => {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, description, category, location, status')
    .in('status', [ReportStatus.Pending, ReportStatus.Assigned, ReportStatus.InProgress])
    .order('created_at', { ascending: false }).limit(50);
    
  if (error) {
    console.error("Error fetching reports for duplicate check:", error);
    return [];
  }
  if (!reports || reports.length === 0) return [];
  
  const reportsContext = reports.map(r => 
    `{ "id": ${r.id}, "title": "${r.title}", "description": "${r.description}", "category": "${r.category}", "location": "${r.location}" }`
  ).join(',\n');
  
  const prompt = `A user is submitting a new report:\n- Title: "${potentialReport.title}"\n- Description: "${potentialReport.description}"\n- Category: "${potentialReport.category}"\n- Location: "${potentialReport.location}"\n\nHere is a list of existing reports in JSON format:\n[\n${reportsContext}\n]\n\nCompare the new report to the existing ones. Identify up to 3 potential duplicates. A duplicate is a report about the same issue at the same location. Return a JSON array of their IDs. If there are no duplicates, return an empty array []. Do not add any explanation, just the JSON array of IDs.`;
  
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json" },
      });

      let duplicateIds = [];
      try {
          const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          duplicateIds = JSON.parse(cleanedText);
      } catch (e) {
          console.error("Could not parse Gemini duplicate check response:", response.text, e);
          return [];
      }

      if (Array.isArray(duplicateIds) && duplicateIds.length > 0) {
          return reports.filter(r => duplicateIds.includes(r.id));
      }
      return [];
  } catch (err) {
      console.error("Gemini duplicate check error:", err);
      return [];
  }
};


// --- Votes ---

export const addVote = async (reportId, userId) => {
    const { error } = await supabase.from('report_votes').insert([{ report_id: reportId, user_id: userId }]);
    if (error) throw new Error(error.message);
};

export const removeVote = async (reportId, userId) => {
    const { error } = await supabase.from('report_votes').delete().match({ report_id: reportId, user_id: userId });
    if (error) throw new Error(error.message);
};

export const getMyVotesForReports = async (reportIds, userId) => {
    const { data, error } = await supabase
        .from('report_votes')
        .select('report_id')
        .eq('user_id', userId)
        .in('report_id', reportIds);
    if (error) throw new Error(error.message);
    const voteMap = new Map();
    (data || []).forEach(vote => voteMap.set(vote.report_id, true));
    return voteMap;
};


// --- Other ---

export const getWorkers = async () => {
    const { data, error } = await supabase.from('workers').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const addWorker = async (worker) => {
    const { data, error } = await supabase.from('workers').insert([worker]);
    if (error) throw new Error(error.message);
    return data;
};

export const getUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data;
};

export const getContactMessages = async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const addContactMessage = async (message) => {
    const { data, error } = await supabase.from('contact_messages').insert([message]);
    if (error) throw new Error(error.message);
    return data;
};

export const getFeedback = async () => {
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const addFeedback = async (feedback) => {
    const { data, error } = await supabase.from('feedback').insert([feedback]);
    if (error) throw new Error(error.message);
    return data;
};