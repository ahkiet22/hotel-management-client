import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Pause, Play } from 'lucide-angular';
import { HlmButton } from '@spartan-ng/helm/button';
import { Meta, Title } from '@angular/platform-browser';

type TourHighlight = {
  title: string;
  description: string;
  image: string;
  eyebrow: string;
};

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, HlmButton],
  templateUrl: './explore.component.html',
})
export class ExplorePageComponent {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  assets = {
    video: 'assets/videos/4185240-hd_1920_1080_25fps.mp4',
    poster: 'assets/images/video.jpg',
  };

  highlights: TourHighlight[] = [
    {
      eyebrow: 'Rooms & Suites',
      title: 'Luxurious rooms',
      description:
        'Step through thoughtfully designed rooms with warm materials, comfortable bedding, and a calm visual language tailored for rest.',
      image: 'assets/images/pic-1.jpg',
    },
    {
      eyebrow: 'Arrival Experience',
      title: 'Elegant social spaces',
      description:
        'From lobby arrival to shared lounge moments, the hotel experience is shaped around comfort, movement, and refined service.',
      image: 'assets/images/hero.jpg',
    },
    {
      eyebrow: 'Signature Moments',
      title: 'Relaxed day-to-night atmosphere',
      description:
        'Discover the tone of Paradise Hotel through spaces curated for quiet mornings, slow afternoons, and memorable evening stays.',
      image: 'assets/images/video.jpg',
    },
  ];

  icons = {
    Play,
    Pause,
  };

  isPlaying = signal(false);

  ngOnInit(): void {
    this.title.setTitle('Explore Luxury Hotels & Experiences | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content: 'Explore premium hotels, luxury rooms and unique experiences with Paradise Hotel.',
    });

    this.meta.updateTag({
      name: 'keywords',
      content: 'explore hotels, luxury experience, Paradise Hotel',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: 'Explore Luxury Hotels | Paradise Hotel',
    });

    this.meta.updateTag({
      property: 'og:description',
      content: 'Discover premium hotels and experiences with Paradise Hotel.',
    });

    this.meta.updateTag({
      property: 'og:image',
      content: this.assets.poster,
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: 'Explore Hotels | Paradise Hotel',
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: 'Discover luxury hotels and experiences.',
    });
  }

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
