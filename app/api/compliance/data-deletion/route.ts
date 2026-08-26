import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Meta User Data Deletion Request Callback (Mandatory for Meta App Review)
 */
export async function POST(req: NextRequest) {
  const confirmationCode = crypto.randomBytes(8).toString('hex');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    url: `${appUrl}/api/compliance/data-deletion/status?id=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
