# UI Specification: Worldbuilding Editor Frontend

This document describes the desktop web interface shown in the provided
reference screenshots. It is intended as a specification for an
AI/frontend developer that cannot inspect the screenshots directly.

The interface is a dark-top-bar, light-content worldbuilding editor. The
application is divided into a global top navigation bar, a left
project/navigation sidebar, a central content editor, and an optional
right metadata/sidebar area.

Browser tabs, browser chrome, operating-system taskbar, Windows UI and
all other elements outside the web application must be ignored.

The visual language should be clean, dense enough for serious desktop
work, but not visually complicated. The application is primarily an
editor rather than a dashboard.

------------------------------------------------------------------------

## 1. Overall application layout

The application occupies the entire browser viewport below the browser
chrome.

At the top is a fixed dark horizontal application bar.

Below it is a three-column workspace:

``` text
┌──────────────────────────────────────────────────────────────────────┐
│                         TOP APPLICATION BAR                          │
├───────────────────┬────────────────────────────────┬─────────────────┤
│                   │                                │                 │
│   LEFT SIDEBAR    │       MAIN CONTENT AREA        │ RIGHT SIDEBAR   │
│                   │                                │                 │
│   navigation      │       page/editor             │ metadata        │
│   tree            │                                │ tags / blocks   │
│   search          │                                │                 │
│   project tabs    │                                │                 │
│                   │                                │                 │
└───────────────────┴────────────────────────────────┴─────────────────┘
```

The left sidebar is approximately 300px wide in the reference layout.

The right sidebar is approximately 300px wide when visible.

The central editor consumes the remaining space.

The right sidebar can be absent or effectively empty when a page does
not expose metadata. The main editor should expand naturally when the
right sidebar is not needed.

------------------------------------------------------------------------

# 2. Top application bar

The top application bar is dark, approximately 60px high.

It spans the entire application width.

It contains several functional zones.

### Left side

At the far left is the application logo/icon.

Next to it is a small dropdown indicator.

Then the current Project name:

``` text
[application logo] [▼]  Questing in Selenia
```

The Project name identifies the currently open Project.

The Project selector/dropdown should be interactive and should
eventually allow switching Projects.

### Navigation controls

After the Project name there are compact icon buttons.

The reference contains:

-   a sidebar/layout icon;
-   back navigation arrow;
-   forward navigation arrow;
-   home icon.

These are icon-only controls.

They should have tooltips on hover.

The controls should be visually subtle and should not compete with the
editor.

### Search

Near the center/right of the top bar is a search icon followed by:

``` text
Search Questing in Selenia   Ctrl+K
```

The search field is visually integrated into the dark toolbar rather
than looking like a large conventional input.

The search is Project-scoped.

`Ctrl+K` should open/focus global Project search.

### User area

At the far right is:

-   user/avatar image;
-   small dropdown indicator;
-   `Share` button.

The Share button is a conventional dark/filled toolbar button.

The avatar is circular.

------------------------------------------------------------------------

# 3. Left sidebar

The left sidebar is a light gray/off-white panel.

It is the main navigation area for the current Project.

The sidebar contains three top-level modes:

``` text
Project    Templates    Assets
```

The currently selected mode is visually darker/bolder.

The three modes are important and should be implemented as actual
navigation states, not merely decorative tabs.

------------------------------------------------------------------------

# 4. Project mode

The Project tab contains the GameObject hierarchy.

At the top is a search/filter input:

``` text
Find by name or #tag
```

The input spans most of the sidebar width.

There is a filter icon at its right edge.

The filter icon should be an icon-only button.

The search supports:

-   name search;
-   tag search;
-   potentially other filters later.

Below the search field are two large icon buttons representing
additional Project navigation views.

The reference shows:

-   a hierarchy/list-like icon;
-   a geometric/map-like icon.

These are icon-only navigation controls.

The exact internal meaning may be implemented later, but the UI should
reserve space for these two navigation modes.

------------------------------------------------------------------------

# 5. GameObject hierarchy

The main section of the Project sidebar is a hierarchical tree.

Example:

