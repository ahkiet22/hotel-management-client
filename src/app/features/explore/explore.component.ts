import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from 'src/app/libs/ui/button/src';

@Component({
  selector: 'app-explore-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ...HlmButtonImports],
  templateUrl: './explore.component.html',
})
export class ExplorePageComponent {
  assets = {
    video: 'https://www.figma.com/api/mcp/asset/9add3b1a-4578-4733-a568-70723b01c762',
    playBtn: 'https://www.figma.com/api/mcp/asset/8a7b7384-57a5-465b-84d2-175f0f9038b8',
    item1: 'https://www.figma.com/api/mcp/asset/88c854b5-22c5-41c3-96c2-c8c6cda39441',
    item2: 'https://www.figma.com/api/mcp/asset/653bab33-aab6-40e9-91ab-142039a74854',
    item3: 'https://www.figma.com/api/mcp/asset/dce897f4-b0a6-4e6e-bfef-c753306871bc',
    logo: 'https://www.figma.com/api/mcp/asset/fd641deb-6a79-4ae2-be87-1914147a6153',
  };
}

