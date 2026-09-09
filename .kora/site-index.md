# Site index · format 2
Structure and the names of what each page offers. Values that change often — prices, hours, phone,
address — and body copy are deliberately not recorded here; read the page itself for those.

## index.html → /
title: Green Chili Indian Restaurant | Authentic Indian Cuisine in Dayton, OH
purpose: The landing page — introduction, a popular-dishes strip, hours, catering and gallery.
sections:
- `#main` "Green Chili Indian Restaurant" — the page body, holding the hero and every section below it
- hero — the tagline and the View Menu and Order Online calls to action, with a strip of popular and signature dishes: Garlic Naan, Chicken Tikka Masala, Butter Naan, Butter Chicken, Green Chili Special Biryani, Vegetable Samosa
- `#about` "Green Chili Indian Restaurant" — the restaurant's story
- `#menu` "Curated categories" — a category browser linking through to the full menu page
- `#hours` "Find us on Lyons Road" — the weekly opening hours and the address
- `#catering` "We bring the restaurant to you" — catering for corporate meetings, weddings, birthdays and custom menus, with a request-a-quote action
- `#gallery` "A taste of our world" — photographs of the dishes and the room
also: The popular-dish strip in the hero is the only place a dish is named in any HTML file on this site. Every other dish lives in `js/main.js`, so the strip and the real menu are two separate copies and nothing keeps them in step.
also: The category browser under Curated categories lists only one category, Starters, and then links away to the menu page. The real category list is in `js/main.js`; neither is generated from the other, so adding a category is two edits in two files.

## contact.html → /contact
title: Contact Green Chili Indian Restaurant | Dayton OH
purpose: Contact page — the enquiry form, the address and the opening hours.
sections:
- `#main` "Visit, reserve, or enquire" — the page body, holding the address, the opening hours and the form
- `#reservations` "Send a note" — the enquiry block introducing the form
- `#contact-form` — the enquiry form itself
- `#name` — the form's name input
- `#email` — the form's email input
- `#phone` — the form's phone input
- `#topic` — the form's topic select
- `#message` — the form's message textarea
also: The opening hours are written out here as well as on index.html, so changing the hours means editing both pages. Nothing links the two copies.

## menu.html → /menu
title: Menu | Green Chili Indian Restaurant Dayton OH
purpose: The menu page — an empty shell in the markup; the whole menu is drawn in from `js/main.js` at load.
sections:
- `#main` "The full Green Chili menu" — the page body, carrying a heading, one line of copy and an Order Online button
- `#menu` — the container the menu is drawn into. Empty in the markup; filled at load from `js/main.js`.
also: THE MENU IS NOT IN THIS FILE. The #menu section is empty markup, filled at load from `js/main.js` — 59,689 characters that hold every dish, price and category on this site. A request to change any of them is an edit to that script. Editing this page would appear to do nothing.

## support files
Files that are not pages. A line marked [content] holds words or data a visitor reads, so a
change to the site's content can land there; the rest only make the site work or look right.
- `llms.txt` — a plain-text summary of the business for AI crawlers — derived from the site by the deploy, not written by hand
- `robots.txt` — crawler rules and the sitemap link — derived from the site by the deploy, not written by hand
- `sitemap.xml` — the list of page URLs — derived from the site by the deploy, not written by hand
- `assets/site.css` — the site's styling and brand colours
- `js/includes.js` — the header, navigation and footer markup, and the ordering links  [content]
- `js/main.js` — THE ENTIRE MENU as data, drawn onto the menu page at load  [content]

## shared (every page)
The header, navigation, mobile menu and footer are NOT in the pages. They are rendered at
load by `js/includes.js`, which is where every change to the shared chrome has to be made. Editing a
page's markup to change the header will appear to do nothing, because there is no header in
it to change.