``` text
▼  [rook-like icon] Questing in Selenia
    ├─ [rook-like icon] Moonlight Citadel
    │   └─ [quest/object icon] Quest: Nerezza's Jagged Crown
    │       ├─ [faded object icon] Part I: Seeking Ingress
    │       ├─ [faded object icon] Part II: The Spiral Stairway
    │       ├─ [faded object icon] Part III: Under Fire
    │       ├─ [faded object icon] Part IV: High Priest Nerezza...
    │       ├─ [faded object icon] Part V: The Crown
    │       └─ [faded object icon] The Priest's Journal - Hando...
    │
    ├─ [structure icon] Port at the Moonlight Gate
    ├─ [structure icon] Brom's Dock
    ├─ [house icon] Shaletal
    ├─ [building icon] Phasing Gate
    ├─ [house icon] Avon Port
    ├─ [stack/object icon] Moonlight Bazaar
    └─ [house icon] Avon Ridge
```

The exact icons can differ in the new application, but each object type
should have a visually distinct icon.

The hierarchy uses indentation to communicate parent/child
relationships.

Expandable nodes have a small disclosure triangle.

Collapsed nodes show a right-facing triangle.

Expanded nodes show a downward-facing triangle.

------------------------------------------------------------------------

# 6. GameObject tree behavior

A GameObject can contain child GameObjects.

A GameObject can also contain Pages.

Pages are displayed beneath their GameObject.

The tree must visually distinguish:

-   GameObjects;
-   Pages;
-   hidden/secret Pages;
-   different object categories.

The reference uses faded text for some inaccessible/hidden entries.

Hidden entries can also display an eye-with-slash icon on the far right.

The eye-slash icon means that the item is hidden.

This icon should be an icon-only control.

Clicking it can toggle visibility if the current user has permission.

------------------------------------------------------------------------

# 7. Selected GameObject

The currently selected object is displayed with a light gray highlighted
row.

Example:

``` text
[icon] Phasing Gate
```

The selected row has:

-   rounded corners;
-   slightly darker gray background;
-   dark text;
-   its normal object icon.

The selected state should be obvious but subtle.

------------------------------------------------------------------------

# 8. Tree row icons

Every tree row can have an icon on its left.

Examples from the reference include:

-   rook/chess-tower-like icon for a major/root object;
-   house icon for locations;
-   geometric icon for quests;
-   building/structure icons;
-   document/page icons;
-   stack/database-like icons.

The implementation should use a consistent icon library rather than
arbitrary Unicode characters.

Icons should be small, approximately 14--18px.

Text follows the icon with a small gap.

Hidden-state icons appear on the far right of the row.

------------------------------------------------------------------------

# 9. Sidebar bottom controls

At the bottom of the left sidebar there is a compact utility row.

The reference contains three icon buttons:

``` text
[sun/light icon] [settings gear] [? help]
```

These are icon-only controls.

They should be aligned horizontally.

Below them is a large `+ Create` button.

The Create button spans almost the entire sidebar width.

It is a white/light button with a subtle border and rounded corners.

The plus icon appears before the text.

------------------------------------------------------------------------

# 10. Templates mode

Selecting `Templates` changes the left sidebar into a Template browser.

The search field remains at the top:

``` text
Find by name or #tag
```

Below it is a list of templates.

Example:

``` text
[person icon] Character Template        [...] [eye]
```

The template row has:

-   a template-type icon on the left;
-   template name;
-   ellipsis menu button on the right;
-   eye/visibility icon on the right.

The currently selected template has a highlighted row.

At the bottom of the sidebar is:

``` text
+ New Template
```

This button behaves similarly to the Create button in Project mode.

------------------------------------------------------------------------

# 11. Template editor

When a Template is selected, the central editor displays it like a
normal GameObject/Page.

The page header contains:

``` text
[large template icon] Character Template [Template badge]
```

The `Template` badge is a small rounded label next to the title.

It visually communicates that the current entity is a template rather
than a normal GameObject.

The header also contains a three-dot menu near the upper-right corner.

There is also a layout/sidebar icon near the upper-right corner.

------------------------------------------------------------------------

# 12. Page tabs

Below the Template title is a horizontal tab/navigation row.

Example:

``` text
[document icon] Main
[document icon] Personality
[document icon] GM Notes [eye-slash]
```

The active tab has:

-   darker text;
-   an underline;
-   stronger visual weight.

Inactive tabs are lighter gray.

Each tab has a small document icon.

