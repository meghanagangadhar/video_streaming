
import { Injectable, signal } from '@angular/core';

import {
  Room,                     
  RoomEvent,                 
  RemoteParticipant,         
  RemoteTrackPublication,    
  RemoteTrack,               
  Track                      
} from 'livekit-client';

import { MeetingInfo } from '../../models/meeting.model';



export interface RemoteParticipantInfo {

  identity: string;

  videoElement: HTMLVideoElement | null;

  audioElement: HTMLAudioElement | null;

  // Whether participant's camera is ON.
  hasVideo: boolean;

  // Whether participant's microphone is ON.
  hasAudio: boolean;
}


@Injectable({
  providedIn: 'root',
})

export class LiveKitProviderService {

  /**
   * Represents the current LiveKit room.
   * This object controls the meeting.
   */
  private room!: Room;



  cameraEnabled = false;


  microphoneEnabled = false;


  screenSharing = false;


  /**
   * Stores all remote participants.
   * Signal automatically updates the UI whenever
   * this list changes.
   */
  remoteParticipants = signal<RemoteParticipantInfo[]>([]);



  /**
   * Connect to LiveKit meeting.
   */
  async joinMeeting(meeting: MeetingInfo) {

    try {

      console.log('Creating Room');

      // Create a new LiveKit Room object.
      this.room = new Room();



     
      // Event: Connected to room
     
      this.room.on(RoomEvent.Connected, () => {

        console.log('Connected');

        console.log(this.room.name);

        console.log(this.room.localParticipant.identity);

        // Check whether there are already participants
        // inside the room before we joined.
        this.room.remoteParticipants.forEach((participant) => {

          this.addRemoteParticipant(participant);

        });

      });



    
      // Someone joins the room.
      this.room.on(

        RoomEvent.ParticipantConnected,

        (participant: RemoteParticipant) => {

          console.log(participant.identity, 'joined');

          this.addRemoteParticipant(participant);

        }

      );

      // Someone leaves.
      this.room.on(

        RoomEvent.ParticipantDisconnected,

        (participant: RemoteParticipant) => {

          console.log(participant.identity, 'left');

          // Remove from UI.
          this.removeRemoteParticipant(

            participant.identity

          );

        }

      );


      // Audio/Video received.
      this.room.on(

        RoomEvent.TrackSubscribed,

        (

          track: RemoteTrack,

          publication: RemoteTrackPublication,

          participant: RemoteParticipant

        ) => {

          console.log(

            track.kind,

            participant.identity

          );

          // Handle received track.
          this.handleTrackSubscribed(

            track,

            participant

          );

        }

      );



      // Audio/Video removed.
      this.room.on(

        RoomEvent.TrackUnsubscribed,

        (

          track: RemoteTrack,

          publication: RemoteTrackPublication,

          participant: RemoteParticipant

        ) => {

          console.log(

            track.kind,

            participant.identity

          );

          // Remove video/audio from HTML.
          track.detach();

        }

      );



          // Room disconnected.
      this.room.on(

        RoomEvent.Disconnected,

        (reason) => {

          console.log(reason);

          // Clear participant list.
          this.remoteParticipants.set([]);

        }

      );



      console.log('Connecting...');

      // Connect to LiveKit Cloud.
      // Uses:
      // 1. LiveKit URL
      // 2. JWT Token
      await this.room.connect(

        meeting.liveKitUrl,

        meeting.token

      );

      console.log('Connected Successfully');

    }

    catch (error) {

      console.error(error);

    }

  }



  /**
   * Add participant into participant list.
   */
  private addRemoteParticipant(

    participant: RemoteParticipant

  ) {

    // Check whether participant already exists.
    const existing = this.remoteParticipants()

      .find(

        p => p.identity === participant.identity

      );

    // Don't add duplicate participant.
    if (existing) return;


    // Add new participant.
    this.remoteParticipants.update(list => [

      ...list,

      {

        identity: participant.identity,

        videoElement: null,

        audioElement: null,

        hasVideo: false,

        hasAudio: false,

      }

    ]);

  }



