import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-page',
  imports: [],
  templateUrl: './contact.component.html',
})
export class ContactPageComponent {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}
  ngOnInit(): void {
    this.title.setTitle('Contact Us | Paradise Hotel');

    this.meta.updateTag({
      name: 'description',
      content:
        'Contact Paradise Hotel for bookings, support or inquiries. We are here to assist you anytime.',
    });
  }
}
