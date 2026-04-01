# v-scroll Component

A lightweight, zero-dependency custom scrollbar component built with native Web Components and Pointer Events.

## Features

- **Isolation**: Uses Shadow DOM for complete structure and style isolation.
- **Native Scrolling**: Built on top of native `overflow: auto` scrolling for performance and accessibility.
- **Customizable**: Fully stylable via CSS Shadow Parts (`::part(bar)`) and CSS variables.
- **Responsive**: Automatically adjusts scrollbar height and visibility using `ResizeObserver`.
- **Smooth Interaction**: Smooth dragging experience using native Pointer Events with pointer capture.

## Usage

### 1. Register the component

Include the `v-scroll.js` module in your project:

```html
<script type="module" src="/path/to/src/v-scroll.js"></script>
```

### 2. Configure Import Map (Optional but Recommended)

To support theme switching as described in the requirements, configure an `importmap`:

```html
<script type="importmap">
{
  "imports": {
    "$/": "/path/to/your/theme/"
  }
}
</script>
```

### 3. Use the `<v-scroll>` tag

Wrap any content you want to make scrollable:

```html
<v-scroll style="width: 300px; height: 200px;">
  <div class="content">
    <!-- Your content here -->
  </div>
</v-scroll>
```

### 4. Customizing Styles

You can customize the scrollbar appearance using CSS variables and the `::part(bar)` pseudo-element:

```css
v-scroll::part(bar) {
  --v-scroll-bar-bg: #4a90e2;        /* Default color */
  --v-scroll-bar-hover-bg: #357abd;  /* Hover color */
  --v-scroll-bar-active-bg: #2a5f9e; /* Dragging color */
}
```

## Development

The project uses Vite for development. A custom plugin transforms the `.css` source into a JS module for runtime injection.

1. Install dependencies:
   ```bash
   bun i
   ```

2. Start development server:
   ```bash
   npx vite
   ```

3. Build for production:
   ```bash
   ./build.sh
   ```

## Implementation Details

- **Mapping Algorithm**: Dragging the thumb calculates the Y-axis offset and maps it proportionally to the `scrollTop` of the container, taking into account a 3px padding at both ends.
- **Cleanup**: The component automatically disconnects `ResizeObserver` and unbinds event listeners when removed from the DOM (`disconnectedCallback`).
