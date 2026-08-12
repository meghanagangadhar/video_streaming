// import { Injectable } from '@angular/core';
// import { MeetingInfo } from '../models/meeting.model';
// import { LiveKitProviderService } from './providers/livekit-provider.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProviderService {

//   constructor(
//     private liveKitProvider: LiveKitProviderService
//   ) {}

//   /**
//    * Returns the current provider.
//    *
//    * Today it is LiveKit.
//    *
//    * Tomorrow it could be:
//    * - Prav.app
//    * - Twilio
//    * - TokBox
//    *
//    * Meeting Component never changes.
//    */
//   getProvider() {
//     return this.liveKitProvider;
//   }

//   /**
//    * Join Meeting.
//    *
//    * Meeting component calls this.
//    *
//    * ProviderService forwards the request
//    * to LiveKitProviderService.
//    */
//   async joinMeeting(meeting: MeetingInfo): Promise<void> {
//     return this.liveKitProvider.joinMeeting(meeting);
//   }

// }