A hidden tab may show an eye-with-slash icon.

The same tab system can be used for ordinary GameObjects.

------------------------------------------------------------------------

# 13. Page editor

The central page is intentionally document-oriented.

The user should feel like they are writing a document, not filling out a
database form.

Example content:

``` text
Gender Race Profession

"Something they said."

Appearance & Quirks

•
```

Text should be rendered with generous line height.

The central content should have a readable maximum width rather than
stretching every line across a huge monitor.

The editor should prioritize typography and writing comfort.

------------------------------------------------------------------------

# 14. Rich blocks

The document consists of Blocks.

A Block may contain:

-   Markdown/rich text;
-   image;
-   quote;
-   callout;
-   map;
-   diagram;
-   table;
-   timeline;
-   embedded GameObject;
-   other future content types.

The `+ Add Block` control is located at the top-right of the central
editor area, in the right-side toolbar region.

The control consists of a plus icon and text:

``` text
+ Add Block
```

It should open a Block type picker.

The editor must not force the entire Page into a rigid schema.

The primary writing surface is free-form text.

------------------------------------------------------------------------

# 15. Markdown/Tiptap writing model

The implementation should use Tiptap or an equivalent ProseMirror-based
editor.

The user should be able to write naturally.

The internal model may serialize content into structured Blocks, but the
visual experience must remain a document editor.

The user should not be required to fill predefined fields merely to
write prose.

A future inline reference syntax such as:

``` text
@Nerezza Moonstone
```

can create a link to another GameObject/Page.

The UI should support inline links between entities without forcing the
user to leave the editor.

------------------------------------------------------------------------

# 16. Assets mode

Selecting `Assets` changes the left sidebar into an Asset browser.

The top search field becomes:

``` text
Search my files
```

There is a filter icon at the right.

Below it are asset-source tabs:

``` text
My Files    Unsplash    Pinterest
```

`My Files` is the active source in the reference.

These tabs should be implemented as real source filters.

------------------------------------------------------------------------

# 17. Asset browser

Assets are displayed as visual folders/cards.

Example:

``` text
┌───────────────┐   ┌───────────────┐
│ [thumbnails]  │   │ [thumbnails]  │
│               │   │               │
│    Deities    │   │   Magic Items │
└───────────────┘   └───────────────┘

┌───────────────┐   ┌───────────────┐
│ [thumbnails]  │   │               │
│ [thumbnails]  │   │   [folder]    │
│               │   │               │
│     Maps      │   │ Maps to get   │
│               │   │   started     │
└───────────────┘   └───────────────┘
```

Folders can contain thumbnail previews.

The card has a label centered at the bottom.

The Asset browser should support:

-   folders;
-   images;
-   files;
-   thumbnails;
-   upload;
-   future asset types.

------------------------------------------------------------------------

# 18. Asset actions

At the bottom of the Asset sidebar are two large buttons:

``` text
[upload icon] Upload
[folder-plus icon] New Folder
```

The buttons span roughly half the sidebar width each.

`Upload` opens the file picker.

`New Folder` creates a new Asset folder.

------------------------------------------------------------------------

# 19. Asset insertion into Page

The central editor can contain an image block.

In the reference, an empty image block appears as a large pale
placeholder:

``` text
┌───────────────────────────────────────────┐
│                                           │
│                  [image icon]             │
│                 Add an image              │
│                                           │
└───────────────────────────────────────────┘
```

This should be a drop/select target.

Possible interactions:

-   click to select an Asset;
-   drag an Asset from the Asset browser;
-   upload a new Asset;
-   paste an image;
-   later, replace/remove image.

------------------------------------------------------------------------

# 20. Normal GameObject page

A normal GameObject page has a breadcrumb above the title.

Example:

``` text
Questing in Selenia / Moonlight Citadel
```

The breadcrumb is small and gray.

The current page title is large and bold:

``` text
[object icon] Phasing Gate
```

The icon is large, approximately 32--40px, and appears immediately
before the title.

Under the title are inline actions:

``` text
+ Add Tab     [banner icon] Add Banner
```

`Add Tab` adds another Page to the GameObject.

`Add Banner` adds/changes the GameObject banner.

------------------------------------------------------------------------

# 21. GameObject banner

A GameObject can have a banner image.

