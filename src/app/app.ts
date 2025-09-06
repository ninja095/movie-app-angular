import {CommonModule} from '@angular/common';
import {Component, DestroyRef, inject, signal} from '@angular/core';
import {MovieCard} from './components/movie-card/movie-card';
import {Modal} from './components/modal/modal';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MovieDetails, MovieResponse} from './interfaces/Movie';
import {MovieService} from './services/movie-service';
import {debounceTime, startWith, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [CommonModule, MovieCard, FormsModule, Modal, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  private movieService = inject(MovieService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly filteredMovies = this.movieService.filteredMovies;
  readonly selectedMovie = signal<MovieDetails | undefined>(undefined);
  readonly hasMore = this.movieService.hasMore;

  searchForm = this.formBuilder.group({
    title: ['']
  });

  isLoading = signal(false);

  constructor() {
    this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.getRawValue()),
      debounceTime(300),
      switchMap(formValue => {
        const query = formValue.title?.trim() ?? '';
        this.movieService.reset();
        this.isLoading.set(true);

        if (query) {
          return this.movieService.searchMovies(query, 1);
        } else {
          return this.movieService.getPopularMovies(1);
        }
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: (response: MovieResponse) => {
        this.movieService.setMovies(response.results);
        this.movieService.currentPage.set(response.page);
        this.movieService.hasMore.set(response.page < response.total_pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при загрузке фильмов:', err);
        this.movieService.setMovies([]);
        this.isLoading.set(false);
      }
    });
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;

    if (atBottom) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;

    const currentPage = this.movieService.currentPage();
    const query = this.searchForm.value.title?.trim() ?? '';

    this.isLoading.set(true);

    const request$ = query
      ? this.movieService.searchMovies(query, currentPage + 1)
      : this.movieService.getPopularMovies(currentPage + 1);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: MovieResponse) => {
        this.movieService.addMovies(response.results);
        this.movieService.currentPage.set(response.page);
        this.movieService.hasMore.set(response.page < response.total_pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Ошибка при подгрузке фильмов:', err);
        this.isLoading.set(false);
      }
    });
  }

  openMovieDetails(movieId: number): void {
    this.movieService.getMovieById(movieId).subscribe({
      next: (res: MovieDetails) => this.selectedMovie.set(res),
      error: (err) => console.error('Ошибка загрузки деталей фильма:', err)
    });
  }
}
