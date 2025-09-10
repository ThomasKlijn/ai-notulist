import { NextRequest, NextResponse } from 'next/server';
import { MeetingProcessingService } from '../../../../../server/processingService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log(`🔄 Manual reprocessing triggered for meeting: ${id}`);
    
    const processingService = new MeetingProcessingService();
    await processingService.processMeeting(id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Meeting ${id} reprocessed successfully` 
    });
  } catch (error: any) {
    console.error('❌ Error during reprocessing:', error);
    return NextResponse.json({ 
      error: 'Reprocessing failed', 
      details: error.message 
    }, { status: 500 });
  }
}