The banner is configured at GameObject level, not Page level.

The UI should therefore treat the banner as part of the GameObject
header rather than part of individual Pages.

This is important for the data model:

``` text
GameObject
├── banner
├── metadata
├── tags
└── Pages
```

rather than:

``` text
Page
└── banner
```

------------------------------------------------------------------------

# 22. Right sidebar

The right sidebar is used for GameObject-level metadata.

It is NOT page-specific metadata.

The reference shows:

``` text
TAGS

[ architecture × ]    [+]
```

The sidebar has a simple title:

``` text
TAGS
```

followed by tag chips.

A tag chip is a rounded light pill:

``` text
architecture ×
```

The `×` removes the tag.

There is a plus button to add another tag.

------------------------------------------------------------------------

# 23. GameObject metadata model

The right sidebar should eventually contain more than tags.

Potential metadata:

``` text
Tags
Rating
Comments
Timeline
Relations
Status
Custom metadata
```

These are properties of the GameObject.

All Pages belonging to the GameObject share this metadata.

The right sidebar therefore remains visible while navigating between
Pages of the same GameObject.

------------------------------------------------------------------------

# 24. Right sidebar and Add Block

In some views the right sidebar contains:

``` text
+ Add Block
```

This is a utility area for adding content blocks.

The implementation should keep this functionality visually separate from
GameObject metadata.

If both metadata and block controls are needed, use clear sections
rather than mixing them into a single undifferentiated list.

------------------------------------------------------------------------

# 25. Page header controls

At the upper-right of the main content header are icon-only controls.

The reference shows:

-   vertical three-dot menu;
-   panel/layout icon.

The three-dot icon opens contextual actions.

The panel icon controls sidebar/layout visibility.

Both should have hover tooltips.

------------------------------------------------------------------------

# 26. Context menu: GameObject/root object

The reference shows a right-click/context menu opened on the Project
root GameObject.

The menu is a white floating panel with subtle shadow and rounded
corners.

Each row has an icon followed by text.

The menu contains the following actions in this order:

``` text
[plus]       Create sub-page
[document]   Convert to template
────────────────────────────
[pencil]     Rename
[duplicate]  Duplicate
[download]   Export
[move]       Move        >
────────────────────────────
[sort]       Sort sub-pages >
────────────────────────────
[shield]     Edit permissions
[bookmark]   Set as shortcut
────────────────────────────
[eye-slash]  Hide
────────────────────────────
[collapse]   Collapse all
```

The separators are thin horizontal lines.

The menu is positioned next to the selected tree item.

------------------------------------------------------------------------

# 27. Context menu actions

### Create sub-page

Creates a new child Page/GameObject depending on the domain context.

The UI should use a plus icon.

### Convert to template

Converts the selected GameObject into a Template.

Uses a document/template-style icon.

### Rename

Opens inline rename or a small dialog.

Uses a pencil icon.

### Duplicate

Creates a copy of the selected object.

Uses a duplicate/copy icon.

### Export

Exports the selected object/data.

Uses a download/export icon.

### Move

Opens a submenu.

The right-facing chevron indicates a submenu.

### Sort sub-pages

Opens a submenu.

The submenu should provide ordering/sorting options.

### Edit permissions

Opens the permission editor.

Uses a shield/security icon.

### Set as shortcut

Adds the object to shortcuts/favorites.

Uses a bookmark icon.

### Hide

Hides the selected object.

Uses an eye-with-slash icon.

### Collapse all

Collapses all expanded descendants in the tree.

Uses a collapse/chevron-style icon.

------------------------------------------------------------------------

# 28. Context menu design rules

Context menu rows should have:

-   approximately 32--38px height;
-   8--12px horizontal padding;
-   14--16px icon width;
-   icon on the left;
-   text aligned consistently;
-   hover background;
-   disabled state when an operation is unavailable;
-   submenu chevron on the right where applicable.

Dangerous operations such as Delete should eventually receive a visually
distinct confirmation flow rather than being hidden among ordinary
actions.

------------------------------------------------------------------------

# 29. Icons

Icons are an important part of the interface.

Do not replace icons with plain text labels where the reference uses an
icon.

Use a consistent SVG icon library.

Important icon categories include:

