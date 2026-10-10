# @muten/shadcn - component catalog (for an AI assembling a muten app)

## Read this first: reuse before you build

This library is the app's component set, built as atoms that compose into molecules and organisms. The most common
mistake when building with muten is to draw from scratch something the library already has: a phone mockup, a button
with its own border, a picker glued inside an input, a skeleton, a legal page. Each copy looks a little different, has
its own bugs, and is one more thing to fix. So before you write any UI piece, walk this loop:

1. **Look it up.** List the parts: `ls node_modules/@muten/shadcn/registry/`. Each `<name>.muten` opens with a header
   comment: what it is, its props, an example. Read the header of every candidate (the catalog below names them; the
   header is the API). Search by meaning: `grep -il "phone\|chat\|calendar" node_modules/@muten/shadcn/registry/*.muten`.
2. **Compose, don't redraw.** If a part covers 80% of it, use the part and add the rest around it (layout, data, copy).
   Build bigger pieces out of smaller ones: a form is `Field` + `Input` + `Btn`, a store tile is `DeviceFrame` +
   two spans. Never copy a part's look into your own classes.
3. **Your CSS only places and sizes.** Write classes for layout (grid, gaps, where a thing sits) and sizes, set through
   the variable a part exposes (`--dw` for DeviceFrame, `width`/`height` props). Do not restyle what a part draws: its
   border, radius, shadow, bezel, padding or colours. If that look is wrong, it is wrong everywhere: fix it in the library.
4. **Missing for real? Add it to the library, not to the app.** A new part goes in `registry/` with its header comment,
   its CSS in `kit.css`, an entry in `registry.json` and a page in the library's bench (`plugins/playground/docs/` in
   its repo). If you cannot change the library, say so instead of building a private copy. Then every app
   gets it, and the next person finds it in step 1.
5. **Check.** `node node_modules/@muten/shadcn/scripts/reuse-audit.mjs src` lists the markup in your app that redraws a
   library piece (a Button wearing `cn-button` classes, a hand-made avatar, a phone frame of its own, a skeleton by
   hand). Every finding is a question: answer it before adding more. Then `muten check`.

### If you need… use…

| You need | Use | Not |
|---|---|---|
| a button / icon button / link that looks like one | `Btn(variant, size, label, onClick, disabled)`, `LinkBtn(to, variant)` | `Button … class("cn-button …")` |
| buttons joined in a row, an action with a menu | `ButtonGroup`, `SplitButton` | two buttons with their own borders |
| a text field, with an icon, a currency or a country | `Input`, `InputGroup` + `GroupInput`, `MoneyField`, `PhoneField` | a select drawn inside an input |
| a label, help text and error around a control | `Field(label, description, error)` | spans with margins |
| a person's face or initials, a name with a subtitle | `Avatar`, `AvatarImage`, `Who` | a circle div with a letter |
| **a phone or browser mockup** (screenshot, live screen, store preview) | **`DeviceFrame`** (`island`, `width`, `href`, `label`, `shot`, `kind: "browser"`, `url`) | any frame of your own: it is the one phone, the iPhone 18 Pro to scale |
| a chat preview in WhatsApp, Instagram or Telegram style | `ChatPlay` (+ `ChatPlayMsg`, `ChatPlayDay`, …) | a hand-made chat screen |
| a conversation column | `MessageScroller` + `Message` + `Marker` | a scrolling div of bubbles |
| a dialog, a drawer, a side sheet | `Modal(mode: "auto" \| "drawer" \| …)` | a fixed div with a backdrop |
| a short notice, an alert, a band | `Island`, `Alert`, `Band` | a toast of your own |
| a loading state | `Loading(busy, kind) { … }`, `Skeletons(kind)`, `Skeleton` | grey boxes by hand |
| an empty state | `Empty(title, description)` | a centred paragraph |
| tabs, a segmented switch | `Tabs`, `SegmentedControl` | buttons with an active class |
| the app's left menu, the phone's bottom bar | `AppSidebar` + `SidebarLink`, `PhoneBar` | a nav of your own |
| a menu, a searchable picker | `DropdownMenu`, `Combobox` | a native `<select>` |
| dates and times, an agenda | `Calendar`, `DateField`, `TimeField`, `AgendaLive` | an input with a library |
| a KPI, a price, a status | `StatCard`, `Price`, `Badge` / `StatusBadge` | a styled number |
| a legal or long document | `DocHead`, `DocToc` + `DocTocLink`, `DocSection` | a wall of paragraphs |
| a hero background, a product tour | `GradientBlinds(colors, from)`, `ScreenTour` | your own canvas or gradient |
| text with the library's type scale | `Txt(value, variant: "title" \| "heading" \| "muted" \| "caption")` | font sizes in your CSS |

