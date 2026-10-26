# Mumbai University Syllabus Overview Optimization Specification

## Problem Summary
When extracting the syllabus overview for large Mumbai University circulars (which often combine two semesters, e.g., Sem V & VI, Sem III & IV):
1. **18-Page Binary PDF Ingest**: Passing 18 pages of visual PDF sends ~5 MB of Base64 inline data to Gemini. Gemini must OCR dozens of unnecessary pages (course modules, textbooks, lab lists).
2. **Vercel Serverless Function Timeout**: Gemini OCR and 2,500-token generation takes 35–50+ seconds. Vercel Hobby/Standard cuts serverless routes at 10–15 seconds, returning a `504 Gateway Timeout` or `500` error.
3. **Redundant Subject Summaries**: Prompting for sentence summaries for 16–22 subjects generates over 1,500 extra tokens of verbose text, slowing generation down by 3x.

---

## The Approved Low-Cost & High-Speed Architecture

### 1. Pre-filter Scheme Pages (Pages 2 to 7 Only)
- In Mumbai University engineering circulars, Teaching Scheme and Examination Scheme tables for both semesters are strictly located between **Pages 2 and 6/7**.
- Slicing only these pages eliminates 90% of useless syllabus reading.

### 2. Digital Text Extraction First (`pdf-parse`)
- Extract raw text from Pages 2–7 using `pdf-parse` in Node.js (~15ms).
- Feed clean text to Gemini instead of multi-megabyte images:
  - **Input Token Cost**: ~1,200 tokens ($0.00018 / document).
  - **Accuracy**: 100% character-exact numbers without OCR distortion.
  - **Fallback**: If the PDF is a scanned photocopy without text, fall back to the 5-page visual slice.

### 3. Extract Tabular Matrix Only (No Verbose Summaries)
- Remove `"summary"` from the prompt and schema.
- Extract only the essential numerical structure:
  - `code` & `name`
  - `type` (`theory` | `practical` | `both` | `project`)
  - `teachingScheme` (L, P, T, Credits)
  - `examScheme` (IA 20, ESE 80, Duration, TW, PR/OR, Total)
  - `semesterNumber`, `semesterLabel`, `totalCredits`, `totalMarks`
- Reduces output from 2,500 tokens down to **~350–450 tokens**.

### 4. Fast & Single-Pass Model Call
- Call `gemini-2.5-flash` with a 10s timeout.
- Response time: **2.5 to 3.5 seconds** (comfortably under Vercel's limit).
- Once extracted, the result is saved forever in MongoDB (`SyllabusOverviewModel`) for 0ms subsequent loads.