``` text
Application/logo
Dropdown chevron
Sidebar/layout
Back
Forward
Home
Search
Filter
GameObject types
Page/document
Hidden/visibility
Plus
Settings
Help
Template
More/ellipsis
Rename/edit
Duplicate
Export/download
Move
Sort
Permissions/security
Bookmark
Collapse
Image
Upload
Folder
Folder-plus
Map
Quote
Info
Lock/secret
```

Icons should generally be monochrome and visually lightweight.

They should inherit the surrounding text color unless a state requires
otherwise.

------------------------------------------------------------------------

# 30. Secret/private content

The reference contains a special content block labeled:

``` text
[lock icon] SECRET
```

The block has a pale purple/pink background and a dashed purple border.

This is a special visibility-controlled content block.

Its visual structure is approximately:

``` text
┌ - - - - - - - - - - - - - - - - - - - ┐
│ [lock] SECRET                           │
│                                         │
│ Welcome to this Example Project...      │
│                                         │
│ This project has been duplicated...     │
│                                         │
└ - - - - - - - - - - - - - - - - - - - ┘
```

The lock icon and `SECRET` label appear at the top of the block.

The block should support permission-aware visibility.

------------------------------------------------------------------------

# 31. Informational callout block

The reference also shows an informational callout with a pale blue
background.

It has an information icon at the left:

``` text
┌──────────────────────────────────────────────┐
│ [i] Start exploring by clicking the "Map"... │
└──────────────────────────────────────────────┘
```

This is a reusable Callout/Info Block.

It should be implemented as a Block type rather than hardcoded into the
page.

Future variants can include:

``` text
Info
Warning
Danger
Success
Secret
```

------------------------------------------------------------------------

# 32. Breadcrumbs

Breadcrumbs are small navigation elements above a GameObject title.

Example:

``` text
Questing in Selenia / Moonlight Citadel
```

The breadcrumb should:

-   use smaller text than the title;
-   use muted gray;
-   allow navigation to parent objects;
-   remain above the main title;
-   avoid excessive visual emphasis.

------------------------------------------------------------------------

# 33. Home label

On a root Project/GameObject page, a small rounded label may appear
beside the title:

``` text
Questing in Selenia   [Home]
```

The `Home` badge contains a small home icon.

It indicates that the current object is the Project's home/root object.

------------------------------------------------------------------------

# 34. Main page title

Titles should be visually strong.

Recommended hierarchy:

``` text
Project/GameObject title:
32–40px, bold

Page tab:
14–16px

Body:
16–18px

Breadcrumb:
12–14px

Metadata:
12–14px
```

Exact values can be adjusted during implementation, but the relative
hierarchy should remain.

------------------------------------------------------------------------


------------------------------------------------------------------------

# 36. Visual palette and design tokens

The palette is an important part of the reference UI and should be
implemented as centralized design tokens rather than hard-coded colors
scattered through components.

The screenshots are the visual reference, so the following values should
be treated as initial approximate tokens. They may be tuned by a designer
later, but all components should consume the shared tokens.

## 36.1 Core palette

```text
--color-app-bar:          #111111
--color-app-bar-hover:    #1B1B1B
--color-app-bar-active:   #242424

--color-page:             #FFFFFF
--color-surface:          #F7F7F7
--color-surface-alt:      #F1F2F3
--color-surface-hover:    #E9EBED
--color-surface-selected: #DDE2E6

--color-border:           #D9DCDD
--color-border-subtle:    #E7E8E9

--color-text:             #202124
--color-text-secondary:   #666A6D
--color-text-muted:       #92969A
--color-text-disabled:    #B5B8BA

--color-text-on-dark:     #F5F5F5
--color-text-on-dark-muted: #A8A8A8

--color-icon:              #666A6D
--color-icon-muted:        #9A9DA0
```

The application should not use pure black for normal body text. The
reference uses a very dark neutral gray, which is easier to read.

Likewise, the application should not use pure white for every surface.
The editor is white, while navigation and secondary controls use subtle
gray surfaces to establish hierarchy.

## 36.2 Semantic colors

Semantic colors are used sparingly. The application is primarily a
neutral writing environment.

