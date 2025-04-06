require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { spawn } = require("child_process");
const crypto = require("crypto");

const app = express();

// Configure CORS with options
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://code-cache.vercel.app",
          "https://codecache.vercel.app",
          "https://code-cache-flame.vercel.app",
          "http://localhost:5173",
        ] // Add all possible Vercel domains
      : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

// Handle CORS preflight requests
app.options("*", cors(corsOptions));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Password verification endpoint
app.post("/verify-upload-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  const correctPassword = process.env.UPLOAD_PASSWORD || "default-password";

  if (password === correctPassword) {
    // Generate a simple token that includes the password and timestamp
    const timestamp = Date.now();
    const token = `${password}_${timestamp}`;

    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Password verification middleware
const verifyUploadPassword = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Upload token required" });
  }

  const uploadToken = authHeader.split(" ")[1];
  if (!uploadToken) {
    return res.status(401).json({ error: "Upload token required" });
  }

  try {
    // Extract password from token
    const [password, timestamp] = uploadToken.split("_");
    const tokenAge = Date.now() - parseInt(timestamp);

    // Token expires after 1 hour
    if (tokenAge > 3600000) {
      return res.status(401).json({ error: "Token expired" });
    }

    const correctPassword = process.env.UPLOAD_PASSWORD || "default-password";

    if (password !== correctPassword) {
      return res.status(401).json({ error: "Invalid token" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token format" });
  }
};

// 1️⃣ Get all templates
app.get("/templates", async (req, res) => {
  try {
    const { data, error } = await supabase.from("code_templates").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2️⃣ Get a single template by ID
app.get("/templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("code_templates")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3️⃣ Upload a new template
app.post("/templates", verifyUploadPassword, async (req, res) => {
  try {
    const { title, description, code_snippet, language, publisher } = req.body;

    if (!title || !description || !code_snippet || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // First, generate the AI bio
    const bioProcess = spawn("python3", [
      "AI_chat.py",
      "bio",
      title,
      language,
      description,
      code_snippet,
    ]);

    let bioOutput = "";
    let bioError = "";

    bioProcess.stdout.on("data", (data) => {
      bioOutput += data.toString();
    });

    bioProcess.stderr.on("data", (data) => {
      bioError += data.toString();
      console.error(`AI_chat.py bio error: ${data}`);
    });

    bioProcess.on("error", (error) => {
      console.error("Failed to start bio process:", error);
      return res
        .status(500)
        .json({ error: "Failed to start AI bio generation" });
    });

    bioProcess.on("close", async (bioCode) => {
      if (bioCode !== 0) {
        console.error(
          "Bio process failed with code:",
          bioCode,
          "Error:",
          bioError
        );
        return res.status(500).json({
          error: "AI bio generation failed",
          details: bioError,
        });
      }

      try {
        // Generate tags
        const tagsProcess = spawn("python3", [
          "AI_chat.py",
          "tags",
          title,
          language,
          description,
          code_snippet,
        ]);

        let tagsOutput = "";
        let tagsError = "";

        tagsProcess.stdout.on("data", (data) => {
          tagsOutput += data.toString();
        });

        tagsProcess.stderr.on("data", (data) => {
          tagsError += data.toString();
          console.error(`AI_chat.py tags error: ${data}`);
        });

        tagsProcess.on("error", (error) => {
          console.error("Failed to start tags process:", error);
          return res
            .status(500)
            .json({ error: "Failed to start AI tags generation" });
        });

        tagsProcess.on("close", async (tagsCode) => {
          if (tagsCode !== 0) {
            console.error(
              "Tags process failed with code:",
              tagsCode,
              "Error:",
              tagsError
            );
            return res.status(500).json({
              error: "AI tags generation failed",
              details: tagsError,
            });
          }

          try {
            let ai_bio = null;
            let tags = [];

            try {
              if (bioOutput) {
                const bioData = JSON.parse(bioOutput);
                ai_bio = bioData.bio;
              }
            } catch (e) {
              console.error("Failed to parse bio output:", e);
            }

            try {
              if (tagsOutput) {
                const tagsData = JSON.parse(tagsOutput);
                tags = tagsData.tags;
              }
            } catch (e) {
              console.error("Failed to parse tags output:", e);
            }

            // Insert into DB with AI bio and tags
            const { data, error } = await supabase
              .from("code_templates")
              .insert([
                {
                  title,
                  description,
                  code_snippet,
                  language,
                  tags,
                  publisher,
                  ai_bio,
                  updated_at: new Date().toISOString(),
                },
              ])
              .select();

            if (error) {
              console.error("Supabase insert error:", error);
              throw error;
            }

            // Call embeddings.py to update the vector
            const embeddingsProcess = spawn("python3", [
              "embeddings.py",
              data[0].id,
              code_snippet,
            ]);

            embeddingsProcess.stderr.on("data", (data) => {
              console.error(`embeddings.py error: ${data}`);
            });

            embeddingsProcess.on("error", (error) => {
              console.error("Failed to start embeddings process:", error);
            });

            embeddingsProcess.on("close", (code) => {
              if (code !== 0) {
                console.error("Embeddings process failed with code:", code);
              } else {
                console.log(
                  `embeddings.py completed successfully for template ${data[0].id}`
                );
              }
            });

            res.json(data[0]);
          } catch (error) {
            console.error("Error in final processing:", error);
            res.status(500).json({ error: error.message });
          }
        });
      } catch (error) {
        console.error("Error in tags generation:", error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error("Error in template upload:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4️⃣ Search templates using text search
app.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    console.log("Search query:", query);

    if (!query.trim()) {
      const { data, error } = await supabase.from("code_templates").select("*");
      if (error) throw error;
      return res.json(data);
    }

    // Search in title, description, and ai_bio using Postgres text search
    const { data, error } = await supabase
      .from("code_templates")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,ai_bio.ilike.%${query}%`
      );

    if (error) {
      console.error("Supabase search error:", error);
      throw error;
    }

    console.log("Search results:", data);
    res.json(data);
  } catch (error) {
    console.error("Error in search endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5️⃣ AI chat recommendation
app.post("/recommend", async (req, res) => {
  try {
    const { project_description } = req.body;

    // Encode the project description to handle spaces and special characters
    const encodedDescription =
      Buffer.from(project_description).toString("base64");

    const pythonProcess = spawn("python3", [
      "AI_chat.py",
      "recommend",
      encodedDescription,
    ]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`AI_chat.py error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: "Error generating recommendation",
          details: errorOutput,
        });
      }

      try {
        const recommendation = JSON.parse(output.trim());
        res.json(recommendation);
      } catch (error) {
        res.status(500).json({
          error: "Error parsing recommendation",
          details: error.message,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prompt Cache endpoints
app.post("/prompts", verifyUploadPassword, async (req, res) => {
  try {
    const {
      title,
      description,
      prompt_text,
      model,
      category,
      example_response,
      tags,
      publisher,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !prompt_text ||
      !model ||
      !category ||
      !publisher
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate AI bio for the prompt
    const bioProcess = spawn("python3", [
      "AI_chat.py",
      "bio",
      Buffer.from(title).toString("base64"),
      model,
      Buffer.from(description).toString("base64"),
      Buffer.from(prompt_text).toString("base64"),
    ]);

    let bioOutput = "";
    let bioError = "";

    bioProcess.stdout.on("data", (data) => {
      bioOutput += data.toString();
    });

    bioProcess.stderr.on("data", (data) => {
      bioError += data.toString();
      console.error(`AI_chat.py bio error: ${data}`);
    });

    bioProcess.on("error", (error) => {
      console.error("Failed to start bio process:", error);
      return res
        .status(500)
        .json({ error: "Failed to start AI bio generation" });
    });

    bioProcess.on("close", async (bioCode) => {
      if (bioCode !== 0) {
        console.error(
          "Bio process failed with code:",
          bioCode,
          "Error:",
          bioError
        );
        return res.status(500).json({
          error: "AI bio generation failed",
          details: bioError,
        });
      }

      try {
        let ai_bio = null;

        try {
          if (bioOutput) {
            const bioData = JSON.parse(bioOutput);
            ai_bio = bioData.bio;
          }
        } catch (e) {
          console.error("Failed to parse bio output:", e);
        }

        // Insert into DB with AI bio
        const { data, error } = await supabase
          .from("prompt_templates")
          .insert([
            {
              title,
              description,
              prompt_text,
              model,
              category,
              example_response,
              tags,
              publisher,
              ai_bio,
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        res.json(data[0]);
      } catch (error) {
        console.error("Error in final processing:", error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error("Error in prompt upload:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/prompts/search", async (req, res) => {
  try {
    const { query = "" } = req.body;

    let dbQuery = supabase.from("prompt_templates").select("*");

    if (query) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,ai_bio.ilike.%${query}%`
      );
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Supabase search error:", error);
      return res.status(500).json({ error: "Failed to search prompts" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /prompts/search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 4872;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
