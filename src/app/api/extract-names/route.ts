import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBS2uNo-oOvINIBfT3p8xcwsv-hIZYuG6w';

interface ExtractedRow {
  customerName: string;
  date: string;
  rowIndex: number;
}

export async function POST(request: NextRequest) {
  console.log('[Extract Names API] Starting extraction...');
  
  try {
    const { headers, rows } = await request.json();
    
    if (!headers || !rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    
    console.log(`[Extract Names API] Processing ${rows.length} rows with ${headers.length} columns`);
    
    // Build a summary of the data for Gemini
    const sampleRows = rows.slice(0, 10).map((row: any, i: number) => {
      if (row.data) {
        return `שורה ${i + 1}: ${JSON.stringify(row.data)}`;
      }
      return `שורה ${i + 1}: ${JSON.stringify(row)}`;
    }).join('\n');
    
    const prompt = `אתה מומחה בניתוח טבלאות אקסל.

קיבלת טבלה עם הכותרות הבאות:
${headers.join(', ')}

דוגמה לשורות הראשונות:
${sampleRows}

המשימה שלך:
1. זהה את העמודה שמכילה שמות לקוחות (יכול להיות: שם, שם לקוח, לקוח, name, customer, וכו')
2. זהה את העמודה שמכילה תאריכים (יכול להיות: תאריך, date, וכו')

החזר תשובה בפורמט JSON בלבד (ללא טקסט נוסף):
{
  "nameColumn": "שם העמודה שמכילה שמות",
  "dateColumn": "שם העמודה שמכילה תאריכים"
}

אם לא מצאת עמודה מסוימת, החזר null עבורה.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Extract Names API] Gemini error:', errorText);
      throw new Error('AI analysis failed');
    }
    
    const geminiData = await response.json();
    let aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('[Extract Names API] AI response:', aiResponse);
    
    // Parse AI response
    let columnMapping: { nameColumn: string | null; dateColumn: string | null };
    try {
      // Clean the response
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      columnMapping = JSON.parse(aiResponse);
    } catch (e) {
      console.error('[Extract Names API] Failed to parse AI response, using fallback');
      // Fallback: try to find columns by common names
      columnMapping = {
        nameColumn: headers.find((h: string) => 
          /שם|לקוח|name|customer/i.test(h)
        ) || null,
        dateColumn: headers.find((h: string) => 
          /תאריך|date/i.test(h)
        ) || null,
      };
    }
    
    console.log('[Extract Names API] Column mapping:', columnMapping);
    
    // Extract data from rows
    const extractedRows: ExtractedRow[] = rows.map((row: any, index: number) => {
      const rowData = row.data || row;
      
      let customerName = '';
      let date = '';
      
      if (columnMapping.nameColumn) {
        customerName = String(rowData[columnMapping.nameColumn] || '').trim();
      }
      
      if (columnMapping.dateColumn) {
        const rawDate = rowData[columnMapping.dateColumn];
        if (rawDate) {
          // Try to format date
          if (typeof rawDate === 'number') {
            // Excel date serial number
            const excelDate = new Date((rawDate - 25569) * 86400 * 1000);
            date = `${excelDate.getDate().toString().padStart(2, '0')}/${(excelDate.getMonth() + 1).toString().padStart(2, '0')}/${excelDate.getFullYear()}`;
          } else {
            date = String(rawDate).trim();
          }
        }
      }
      
      return {
        customerName,
        date,
        rowIndex: index + 1,
      };
    });
    
    // Filter out rows without name or date
    const validRows = extractedRows.filter(r => r.customerName || r.date);
    
    console.log(`[Extract Names API] Extracted ${validRows.length} valid rows`);
    
    return NextResponse.json({
      success: true,
      columnMapping,
      rows: validRows,
      totalRows: rows.length,
    });
    
  } catch (error) {
    console.error('[Extract Names API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
