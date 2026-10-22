"""Проверка локальных ссылок и базовой HTML-структуры без зависимостей."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.refs, self.labels = path, [], [], []
        self.inputs, self.h1, self.titles, self.viewport = [], 0, 0, False
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append(attrs[key])
        for item in attrs.get('srcset', '').split(','):
            if item.strip():
                self.refs.append(item.strip().split()[0])
        if tag == 'label' and 'for' in attrs:
            self.labels.append(attrs['for'])
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.titles += 1
        if tag == 'meta' and attrs.get('name') == 'viewport':
            self.viewport = 'width=device-width' in attrs.get('content', '')
        if tag == 'img':
            assert 'alt' in attrs, f'{self.path.name}: у изображения нет alt'

pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
links = 0
for name, page in pages.items():
    assert page.h1 == 1 and page.titles == 1 and page.viewport, f'{name}: h1/title/viewport'
    assert len(page.ids) == len(set(page.ids)), f'{name}: повтор id'
    assert all(label in page.ids for label in page.labels), f'{name}: неверный label/for'
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = page.path.parent / unquote(url.path) if url.path else page.path
        assert target.is_file(), f'{name}: отсутствует {ref}'
        if url.fragment and target.suffix == '.html':
            assert unquote(url.fragment) in pages[target.name].ids, f'{name}: отсутствует якорь {ref}'
        links += 1
print(f'OK: {len(pages)} страниц; {links} локальных ссылок/ресурсов; h1, title, viewport, id, label и alt.')
