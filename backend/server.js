require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
app.post("/templates", async (req, res) => {
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

// 4️⃣ Search templates using AI embeddings
app.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    // Call Python script to generate query embedding
    const pythonProcess = spawn("python3", ["embeddings.py", "--query", query]);

    let embedding = "";
    pythonProcess.stdout.on("data", (data) => {
      embedding += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`embeddings.py error: ${data}`);
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        return res
          .status(500)
          .json({ error: "Error generating search embedding" });
      }

      try {
        const { data, error } = await supabase.rpc("match_templates", {
          query_embedding: JSON.parse(embedding.trim()),
        });
        if (error) throw error;
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
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

// Start Server
const PORT = process.env.PORT || 4872;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));