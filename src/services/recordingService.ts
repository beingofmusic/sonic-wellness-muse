import { supabase } from '@/integrations/supabase/client';
import { PracticeRecording, RecordingFormData } from '@/types/recording';

export const recordingService = {
  async uploadRecording(
    audioBlob: Blob, 
    userId: string, 
    formData: RecordingFormData,
    durationSeconds: number,
    sessionId?: string
  ): Promise<PracticeRecording> {
    console.log('Starting upload process...', { 
      blobSize: audioBlob.size, 
      blobType: audioBlob.type, 
      userId, 
      durationSeconds,
      formData 
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `recording_${userId}_${timestamp}.webm`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading to storage...', { fileName, filePath });

    // Upload audio file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('practice_recordings')
      .upload(filePath, audioBlob, {
        contentType: audioBlob.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload recording: ${uploadError.message}`);
    }

    console.log('Storage upload successful:', uploadData);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('practice_recordings')
      .getPublicUrl(filePath);

    console.log('Got public URL:', publicUrl);

    // Use the actual duration passed from the recorder
    const actualDuration = durationSeconds > 0 ? durationSeconds : Math.floor(audioBlob.size / 16000);

    console.log('Inserting metadata to database...', {
      user_id: userId,
      title: formData.title,
      recording_url: publicUrl,
      notes: formData.notes || null,
      tags: formData.tags || [],
      duration_seconds: actualDuration
    });

    // Save recording metadata to database
    const { data: recordingData, error: dbError } = await supabase
      .from('practice_recordings')
      .insert({
        user_id: userId,
        session_id: sessionId || null,
        title: formData.title,
        recording_url: publicUrl,
        notes: formData.notes || null,
        tags: formData.tags || [],
        duration_seconds: actualDuration
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('practice_recordings')
        .remove([filePath]);
      
      throw new Error(`Failed to save recording metadata: ${dbError.message}`);
    }

    console.log('Database insert successful:', recordingData);
    return recordingData;
  },

  async fetchUserRecordings(userId: string): Promise<PracticeRecording[]> {
    const { data, error } = await supabase
      .from('practice_recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recordings: ${error.message}`);
    }

    return data || [];
  },

  async deleteRecording(recordingId: string): Promise<void> {
    // First get the recording to find the file path
    const { data: recording, error: fetchError } = await supabase
      .from('practice_recordings')
      .select('recording_url, user_id')
      .eq('id', recordingId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch recording: ${fetchError.message}`);
    }

    // Extract file path from URL
    const urlParts = recording.recording_url.split('/practice_recordings/');
    const filePath = urlParts[1];

    if (filePath) {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('practice_recordings')
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete recording file:', storageError.message);
      }
    }

    // Delete metadata from database
    const { error: dbError } = await supabase
      .from('practice_recordings')
      .delete()
      .eq('id', recordingId);

    if (dbError) {
      throw new Error(`Failed to delete recording: ${dbError.message}`);
    }
  },

  async updateRecording(
    recordingId: string, 
    updates: Partial<RecordingFormData>
  ): Promise<PracticeRecording> {
    const { data, error } = await supabase
      .from('practice_recordings')
      .update({
        title: updates.title,
        notes: updates.notes,
        tags: updates.tags
      })
      .eq('id', recordingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recording: ${error.message}`);
    }

    return data;
  }
};