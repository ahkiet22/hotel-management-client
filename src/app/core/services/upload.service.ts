import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '@core/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/upload`;

  /**
   * Upload multiple images
   */
  uploadImages(files: File[] | FileList): Observable<string[]> {
    const formData = new FormData();
    if (files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
    } else {
      files.forEach(file => {
        formData.append('images', file);
      });
    }

    return this.http
      .post<ApiResponse<{ message: string; urls: string[] }>>(`${this.baseUrl}images`, formData)
      .pipe(map(res => res.data.urls));
  }

  /**
   * Upload images and connect to a room type in one go
   */
  uploadRoomTypeImages(roomTypeId: string, files: File[] | FileList): Observable<string[]> {
    const formData = new FormData();
    formData.append('roomTypeId', roomTypeId);
    
    if (files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
    } else {
      files.forEach(file => {
        formData.append('images', file);
      });
    }

    return this.http
      .post<ApiResponse<{ message: string; urls: string[]; roomTypeId: string }>>(
        `${this.baseUrl}room-type-images`,
        formData
      )
      .pipe(map(res => res.data.urls));
  }
}
