# Images for photo-based bank questions

Some official questions rely on a photo we cannot copy. We replace each with a freely licensed image of the
same subject from **Wikimedia Commons** only, and credit it.

File: `data/src/images/{his,cul}.json` — an object keyed by question id:

```
{
  "his-41": {
    "images": [
      {
        "slot": null,                    // null for a single image; "Α","Β","Γ","Δ" or "1".."4" when the question
                                         // refers to several pictures (must match the letters/numbers used in the question)
        "file": "images/q/his-41.jpg",   // saved under the project's images/q/ folder
        "w": 600, "h": 800,              // pixel size of the saved file
        "subject": {"el": "...", "tr": "...", "en": "..."},   // what it shows (shown only AFTER answering)
        "author": "Unknown author",      // from Commons metadata (Artist), plain text
        "license": "Public domain",      // LicenseShortName from Commons, e.g. "CC BY-SA 4.0"
        "licenseUrl": "https://..." | null,
        "source": "https://commons.wikimedia.org/wiki/File:..."   // the Commons file page
      }
    ]
  }
}
```

Rules
- Source: commons.wikimedia.org only (use the MediaWiki API: `action=query&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=800`).
  Download the scaled thumbnail (≤ 800 px wide) from upload.wikimedia.org, save as JPEG (convert PNG/WebP with Pillow;
  max ~150 KB each, quality ~82).
- Allowed licenses ONLY: Public domain (any PD tag), CC0, CC BY (any version), CC BY-SA (any version).
  Read `extmetadata.LicenseShortName`; reject anything else (GFDL-only, non-commercial, "fair use", unknown).
- The image must truly show the required subject (check the file's description and categories). For "who is pictured?"
  questions use a recognised portrait/photo of exactly that person. For multi-picture questions, every slot must be
  consistent with the OFFICIAL answer of the question (read the question's items/pairs/answer and note).
- If you cannot find a faithful, freely licensed image for every slot of a question, leave that question out
  entirely (it stays text-only). Never guess.
- Do not add text to images, do not crop away important parts, do not include watermarks.
