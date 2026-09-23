import { DrawingElement } from '../types';

export class HistoryManager {
  private undoStack: DrawingElement[][] = [[]];
  private redoStack: DrawingElement[][] = [];
  private maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  public get currentElements(): DrawingElement[] {
    return this.undoStack[this.undoStack.length - 1] || [];
  }

  public addElement(element: DrawingElement): void {
    const nextState = [...this.currentElements, element];
    this.pushState(nextState);
  }

  public setElements(elements: DrawingElement[]): void {
    this.pushState(elements);
  }

  public removeElement(elementId: string): boolean {
    const current = this.currentElements;
    const filtered = current.filter((el) => el.id !== elementId);
    if (filtered.length !== current.length) {
      this.pushState(filtered);
      return true;
    }
    return false;
  }

  public clear(): void {
    if (this.currentElements.length > 0) {
      this.pushState([]);
    }
  }

  public undo(): boolean {
    if (this.canUndo) {
      const currentState = this.undoStack.pop()!;
      this.redoStack.push(currentState);
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.canRedo) {
      const nextState = this.redoStack.pop()!;
      this.undoStack.push(nextState);
      return true;
    }
    return false;
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private pushState(state: DrawingElement[]): void {
    this.undoStack.push(state);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // clear redo on new action
  }

  public getHistoryState() {
    return {
      canUndo: this.canUndo,
      canRedo: this.canRedo,
      elementCount: this.currentElements.length,
    };
  }
}
