import { Slide, SlideDeck, DrawingElement, BackdropType } from '../types';

let slideCounter = 1;

export function generateSlideId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createSlide(title?: string, backdropType: BackdropType = 'transparent'): Slide {
  const num = slideCounter++;
  return {
    id: generateSlideId(),
    title: title || `Slide ${num}`,
    elements: [],
    backdropType,
    createdAt: Date.now(),
  };
}

export function createDefaultSlideDeck(): SlideDeck {
  slideCounter = 1;
  return {
    slides: [createSlide('Slide 1')],
    activeSlideIndex: 0,
  };
}

export function setActiveSlide(deck: SlideDeck, index: number): SlideDeck {
  if (deck.slides.length === 0) return deck;
  const clampedIndex = Math.max(0, Math.min(index, deck.slides.length - 1));
  return {
    ...deck,
    activeSlideIndex: clampedIndex,
  };
}

export function nextSlide(deck: SlideDeck): SlideDeck {
  if (deck.activeSlideIndex < deck.slides.length - 1) {
    return {
      ...deck,
      activeSlideIndex: deck.activeSlideIndex + 1,
    };
  }
  return deck;
}

export function prevSlide(deck: SlideDeck): SlideDeck {
  if (deck.activeSlideIndex > 0) {
    return {
      ...deck,
      activeSlideIndex: deck.activeSlideIndex - 1,
    };
  }
  return deck;
}

export function addSlide(deck: SlideDeck, title?: string, backdropType?: BackdropType): SlideDeck {
  const newSlide = createSlide(title, backdropType ?? deck.slides[deck.activeSlideIndex]?.backdropType);
  const insertIndex = deck.activeSlideIndex + 1;
  const updatedSlides = [...deck.slides];
  updatedSlides.splice(insertIndex, 0, newSlide);

  return {
    slides: updatedSlides,
    activeSlideIndex: insertIndex,
  };
}

export function duplicateSlide(deck: SlideDeck, index: number): SlideDeck {
  const target = deck.slides[index];
  if (!target) return deck;

  const duplicated: Slide = {
    id: generateSlideId(),
    title: `${target.title} (Copy)`,
    elements: JSON.parse(JSON.stringify(target.elements)),
    backdropType: target.backdropType,
    createdAt: Date.now(),
  };

  const insertIndex = index + 1;
  const updatedSlides = [...deck.slides];
  updatedSlides.splice(insertIndex, 0, duplicated);

  return {
    slides: updatedSlides,
    activeSlideIndex: insertIndex,
  };
}

export function deleteSlide(deck: SlideDeck, index: number): SlideDeck {
  if (deck.slides.length <= 1) {
    // If only one slide remains, reset it to blank rather than deleting
    const clearedSlide: Slide = {
      ...deck.slides[0],
      elements: [],
    };
    return {
      slides: [clearedSlide],
      activeSlideIndex: 0,
    };
  }

  const updatedSlides = deck.slides.filter((_, i) => i !== index);
  let newActiveIndex = deck.activeSlideIndex;

  if (index < deck.activeSlideIndex) {
    newActiveIndex = Math.max(0, deck.activeSlideIndex - 1);
  } else if (newActiveIndex >= updatedSlides.length) {
    newActiveIndex = updatedSlides.length - 1;
  }

  return {
    slides: updatedSlides,
    activeSlideIndex: newActiveIndex,
  };
}

export function updateActiveSlideElements(deck: SlideDeck, elements: DrawingElement[]): SlideDeck {
  if (!deck.slides[deck.activeSlideIndex]) return deck;

  const updatedSlides = deck.slides.map((slide, i) => {
    if (i === deck.activeSlideIndex) {
      return { ...slide, elements: [...elements] };
    }
    return slide;
  });

  return {
    ...deck,
    slides: updatedSlides,
  };
}

export function getActiveSlide(deck: SlideDeck): Slide | undefined {
  return deck.slides[deck.activeSlideIndex];
}
