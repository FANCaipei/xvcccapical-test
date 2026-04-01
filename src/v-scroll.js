import CSS from '$/v-scroll.js';

const MIN_THUMB_HEIGHT = 16, PADDING = 3;

const setup_styles = (root, css_text) => {
  const style = document.createElement('style');
  style.textContent = css_text;
  root.appendChild(style);
};

const create_v_scroll = () => {
  /**
   * Note: Web Components standard requires a class extending HTMLElement.
   * Internal logic is kept as functional as possible per AGENTS.md.
   */
  class VScroll extends HTMLElement {
    #viewport;
    #track;
    #thumb;
    #resize_observer;
    #is_dragging = false;
    #start_y = 0;
    #start_scroll_top = 0;

    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      setup_styles(shadow, CSS);

      shadow.innerHTML += `
        <div class="v-scroll-viewport">
          <div class="v-scroll-content">
            <slot></slot>
          </div>
        </div>
        <div class="v-scroll-track">
          <b part="bar" class="v-scroll-thumb"></b>
        </div>
      `;

      this.#viewport = shadow.querySelector('.v-scroll-viewport');
      this.#track = shadow.querySelector('.v-scroll-track');
      this.#thumb = shadow.querySelector('.v-scroll-thumb');
    }

    connectedCallback() {
      this.#viewport.addEventListener('scroll', this.#on_scroll);
      this.#thumb.addEventListener('pointerdown', this.#on_pointer_down);
      
      this.#resize_observer = new ResizeObserver(this.#update_scrollbar);
      this.#resize_observer.observe(this.#viewport);
      const content = this.shadowRoot.querySelector('.v-scroll-content');
      if (content) this.#resize_observer.observe(content);

      this.#update_scrollbar();
    }

    disconnectedCallback() {
      this.#viewport.removeEventListener('scroll', this.#on_scroll);
      this.#thumb.removeEventListener('pointerdown', this.#on_pointer_down);
      
      if (this.#resize_observer) {
        this.#resize_observer.disconnect();
        this.#resize_observer = null;
      }

      // Ensure pointer capture is released if dragging
      if (this.#is_dragging) {
        this.#on_pointer_up();
      }
    }

    #on_scroll = () => {
      if (!this.#is_dragging) {
        this.#update_thumb_position();
      }
    };

    #update_scrollbar = () => {
      const { offsetHeight: viewport_h, scrollHeight: content_h } = this.#viewport,
            track_h = this.#track.offsetHeight;
      
      if (content_h <= viewport_h) {
        this.#thumb.style.display = 'none';
        return;
      }

      this.#thumb.style.display = 'block';
      const thumb_h = Math.max(MIN_THUMB_HEIGHT, (viewport_h / content_h) * track_h);
      this.#thumb.style.height = `${thumb_h}px`;
      
      this.#update_thumb_position();
    };

    #update_thumb_position = () => {
      const { scrollTop, scrollHeight: content_h, offsetHeight: viewport_h } = this.#viewport,
            track_h = this.#track.offsetHeight,
            thumb_h = this.#thumb.offsetHeight;
      
      const max_scroll = content_h - viewport_h,
            max_thumb_move = track_h - thumb_h - (PADDING * 2);
      
      const thumb_top = max_scroll > 0 
        ? (scrollTop / max_scroll) * max_thumb_move + PADDING 
        : PADDING;
        
      this.#thumb.style.transform = `translateY(${thumb_top}px)`;
    };

    #on_pointer_down = (e) => {
      this.#is_dragging = true;
      this.#start_y = e.clientY;
      this.#start_scroll_top = this.#viewport.scrollTop;
      this.#thumb.classList.add('dragging');
      
      this.#thumb.setPointerCapture(e.pointerId);
      this.#thumb.addEventListener('pointermove', this.#on_pointer_move);
      this.#thumb.addEventListener('pointerup', this.#on_pointer_up);
      this.#thumb.addEventListener('pointercancel', this.#on_pointer_up);
      
      e.preventDefault();
    };

    #on_pointer_move = (e) => {
      if (!this.#is_dragging) return;
      
      const delta_y = e.clientY - this.#start_y,
            { scrollHeight: content_h, offsetHeight: viewport_h } = this.#viewport,
            track_h = this.#track.offsetHeight,
            thumb_h = this.#thumb.offsetHeight;
      
      const max_scroll = content_h - viewport_h,
            max_thumb_move = track_h - thumb_h - (PADDING * 2);
      
      if (max_thumb_move <= 0) return;
      
      const scroll_delta = (delta_y / max_thumb_move) * max_scroll;
      this.#viewport.scrollTop = this.#start_scroll_top + scroll_delta;
      
      this.#update_thumb_position();
    };

    #on_pointer_up = (e) => {
      this.#is_dragging = false;
      this.#thumb.classList.remove('dragging');
      
      this.#thumb.removeEventListener('pointermove', this.#on_pointer_move);
      this.#thumb.removeEventListener('pointerup', this.#on_pointer_up);
      this.#thumb.removeEventListener('pointercancel', this.#on_pointer_up);
      
      if (e) this.#thumb.releasePointerCapture(e.pointerId);
    };
  }

  customElements.define('v-scroll', VScroll);
};

if (!customElements.get('v-scroll')) {
  create_v_scroll();
}
