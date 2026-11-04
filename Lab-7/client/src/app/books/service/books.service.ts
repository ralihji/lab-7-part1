import {inject, Injectable} from '@angular/core';
import {Author, Book} from '../model/book';
import { HttpClient, HttpParams } from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {AuthorDetails, AuthorResource, BioResource, toAuthorDetails} from '../../authors/model/author-details';

const Url = 'http://localhost:8080/books-api/';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private http: HttpClient = inject(HttpClient);

  public getBook(id: string): Observable<Book> {
    return this.http.get<Book>(Url + 'books/' + id);
  }

  public addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(Url + 'books', book);
  }

  public addBookAuthor(id: number, author: Author): Observable<Author> {
    return this.http.post<Author>(Url + 'books/' + id + '/authors', author);
  }

  public getAuthorsNamed(firstName: string, lastName: string): Observable<any> {
    const options = {params: new HttpParams().set('firstName', firstName).set('lastName', lastName)};
    return this.http.get<any>(Url + 'authors', options).pipe(
      map(response => response._embedded ? response._embedded.authors : undefined )
    );
  }

  public updateBookAuthors(bookId: number, authorId: number): Observable<any> {
    return this.http.patch(Url + 'books/' + bookId + '/authors/' + authorId, {});
  }

  /**
   * Exercice Authors : récupère un auteur par son id (GET /books-api/authors/{id}).
   * La réponse HAL est convertie en AuthorDetails.
   * Si l'auteur n'existe pas, l'API répond 404 et l'Observable émet une erreur.
   */
  public getAuthor(id: string | number): Observable<AuthorDetails> {
    return this.http.get<AuthorResource>(Url + 'authors/' + id).pipe(
      map(resource => toAuthorDetails(resource))
    );
  }

  /**
   * Exercice Authors : récupère la biographie d'un auteur.
   * On suit le lien HATEOAS « bio » renvoyé avec l'auteur
   * (http://localhost:8080/books-api/authors/{id}/bio).
   */
  public getAuthorBio(author: AuthorDetails): Observable<string> {
    const bioUrl = author.bioUrl ?? Url + 'authors/' + author.id + '/bio';
    return this.http.get<BioResource>(bioUrl).pipe(
      map(bio => bio.biodata ?? '')
    );
  }
}
