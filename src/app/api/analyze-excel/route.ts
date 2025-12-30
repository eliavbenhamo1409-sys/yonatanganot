import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedReceipt {
  customerName: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
  rowNumber: number;
  isComplete: boolean;
  missingFields: string[];
}

export interface AnalysisResult {
  success: boolean;
  receipts: ExtractedReceipt[];
  summary: {
    totalRows: number;
    completeRows: number;
    incompleteRows: number;
    totalAmount: number;
    dateRange: { from: string; to: string };
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { headers, rows, businessInfo } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    // שליחת הנתונים ל-AI לניתוח
    const prompt = `אתה מומחה בניתוח נתונים פיננסיים. קיבלת טבלת נתונים מקובץ אקסל והמשימה שלך היא לחלץ קבלות.

כותרות העמודות: ${JSON.stringify(headers)}

הנתונים (עד 200 שורות ראשונות):
${JSON.stringify(rows.slice(0, 200), null, 2)}

צור JSON עם המבנה הבא:
{
  "receipts": [
    {
      "customerName": "שם הלקוח",
      "amount": 100.00,
      "date": "DD/MM/YYYY",
      "description": "תיאור השירות/מוצר",
      "paymentMethod": "מזומן/אשראי/העברה/צ'ק/bit",
      "notes": "הערות נוספות אם יש",
      "rowNumber": 1,
      "isComplete": true,
      "missingFields": []
    }
  ],
  "summary": {
    "totalRows": 10,
    "completeRows": 9,
    "incompleteRows": 1,
    "totalAmount": 5000.00,
    "dateRange": { "from": "01/12/2025", "to": "31/12/2025" }
  }
}

כללים חשובים:
1. זהה את העמודות הנכונות לפי התוכן שלהן, לא רק לפי השם
2. אם שורה היא כותרת סיכום (למשל "סה"כ הכנסות") - דלג עליה
3. אם שדה חסר באמת (עמודה ריקה) - סמן isComplete: false והוסף את השדה ל-missingFields
4. אם יש סכומים עם מע"מ - השתמש בסכום הכולל
5. נרמל תאריכים לפורמט DD/MM/YYYY
6. נרמל סכומים למספרים (הסר סימני מטבע)
7. זהה שם לקוח גם אם הוא בעמודה לא צפויה
8. החזר רק JSON תקין, ללא טקסט נוסף`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction expert. Always respond with valid JSON only, no markdown or additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 16000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    let result: AnalysisResult;
    try {
      const parsed = JSON.parse(content);
      result = {
        success: true,
        receipts: parsed.receipts || [],
        summary: parsed.summary || {
          totalRows: rows.length,
          completeRows: 0,
          incompleteRows: 0,
          totalAmount: 0,
          dateRange: { from: '', to: '' }
        }
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

