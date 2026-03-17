import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Pause, Play } from 'lucide-angular';
import { HlmButton } from '@spartan-ng/helm/button';


@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HlmButton],
  templateUrl: './explore.component.html',
})
export class ExplorePageComponent {
  assets = {
    video: 'assets/videos/4185240-hd_1920_1080_25fps.mp4',
    poster: 'assets/images/video.jpg',
    playBtn: 'https://www.figma.com/api/mcp/asset/8a7b7384-57a5-465b-84d2-175f0f9038b8',
    pauseBtn: 'assets/images/pause-icon.png',
    item1: 'https://www.figma.com/api/mcp/asset/88c854b5-22c5-41c3-96c2-c8c6cda39441',
    item2: 'https://www.figma.com/api/mcp/asset/653bab33-aab6-40e9-91ab-142039a74854',
    item3: 'https://www.figma.com/api/mcp/asset/dce897f4-b0a6-4e6e-bfef-c753306871bc',
    logo: 'https://www.figma.com/api/mcp/asset/fd641deb-6a79-4ae2-be87-1914147a6153',
  };

  icons = {
    Play,
    Pause,
  };

  // @ViewChild('myVideo') videoRef!: ElementRef<HTMLVideoElement>;

  isPlaying = signal(false);

  // ngAfterViewInit() {
  //   const video = this.videoRef.nativeElement;
  //   this.isPlaying.set(!video.paused);
  // }

  toggleVideo(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  onPlay() {
    this.isPlaying.set(true);
  }

  onPause() {
    this.isPlaying.set(false);
  }
}
