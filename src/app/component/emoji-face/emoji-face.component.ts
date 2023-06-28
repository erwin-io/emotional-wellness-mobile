import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MoodEntityEnum } from 'src/app/core/enums/mood-entity.enum';

@Component({
  selector: 'app-emoji-face',
  templateUrl: './emoji-face.component.html',
  styleUrls: ['./emoji-face.component.scss']
})
export class EmojiFaceComponent implements OnInit {
  @Input("moodEntityId") moodEntityId: string = MoodEntityEnum.I_AM_GOOD.toString();
  @Input("scale") scale: number | string = 1;
  constructor() { }

  get emotion() {
    if(this.moodEntityId === MoodEntityEnum.AMAZING.toString()) {
      return "amazing";
    } else if(this.moodEntityId === MoodEntityEnum.FEELING_HAPPY.toString()) {
      return "happy";
    } else if(this.moodEntityId === MoodEntityEnum.I_AM_GOOD.toString()) {
      return "normal";
    } else if(this.moodEntityId === MoodEntityEnum.FEELING_SAD.toString()) {
      return "sad";
    } else if(this.moodEntityId === MoodEntityEnum.ANGRY.toString()) {
      return "angry";
    } else {
      return "normal";
    }
  }

  ngOnInit() {
    console.log(this.moodEntityId);
  }

}