```text
--color-primary:          #4A78A8
--color-primary-hover:    #3F6894
--color-primary-soft:    #EAF2FA

--color-info:             #4A86C5
--color-info-soft:        #E8F2FC

--color-success:          #4E8A63
--color-success-soft:     #EAF4ED

--color-warning:          #B5833E
--color-warning-soft:     #FBF3E5

--color-danger:           #B85A5A
--color-danger-soft:      #FBECEC
```

These colors should primarily appear in callouts, status indicators,
validation states, permission states, and destructive actions.

They should not turn ordinary navigation into a colorful dashboard.

## 36.3 Secret/private block palette

The reference uses a pale purple/pink treatment for SECRET content.

```text
--color-secret:            #8D4FA3
--color-secret-soft:       #FAF0FC
--color-secret-border:     #C98DD8
```

A SECRET block should use:

- a very pale purple background;
- a purple dashed border;
- a purple lock icon;
- a purple `SECRET` label.

The body text remains the normal dark text color.

## 36.4 Informational callout palette

The reference uses a pale blue informational callout.

```text
--color-callout-info:       #4A86C5
--color-callout-info-soft:  #EAF3FD
--color-callout-info-border:#C9DDF2
```

The callout should have a soft blue background and an information icon.
The treatment should remain low contrast so that large amounts of
documentation remain comfortable to read.

## 36.5 Tags

Tags are represented as small neutral pills.

```text
--color-tag-background:    #F0F1F2
--color-tag-border:        #E0E2E3
--color-tag-text:          #55595C
--color-tag-remove:        #7C8083
```

The tag chip should not use a strong accent color by default. Semantic
tag colors can be added later as an optional feature.

Example:

```text
┌──────────────────┐
│ architecture  × │
└──────────────────┘
```

## 36.6 Selection and hover states

Selection is intentionally subtle.

```text
--color-selection:         #DDE2E6
--color-hover:             #E9EBED
--color-focus:             #C7D9EA
```

A selected GameObject row should use `--color-selection`.

A hovered row or menu item should use `--color-hover`.

Keyboard focus should be visible without introducing a heavy browser-
style outline everywhere. Use the focus token consistently.

## 36.7 Dark application bar

The top bar is visually separated from the writing area by a strong
dark surface.

```text
background: #111111
primary text: #F5F5F5
secondary text: #A8A8A8
icons: #B8B8B8
hover: #1B1B1B
active: #242424
```

The Project name, navigation controls, search and user controls all live
inside this dark visual system.

The dark toolbar should not bleed into the editor.

## 36.8 Borders and separators

Borders should be low contrast.

Prefer:

```text
1px solid #D9DCDD
```

for visible component boundaries and:

```text
1px solid #E7E8E9
```

for subtle separators.

Context-menu separators should be slightly more visible than ordinary
surface separators, but still remain neutral.

Avoid thick borders except for special blocks such as SECRET content.

## 36.9 Shadows

The interface should use restrained shadows.

The main editor should generally not look like a collection of floating
cards.

Floating elements such as:

- context menus;
- dropdowns;
- command palettes;
- popovers;
- dialogs;

may use a soft shadow.

Suggested starting token:

```text
--shadow-popover:
0 4px 16px rgba(0, 0, 0, 0.12)
```

Avoid excessive card shadows in the normal document editor.

## 36.10 Radius

The reference uses modest rounded corners.

Suggested tokens:

```text
--radius-small:   4px
--radius-medium:  6px
--radius-large:   8px
--radius-pill:    999px
```

Use:

- small radius for inputs and compact controls;
- medium radius for selected rows and buttons;
- large radius for callouts and larger content surfaces;
- pill radius for tags and badges.

## 36.11 Typography color hierarchy

The visual hierarchy should primarily come from typography and neutral
surfaces rather than many colors.

Use approximately:

```text
Primary text       #202124
Secondary text     #666A6D
Muted text         #92969A
Disabled text      #B5B8BA
```

Headers use the primary text color.

Breadcrumbs, inactive tabs and secondary controls use secondary or muted
text.

Disabled/hidden entries use the disabled token.

## 36.12 Palette implementation rule

All colors must be defined through a centralized theme/token layer.

Do not write arbitrary values such as `color: #777` throughout the
frontend.

Components should reference semantic tokens:

```css
color: var(--color-text-secondary);
background: var(--color-surface);
border-color: var(--color-border);
```

This is required because the application will eventually support:

