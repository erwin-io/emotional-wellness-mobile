import { AfterViewInit, EventEmitter, Output } from '@angular/core';
import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MoodEntityEnum } from 'src/app/core/enums/mood-entity.enum';
import Swiper, {SwiperOptions} from "swiper";
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-emoji-face-slider',
  templateUrl: './emoji-face-slider.component.html',
  styleUrls: ['./emoji-face-slider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmojiFaceSliderComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer: SwiperContainer;

  swiper;
  mood = ['1','2','3','4','5']
  isTouching = false;
  
  @Output() onActiveIndexChange: EventEmitter<any> = new EventEmitter();
  constructor() {}
  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.swiperContainer.swiper = new Swiper('.swiper-container', {
      initialSlide: -1,
      slidesPerView: 1,
      centeredSlides: true,
      allowTouchMove: true,
      grabCursor: true
    });
    this.setSelected("0");
  }

  setSelected(moodEntityId) {
    const index = this.mood.findIndex(x=>x.trim() === moodEntityId);
    this.swiperContainer.swiper.slideTo(index);
  }

  activeIndexChange(event) {
    const data = { moodEntityId: this.mood[event.detail[0].activeIndex] };
    console.log(data);
    this.onActiveIndexChange.emit(data)
  }

}
