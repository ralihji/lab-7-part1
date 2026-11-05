import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule,
        AppComponent],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'book-store'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('book-store');
  });

  it('should have an "Authors" option in the navigation bar that opens /authors', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('.nav-link a')) as HTMLAnchorElement[];
    const authors = links.find(link => link.textContent?.trim() === 'Authors');
    expect(authors).toBeDefined();
    expect(authors?.getAttribute('href')).toBe('/authors');
    // placé juste après « Books »
    expect(links.map(link => link.textContent?.trim()).indexOf('Authors'))
      .toBe(links.map(link => link.textContent?.trim()).indexOf('Books') + 1);
  });
});
