import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '../../src/shared/utils/HistoryManager';
import { PathElement } from '../../src/shared/types';

describe('HistoryManager', () => {
  let history: HistoryManager;

  const mockStroke1: PathElement = {
    id: 'stroke-1',
    type: 'pen',
    color: '#ff0000',
    strokeWidth: 4,
    opacity: 1,
    brushStyle: 'solid',
    points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
  };

  const mockStroke2: PathElement = {
    id: 'stroke-2',
    type: 'pen',
    color: '#00ff00',
    strokeWidth: 6,
    opacity: 1,
    brushStyle: 'solid',
    points: [{ x: 30, y: 30 }, { x: 40, y: 40 }],
  };

  beforeEach(() => {
    history = new HistoryManager(10);
  });

  it('initializes with empty state and cannot undo/redo', () => {
    expect(history.currentElements).toEqual([]);
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);
  });

  it('adds elements and enables undo', () => {
    history.addElement(mockStroke1);
    expect(history.currentElements.length).toBe(1);
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);

    history.addElement(mockStroke2);
    expect(history.currentElements.length).toBe(2);
  });

  it('supports undo and redo cycles', () => {
    history.addElement(mockStroke1);
    history.addElement(mockStroke2);

    expect(history.currentElements.length).toBe(2);

    // Undo mockStroke2
    expect(history.undo()).toBe(true);
    expect(history.currentElements.length).toBe(1);
    expect(history.currentElements[0].id).toBe('stroke-1');
    expect(history.canRedo).toBe(true);

    // Undo mockStroke1
    expect(history.undo()).toBe(true);
    expect(history.currentElements.length).toBe(0);
    expect(history.canUndo).toBe(false);

    // Redo mockStroke1
    expect(history.redo()).toBe(true);
    expect(history.currentElements.length).toBe(1);
    expect(history.currentElements[0].id).toBe('stroke-1');

    // Redo mockStroke2
    expect(history.redo()).toBe(true);
    expect(history.currentElements.length).toBe(2);
    expect(history.canRedo).toBe(false);
  });

  it('clears redo stack when new element is added after undo', () => {
    history.addElement(mockStroke1);
    history.undo();
    expect(history.canRedo).toBe(true);

    history.addElement(mockStroke2);
    expect(history.canRedo).toBe(false);
  });

  it('removes specific element (object-level eraser) and records in undo history', () => {
    history.addElement(mockStroke1);
    history.addElement(mockStroke2);

    const removed = history.removeElement('stroke-1');
    expect(removed).toBe(true);
    expect(history.currentElements.length).toBe(1);
    expect(history.currentElements[0].id).toBe('stroke-2');

    // Undo restores the erased element
    history.undo();
    expect(history.currentElements.length).toBe(2);
  });

  it('clears all elements and records state in undo stack', () => {
    history.addElement(mockStroke1);
    history.clear();

    expect(history.currentElements.length).toBe(0);
    expect(history.canUndo).toBe(true);

    history.undo();
    expect(history.currentElements.length).toBe(1);
  });
});
