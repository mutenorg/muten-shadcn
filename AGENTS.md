# @muten/shadcn - component catalog (for an AI assembling a muten app)

## Setup (once): `plugins { shadcn {} }` in muten.config + `@import "@muten/shadcn/globals.css";` in src/styles.css. Then everything below is usable directly; `muten add <name>` only ejects a source.

> **Native primitives always win — for a checkbox / select / number / range / date / chart, use the native muten
> primitive, NOT a plugin part.** muten's core now ships these as primitives, so this plugin does NOT: write
> `Checkbox bind(agree)`, `Select bind(theme) options(System, Light, Dark) class("native-select")` (the `.native-select`
> class gives the native `<select>` the shadcn look), `Number bind(qty)`, `Range bind(vol)`, `Date bind(due)`,
> `Chart @data kind(bar) x(label) y(value)`. A part named the same as a primitive is unreachable (the primitive
> shadows it), so those parts were removed. For a *searchable* dropdown use the `Combobox` part.
> **The exact props of every part are in the header comment of `node_modules/@muten/shadcn/registry/<name>.muten` —
> read it before calling (the one-liners below are the catalog, not the API).**

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

### Gotcha: a **part takes NO trailing modifiers** — `Part(...) class(...)`, `Part(...) disabled when x`, `Part(...) on(...)` and `Part(...) aria(...)` are all syntax errors (a part call ends at its `)`/`{}`). When you need `class`/`disabled when`/`on`/`aria` on a control, use the **native primitive** (`Button "Save" -> save disabled when not valid class("btn btn-default")`), not the `Btn(...)` part.