### Things that went wrong before (don't repeat them)

- A second (and third) phone drawn by hand in the app, each with its own bezel and buttons. There is one phone:
  `DeviceFrame`. Size it with `width` or `--dw`; give it `island: "on"` or a `shot`; never redraw it.
- A percent `padding` used for a bezel or a border: a percent padding is a share of the PARENT's width, so the border
  grows with the page. Shares of the element itself come from its children's margin or from `cqw`.
- A picker given its own border and radius inside an input: it reads as a button stuck in a field. `InputGroup` makes
  it a segment of the same field.
- Bubbles squashed and hours drawn over the text in a fixed-height column: flex shrank them. The library's parts already
  hold their size; a hand-made list did not.
- A gradient with hard stripes and a sudden cut: `GradientBlinds` melts into the page and can come `from` any side.

## Setup (once): `plugins { shadcn {} }` in muten.config + `@import "@muten/shadcn/globals.css";` in src/styles.css. Then everything below is usable directly; `muten add <name>` only ejects a source.

> **Native primitives always win — for a checkbox / select / number / range / date / chart, use the native muten
> primitive, NOT a plugin part.** muten's core now ships these as primitives, so this plugin does NOT: write
> `Checkbox bind(agree)`, `Select bind(theme) options(System, Light, Dark) class("native-select")` (the `.native-select`
> class gives the native `<select>` the shadcn look), `Number bind(qty)`, `Range bind(vol)`, `Date bind(due)`,
> `Chart @data kind(bar) x(label) y(value)`. A part named the same as a primitive is unreachable (the primitive
> shadows it), so those parts were removed. For a *searchable* dropdown use the `Combobox` part.
> **The exact props of every part are in the header comment of `node_modules/@muten/shadcn/registry/<name>.muten` —
> read it before calling (the one-liners below are the catalog, not the API).**

## Nova + the system kit

The newer half of the plugin is shadcn's **Nova** style plus a kit of generic, data-driven components (agenda,
inbox, order board, booking, app shell…). It is 1:1 with the reference artifact the bench page `plugins/playground`
shows. Setup, on top of the install above:

```css
/* src/styles.css, after globals.css */
@import "@muten/shadcn/nova.css";   /* shadcn's Nova source, scoped under .style-nova */
@import "@muten/shadcn/kit.css";    /* muten adapters + the kit's layout and motion */
```

```html
<!-- index.html: the style class on <html>, and Geist -->
<html class="style-nova">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
```

```
# src/app.muten: once, in the shell (a shell cannot call plugin parts, so the Custom directly)
shell { Stack { Custom KitLayer class("cx-kit-host")  slot } }
```

`KitLayer` loads the kit core once: the icon sprite, the tooltip on anything with `data-name`, the Island, the one
adaptive modal (Dialog wide, Drawer on a phone) the kit's components share, and the wheels. Every component's exact
props are in the header comment of its `registry/<name>.muten`; the data shapes are documented there too.

| Group | Parts |
|---|---|
| Atoms | `Btn` (variant, size, tone), `Txt`, `Badge`/`StatusBadge`/`ToneBadge`/`Chip`, `Avatar`/`AvatarGroup`/`Who`, `Kbd`, `Spinner`, `Skeleton`, `Indicator`, `Separator`, `Progress` |
| Lists and cards | `Item…`, `Price`, `Card…` (with the action zone), `FixedCard`/`Row3`/`EmptyMini`, `StatCard`/`StatGrid`, `Spark` |
| Controls | `Switch`/`SwitchRow`, `Tabs`, `SegmentedControl`, `ChoiceList`, `Sortable`, `SaveButton`, `NavButton` |
| Fields | `Field…`, `Input`/`TextArea`, `InputGroup`/`SearchInput`, `MoneyField`, `PhoneField`, `InputOtp`, `PasswordField` |
| Notices | `Alert`, `Band`, `Island`, `Modal`/`ModalFooter`, `SettingsForm`/`DirtyBar` |
| Menus and content | `Combobox`, `RowMenu`, `Accordion`, `StoreQr` |
| Values | `ScaleSlider`, `RangeSlider`, `Slider`, `ColorPicker` |
| Collections | `TagInput`, `PaginationNav`, `VirtualList`, `Carousel`/`CarouselSlide` |
| Data | `TableView` (filters as data, chips, bulk), `OrderBoard`, `OrderCards` |
| Dates and files | `Booking`, `Calendar`, `DateField`, `TimeField`, `ImageUpload` |
| Structure | `PhoneShell`, `ShareButton`, `AppShell` (Sidebar, page header, detail Sheet, ⌘K) |
| System | `Agenda`, `NewAppointment`, `Messaging`, `Chatbot`, `BarChart`, `Checklist`, `Plans`, `CardField`, `MemberList`, `PermissionMatrix`, `StampCard`, `Bell`, `Queue`, `WeeklyHours` |
| Loading | `Skeletons(kind)`, `Loading(busy, kind) { … }`: content-shaped skeletons, a fade when the data lands |

