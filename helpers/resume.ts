
export const extractCandidateName = (html: string): string => {
  const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : "Optimized Resume";
};

export const generateResumeTemplate = (content: string, title: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');
    body { 
      font-family: 'Source Sans Pro', 'Helvetica', 'Arial', sans-serif; 
      line-height: 1.4; 
      color: #111; 
      padding: 40px; 
      max-width: 850px; 
      margin: auto; 
      background: white;
    }
    header { text-align: center; margin-bottom: 25px; }
    h1 { font-size: 24pt; margin: 0 0 5px 0; font-weight: 700; text-transform: uppercase; border-bottom: none; }
    .contact-info { font-size: 10pt; color: #444; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 8px; text-align: center; }
    h2 { 
      font-size: 13pt; 
      font-weight: 700; 
      margin-top: 20px; 
      margin-bottom: 8px; 
      text-transform: uppercase; 
      border-bottom: 1.5px solid #111; 
      padding-bottom: 2px;
      color: #111;
    }
    h3 { font-size: 11pt; font-weight: 700; margin: 12px 0 2px 0; display: flex; justify-content: space-between; }
    .date { font-weight: 400; font-style: italic; }
    .job-title { font-style: italic; font-weight: 600; color: #333; margin-bottom: 5px; }
    p { margin: 5px 0; font-size: 10.5pt; }
    ul { margin: 6px 0 10px 0; padding-left: 20px; list-style-type: disc; }
    li { margin-bottom: 4px; font-size: 10.5pt; }
    .no-print {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      color: #475569;
      font-family: sans-serif;
    }
    @media print { 
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <strong>✨ Your High-Performance Resume is Ready!</strong><br/>
    Use <code>Ctrl+P</code> or <code>Cmd+P</code> to save this document as a professional PDF.
  </div>
  ${content}
</body>
</html>
`;
