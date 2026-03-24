import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Home, ArrowLeft } from 'lucide-angular';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent implements OnInit {
  icons = {
    Home,
    ArrowLeft,
  };

  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Page Not Found - Paradise Hotel');
    this.meta.addTags([
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: 'The page you are looking for does not exist.' },
    ]);
  }
}
