
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  AfterViewChecked
} from '@angular/core';

import { Router } from '@angular/router';

import { NgClass } from '@angular/common';

import { TokenService } from '../../services/token.service';

import { LiveKitProviderService } from '../../services/providers/livekit-provider.service';

import { MeetingInfo } from '../../models/meeting.model';

import { environment } from '../../environment/environment';


@Component({

  selector: 'app-meeting',

  standalone: true,

  imports: [NgClass],

  templateUrl: './meeting.html',

})

export class Meeting implements OnInit, AfterViewChecked {

  candidateName = '';

  roomId = '';

  token = '';



  @ViewChild('localVideo')
  localVideo!: ElementRef<HTMLVideoElement>;



  constructor(

    private tokenService: TokenService,

    private router: Router,

    public provider: LiveKitProviderService,

  ) {}



  ngOnInit() {


    const state = history.state;

    // Store participant name.
    this.candidateName = state.candidateName;

    // Store room id.
    this.roomId = state.roomId;



    // Ask backend to generate JWT token.
    this.tokenService

      // Send room id and participant identity.
      .getToken(this.roomId, this.candidateName)

      // Wait for backend response.
      .subscribe(async (response) => {

        // Store JWT token.
        this.token = response.token;



        // Create meeting object.
        const meeting: MeetingInfo = {

          // Participant name.
          candidateName: this.candidateName,

          // Meeting room.
          roomId: this.roomId,

          // JWT Token.
          token: this.token,

          // LiveKit Cloud URL.
          liveKitUrl: environment.livekitUrl,

        };



        // Connect to LiveKit room.
        //
        // This internally:
        //
        // Creates Room
        // Connects
        // Registers events
        // Waits for participants
        //
        await this.provider.joinMeeting(meeting);

      });

  }




  ngAfterViewChecked() {

    // Get all remote participants.
    const participants = this.provider.remoteParticipants();



    // Loop through every participant.
    for (const participant of participants) {

      // Only continue if participant already has
      // a video element.
      if (participant.videoElement) {

        // Find corresponding HTML container.
    
    
        const container = document.querySelector(

          `[data-identity="${participant.identity}"]`

        ) as HTMLElement;



        // If container exists
        // AND
        // Video not already attached
        if (

          container &&

          container.children.length === 0

        ) {

          // Put LiveKit video inside HTML.
          container.appendChild(participant.videoElement);

        }

      }

    }

  }



  /**
   * Camera button clicked.
   */
  camera() {


    this.provider.toggleCamera(

      this.localVideo.nativeElement

    );

  }



  microphone() {

    // Enable or disable microphone.
    this.provider.toggleMicrophone();

  }



  shareScreen() {

    // Enable or disable screen sharing.
    this.provider.toggleScreenShare();

  }



  
  leave() {

    this.provider.leaveMeeting();

    this.router.navigate(['/']);

  }

}