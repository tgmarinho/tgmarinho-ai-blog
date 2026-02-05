"use client";

import { useState, useEffect } from "react";
import { CVViewer } from "@/components/cv/cv-viewer";
import { Button } from "@/components/ui/button";
import { Download, Languages } from "lucide-react";

export default function CVPage() {
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [cvContent, setCvContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load CV content based on language
    const loadCV = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          language === "en"
            ? "/content/cv.md"
            : "/content/cv_pt.md"
        );
        if (response.ok) {
          const text = await response.text();
          setCvContent(text);
        } else {
          console.error("Failed to load CV");
        }
      } catch (error) {
        console.error("Error loading CV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCV();
  }, [language]);

  const handleDownloadPDF = async () => {
    const content = document.getElementById("cv-content");
    if (!content) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the CV content element
    const cvElement = content.querySelector(".cv-content");
    if (!cvElement) return;

    // Clone the content
    const clonedContent = cvElement.cloneNode(true) as HTMLElement;
    
    // Remove any interactive elements that might be in the content
    const buttons = clonedContent.querySelectorAll("button, .no-print");
    buttons.forEach((btn) => btn.remove());

    // Get computed styles for better rendering
    const computedStyles = window.getComputedStyle(cvElement);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language}">
        <head>
          <title>CV - Thiago Marinho ${language === "en" ? "(English)" : "(Português)"}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${getPDFStyles()}
          </style>
        </head>
        <body>
          ${clonedContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header with controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Curriculum Vitae</h1>
            <p className="text-muted-foreground mt-1">
              Thiago Marinho de Oliveira
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
                className="h-8"
              >
                <Languages className="h-4 w-4 mr-1" />
                EN
              </Button>
              <Button
                variant={language === "pt" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("pt")}
                className="h-8"
              >
                <Languages className="h-4 w-4 mr-1" />
                PT-BR
              </Button>
            </div>

            {/* Download PDF Button */}
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* CV Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading CV...</p>
          </div>
        ) : (
          <div id="cv-content" className="cv-container">
            <CVViewer content={cvContent} />
          </div>
        )}
      </div>
    </div>
  );
}

function getPDFStyles() {
  return `
    @page {
      margin: 1.5cm;
      size: A4;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 24pt;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 0.5em;
      color: #000;
      page-break-after: avoid;
    }
    h2 {
      font-size: 18pt;
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      color: #000;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.25em;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14pt;
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #000;
      page-break-after: avoid;
    }
    p {
      margin: 0.5em 0;
      orphans: 3;
      widows: 3;
    }
    ul, ol {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }
    li {
      margin: 0.25em 0;
      page-break-inside: avoid;
    }
    strong {
      font-weight: 600;
    }
    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 3px solid #e5e7eb;
      color: #4b5563;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 1.5em 0;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    th, td {
      padding: 0.5em;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      font-weight: 600;
      background-color: #f9fafb;
    }
    code {
      background-color: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    pre {
      background-color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
}
