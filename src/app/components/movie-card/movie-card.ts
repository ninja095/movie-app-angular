import { Component, input } from '@angular/core';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';
import { DatePipe } from '@angular/common';
import {Movie} from '../../interfaces/Movie';

@Component({
  selector: 'app-movie-card',
  imports: [TmdbImagePipe, DatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCard {
    movie = input<Movie | null | undefined>();
}
