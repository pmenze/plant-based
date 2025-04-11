import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { createApi } from 'unsplash-js';

// Define interfaces for Unsplash API responses
interface UnsplashSearchResponse {
  results: {
    urls: {
      small: string;
      thumb: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FoodImageService {
  private readonly STORAGE_KEY = 'food_images_data';
  private imageCache: Record<string, string> = {}; // Cache now stores base64 image data
  
  // Unsplash API configuration
  private readonly UNSPLASH_ACCESS_KEY = 'Wyorvk1lvkJnA-lC24Oe_v4FqYXll5JsDqGEbweU3rU'; // Replace with your Unsplash access key
  private unsplashApi = createApi({
    accessKey: this.UNSPLASH_ACCESS_KEY
  });

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  /**
   * Get an image for a food item as a data URL
   * If the image is already cached, return it
   * Otherwise, fetch a new image, convert to data URL, and cache it
   */
  getImageForFood(foodName: string): Observable<string> {
    // Check if we already have this image cached as base64 data
    if (this.imageCache[foodName]) {
      return of(this.imageCache[foodName]);
    }
    
    // Otherwise, fetch a new image and convert it to base64
    return this.fetchFoodImage(foodName).pipe(
      switchMap(imageUrl => {
        if (!imageUrl) {
          return of('');
        }
        // Convert the image URL to a base64 data URL
        return this.convertImageToBase64(imageUrl).pipe(
          tap(base64Data => {
            // Cache the base64 image data
            this.imageCache[foodName] = base64Data;
            this.saveToStorage();
          })
        );
      })
    );
  }
  
  /**
   * Convert an image URL to a base64 data URL
   */
  private convertImageToBase64(imageUrl: string): Observable<string> {
    return new Observable<string>(observer => {
      // Create an image element to load the image
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle CORS issues
      
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert the canvas to a data URL
          const dataURL = canvas.toDataURL('image/jpeg');
          observer.next(dataURL);
          observer.complete();
        } else {
          observer.error('Could not get canvas context');
        }
      };
      
      img.onerror = () => {
        console.error('Error loading image:', imageUrl);
        observer.error('Error loading image');
      };
      
      // Start loading the image
      img.src = imageUrl;
    }).pipe(
      catchError(error => {
        console.error('Error converting image to base64:', error);
        return of('');
      })
    );
  }

  /**
   * Fetch a food image from Unsplash API
   */
  private fetchFoodImage(foodName: string): Observable<string> {
    // In a production app, you would need to provide your own Unsplash access key
    // For demonstration purposes, we'll use the Unsplash API with a fallback to a placeholder
    
    // This is how you would make a real API call to Unsplash using the SDK:
    if (this.UNSPLASH_ACCESS_KEY == 'Wyorvk1lvkJnA-lC24Oe_v4FqYXll5JsDqGEbweU3rU') {
      // Only make the API call if a real access key is provided
      return from(this.unsplashApi.search.getPhotos({
        query: `${foodName}`,
        perPage: 1,
        orientation: 'squarish'
      })).pipe(
        map(result => {
          if (result.response && result.response.results.length > 0) {
            // Use the small or thumbnail image for better performance
            return result.response.results[0].urls.thumb;
          }
          throw new Error('No images found');
        }),
        catchError(error => {
          console.error('Error fetching image from Unsplash:', error);
          return of('');
        })
      );
    }
    
    return of('');
  }
  
  /**
   * Generate a consistent random seed for a food name
   */
  private getRandomSeed(foodName: string): string {
    let hash = 0;
    for (let i = 0; i < foodName.length; i++) {
      hash = ((hash << 5) - hash) + foodName.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Load cached images from localStorage
   */
  private loadFromStorage(): void {
    const storedImages = localStorage.getItem(this.STORAGE_KEY);
    if (storedImages) {
      this.imageCache = JSON.parse(storedImages);
    }
  }

  /**
   * Save cached images to localStorage
   */
  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.imageCache));
  }
}
