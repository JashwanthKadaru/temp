// parse-md-to-json.js
//
// Usage:
//    node parse-md-to-json.js path/to/output.md > docx_output.json
//
// This script reads a Markdown file (converted by Mammoth.js), 
// looks for <a id="_Toc…"></a> anchors to locate each
// section and subsection, and then emits a JSON array of objects
// with this shape:
//
// [
//   {
//     "title": "Section Title",
//     "text": "All the paragraph text under that section...",
//     "subsections": [
//       {
//         "title": "Subsection Title",
//         "text": "All the paragraph text under that subsection..."
//       },
//       ...
//     ]
//   },
//   ...
// ]
//
// It skips any TOC entries (lines that start with "[" and link to "#_Toc…"),
// and it will ignore stray anchor lines that have no actual title text.
//
// (No additional npm packages are required—just built-in fs/path.)

const fs = require('fs');
const path = require('path');

// if (process.argv.length !== 3) {
//   console.error('Usage: node parse-md-to-json.js <path/to/output.md>');
//   process.exit(1);
// }

const mdPath = "./output.md" //process.argv[2];
let raw;
try {
  raw = fs.readFileSync(mdPath, 'utf8');
} catch (err) {
  console.error('Error reading file:', err.message);
  process.exit(1);
}

const lines = raw.split(/\r?\n/);

const result = [];
let currentSection = null;
let currentSubsection = null;

// Helper to flush a subsection into its parent section
function flushSubsection() {
  if (currentSubsection && currentSection) {
    currentSubsection.text = currentSubsection.text.trim();
    currentSection.subsections.push(currentSubsection);
    currentSubsection = null;
  }
}

// Helper to flush a section (which also flushes any open subsection)
function flushSection() {
  if (currentSection) {
    flushSubsection();
    currentSection.text = currentSection.text.trim();
    result.push(currentSection);
    currentSection = null;
  }
}

// Regex to detect a section header (no leading tab, but does have at least one <a id="_Toc…"></a>)
//   ^\s*              → optional leading spaces
//   (?:#\s*)?         → optional "# " (Mammoth sometimes emits "# <a…>…")
//   (?:\d+\.\s*)?     → optional numeric prefix like "1. " (Mammoth sometimes numbers the heading in MD)
//   (?:<a id="_Toc[^>]+"><\/a>)+  → at least one _Toc-style anchor
//   \s*(.*\S)\s*$     → capture the remainder of the line (the actual title), as long as it’s not empty
const sectionRe = /^\s*(?:#\s*)?(?:\d+\.\s*)?(?:<a id="_Toc[^>]+"><\/a>)+\s*(.*\S)\s*$/;

// Regex to detect a subsection header (must start with a tab, then "1. <a…></a>SubTitle")
//   ^\s*\d+\.\s*      → “1. ” or similar (with possible leading spaces, since the tab is literal \t)
//   (?:<a id="_Toc[^>]+"><\/a>)+ → at least one _Toc anchor
//   \s*(.*\S)\s*$     → capture the remainder of the line (the subtitle text)
const subsectionRe = /^\s*\d+\.\s*(?:<a id="_Toc[^>]+"><\/a>)+\s*(.*\S)\s*$/;

for (let rawLine of lines) {
  const line = rawLine; // keep exact whitespace for detecting leading tabs

  // 1) Skip completely empty lines or lines that are just a single "-" bullet
  if (line.trim() === '' || line.trim() === '-') {
    continue;
  }

  // 2) Skip any TOC entries: they start with "[" and somewhere contain "](#_Toc"
  //    e.g.: [1. Document Introduction 5](#_Toc…)
  if (line.trim().startsWith('[') && line.includes('](#_Toc')) {
    continue;
  }

  // 3) Does this line begin with a tab?  If so, it might be a subsidiary "subsection" heading
  if (line.startsWith('\t')) {
    const mSub = line.match(subsectionRe);
    if (mSub && currentSection) {
      // We found a new subsection header.  First, flush any previous one:
      flushSubsection();

      // mSub[1] is the raw text after the <a…></a> anchors,
      // but it may still contain stray anchor tags (OLE_LINK, etc.).  Strip them:
      let subTitle = mSub[1].replace(/<a[^>]*><\/a>/g, '').trim();

      currentSubsection = {
        title: subTitle,
        text: ''
      };
      continue;
    }
    // If it starts with a tab but doesn't match subsectionRe, treat it as “content under a subsection”
    // so we’ll fall through to the “plain text” logic below.
  }

  // 4) Otherwise, try to detect a SECTION heading (no leading tab)
  const mSec = line.match(sectionRe);
  if (mSec) {
    // mSec[1] is the captured “title” portion.  If it’s empty after stripping HTML, skip.
    let rawTitle = mSec[1].replace(/<a[^>]*><\/a>/g, '').trim();
    if (rawTitle !== '') {
      // Found a bona fide section.  Flush any existing section first.
      flushSection();

      currentSection = {
        title: rawTitle,
        text: '',
        subsections: []
      };
      continue;
    }
    // If rawTitle is empty, it was probably just a row of anchors with no real text—ignore.
  }

  // 5) Otherwise, treat this as “plain text” belonging to whichever (sub)section is currently open.
  //    Strip out any leftover <a…></a> tags before appending.
  let cleaned = line.replace(/<a[^>]*><\/a>/g, '').trim();
  if (cleaned === '') {
    continue;
  }

  if (currentSubsection) {
    currentSubsection.text += cleaned + ' ';
  } else if (currentSection) {
    currentSection.text += cleaned + ' ';
  }
  // If there’s no currentSection yet (i.e. preamble before the very first heading), we drop those lines.
}

// 6) At EOF, flush the last section (and any open subsection)
flushSection();

// 7) Emit the final JSON
process.stdout.write(JSON.stringify(result, null, 2));
