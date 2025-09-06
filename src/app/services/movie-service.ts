import {inject, Injectable, signal} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Movie, MovieDetails, MovieResponse} from '../interfaces/Movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);

  private apiUrl = 'https://api.themoviedb.org/3';
  private apiKey = 'f43d35a1eef997efb796523ca6808ffb'; // Понятное дело что в реальном приложении так нельзя, но для тестового задания сойдёт))

  filteredMovies = signal<Movie[]>([]);
  currentPage = signal<number>(1);
  hasMore = signal<boolean>(true);

  reset() {
    this.filteredMovies.set([]);
    this.currentPage.set(1);
    this.hasMore.set(true);
  }

  setMovies(movies: Movie[]) {
    this.filteredMovies.set(movies);
  }

  addMovies(movies: Movie[]) {
    this.filteredMovies.update(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newUniqueMovies = movies.filter(movie => !existingIds.has(movie.id));
      return [...prev, ...newUniqueMovies];
    });
  }
  getMovieById(id: number): Observable<MovieDetails> {
    return this.http.get<MovieDetails>(`${this.apiUrl}/movie/${id}`, {
      params: this.getParams(),
    });
  }

  getPopularMovies(page = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: this.getParams().set('page', page),
    });
  }

  searchMovies(query: string, page = 1): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(`${this.apiUrl}/search/movie`, {
      params: this.getParams().set('query', query).set('page', page),
    });
  }

  private getParams(): HttpParams {
    return new HttpParams().set('api_key', this.apiKey).set('language', 'ru-RU');
  }
}
