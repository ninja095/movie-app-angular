import {Component, input, output} from '@angular/core';
import {MovieDetails} from '../../interfaces/Movie';
import {TmdbImagePipe} from '../../pipes/tmdb-image.pipe';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [
    TmdbImagePipe,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  movie = input<MovieDetails | undefined>();
  close = output<void>();

  // readonly genresList = computed(() =>
  //   this.movie() ? this.movie()!.genres.map(g => g.name).join(', ') : ''
  // );
}
