import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBS2uNo-oOvINIBfT3p8xcwsv-hIZYuG6w';

interface ExtractedRow {
  customerName: string;
  date: string;
  rowIndex: number;
}

// Common column name patterns
const NAME_PATTERNS = ['שם', 'שם לקוח', 'לקוח', 'שם הלקוח', 'name', 'customer', 'client', 'שם מלא'];
const DATE_PATTERNS = ['תאריך', 'date', 'תאריך תשלום', 'תאריך קבלה', 'יום', 'תאריך עסקה'];

function findColumnByPattern(headers: string[], patterns: string[]): string | null {
  // First try exact match
  for (const pattern of patterns) {
    const found = headers.find(h => h.toLowerCase().trim() === pattern.toLowerCase());
    if (found) return found;
  }
  // Then try contains
  for (const pattern of patterns) {
    const found = headers.find(h => h.toLowerCase().includes(pattern.toLowerCase()));
    if (found) return found;
  }
  return null;
}

function formatDate(rawDate: any): string {
  if (!rawDate) return '';
  
  // If it's a number (Excel serial date)
  if (typeof rawDate === 'number') {
    const excelDate = new Date((rawDate - 25569) * 86400 * 1000);
    return `${excelDate.getDate().toString().padStart(2, '0')}/${(excelDate.getMonth() + 1).toString().padStart(2, '0')}/${excelDate.getFullYear()}`;
  }
  
  // If it's already a string
  const dateStr = String(rawDate).trim();
  
  // Try to parse various date formats
  // Check if it's already in DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Check if it's in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('-');
    return `${parts[2].substring(0, 2)}/${parts[1]}/${parts[0]}`;
  }
  
  return dateStr;
}

export async function POST(request: NextRequest) {
  console.log('[Extract Names API] Starting extraction...');
  
  try {
    const { headers, rows } = await request.json();
    
    if (!headers || !rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    
    console.log(`[Extract Names API] Processing ${rows.length} rows with ${headers.length} columns`);
    console.log('[Extract Names API] Headers:', headers);
    
    // First, try to find columns using simple pattern matching (faster and more reliable)
    let nameColumn = findColumnByPattern(headers, NAME_PATTERNS);
    let dateColumn = findColumnByPattern(headers, DATE_PATTERNS);
    
    console.log('[Extract Names API] Pattern match - nameColumn:', nameColumn, 'dateColumn:', dateColumn);
    
    // If pattern matching didn't find columns, try Gemini AI
    if (!nameColumn || !dateColumn) {
      try {
        // Build a summary of the data for Gemini
        const sampleRows = rows.slice(0, 5).map((row: any, i: number) => {
          const rowData = row.data || row;
          return `שורה ${i + 1}: ${JSON.stringify(rowData)}`;
        }).join('\n');
        
        const prompt = `אתה מומחה בניתוח טבלאות.

כותרות הטבלה: ${headers.join(', ')}

דוגמה לשורות:
${sampleRows}

זהה את העמודות הבאות:
1. עמודת שם לקוח (מכילה שמות של אנשים)
2. עמודת תאריך (מכילה תאריכים)

החזר JSON בלבד:
{"nameColumn": "שם העמודה", "dateColumn": "שם העמודה"}

אם עמודה לא נמצאה, החזר null.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
            }),
          }
        );
        
        if (response.ok) {
          const geminiData = await response.json();
          let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log('[Extract Names API] AI response:', aiResponse);
          
          // Clean and parse response
          aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const aiMapping = JSON.parse(aiResponse);
          
          if (!nameColumn && aiMapping.nameColumn) nameColumn = aiMapping.nameColumn;
          if (!dateColumn && aiMapping.dateColumn) dateColumn = aiMapping.dateColumn;
        }
      } catch (aiError) {
        console.log('[Extract Names API] AI fallback error:', aiError);
        // Continue with pattern matching results
      }
    }
    
    // If still no columns found, use first two columns as fallback
    if (!nameColumn && headers.length > 0) {
      nameColumn = headers[0];
      console.log('[Extract Names API] Using first column as name:', nameColumn);
    }
    
    if (!dateColumn && headers.length > 1) {
      // Try to find a column that looks like it contains dates
      for (const header of headers) {
        const sampleValue = rows[0]?.data?.[header] || rows[0]?.[header];
        if (sampleValue) {
          const strVal = String(sampleValue);
          if (/\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}/.test(strVal) || typeof sampleValue === 'number') {
            dateColumn = header;
            console.log('[Extract Names API] Found date column by value:', dateColumn);
            break;
          }
        }
      }
    }
    
    console.log('[Extract Names API] Final mapping - nameColumn:', nameColumn, 'dateColumn:', dateColumn);
    
    // Extract data from rows
    const extractedRows: ExtractedRow[] = rows.map((row: any, index: number) => {
      const rowData = row.data || row;
      
      let customerName = '';
      let date = '';
      
      if (nameColumn && rowData[nameColumn] !== undefined) {
        customerName = String(rowData[nameColumn] || '').trim();
      }
      
      if (dateColumn && rowData[dateColumn] !== undefined) {
        date = formatDate(rowData[dateColumn]);
      }
      
      return {
        customerName,
        date,
        rowIndex: index + 1,
      };
    });
    
    // Filter out empty rows
    const validRows = extractedRows.filter(r => r.customerName || r.date);
    
    console.log(`[Extract Names API] Extracted ${validRows.length} valid rows`);
    
    if (validRows.length === 0) {
      // Return all rows with whatever data we have
      return NextResponse.json({
        success: true,
        columnMapping: { nameColumn, dateColumn },
        rows: extractedRows,
        totalRows: rows.length,
      });
    }
    
    return NextResponse.json({
      success: true,
      columnMapping: { nameColumn, dateColumn },
      rows: validRows,
      totalRows: rows.length,
    });
    
  } catch (error) {
    console.error('[Extract Names API] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