- light theme;
- dark theme;
- user-customizable themes;
- accessibility adjustments;
- possible branded SaaS deployments.

The initial UI should reproduce the neutral light appearance of the
reference screenshots, but the architecture must not make that palette
permanent.

# 37. Responsive behavior

The reference is desktop-oriented.

The new product is a web application with PWA support.

On desktop:

``` text
Left sidebar | Editor | Right sidebar
```

On tablet:

-   left sidebar can collapse into a drawer;
-   right sidebar can become an overlay/drawer;
-   editor remains the primary surface.

On smartphone:

-   use a single-column editor;
-   navigation becomes drawers;
-   metadata becomes an overlay;
-   top toolbar should be simplified.

The desktop layout should remain the primary reference implementation.

------------------------------------------------------------------------

# 36. Interaction priorities

The interface should prioritize these actions:

1.  Navigate the Project hierarchy.
2.  Open a GameObject.
3.  Switch Pages/Tabs.
4.  Read/write the document.
5.  Add Blocks.
6.  Inspect GameObject metadata.
7.  Search the Project.
8.  Manage Assets.
9.  Manage Templates.

The UI should not make the user navigate through configuration forms
merely to write content.

------------------------------------------------------------------------

# 37. Important domain/UI distinction

The frontend must preserve the distinction between:

``` text
Project
    └── GameObject
            └── Page
                    └── Block
```

and:

``` text
GameObject metadata
    ├── Tags
    ├── Rating
    ├── Comments
    ├── Timeline
    └── Relations
```

GameObject metadata belongs to the GameObject and is shared by all its
Pages.

A Page is primarily a writing/document surface.

A Block is a piece of content inside the Page.

------------------------------------------------------------------------

# 38. Overall visual summary

The intended interface should feel like a combination of:

-   a file/tree navigator;
-   a modern document editor;
-   a lightweight knowledge graph/worldbuilding tool;
-   an asset manager.

It should NOT feel like:

-   a spreadsheet;
-   a rigid database form;
-   an enterprise administration panel;
-   a dashboard full of cards.

The central experience is:

``` text
Find an object
      ↓
Open its page
      ↓
Write naturally
      ↓
Add rich blocks when needed
      ↓
Link other world objects
      ↓
Use metadata in the right sidebar
```

The tree provides structure.

The editor provides freedom.

The right sidebar provides context.

Templates and Assets provide reusable building blocks.

------------------------------------------------------------------------

# 39. Suggested frontend component hierarchy

A possible component architecture:

``` text
App
├── AppTopBar
│   ├── AppLogo
│   ├── ProjectSelector
│   ├── NavigationControls
│   ├── GlobalSearch
│   └── UserMenu
│
└── Workspace
    ├── LeftSidebar
    │   ├── SidebarTabs
    │   ├── ProjectBrowser
    │   │   ├── TreeSearch
    │   │   ├── TreeView
    │   │   └── CreateButton
    │   │
    │   ├── TemplateBrowser
    │   │   └── TemplateList
    │   │
    │   └── AssetBrowser
    │       ├── AssetSearch
    │       ├── AssetSources
    │       ├── AssetGrid
    │       └── AssetActions
    │
    ├── MainEditor
    │   ├── Breadcrumbs
    │   ├── ObjectHeader
    │   ├── PageTabs
    │   ├── TiptapEditor
    │   ├── BlockRenderer
    │   └── AddBlock
    │
    └── RightSidebar
        ├── GameObjectMetadata
        ├── Tags
        ├── Relations
        └── BlockActions
```

Context menus should be implemented independently:

``` text
ContextMenu
├── MenuItem
├── MenuSeparator
└── Submenu
```

This allows the same menu system to be reused for GameObjects, Pages,
Templates, Assets and other entities.

------------------------------------------------------------------------

# 40. Final implementation rule

The screenshots are a visual reference for layout, information
hierarchy, interaction patterns and icon usage.

Do not reproduce browser/OS chrome.

The frontend should reproduce the application structure and behavior,
while using the project's own branding and design tokens.

The most important principle is that the interface must remain a writing
tool first:

``` text
World structure
      ↓
GameObject
      ↓
Page
      ↓
Free-form rich text + Blocks
```

Structured metadata, templates and assets should enhance writing rather
than turn the application into a rigid form editor.
