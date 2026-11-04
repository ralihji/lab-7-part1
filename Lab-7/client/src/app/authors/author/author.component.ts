import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {BooksService} from '../../books/service/books.service';
import {AuthorDetails, normalizeAuthorId} from '../model/author-details';

/** État de la recherche d'un auteur. */
export type AuthorStatus = 'loading' | 'found' | 'not-found' | 'invalid-id' | 'unreachable' | 'error';

/** État du chargement de la biographie (suivie avec le lien HATEOAS « bio »). */
export type BioStatus = 'loading' | 'loaded' | 'empty' | 'unavailable';

/**
 * Affiche l'auteur dont l'id est dans l'adresse (/authors/:id).
 * Requêtes : GET /books-api/authors/{id}, puis le lien « bio » de la réponse.
 */
@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.css'],
  standalone: true,
  imports: [RouterLink]
})
export class AuthorComponent implements OnInit, OnDestroy {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private booksService: BooksService = inject(BooksService);
  private paramSubscription?: Subscription;
  private authorSubscription?: Subscription;
  private bioSubscription?: Subscription;

  requestedId = '';
  status: AuthorStatus = 'loading';
  author: AuthorDetails | null = null;
  errorCode = 0;
  bioStatus: BioStatus = 'loading';
  biography = '';

  ngOnInit(): void {
    // paramMap émet à nouveau quand on passe de /authors/4 à /authors/5 (même composant).
    this.paramSubscription = this.route.paramMap.subscribe(
      params => this.loadAuthor(params.get('id') ?? '')
    );
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
    this.cancelRequests();
  }

  /** Prénom et nom de l'auteur trouvé. */
  get fullName(): string {
    return this.author ? `${this.author.firstName} ${this.author.lastName}`.trim() : '';
  }

  /** Message à afficher quand l'auteur n'est pas (encore) affiché. */
  get message(): string {
    switch (this.status) {
      case 'loading':
        return `Loading author ${this.requestedId}…`;
      case 'not-found':
        return `Sorry, no author was found with id ${this.requestedId}.`;
      case 'invalid-id':
        return `"${this.requestedId}" is not a valid author id. Please enter a whole number greater than 0.`;
      case 'unreachable':
        return 'Unable to reach the Books API. Make sure the server is running on http://localhost:8080.';
      case 'error':
        return `The server could not return author ${this.requestedId} (error ${this.errorCode}). Please try again.`;
      default:
        return '';
    }
  }

  loadAuthor(rawId: string): void {
    this.cancelRequests();
    this.author = null;
    this.errorCode = 0;
    this.biography = '';
    this.bioStatus = 'loading';

    const id = normalizeAuthorId(rawId);
    this.requestedId = id ?? rawId.trim();
    if (id === null) {
      this.status = 'invalid-id'; // aucune requête envoyée
      return;
    }

    this.status = 'loading';
    this.authorSubscription = this.booksService.getAuthor(id).subscribe({
      next: author => {
        this.author = author;
        this.status = 'found';
        this.loadBio(author);
      },
      error: (error: HttpErrorResponse) => this.showError(error)
    });
  }

  private loadBio(author: AuthorDetails): void {
    this.bioSubscription = this.booksService.getAuthorBio(author).subscribe({
      next: biodata => {
        this.biography = biodata.trim();
        this.bioStatus = this.biography ? 'loaded' : 'empty';
      },
      error: () => this.bioStatus = 'unavailable'
    });
  }

  private showError(error: HttpErrorResponse): void {
    this.errorCode = error.status;
    if (error.status === 404) {
      this.status = 'not-found';      // l'API répond 404 : aucun auteur avec cet id
    } else if (error.status === 0) {
      this.status = 'unreachable';    // pas de réponse : serveur arrêté ou CORS
    } else {
      this.status = 'error';
    }
  }

  private cancelRequests(): void {
    this.authorSubscription?.unsubscribe();
    this.bioSubscription?.unsubscribe();
  }
}
