# Site index · format 1
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
also: The popular-dish strip in the hero is the only place any dish is named anywhere on this site, because the menu page carries no dishes.
also: The category browser under Curated categories lists only one category, Starters, and then links away to the menu page. Adding a category here does not add it to the menu page, and neither list is generated from the other.

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
purpose: The menu page — currently a heading and an Order Online link, with no dishes on it.
sections:
- `#main` "The full Green Chili menu" — the page body, carrying a heading, one line of copy and an Order Online button
- `#menu` — the container the menu belongs in. It is empty.
also: THIS PAGE HAS NO MENU ON IT. The page promises "Starters through desserts — scroll the full menu, or jump by category" and then renders nothing: the #menu section is empty in the markup. Anyone asked to change a dish, a price or a category on this site has nothing here to change, and the request means either index.html's popular-dish strip or building this page's content for the first time.

## shared (every page)
The header, navigation, mobile menu and footer are propagated from index.html to every other page by
`shell_propagation`. A change to any of them is made on index.html alone and copied automatically.
