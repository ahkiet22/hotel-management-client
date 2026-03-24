import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about-page',
  imports: [],
  templateUrl: './about.component.html',
})
export class AboutPageComponent {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}
  ngOnInit(): void {
    this.title.setTitle('About Us | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content:
        'Learn more about Paradise Hotel, our mission, values and commitment to delivering luxury hotel experiences.',
    });
  }
}
