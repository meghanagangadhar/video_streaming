// import { Injectable } from '@angular/core';
// import { ProviderService } from './provider.service';
// import { MeetingInfo } from '../models/meeting.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class WebRtcBlackboxService {

//   constructor(
//     private providerService: ProviderService
//   ) {}

//     /**
//    * Join a meeting.
//    * The Meeting Component calls only this method.
//    * It doesn't know which provider is used.
//    */
//   async joinMeeting(meeting: MeetingInfo): Promise<void> {

//     // Ask ProviderService which provider to use
//     const provider = this.providerService.getProvider();

//     // Call the provider's joinMeeting()
//     await provider.joinMeeting(meeting);

//   }

//   /**
//    * Leave the meeting.
//    */
//   async leaveMeeting(): Promise<void> {

//     const provider = this.providerService.getProvider();

//     await provider.leaveMeeting();

//   }

// }