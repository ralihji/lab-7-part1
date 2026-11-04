import { TestBed } from '@angular/core/testing';

import { BooksService } from './books.service';
import {RouterTestingModule} from "@angular/router/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthorDetails, AuthorResource } from '../../authors/model/author-details';

const API = 'http://localhost:8080/books-api/';

describe('BooksService', () => {
  let service: BooksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [BooksService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(BooksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAuthor', () => {
    const resource: AuthorResource = {
      id: 4,
      firstName: 'Koredo',
      lastName: 'Tablanga',
      books: [{ title: 'SpringBoot JPA and REST', _links: { self: { href: API + 'books/1' } } }],
      _links: { self: { href: API + 'authors/4' }, bio: { href: API + 'authors/4/bio' } }
    };

    it('sends GET /books-api/authors/{id} and converts the HAL response', () => {
      let result: AuthorDetails | undefined;
      service.getAuthor('4').subscribe(author => result = author);

      const request = httpMock.expectOne(API + 'authors/4');
      expect(request.request.method).toBe('GET');
      request.flush(resource);

      expect(result).toEqual({
        id: 4,
        firstName: 'Koredo',
        lastName: 'Tablanga',
        books: [{ id: 1, title: 'SpringBoot JPA and REST' }],
        bioUrl: API + 'authors/4/bio'
      });
    });

    it('emits an error with status 404 when the author does not exist', () => {
      let status = 0;
      service.getAuthor(999).subscribe({
        next: () => fail('a 404 should not emit an author'),
        error: (error: HttpErrorResponse) => status = error.status
      });

      httpMock.expectOne(API + 'authors/999').flush(null, { status: 404, statusText: 'Not Found' });

      expect(status).toBe(404);
    });
  });

  describe('getAuthorBio', () => {
    const author: AuthorDetails = {
      id: 4, firstName: 'Koredo', lastName: 'Tablanga', books: [], bioUrl: API + 'authors/4/bio'
    };

    it('follows the HATEOAS bio link and returns the biodata', () => {
      let bio = '';
      service.getAuthorBio(author).subscribe(text => bio = text);

      const request = httpMock.expectOne(API + 'authors/4/bio');
      expect(request.request.method).toBe('GET');
      request.flush({ id: 9, biodata: 'Software architect.', _links: { self: { href: API + 'bios/9' } } });

      expect(bio).toBe('Software architect.');
    });

    it('builds the bio URL when the link is missing', () => {
      service.getAuthorBio({ ...author, bioUrl: null }).subscribe();
      httpMock.expectOne(API + 'authors/4/bio').flush({ id: 9, biodata: '' });
    });
  });
});
