import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  Info,
} from 'lucide-angular';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomePageComponent implements OnInit {
  private router = inject(Router);

  // Booking signals
  checkIn = signal<string>('');
  checkOut = signal<string>('');
  adults = signal<number>(1);
  children = signal<number>(0);

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
    Info,
  };

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Paradise Hotel - Luxury Hotel Booking & Best Deals');

    // Default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.checkIn.set(today.toISOString().split('T')[0]);
    this.checkOut.set(tomorrow.toISOString().split('T')[0]);

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

  onSearch() {
    this.router.navigate(['/booking'], {
      queryParams: {
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        adults: this.adults(),
        children: this.children(),
      },
    });
  }
}
