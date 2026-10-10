# @muten/shadcn

[shadcn/ui](https://ui.shadcn.com) for [muten](https://muten.dev) - the authentic shadcn components, ported to
muten's declarative DSL. Every component ships the exact shadcn class strings as **semantic classes** (`.card`,
`.badge`, `.btn`, ...), so your `.muten` stays readable (`class("card")`, not a pile of utilities) while the look
is 100% shadcn (zinc dark theme, the same tokens, the same animations).

This is a **muten plugin**: a registry of components you either **import** (use as-is) or **eject** (`muten add`,
copy the source and own it, the shadcn way). It is not a runtime - the components compile away with your app.

## Before you build anything

Use what the library has before drawing your own: one phone (`DeviceFrame`), one button (`Btn`), one field family,
one modal. The reuse loop, the "if you need X, use Y" table and the mistakes not to repeat are in
[AGENTS.md](AGENTS.md#read-this-first-reuse-before-you-build). To check an app:
`node node_modules/@muten/shadcn/scripts/reuse-audit.mjs src`.

## Requirements

A muten app using **Tailwind CSS v4** (scaffold with `npm create muten@latest` and pick Tailwind, or add it). The
plugin ships its theme + component classes as a Tailwind `@theme` / `@layer`, so Tailwind does the work.

## Install

```sh
npm install @muten/shadcn
```

Then wire two things:

**1. Import the styles** in your `src/styles.css` (after Tailwind):

```css
@import "tailwindcss";
@import "@muten/shadcn/globals.css";
```

`globals.css` brings the shadcn `@theme` tokens (colors + radius), the base border reset, and every class-driven
component. It also `@source`s its own parts, so any utility used inside a component is generated.

**2. Let the plugin own the theme.** Empty your `theme.muten` colors so they do not override the shadcn `@theme`:

```
# theme.muten
theme { scheme { mode "dark" } }
```

## Two ways to use a component

### Import (use as-is)

Declare the plugin in `muten.config`. Its parts become available across the app, no copying:

```
# muten.config
plugins {
  shadcn {}
}
```

```
# any page
Card {
  CardHeader { CardTitle(label: "Create project") }
  CardContent { Span "Deploy in one click." class("text-sm text-muted-foreground") }
}
```

### Eject (own the source)

`muten add` copies the component's `.muten` into `src/parts/` so you can edit it (the shadcn philosophy):

```sh
muten add card badge dialog
```

The two approaches mix freely. **Custom components (see below) are eject-only** - their host `.js` must live in
your `src/components/`, so `muten add` copies both files.

---

## Components

### Class-driven (in `globals.css`, no `muten add` needed)

Style any muten primitive with these - the exact shadcn utility strings:

| Component | Usage |
|---|---|
| **Button** | `Button "Save" -> save class("btn btn-default")` - variants `btn-default\|secondary\|outline\|ghost\|destructive\|link`, sizes `btn-sm\|btn-lg\|btn-icon` |
| **Input / Textarea / Label** | `SearchField bind(q) class("input")` - also `.textarea`, `.label`, `.native-select` |
| **Skeleton** | `Stack class("skeleton h-4 w-32")` (size it at the call site) |
| **Separator / Kbd** | `Stack class("separator")` - `Span "Ctrl" class("kbd")` |
| **Typography** | `Title "Docs" h1 class("prose-h1")` - `prose-h1..h4`, `prose-p\|lead\|large\|small\|muted\|blockquote\|code\|list` |
| **Button Group / Input Group** | `Stack class("btn-group") { … }` - `Stack class("input-group") { Icon … SearchField class("input-group-control") }` |
| **Table** | `DataTable @rows columns(a, b) class("data-table")` (styles muten's DataTable) |

### Parts (import via `plugins {}`, or `muten add <name>`)

Display: **card** (Card / CardHeader / CardTitle / CardDescription / CardContent / CardFooter), **badge**,
**alert** (Alert / AlertTitle / AlertDescription), **avatar**, **spinner**, **progress**, **empty**,
**breadcrumb**, **pagination**, **field**, **item**.

Stateful (the page owns the state, the part receives it - see the pattern below): **switch**,
**toggle**, **toggle-group**, **radio-group**, **collapsible**, **accordion**, **tabs**.

Overlays (the page owns an `open` bool): **dialog**, **alert-dialog**, **tooltip** (pure hover, no state),
**dropdown-menu**, **popover**, **sheet**, **drawer**, **hover-card** (hover), **scroll-area**,
**menubar**, **navigation-menu** (hover), **combobox**, **command**.

> **Not here on purpose:** checkbox / select / number / range / date / chart are **native muten primitives** now,
> so this plugin ships no part for them (a same-named part would be shadowed by the primitive). Use `Checkbox bind(x)`,
> `Select bind(x) options(a, b) class("native-select")`, `Number`/`Range`/`Date bind(x)`, `Chart @data kind(bar) …`.
> For a *searchable* dropdown, use **combobox**.

Chat: **message** (Message / Bubble / Marker), **message-scroller**, **attachment**.

### Custom (eject-only - `muten add` copies a host `.js` into `src/components/`)

The genuinely interactive 20%: **input-otp**, **toaster**, **carousel**, **resizable**, **context-menu** (+ more,
see AGENTS.md). Each is a thin muten part over a small vanilla-JS host you own and can edit. (A chart / slider /
date picker is **native** — `Chart`/`Range`/`Date` — not a Custom; don't `muten add` those.)

`calendar` ships all the shadcn variants: `mode` (`single` / `range` / `multiple`), `months` (1-2 side by side),
`caption` (`label` / `dropdown`). `selected` encodes the value (`"yyyy-mm-dd"`, `"from/to"`, or `"d1,d2,..."`).
A **date picker** is just `Popover { Calendar … }`.

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

---

## The container / presentational pattern

shadcn components in React hold their own state; in muten the **page owns the state** and passes it down, so the
oracle can see and check it. Interactive parts take a value + an action callback:

```
state { dark = false : bool }
action toggle mutates dark { dark.toggle() }

Switch(on: dark, onToggle: toggle)
```

Single-select groups pass the current value + each item's value (the part highlights the match):

```
state { align = "left" : text }
action setAlign(v: text) mutates align { align.set(v) }

ToggleGroup {
  ToggleGroupItem(value: "left",  current: align, onSelect: setAlign) { Icon "lucide:align-left" }
  ToggleGroupItem(value: "right", current: align, onSelect: setAlign) { Icon "lucide:align-right" }
}
```

Overlays own an `open` bool; the backdrop click closes:

```
state { open = false : bool }
action show mutates open { open.set(true) }
action close mutates open { open.set(false) }

Button "Open" -> show class("btn btn-outline")
Dialog(open: open, onClose: close) {
  DialogTitle(label: "Are you sure?")
  DialogFooter { Button "Cancel" -> close class("btn btn-outline") }
}
```

Each component's `.muten` file has a usage snippet in its header comment.

## Theming

Everything is driven by the shadcn `@theme` tokens in `globals.css` (`--color-primary`, `--color-card`,
`--radius`, ...). To re-theme, edit those CSS variables - the components follow. The default is shadcn's zinc dark.

## License

MIT.
