import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tmdbImage',
  standalone: true
})
export class TmdbImagePipe implements PipeTransform {
  transform(
    path: string | null, 
    size: 'w200' | 'w500' | 'original' = 'w500'
): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/placeholder.jpg';
  }
}