import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthorComponent } from './author.component';
import { AuthorsComponent } from '../authors.component';
import { AuthorResource } from '../model/author-details';

const API = 'http://localhost:8080/books-api/';

/** Réponse HAL de GET /books-api/authors/4 (même format que le serveur Spring). */
const KOREDO: AuthorResource = {
  id: 4,
  firstName: 'Koredo',
  lastName: 'Tablanga',
  books: [
    {title: 'SpringBoot JPA and REST', _links: {self: {href: API + 'books/1'}}},
    {title: 'Angular for Beginners', _links: {self: {href: API + 'books/2'}}}
  ],
  _links: {self: {href: API + 'authors/4'}, bio: {href: API + 'authors/4/bio'}}
};

describe('AuthorComponent', () => {
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorComponent],
      providers: [
        provideRouter([
          {path: 'authors', component: AuthorsComponent, children: [{path: ':id', component: AuthorComponent}]},
          {path: 'books/:id', children: []}
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Ouvre /authors/:id et renvoie le composant AuthorComponent affiché. */
  async function open(id: string): Promise<AuthorComponent> {
    await harness.navigateByUrl('/authors/' + id);
    return harness.fixture.debugElement.query(By.directive(AuthorComponent)).componentInstance;
  }

  it('requests the author, then follows the bio link', async () => {
    const component = await open('4');
    expect(component.status).toBe('loading');
    expect(component.message).toBe('Loading author 4…');

    httpMock.expectOne(API + 'authors/4').flush(KOREDO);
    expect(component.status).toBe('found');
    expect(component.fullName).toBe('Koredo Tablanga');
    expect(component.author?.books).toEqual([
      {id: 1, title: 'SpringBoot JPA and REST'},
      {id: 2, title: 'Angular for Beginners'}
    ]);
    expect(component.bioStatus).toBe('loading');

    httpMock.expectOne(API + 'authors/4/bio').flush({id: 4, biodata: '  Software architect.  '});
    expect(component.bioStatus).toBe('loaded');
    expect(component.biography).toBe('Software architect.');
  });

  it('shows a message when no author has this id (404)', async () => {
    const component = await open('99');
    httpMock.expectOne(API + 'authors/99').flush(null, {status: 404, statusText: 'Not Found'});

    expect(component.status).toBe('not-found');
    expect(component.author).toBeNull();
    expect(component.message).toBe('Sorry, no author was found with id 99.');
  });

  it('does not send a request when the id in the address is not valid', async () => {
    const component = await open('abc');

    httpMock.expectNone(() => true);
    expect(component.status).toBe('invalid-id');
    expect(component.message).toBe('"abc" is not a valid author id. Please enter a whole number greater than 0.');
  });

  it('says when the server cannot be reached', async () => {
    const component = await open('4');
    httpMock.expectOne(API + 'authors/4').error(new ProgressEvent('error'), {status: 0, statusText: 'Unknown Error'});

    expect(component.status).toBe('unreachable');
    expect(component.message).toContain('Unable to reach the Books API');
  });

  it('reports other server errors with their code', async () => {
    const component = await open('4');
    httpMock.expectOne(API + 'authors/4').flush(null, {status: 500, statusText: 'Server Error'});

    expect(component.status).toBe('error');
    expect(component.message).toBe('The server could not return author 4 (error 500). Please try again.');
  });

  it('keeps the author when the biography is empty or cannot be loaded', async () => {
    let component = await open('4');
    httpMock.expectOne(API + 'authors/4').flush(KOREDO);
    httpMock.expectOne(API + 'authors/4/bio').flush({id: 4, biodata: ''});
    expect(component.bioStatus).toBe('empty');

    component = await open('5');
    httpMock.expectOne(API + 'authors/5').flush({...KOREDO, id: 5, _links: {bio: {href: API + 'authors/5/bio'}}});
    httpMock.expectOne(API + 'authors/5/bio').flush(null, {status: 500, statusText: 'Server Error'});
    expect(component.status).toBe('found');
    expect(component.bioStatus).toBe('unavailable');
  });

  it('cancels the previous request when another id is searched', async () => {
    await open('4');
    const first = httpMock.expectOne(API + 'authors/4');

    const component = await open('5');
    expect(first.cancelled).toBeTrue();
    httpMock.expectOne(API + 'authors/5').flush(null, {status: 404, statusText: 'Not Found'});
    expect(component.message).toBe('Sorry, no author was found with id 5.');
  });

  // Partie interface : ce que l'utilisateur voit dans la page
  describe('display', () => {
    const page = () => harness.routeNativeElement as HTMLElement;

    it('shows a loading indicator while waiting for the API', async () => {
      await open('4');

      expect(page().querySelector('[role="status"]')?.textContent).toContain('Loading author 4');
      httpMock.expectOne(API + 'authors/4').flush(null, {status: 404, statusText: 'Not Found'});
    });

    it('shows the name, the books as links to /books/:id and the biography', async () => {
      await open('4');
      httpMock.expectOne(API + 'authors/4').flush(KOREDO);
      httpMock.expectOne(API + 'authors/4/bio').flush({id: 4, biodata: 'Software architect.'});
      harness.detectChanges();

      expect(page().querySelector('.author-badge')?.textContent).toContain('Author #4');
      expect(page().querySelector('.author-name')?.textContent).toContain('Koredo Tablanga');
      const links = Array.from(page().querySelectorAll('a.book-link'));
      expect(links.map(link => link.textContent?.trim())).toEqual(['SpringBoot JPA and REST', 'Angular for Beginners']);
      expect(links[0].getAttribute('href')).toBe('/books/1');
      expect(page().querySelector('.bio')?.textContent).toContain('Software architect.');
    });

    it('shows "No biography available." when the biography is empty', async () => {
      await open('4');
      httpMock.expectOne(API + 'authors/4').flush({...KOREDO, books: []});
      httpMock.expectOne(API + 'authors/4/bio').flush({id: 4, biodata: ''});
      harness.detectChanges();

      expect(page().textContent).toContain('No books for this author yet.');
      expect(page().querySelector('.bio')?.textContent).toContain('No biography available.');
    });

    it('shows a warning and no author card when the author is not found', async () => {
      await open('99');
      httpMock.expectOne(API + 'authors/99').flush(null, {status: 404, statusText: 'Not Found'});
      harness.detectChanges();

      const alert = page().querySelector('.alert-warning');
      expect(alert?.textContent).toContain('Author not found.');
      expect(alert?.textContent).toContain('Sorry, no author was found with id 99.');
      expect(page().querySelector('.author-card')).toBeNull();
    });

    it('shows an error when the server cannot be reached', async () => {
      await open('4');
      httpMock.expectOne(API + 'authors/4').error(new ProgressEvent('error'), {status: 0, statusText: 'Unknown Error'});
      harness.detectChanges();

      expect(page().querySelector('.alert-danger')?.textContent).toContain('Unable to reach the Books API');
    });
  });
});
