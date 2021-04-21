import { E2eFixture } from './e2e.fixture';
import * as cheerio from 'cheerio';

describe('AppController (e2e)', () => {
  const fixture = new E2eFixture();

  beforeEach(async () => {
    await fixture.init();
  });

  it('/ (GET)', () => {
    return fixture
      .request()
      .get('/')
      .expect(200)
      .expect((r) => {
        const $ = cheerio.load(r.text);
        expect($('title').text()).toBe('HMPPS Nest - Home');
        expect($('.app-container h1').text()).toBe('This site is under construction...');
      });
  });
});