  /**
   * Remove participant from list.
   */
  private removeRemoteParticipant(identity: string) {

    this.remoteParticipants.update(

      list =>

        list.filter(

          p => p.identity !== identity

        )

    );

  }



  /**
   * Called whenever LiveKit sends
   * audio or video.
   */
  private handleTrackSubscribed(

    track: RemoteTrack,

    participant: RemoteParticipant

  ) {

    // If track is VIDEO.
    if (track.kind === Track.Kind.Video) {

      // Create HTML video element.
      const videoEl = track.attach() as HTMLVideoElement;

      // Style the video.
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'cover';

      // Save video element.
      this.remoteParticipants.update(

        list =>

          list.map(

            p =>

              p.identity === participant.identity

                ? {

                    ...p,

                    videoElement: videoEl,

                    hasVideo: true

                  }

                : p

          )

      );

      // Attach video to DOM container after a short delay
      setTimeout(() => {
        const container = document.querySelector(
          `[data-identity="${participant.identity}"]`
        ) as HTMLElement;
        if (container) {
          container.innerHTML = '';
          container.appendChild(videoEl);
        }
      }, 200);

    }



    // If track is AUDIO.
    if (track.kind === Track.Kind.Audio) {

      // Create HTML audio element.
      const audioEl = track.attach() as HTMLAudioElement;
      document.body.appendChild(audioEl);

      // Save audio element.
      this.remoteParticipants.update(

        list =>

          list.map(

            p =>

              p.identity === participant.identity

                ? {

                    ...p,

                    audioElement: audioEl,

                    hasAudio: true

                  }

                : p

          )

      );

    }

  }



  /**
   * Attach participant video
   * into HTML container.
   */
  attachRemoteVideo(

    identity: string,

    container: HTMLElement

  ) {

    // Find participant.
    const participant = this.remoteParticipants()

      .find(

        p => p.identity === identity

      );

    // If participant has video.
    if (participant?.videoElement) {

      // Clear old content.
      container.innerHTML = '';

      // Add video element.
      container.appendChild(

        participant.videoElement

      );

    }

  }



  /**
   * Turn Camera ON/OFF.
   */
  async toggleCamera(video: HTMLVideoElement) {

    try {

      // Toggle status.
      this.cameraEnabled = !this.cameraEnabled;

      // Tell LiveKit.
      await this.room.localParticipant.setCameraEnabled(

        this.cameraEnabled

      );

      // If camera turned OFF.
      if (!this.cameraEnabled) {

        console.log('Camera Disabled');

        return;

      }

      // Get local video track.
      const publications = Array.from(

        this.room.localParticipant.videoTrackPublications.values()

      );

      if (publications.length === 0) {

        console.log('No Video Track');

        return;

      }

      const track = publications[0].track;

      // Attach local camera to HTML video.
      if (track) {

        track.attach(video);

        console.log('Camera Started');

      }

    }

    catch (error) {

      // Restore previous state if error occurs.
      this.cameraEnabled = !this.cameraEnabled;

      console.error(error);

    }

  }



  /**
   * Turn microphone ON/OFF.
   */
  async toggleMicrophone() {

    try {

      this.microphoneEnabled = !this.microphoneEnabled;

      await this.room.localParticipant.setMicrophoneEnabled(

        this.microphoneEnabled

      );

    }

    catch (error) {

      this.microphoneEnabled = !this.microphoneEnabled;

      console.error(error);

    }

  }



  /**
   * Start/Stop screen sharing.
   */
  async toggleScreenShare() {

    try {

      this.screenSharing = !this.screenSharing;

      await this.room.localParticipant.setScreenShareEnabled(

        this.screenSharing

      );

    }

    catch (error) {

      this.screenSharing = !this.screenSharing;

      console.error(error);

    }

  }



  /**
   * Leave the meeting.
   */
  leaveMeeting() {

    // Check room exists.
    if (this.room) {

      // Disconnect from LiveKit.
      this.room.disconnect();

      // Clear participant list.
      this.remoteParticipants.set([]);

      // Reset statuses.
      this.cameraEnabled = false;
      this.microphoneEnabled = false;
      this.screenSharing = false;

      console.log('Meeting Left');

    }

  }

}