"""Read-only browser regression suite. Point CARDORA_TEST_URL at a private candidate or a static concept build."""
import os
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

def check(browser, url, width, height, reduced=False):
    page = browser.new_page(viewport={"width":width,"height":height}, reduced_motion="reduce" if reduced else "no-preference")
    if directory := os.getenv('CARDORA_STATIC_FIXTURE'):
        root=Path(directory).resolve()
        def serve(route):
            path=urlsplit(route.request.url)
            if path.netloc != urlsplit(url).netloc:
                route.abort();return
            asset=(root/(path.path.lstrip('/') or 'index.html')).resolve()
            if asset.is_relative_to(root) and asset.is_file():
                route.fulfill(path=asset)
            elif path.path=='/customer.php':
                route.fulfill(json={'email':None,'orders':[]})
            else:route.fulfill(status=404,body='Missing fixture')
        page.route('**/*',serve)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.add_init_script("""if (!sessionStorage.getItem('qa-initialized')) {
      localStorage.setItem('cardora-v2-last',JSON.stringify({items:{}}));localStorage.setItem('cardora-v2-recent','{}');sessionStorage.setItem('qa-initialized','1');
    }""")
    page.goto(url, wait_until="domcontentloaded")
    page.locator('.tile').first.wait_for(timeout=6500)
    assert not errors, errors
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    item = page.locator(".tile").first.get_attribute("data-id")
    page.evaluate("id=>{location.hash='/p/'+id}",item)
    page.wait_for_selector("#sheet[open]")
    page.evaluate("""() => {history.back();}""")
    page.wait_for_function("!location.hash.startsWith('#/p/')")
    page.evaluate("history.forward()")
    page.wait_for_timeout(650)
    assert page.locator("#sheet").evaluate("d=>d.open && d.classList.contains('is-open')"), "rapid forward lost the product"
    page.reload(wait_until="domcontentloaded")
    page.wait_for_selector('#sheet[open]')
    page.keyboard.press('Escape')
    page.wait_for_function("!document.querySelector('#sheet').open")
    search=page.locator('#q1')
    search.fill('PlayStation')
    page.wait_for_selector('[data-sg]')
    search.press('ArrowDown')
    search.press('Escape')
    search.press('Enter')
    assert not page.locator('#sheet').evaluate('d=>d.open'), "dismissed suggestion selected"
    page.locator('#q2').fill('nonexistent-qa-item')
    assert page.locator('#results .empty').count()==1
    page.locator('[data-reset]').click()
    for cat in ['gift-cards','game-keys','game-credits','all']:
        page.locator('[data-tab="'+cat+'"]').click()
        assert page.locator('[data-tab="'+cat+'"]').get_attribute('aria-selected')=='true'
    page.locator('[data-open-cart]:visible').first.click()
    page.wait_for_selector('#cart[open]')
    page.keyboard.press('Escape')
    page.wait_for_function("!document.querySelector('#cart').open")
    if not reduced:
        page.evaluate("window.scrollTo(0,document.querySelector('#cats').offsetTop)")
        page.wait_for_function("window.ScrollTrigger && ScrollTrigger.getAll().some(t=>t.progress>0)")
    assert not errors,errors
    page.close()

if __name__=='__main__':
    with sync_playwright() as pw:
        engine=getattr(pw,os.environ.get('ENGINE','chromium'))
        opts={'executable_path':os.environ['BROWSER_PATH']} if 'BROWSER_PATH' in os.environ else {}
        browser=engine.launch(**opts)
        for w,h,r in [(320,568,False),(390,844,False),(844,390,True),(768,1024,False),(1440,900,False)]:
            check(browser,os.environ['CARDORA_TEST_URL'],w,h,r)
            print(f'PASS {w}x{h} reduced-motion={r}',flush=True)
        browser.close()
