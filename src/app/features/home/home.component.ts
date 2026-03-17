import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  LucideAngularModule,
  Play,
  MapPin,
  Users,
  Calendar,
  Wifi,
  Waves,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Coffee,
  Dumbbell,
  Gamepad2,
  Lightbulb,
  WashingMachine,
  Car,
} from 'lucide-angular';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './home.component.html',
})
export class HomePageComponent implements OnInit {
  hotels: any[] = [];
  categories: any[] = [];

  icons = {
    Play,
    MapPin,
    Users,
    Calendar,
    Wifi,
    Waves,
    Star,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Coffee,
    Dumbbell,
    Gamepad2,
    Lightbulb,
    WashingMachine,
    Car,
  };

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Paradise Hotel - Luxury Hotel Booking & Best Deals');

    this.meta.addTags([
      {
        name: 'description',
        content:
          'Paradise Hotel - Book luxury hotels, resorts and villas with the best prices. Enjoy premium services and exclusive deals.',
      },
      {
        name: 'keywords',
        content: 'Paradise Hotel, hotel booking, luxury hotel, resort, villa, travel Vietnam',
      },
      {
        name: 'author',
        content: 'Paradise Hotel',
      },
    ]);

    // Open Graph (Facebook, Zalo)
    this.meta.addTags([
      {
        property: 'og:title',
        content: 'Paradise Hotel - Best Hotel Booking Platform',
      },
      {
        property: 'og:description',
        content: 'Discover luxury hotels and enjoy the best deals with Paradise Hotel.',
      },
      {
        property: 'og:image',
        content: 'https://yourdomain.com/Paradise-hotel-banner.jpg',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ]);

    // Twitter Card
    this.meta.addTags([
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Paradise Hotel - Luxury Hotel Booking',
      },
      {
        name: 'twitter:description',
        content: 'Book top hotels with the best prices at Paradise Hotel.',
      },
    ]);
  }
}
