import { describe, it, expect } from 'vitest';
import {
  createDefaultSlideDeck,
  createSlide,
  addSlide,
  nextSlide,
  prevSlide,
  setActiveSlide,
  duplicateSlide,
  deleteSlide,
  updateActiveSlideElements,
  getActiveSlide,
} from '../../src/shared/utils/slideDeckManager';
import { PathElement } from '../../src/shared/types';

describe('Slide Deck Manager Utility', () => {
  it('creates default slide deck with 1 initial slide', () => {
    const deck = createDefaultSlideDeck();
    expect(deck.slides).toHaveLength(1);
    expect(deck.activeSlideIndex).toBe(0);
    expect(deck.slides[0].title).toBe('Slide 1');
    expect(deck.slides[0].elements).toEqual([]);
  });

  it('adds a new slide after current active slide and focuses it', () => {
    let deck = createDefaultSlideDeck();
    deck = addSlide(deck, 'Architecture Overview');

    expect(deck.slides).toHaveLength(2);
    expect(deck.activeSlideIndex).toBe(1);
    expect(deck.slides[1].title).toBe('Architecture Overview');
  });

  it('navigates next and previous slides with boundary constraints', () => {
    let deck = createDefaultSlideDeck();
    deck = addSlide(deck, 'Slide 2');
    deck = addSlide(deck, 'Slide 3');
    // active is 2 (Slide 3)

    // Cannot advance past end
    deck = nextSlide(deck);
    expect(deck.activeSlideIndex).toBe(2);

    // Go back
    deck = prevSlide(deck);
    expect(deck.activeSlideIndex).toBe(1);

    deck = prevSlide(deck);
    expect(deck.activeSlideIndex).toBe(0);

    // Cannot go before start
    deck = prevSlide(deck);
    expect(deck.activeSlideIndex).toBe(0);
  });

  it('clamps setActiveSlide correctly', () => {
    let deck = createDefaultSlideDeck();
    deck = addSlide(deck, 'Slide 2');

    deck = setActiveSlide(deck, 100);
    expect(deck.activeSlideIndex).toBe(1);

    deck = setActiveSlide(deck, -5);
    expect(deck.activeSlideIndex).toBe(0);
  });

  it('duplicates an existing slide with elements', () => {
    let deck = createDefaultSlideDeck();
    const mockStroke: PathElement = {
      id: 'stroke-1',
      type: 'pen',
      color: '#ff0000',
      strokeWidth: 4,
      opacity: 1,
      brushStyle: 'solid',
      points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
    };

    deck = updateActiveSlideElements(deck, [mockStroke]);
    deck = duplicateSlide(deck, 0);

    expect(deck.slides).toHaveLength(2);
    expect(deck.activeSlideIndex).toBe(1);
    expect(deck.slides[1].title).toBe('Slide 1 (Copy)');
    expect(deck.slides[1].elements).toHaveLength(1);
    expect(deck.slides[1].elements[0].id).toBe('stroke-1');
  });

  it('deletes a slide safely and adjusts activeSlideIndex', () => {
    let deck = createDefaultSlideDeck();
    deck = addSlide(deck, 'Slide 2');
    deck = addSlide(deck, 'Slide 3');
    // active is 2

    // Delete middle slide (index 1)
    deck = deleteSlide(deck, 1);
    expect(deck.slides).toHaveLength(2);
    expect(deck.activeSlideIndex).toBe(1); // was 2, now 1

    // Delete last remaining slide should clear rather than empty array
    deck = deleteSlide(deck, 1);
    expect(deck.slides).toHaveLength(1);
    deck = deleteSlide(deck, 0);
    expect(deck.slides).toHaveLength(1);
    expect(deck.slides[0].elements).toEqual([]);
  });

  it('updates elements for the active slide only', () => {
    let deck = createDefaultSlideDeck();
    deck = addSlide(deck, 'Slide 2');

    const mockStroke: PathElement = {
      id: 'stroke-active',
      type: 'pen',
      color: '#00ff00',
      strokeWidth: 6,
      opacity: 1,
      brushStyle: 'solid',
      points: [{ x: 50, y: 50 }],
    };

    deck = updateActiveSlideElements(deck, [mockStroke]);
    expect(deck.slides[1].elements).toHaveLength(1);
    expect(deck.slides[0].elements).toHaveLength(0);
    expect(getActiveSlide(deck)?.id).toBe(deck.slides[1].id);
  });
});