Rules the kit keeps: the page owns the state and gets JSON back through actions; functions never travel as data
(a bot's answers are `{match, text}` rules); a skeleton only shows while there is nothing to show; no native
`<select>`, the wheels and menus instead.

## PLUG-AND-PLAY (zero class props)
- **Btn**(variant, onClick) { slot } · **LinkBtn**(to, variant) { slot } · **Input**(value, placeholder)
- **DataTable** @rows columns(a, b) - STYLED BY DEFAULT, no class needed.
- + every Part / Custom below.

## Parts (62) - imported by plugins {}

- **Card** - A surface with CardHeader / CardTitle / CardDescription / CardContent / CardFooter sub-components.  ·  +CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Badge** - A small status descriptor. variant: default | secondary | destructive | outline.
- **Alert** - A callout with AlertTitle / AlertDescription. variant: default | destructive.  ·  +AlertTitle, AlertDescription
- **Avatar** - A user's initials in a circle (AvatarFallback).
- **Switch** - A toggle; the page owns the bool + the action.
- **Spinner** - A loading indicator (animate-spin loader).
- **Progress** - A determinate progress bar; value is 0-100.
- **Separator** - A thin divider line.
- **Empty** - An empty-state placeholder (title + description in a dashed border).
- **Breadcrumb** - A breadcrumb trail with BreadcrumbLink / BreadcrumbSeparator / BreadcrumbPage.  ·  +BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
- **Pagination** - Page navigation with PaginationLink / Previous / Next / Ellipsis.  ·  +PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis
- **Field** - A labelled form control: FieldLabel / FieldDescription / FieldError.  ·  +FieldLabel, FieldDescription, FieldError
- **Item** - A bordered row: ItemContent / ItemTitle / ItemDescription.  ·  +ItemContent, ItemTitle, ItemDescription
- **Toggle** - A two-state button; the page owns the bool + the toggle action.
- **ToggleGroup** - Single-select toolbar with ToggleGroupItem; page owns a text state.  ·  +ToggleGroupItem
- **RadioGroup** - Single choice with RadioGroupItem; page owns a text state.  ·  +RadioGroupItem
- **Collapsible** - A trigger + content shown when open; page owns the bool.
- **Accordion** - Stacked expandable sections with AccordionItem; page owns a bool per item.  ·  +AccordionItem
- **TabsList** - Tab bar (TabsList/TabsTrigger) + TabsContent panels; page owns the active-tab text.  ·  +TabsTrigger, TabsContent
- **Dialog** - A modal with DialogTitle/Description/Footer; page owns the open bool. Backdrop click closes.  ·  +DialogTitle, DialogDescription, DialogFooter
- **Tooltip** - A hover tooltip (pure CSS, no state). The slot is the trigger.
- **DropdownMenu** - A menu below a trigger with DropdownItem/Label/Separator; page owns the open bool.  ·  +DropdownItem, DropdownLabel, DropdownSeparator
- **Popover** - A floating panel below a trigger; page owns the open bool.
- **AlertDialog** - A modal requiring an explicit choice (no backdrop dismiss); page owns the open bool.  ·  +AlertDialogTitle, AlertDialogDescription, AlertDialogFooter
- **Sheet** - A panel that slides in from the right; page owns the open bool.  ·  +SheetTitle, SheetDescription
- **Drawer** - A panel that slides up from the bottom; page owns the open bool.
- **HoverCard** - Richer content shown on hover (pure CSS, no state).
- **ScrollArea** - A scrollable region with styled scrollbars.
- **Message** - Chat Message + Bubble + Marker (variant: sent | received).  ·  +Bubble, Marker
- **MessageScroller** - A scrollable column of chat messages.
- **Attachment** - A file attachment chip (icon + name + size).
- **Menubar** - A bar of menus (File/Edit/View); page owns which is open via a text state.  ·  +MenubarMenu, MenubarItem, MenubarSeparator
- **NavigationMenu** - A nav bar with hover-revealed panels (pure CSS, no state).  ·  +NavigationMenuItem, NavigationMenuLink
- **Combobox** - A Select with a search box; page filters items with `each … where`.  ·  +ComboboxItem
- **Command** - A command palette (search + grouped CommandItem list).  ·  +CommandList, CommandGroup, CommandItem, CommandShortcut
- **SegmentedControl** - A single-select toolbar (SegmentedItem); page owns a text state.  ·  +SegmentedItem, SegmentedTabs, IconTab
- **VectorField** - Paired NumberFields (X/Y) for position or size.
- **Toolbar** - A grouped button bar with ToolbarGroup / ToolbarSeparator.  ·  +ToolbarGroup, ToolbarSeparator
- **StatusBar** - A thin bottom bar with StatusItem / StatusSpacer.  ·  +StatusItem, StatusSpacer
- **ZoomControl** - A - 100% + zoom widget; page owns the zoom number.
- **SplitButton** - A main action + a caret dropdown; page owns the open bool.
- **SwatchPalette** - A grid of selectable color swatches (Swatch); page owns the selected hex + colors.  ·  +Swatch
- **AppSidebar** - AppSidebar - a collapsible nav panel (SidebarHeader / SidebarGroup / SidebarItem). Named AppSidebar so it never shadows muten's core Sidebar <aside> primitive.  ·  +SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarItem
- **Inspector** - Property grid: InspectorSection (collapsible) / InspectorRow (label : value slot).  ·  +InspectorSection, InspectorRow
- **CommandPalette** - A top-anchored modal holding a Command; page owns the open bool.
- **Stepper** - Horizontal or vertical step progress indicator; done steps show a check, the current step is ringed (parts: Stepper, StepperVertical, Step).  ·  +StepperVertical, Step
- **Timeline** - Vertical event timeline: a dot on a connector line + title/time/description per item (parts: Timeline, TimelineItem).  ·  +TimelineItem
- **Pill** - A hero eyebrow chip (rounded-full, bigger than Badge); slot-based for an icon + text.
- **FeatureGrid** - BLOCK: responsive grid of feature cards (icon + title + copy). Parts: FeatureGrid, FeatureCard.  ·  +FeatureCard
- **Pricing** - BLOCK: a row of pricing tiers (name/price/features/CTA), featured highlight. Parts: Pricing, PricingTier, PricingFeature.  ·  +PricingTier, PricingTierFeatured, PricingFeature
- **LogoCloud** - BLOCK: a 'trusted by' strip of logos, muted + grayscale until hover. Parts: LogoCloud, LogoCloudItem.  ·  +LogoCloudItem
- **NavPill** - BLOCK: the floating glass navbar (sticky wrapper + glass pill + scroll animation baked in). Drop logo/links/CTA inside.
- **StatBand** - BLOCK: a divided row of KPI stats. Parts: StatBand, Stat(label) - value goes in the slot (Span or Custom CountUp).  ·  +Stat
- **FeatureRows** - BLOCK: numbered feature/schedule rows with side gutters (12-col grid inside). Parts: FeatureRows, FeatureRow.  ·  +FeatureRow
- **BentoGallery** - BLOCK: fixed-row-height tiling gallery; cells pick their col-span. Parts: BentoGallery, BentoCell.  ·  +BentoCell
- **ButtonGroup** - A segmented row of buttons that share borders. Put btn-outline buttons inside.
- **InputGroup** - An input with a leading icon/addon in one bordered field.
- **Skeleton** - A loading placeholder (pulse). Add size via class: Skeleton class("h-4 w-32").
- **Kbd** - A keyboard key hint. Kbd { Span "Ctrl" }.
- **Btn** - Plug-and-play button (part Btn - Button is a primitive). `Btn(variant: "default", onClick: save) { Span "Save" }`. variant: default|secondary|outline|ghost|destructive|link.
- **Input** - Plug-and-play text input (part Input wraps SearchField). `Input(value: q, placeholder: "...")` - value is two-way bound. For typed/validated fields use a Form.
- **LinkBtn** - A navigation link styled as a button. `LinkBtn(to: "/signup", variant: "default") { Span "Get started" }`.

## Customs (20) - importable; some need a dep

- **Slider** (`slider`) - A draggable range slider (Custom). Page owns the value number.
- **InputOtp** (`input-otp`) - N single-character boxes synced to one value (Custom). Page owns the value text.
- **Calendar** (`calendar`) - A month-grid date picker (Custom). Page owns the selected ISO date text.
- **Toaster** (`toaster`) - Fixed toast notifications (Custom). Page bumps a trigger counter to fire one.
- **Carousel** (`carousel`) - A slide carousel over a list (Custom). Page owns the slides list.
- **GradientBlinds** (`gradient-blinds`) · **needs npm: ogl** - Animated WebGL gradient + diagonal-blinds hero background that follows the cursor and fades into the page (needs ogl).
- **Resizable** (`resizable`) - Two panels with a draggable splitter (Custom).
- **ContextMenu** (`context-menu`) - Right-click an area to open a menu of items (Custom).
- **NumberField** (`number-field`) - A numeric input with -/+ steppers, min/max/step (Custom).
- **FileInput** (`file-input`) - A click/drag-drop file dropzone (Custom); emits file names.
- **ColorPicker** (`color-picker`) - A swatch + saturation/value + hue popover (Custom); page owns the hex.
- **TreeView** (`tree-view`) - A nested folder/file tree (Custom): expandable, selectable, icons + indent.
- **CanvasHost** (`canvas-viewport`) - A <canvas> with pan/zoom (Custom) + a muten toolbar slot floating on top.
- **TagInput** (`tag-input`) - Chips you add by typing + Enter (Custom); page owns a comma-joined text.
- **RangeSlider** (`range-slider`) - A two-thumb range slider (Custom); page owns the low + high numbers.
- **SortableList** (`sortable-list`) - Drag rows to reorder (Custom); page owns a comma-joined order.
- **FolderPicker** (`folder-picker`) - Connect a local folder via showDirectoryPicker (Custom); emits the name.
- **Hotkey** (`hotkey`) - A global keyboard shortcut (Cmd/Ctrl+key), invisible (Custom).
- **Code** (`code`) - Syntax-highlighted code block that understands muten (shared highlight.js, same grammar as the VS Code extension).
- **CountUp** (`count-up`) - Animate a formatted number (2.4M / 94% / 40ms / 99.99%) from 0 when it scrolls into view; lands on the exact target. Custom. Styled form (takes the class): `Custom CountUp inputs(to: "2.4M") class("text-4xl font-bold")`. For stat bands + hero metrics.

## Class recipes (4) - style a primitive (Table is default-styled; typography/textarea/motion)

- **textarea** - class("textarea")  ·  label: class("label")  ·  native select: class("native-select")
- **typography** - Title "Docs" h1 class("prose-h1")   (prose-h1..h4 · prose-p|lead|large|small|muted|blockquote|code|list)
- **table** - DataTable @rows columns(name, email, status)  -  STYLED BY DEFAULT (no class needed). `class("data-table")` still works as an explicit alias. Raw cells; for badge/formatted cells build with each + Stack.
- **motion** - Page animations, all CSS + reduced-motion safe. Entrance: animate-fade-up|fade-in|scale-in|slide-in (+ d1..d6 stagger). Scroll: reveal|reveal-left|reveal-scale, and nav-scroll on a navbar. Hover/press: hover-lift, hover-glow, arrow-hover (nudges a trailing Icon), link-underline, press, float.

### Gotcha: a part can not be named after a core primitive — the **primitive wins** and any same-named plugin part is unreachable on import. The primitives include `Button/Link/Form/Image/SearchField/DataTable/Icon/Text/Title/Span` (→ this plugin uses `Btn`/`Input`/`LinkBtn`) AND `Select/Checkbox/Number/Range/Date/Chart` (→ use those primitives directly, see the note at the top). If you write a part call and the oracle says `missing-prop: X is missing the required "bind"`, X is a primitive shadowing the part — switch to the primitive's API.

### Gotcha: at the CALL SITE a part takes only `class(...)`, which is added to the part's root (for placing and sizing:
`DeviceFrame(island: "on") class("my-phone-slot")`). `disabled when`, `on(...)` and `aria(...)` there are syntax
errors: pass them as the part's props when it has them (`Btn(disabled: busy)`), or use the native primitive.
